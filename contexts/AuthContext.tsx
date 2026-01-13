"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUp: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{ success: boolean; userId?: string; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // loading state will be handled in fetchUserProfile
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        // Handle specifically the "User from sub claim in JWT does not exist" error
        // This happens when a user is deleted from Supabase but still has a valid local session token
        if (authError?.message?.includes("User from sub claim in JWT does not exist") || 
            authError?.message?.includes("invalid claim")) {
          console.warn("Session invalid (user likely deleted). Signing out...");
          await signOut();
          return;
        }

        console.error("Auth user not found:", authError);
        setUser(null);
        return;
      }

      const { data, error } = (await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()) as { data: any; error: any };

      // If profile does not exist → create it
      if (!data) {
        const { data: newUser, error: insertError } = (await (
          supabase.from("users") as any
        )
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single()) as { data: any; error: any };

        if (insertError || !newUser) {
          console.error("Profile creation failed:", insertError);
          setUser(null);
          return;
        }

        setUser({
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        });

        return;
      }

      if (error) {
        console.error("Profile fetch error:", error);
        setUser(null);
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      console.error("fetchUserProfile failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    // Helper to run the actual login logic
    const attemptLogin = async () => {
      try {
        // 1. Authenticate
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const session = data.session;
        if (!session?.user) {
          return { success: false, error: "No user session created" };
        }

        // 2. Fetch or Create Profile
        let { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile during login:", profileError);
        }

        let userProfile = profile;

        if (!userProfile) {
          console.warn("User profile missing during login. Attempting to create...");
          // Fallback: Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await (supabase
            .from("users") as any)
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                role: expectedRole || "influencer",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (createError || !newProfile) {
            console.error("Failed to create missing profile:", createError);
            await supabase.auth.signOut();
            return { success: false, error: "User profile verification failed. Contact support." };
          }
          userProfile = newProfile;
        }

        if (!userProfile) {
          return { success: false, error: "Unexpected error: User profile not found." };
        }

        // 3. Verify Role
        const validRoles: UserRole[] = ['admin', 'influencer', 'marketing'];
        const userRole = (userProfile as any).role;
        
        if (!validRoles.includes(userRole)) {
           console.warn(`Unauthorized role: ${userRole}`);
           await supabase.auth.signOut();
           return {
             success: false,
             error: "Access Denied: Invalid user role."
           };
        }
        
        if (expectedRole && userRole !== expectedRole) {
             console.warn(`Role mismatch. Expected ${expectedRole}, got ${userRole}`);
             await supabase.auth.signOut();
             return {
                 success: false,
                 error: `Access Denied: Account is ${userRole}, not ${expectedRole}.`
             };
        }

        console.log("Login successful:", session.user.id);
        return { success: true, role: userRole };
      } catch (error: any) {
        console.error("Login logic error:", error);
        // Clean up partial session
        const { data } = await supabase.auth.getSession();
        if (data.session) await supabase.auth.signOut();
        return { success: false, error: error.message || "An unexpected error occurred." };
      }
    };

    // Race between login attempt and a 15s timeout
    const TIMEOUT_MS = 15000;
    const timeoutPromise = new Promise<{ success: boolean; error: string }>((resolve) => {
      setTimeout(() => {
        resolve({ success: false, error: "Login timed out. Please check your connection." });
      }, TIMEOUT_MS);
    });

    try {
      return await Promise.race([attemptLogin(), timeoutPromise]);
    } catch (err: any) {
      return { success: false, error: "Unexpected system error during login." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole = "influencer"
  ): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "No user returned after signup" };
      }

      // Create profile immediately
      const { error: profileError } = await (supabase.from("users") as any)
        .insert([
          {
            id: data.user.id,
            email,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // If profile creation fails, we might want to rollback the auth user creation or just throw
        // For now, throw to alert the user
        return { success: false, error: "Failed to create user profile" };
      }

      return { success: true, userId: data.user.id };
    } catch (error: any) {
      console.error("Signup failed:", error);
      return { success: false, error: error.message || "An unexpected error occurred during signup." };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error from Supabase:", error);
      }
    } catch (err) {
      console.error("Sign out exception:", err);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

