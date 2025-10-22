import { useState, useEffect, useRef } from 'react';
import { UserAPI, ChatAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { Send } from 'lucide-react';

interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
}

export default function MessagesPage() {
    const currentUser = useAuthStore((state) => state.user);
    const token = localStorage.getItem('accessToken');

    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Connect Socket.IO on mount
    useEffect(() => {
        if (!token || !currentUser?.id) {
            console.error('❌ Cannot connect socket: missing token or userId');
            return;
        }

        console.log('🔌 Connecting socket for user:', currentUser.id);

        try {
            ChatAPI.connectSocket(token);

            // ✅ Authenticate after connection
            const socket = ChatAPI.getSocket();
            if (socket) {
                socket.emit('authenticate', { userId: currentUser.id });
            }
        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
        }

        return () => {
            console.log('🔌 Disconnecting socket');
            ChatAPI.disconnectSocket();
        };
    }, [token, currentUser?.id]);

    // Fetch following users
    useEffect(() => {
        async function fetchFollowing() {
            if (!currentUser) return;
            try {
                const res = await UserAPI.getFollowing(currentUser.id);
                setFollowingUsers(res.data || []);
            } catch (error) {
                console.error('Failed to fetch following users:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFollowing();
    }, [currentUser]);

    // Handle user selection and room creation
    useEffect(() => {
        async function setupChat() {
            if (!selectedUser || !currentUser) return;

            try {
                console.log('🔍 Creating room for users:', [currentUser.id, selectedUser.id]);

                // Create or get room
                const roomRes = await ChatAPI.createOrGetRoom([currentUser.id, selectedUser.id]);
                const room = roomRes.data;

                if (!room || !room.id) {
                    console.error('❌ Invalid room response');
                    return;
                }

                console.log('✅ Room ID:', room.id);
                setCurrentRoomId(room.id);

                // Join room via socket
                ChatAPI.joinRoom(room.id);

                // Fetch messages
                const msgRes = await ChatAPI.getRoomMessages(room.id);
                setMessages((msgRes.data || []).reverse());

            } catch (error) {
                console.error('Failed to setup chat:', error);
            }
        }

        setupChat();

        return () => {
            if (currentRoomId) {
                ChatAPI.leaveRoom(currentRoomId);
            }
        };
    }, [selectedUser, currentUser]);

    // ✅ FIXED: Listen for real-time messages with correct payload structure
    useEffect(() => {
        // ✅ Fix: Backend sends { message: Message }, not just Message
        const handleNewMessage = (data: { message: Message }) => {
            console.log('📨 New message received:', data);

            const message = data.message;

            // Only add if it's for current conversation
            if (selectedUser &&
                (message.senderId === selectedUser.id ||
                    message.receiverId === selectedUser.id)) {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.find(m => m.id === message.id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
            }
        };

        const handleTyping = (data: { userId: string; roomId: string }) => {
            console.log('⌨️ Typing event:', data);
            if (data.userId !== currentUser?.id && data.roomId === currentRoomId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        ChatAPI.onNewMessage(handleNewMessage);
        ChatAPI.onTyping(handleTyping);

        return () => {
            ChatAPI.offNewMessage();
            ChatAPI.offTyping();
        };
    }, [currentRoomId, currentUser, selectedUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ✅ FIXED: Add optimistic UI updates
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentRoomId || sendingMessage || !selectedUser) return;

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            senderId: currentUser!.id,
            receiverId: selectedUser.id,
            content: messageInput,
            createdAt: new Date().toISOString(),
        };

        // ✅ Show message immediately (optimistic update)
        setMessages((prev) => [...prev, tempMessage]);

        const content = messageInput;
        setMessageInput(''); // Clear input immediately
        setSendingMessage(true);

        try {
            const response = await ChatAPI.sendMessage(currentRoomId, content);
            console.log('✅ Message sent:', response);

            // ✅ Replace temp message with real one
            setMessages((prev) => {
                const filtered = prev.filter(m => m.id !== tempMessage.id);
                const realMessage = response.data;

                // Avoid duplicates
                if (filtered.find(m => m.id === realMessage.id)) {
                    return filtered;
                }

                return [...filtered, realMessage];
            });
        } catch (error: any) {
            console.error('❌ Failed to send message:', error);

            // ✅ Remove failed message
            setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));

            alert(error.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleTyping = () => {
        if (currentRoomId) {
            ChatAPI.emitTyping(currentRoomId);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Following Users List - Left Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : followingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <p className="text-gray-500 text-center">
                            You're not following anyone yet. Follow people to start messaging!
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {followingUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition ${selectedUser?.id === user.id ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <img
                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Area - Right Side */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <img
                                src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                                alt={selectedUser.username}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </p>
                                <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                            </div>
                        </div>

                        {/* Messages Display */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <div
                                                className={`max-w-xs px-4 py-2 rounded-2xl ${msg.senderId === currentUser?.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
                                                <p className="text-sm italic">typing...</p>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => {
                                        setMessageInput(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-600"
                                />
                                <button
                                    type="submit"
                                    disabled={sendingMessage || !messageInput.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select a user to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
