
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
    userAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
}

const Messages: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchConversations();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (router.query.userId && typeof router.query.userId === 'string') {
            handleDirectMessage(router.query.userId);
        }
    }, [router.query.userId, conversations]);

    useEffect(() => {
        setFilteredConversations(
            conversations.filter(c => 
                c.userName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, conversations]);

    const handleDirectMessage = async (targetUserId: string) => {
        const existing = conversations.find(c => c.userId === targetUserId);
        
        // Mark messages as read immediately
        if (targetUserId) {
            markMessagesAsRead(targetUserId);
        }

        if (existing) {
            setSelectedUserId(existing.userId);
            setSelectedUserName(existing.userName);
        } else {
             try {
                let name = 'User';
                // Try influencer
                const { data: inf } = await supabase.from('influencers').select('full_name').eq('user_id', targetUserId).maybeSingle();
                if (inf) name = (inf as any).full_name;
                
                // Try brand
                if (!inf) {
                    const { data: br } = await supabase.from('brands').select('company_name').eq('user_id', targetUserId).maybeSingle();
                    if (br) name = (br as any).company_name;
                }

                setSelectedUserId(targetUserId);
                setSelectedUserName(name);
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
                .eq('is_read', false); // Only update unread
            
            if (error) throw error;
            
            // Update local state to reflect read status
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

            // Fetch names for these users
            const userIdList = Array.from(otherUserIds);
            const userMap = new Map<string, string>();

            if (userIdList.length > 0) {
                // Try influencers
                const { data: influencersData } = await supabase
                    .from('influencers')
                    .select('user_id, full_name')
                    .in('user_id', userIdList);
                
                const influencers = (influencersData || []) as any[];
                influencers.forEach(inf => userMap.set(inf.user_id, inf.full_name));

                // Try brands (for IDs not found yet, or just fetch all to be safe)
                const { data: brandsData } = await supabase
                    .from('brands')
                    .select('user_id, company_name')
                    .in('user_id', userIdList);
                
                const brands = (brandsData || []) as any[];
                brands.forEach(br => userMap.set(br.user_id, br.company_name));
            }

            const contactMap = new Map<string, Conversation>();

            for (const msg of messages) {
                const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
                const userName = userMap.get(otherUserId) || 'Unknown User';
                
                const isUnread = msg.receiver_id === user?.id && !msg.is_read;

                if (!contactMap.has(otherUserId)) {
                    contactMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: userName,
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
            setConversations(Array.from(contactMap.values()));

        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Messages - Cehpoint</title>
            </Head>

            <div className="h-[calc(100vh-140px)] flex gap-6 relative">
                {/* Sidebar */}
                <div className={`w-full md:w-1/3 min-w-[300px] bg-white rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden ${
                    selectedUserId ? 'hidden md:flex' : 'flex'
                }`}>
                    <div className="p-4 border-b border-gray-50 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <MessageSquare className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">No messages found</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <div 
                                    key={conv.userId}
                                    onClick={() => {
                                        setSelectedUserId(conv.userId);
                                        setSelectedUserName(conv.userName);
                                        markMessagesAsRead(conv.userId);
                                    }}
                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                        selectedUserId === conv.userId 
                                            ? 'bg-indigo-50 shadow-sm' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 transition-colors ${
                                        selectedUserId === conv.userId
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                                    }`}>
                                        {conv.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`text-sm font-semibold truncate ${
                                                selectedUserId === conv.userId ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                                {conv.userName}
                                            </h3>
                                            <span className="text-xs text-gray-400 shrink-0">
                                                {new Date(conv.lastMessageTime).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
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
                    </div>
                </div>

                {/* Chat Area */}
                <div className={` md:flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-col ${
                    selectedUserId ? 'flex absolute inset-0 md:static z-20' : 'hidden md:flex'
                }`}>
                    {selectedUserId ? (
                        <ChatWindow 
                            recipientId={selectedUserId} 
                            recipientName={selectedUserName} 
                            onBack={() => {
                                setSelectedUserId(null);
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
                                Select a conversation from the sidebar to send a message to a brand or influencer.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Messages;
