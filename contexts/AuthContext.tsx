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
    requiredRole: string
  ) => Promise<{ success: boolean; error?: string }>;
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
    requiredRole: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Authenticate
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Return error gracefully without logging as error to avoid strict mode overlays
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
        // Don't throw yet, try to recover if it's just missing
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
              role: "influencer", // Default role, or we could leave it null if schema allows
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError || !newProfile) {
          console.error("Failed to create missing profile:", createError);
          await supabase.auth.signOut();
          return { success: false, error: "User profile verification failed. Please contact support." };
        }
        userProfile = newProfile;
      }

      if (!userProfile) {
        return { success: false, error: "Unexpected error: User profile not found." };
      }

      // 3. Verify Role
      // 'marketing' role in frontend seems to map to 'Brand' in UI messages, but let's check strict equality
      // The original code had: const roleName = requiredRole === 'marketing' ? 'Brand' : 'Influencer';
      if ((userProfile as any).role !== requiredRole) {
        console.warn(`Role mismatch. Required: ${requiredRole}, Actual: ${(userProfile as any).role}`);
        await supabase.auth.signOut();
        const roleName = requiredRole === "marketing" ? "Brand" : "Influencer";
        return { 
          success: false, 
          error: `Access Denied: You are not authorized as a ${roleName}. Please check your login credentials.` 
        };
      }

      console.log("Login successful:", session.user.id);
      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      // Ensure we clear any partial session if we failed validity checks
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.signOut();
      }
      return { success: false, error: error.message || "An unexpected error occurred during login." };
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

