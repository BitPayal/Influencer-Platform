
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Message } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
    recipientId: string;
    recipientName: string;
    onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, recipientName, onBack }) => {
    const { user } = useAuth();
    const [isOnline, setIsOnline] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchMessages();
            const channel = supabase.channel(`chat:${getChannelId(user.id, recipientId)}`);

            channel
                .on('presence', { event: 'sync' }, () => {
                    const newState = channel.presenceState();
                    // Check if recipient is in the state
                    // The keys in presenceState are usually user IDs if we track them that way, or just check if > 1 user (me + them)
                    // Better: User tracks themselves with their ID.
                    const hasRecipient = Object.values(newState).some((presences: any) => 
                        presences.some((p: any) => p.user_id === recipientId)
                    );
                    setIsOnline(hasRecipient);
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${recipientId}`,
                }, (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
                    }
                });

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, recipientId]);

    // Helper to ensure consistent channel name (sort IDs or just use one way if logic allows)
    // Actually, channel name needs to be consistent for both users to meet.
    // Let's use sorted IDs.
    const getChannelId = (uid1: string, uid2: string) => {
        return [uid1, uid2].sort().join('-');
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user?.id})`)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data || []);
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const msgContent = newMessage;
        setNewMessage('');

        const { data, error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: recipientId,
            content: msgContent
        } as any).select().single();

        if (error) {
            console.error("Error sending message:", error);
        } else if (data) {
             setMessages((prev) => [...prev, data]);
        }
    };

    // ... (rest of code)

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {recipientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{recipientName}</h3>
                        {isOnline && (
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                <span className="text-xs text-green-600 font-medium">Online</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] group flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`px-5 py-3 rounded-2xl text-sm shadow-sm transition-all ${
                                    msg.sender_id === user?.id
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}
                            >
                                <p className="leading-relaxed">{msg.content}</p>
                            </div>
                            <span className={`text-[11px] font-medium mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                msg.sender_id === user?.id ? 'text-gray-400' : 'text-gray-400'
                            }`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-3 items-center">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl py-6"
                    />
                    <Button type="submit" variant="primary" disabled={!newMessage.trim()} className="rounded-xl h-12 px-6 shadow-indigo-200 shadow-lg hover:shadow-indigo-300">
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
