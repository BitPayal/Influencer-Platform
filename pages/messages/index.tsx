
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/Layout';
import ChatWindow from '@/components/Messaging/ChatWindow';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Message } from '@/types';

interface Conversation {
    userId: string;
    userName: string;
    userEmail?: string;
    userStatus?: string;
    userAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
    isSearchResult?: boolean;
}

const Messages: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchResults, setSearchResults] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchConversations();
            
            // Subscribe to new messages to update the list in real-time
            const channel = supabase.channel('public:messages_list')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`,
                }, (payload) => handleRealtimeMessage(payload.new))
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${user.id}`,
                }, (payload) => handleRealtimeMessage(payload.new))
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, authLoading]);

    const handleRealtimeMessage = async (msg: any) => {
        const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        const isUnread = msg.receiver_id === user?.id && !msg.is_read;
        
        setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.userId === otherUserId);
            
            if (existingIndex >= 0) {
                // Update existing conversation
                const updatedConv = {
                    ...prev[existingIndex],
                    lastMessage: msg.content,
                    lastMessageTime: msg.created_at,
                    unreadCount: (prev[existingIndex].unreadCount || 0) + (isUnread ? 1 : 0)
                };
                
                // Move to top
                const newList = [...prev];
                newList.splice(existingIndex, 1);
                return [updatedConv, ...newList];
            } else {
                // New conversation found via realtime - checking if we need to fetch details
                // Ideally we fetch details, but for now we might skip or do a quick fetch
                // Trigger a full re-fetch to be safe and simple for new users
                fetchConversations();
                return prev;
            }
        });
    };

    // Handle URL query for direct message
    useEffect(() => {
        if (router.query.userId && typeof router.query.userId === 'string' && conversations.length >= 0) { // check conversation length to ensure load
            handleDirectMessage(router.query.userId);
        }
    }, [router.query.userId, conversations]);

    // Admin Search Logic
    useEffect(() => {
        if (user?.role === 'admin' && searchTerm.trim().length > 0) {
            const timeoutId = setTimeout(() => {
                searchInfluencers(searchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchTerm, user]);

    const searchInfluencers = async (term: string) => {
        setIsSearching(true);
        try {
            const { data, error } = await supabase
                .from('influencers')
                .select('user_id, full_name, email, approval_status')
                .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
                .limit(10);

            if (error) throw error;

            if (data) {
                const results: Conversation[] = data.map((inf: any) => ({
                    userId: inf.user_id,
                    userName: inf.full_name,
                    userEmail: inf.email,
                    userStatus: inf.approval_status,
                    lastMessage: 'Start a conversation',
                    lastMessageTime: new Date().toISOString(),
                    isSearchResult: true
                }));
                // Filter out results that are ALREADY in conversations
                const newResults = results.filter(r => !conversations.some(c => c.userId === r.userId));
                setSearchResults(newResults);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDirectMessage = async (targetUserId: string) => {
        // 1. Check if we already have a conversation
        const existing = conversations.find(c => c.userId === targetUserId);
        
        if (existing) {
            setSelectedConversation(existing);
            markMessagesAsRead(targetUserId);
        } else {
            // 2. If no conversation, fetch user details to create a temporary/new conversation state
            try {
                let name = 'User';
                let email = '';
                let status = '';

                if (user?.role === 'admin') {
                     const { data: inf } = await supabase.from('influencers').select('full_name, email, approval_status').eq('user_id', targetUserId).maybeSingle();
                     if (inf) {
                         name = (inf as any).full_name;
                         email = (inf as any).email;
                         status = (inf as any).approval_status;
                     }
                } else if (user?.role === 'influencer') {
                    name = 'Admin Team';
                }

                const newConv: Conversation = {
                    userId: targetUserId,
                    userName: name,
                    userEmail: email,
                    userStatus: status,
                    lastMessage: 'New Conversation',
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0
                };
                
                setSelectedConversation(newConv);
            } catch (e) {
                console.error("Error fetching user details", e);
            }
        }
    };

    const markMessagesAsRead = async (senderId: string) => {
        if (!user) return;
        try {
            const { error } = await (supabase
                .from('messages') as any)
                .update({ is_read: true })
                .eq('sender_id', senderId)
                .eq('receiver_id', user.id)
                .eq('is_read', false); 
            
            if (error) throw error;
            
            setConversations(prev => prev.map(c => {
                if (c.userId === senderId) {
                    return { ...c, unreadCount: 0 };
                }
                return c;
            }));
            
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    };

    const fetchConversations = async () => {
        try {
            const { data: messagesData, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    content,
                    created_at,
                    is_read
                `)
                .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!messagesData) return;

            const messages = messagesData as Message[];

            // Identify unique users involved
            const otherUserIds = new Set<string>();
            messages.forEach(msg => {
                const otherId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
                otherUserIds.add(otherId);
            });

            // Fetch names/details for these users
            const userIdList = Array.from(otherUserIds);
            const userMap = new Map<string, {name: string, email?: string, status?: string}>();

            if (userIdList.length > 0) {
                 if (user?.role === 'admin') {
                     const { data: influencersData } = await supabase
                        .from('influencers')
                        .select('user_id, full_name, email, approval_status')
                        .in('user_id', userIdList);
                     
                     (influencersData as any[])?.forEach(inf => userMap.set(inf.user_id, {
                         name: inf.full_name,
                         email: inf.email,
                         status: inf.approval_status
                     }));
                 } 
                 else if (user?.role === 'influencer') {
                     userIdList.forEach(id => userMap.set(id, { name: 'Admin Team' }));
                 }
                 else {
                     // Fallback
                     const { data: brandsData } = await supabase
                        .from('brands')
                        .select('user_id, company_name')
                        .in('user_id', userIdList);
                     (brandsData as any[])?.forEach(br => userMap.set(br.user_id, { name: br.company_name }));
                     
                     const { data: influencersData } = await supabase
                        .from('influencers')
                        .select('user_id, full_name, email')
                        .in('user_id', userIdList);
                     (influencersData as any[])?.forEach(inf => userMap.set(inf.user_id, { name: inf.full_name, email: inf.email }));
                 }
            }

            const contactMap = new Map<string, Conversation>();

            for (const msg of messages) {
                const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
                let userDetails = userMap.get(otherUserId);

                if (!userDetails) {
                     if (user?.role === 'influencer') userDetails = { name: 'Admin Team' };
                     else userDetails = { name: 'Unknown User' }; 
                }
                
                const isUnread = msg.receiver_id === user?.id && !msg.is_read;

                if (!contactMap.has(otherUserId)) {
                    contactMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: userDetails.name,
                        userEmail: userDetails.email,
                        userStatus: userDetails.status,
                        lastMessage: msg.content,
                        lastMessageTime: msg.created_at,
                        unreadCount: isUnread ? 1 : 0
                    });
                } else {
                    if (isUnread) {
                        const existing = contactMap.get(otherUserId)!;
                        existing.unreadCount = (existing.unreadCount || 0) + 1;
                    }
                }
            }
            // Sort by latest message time
            const sorted = Array.from(contactMap.values()).sort((a, b) => 
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );
            setConversations(sorted);

        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic:
    // If not admin, just filter existing conversations by local filter
    // If Admin, utilize searchResults for global search + filter existing
    const getDisplayList = () => {
         // Start with existing conversations
         let list = conversations;

         // Apply local search filter (names)
         if (searchTerm.trim()) {
             list = list.filter(c => c.userName.toLowerCase().includes(searchTerm.toLowerCase()));
         }

         // If Admin and searching, append global search results
         if (user?.role === 'admin' && searchTerm.trim() && searchResults.length > 0) {
             const existingIds = new Set(list.map(c => c.userId));
             const distinctSearchResults = searchResults.filter(r => !existingIds.has(r.userId));
             list = [...list, ...distinctSearchResults];
         }
         
         return list;
    }

    const displayList = getDisplayList();

    return (
        <Layout>
            <Head>
                <title>Messages - Cehpoint</title>
            </Head>

            <div className="h-[calc(100vh-140px)] flex gap-6 relative">
                {/* Sidebar */}
                <div className={`w-full md:w-1/3 min-w-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden ${
                    selectedConversation ? 'hidden md:flex' : 'flex'
                }`}>
                    <div className="p-4 border-b border-gray-50 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={user?.role === 'admin' ? "Search all influencers..." : "Search conversations..."}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : displayList.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <MessageSquare className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">
                                    {user?.role === 'admin' 
                                        ? "No conversations found. Search above to start a chat."
                                        : "No messages found"
                                    }
                                </p>
                            </div>
                        ) : (
                            displayList.map((conv) => (
                                <div 
                                    key={conv.userId}
                                    onClick={() => {
                                        handleDirectMessage(conv.userId);
                                        // Reset unread count locally immediately
                                        setConversations(prev => prev.map(c => 
                                            c.userId === conv.userId ? { ...c, unreadCount: 0 } : c
                                        ));
                                    }}
                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                        selectedConversation?.userId === conv.userId 
                                            ? 'bg-indigo-50 shadow-sm' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 transition-colors ${
                                        selectedConversation?.userId === conv.userId
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                                    }`}>
                                        {conv.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`text-sm font-semibold truncate ${
                                                selectedConversation?.userId === conv.userId ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                                {conv.userName}
                                            </h3>
                                            {!conv.isSearchResult && (
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {new Date(conv.lastMessageTime).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate ${
                                                (conv.unreadCount || 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                            }`}>
                                                {conv.lastMessage}
                                            </p>
                                            {(conv.unreadCount || 0) > 0 && (
                                                <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ml-2">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Show searching indicator */}
                        {isSearching && (
                            <div className="text-center py-2 text-xs text-gray-400">
                                Searching directory...
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={` md:flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-col ${
                    selectedConversation ? 'flex absolute inset-0 md:static z-20' : 'hidden md:flex'
                }`}>
                    {selectedConversation ? (
                        <ChatWindow 
                            recipientId={selectedConversation.userId} 
                            recipientName={selectedConversation.userName} 
                            recipientEmail={selectedConversation.userEmail}
                            recipientStatus={selectedConversation.userStatus}
                            onBack={() => {
                                setSelectedConversation(null);
                                router.push('/messages', undefined, { shallow: true });
                            }}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                            <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-500 max-w-sm">
                                {user?.role === 'admin' 
                                  ? "Select an influencer to start or continue a conversation." 
                                  : "Select a conversation to view messages."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Messages;
