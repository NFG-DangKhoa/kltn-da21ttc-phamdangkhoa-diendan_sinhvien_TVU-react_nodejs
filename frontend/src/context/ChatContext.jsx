import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import socket from '../socket';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';
import notificationSound from '../utils/notificationSound';

// Initial state
const initialState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    onlineUsers: [],
    typingUsers: {},
    userLastSeen: {}, // Thời gian hoạt động cuối của users
    unreadCount: 0,
    loading: false,
    error: null,
    isConnected: false,
    heartbeatInterval: null
};

// Action types
const CHAT_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_CONVERSATIONS: 'SET_CONVERSATIONS',
    ADD_CONVERSATION: 'ADD_CONVERSATION',
    UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
    SET_CURRENT_CONVERSATION: 'SET_CURRENT_CONVERSATION',
    SET_MESSAGES: 'SET_MESSAGES',
    ADD_MESSAGE: 'ADD_MESSAGE',
    UPDATE_MESSAGE: 'UPDATE_MESSAGE',
    DELETE_MESSAGE: 'DELETE_MESSAGE',
    SET_ONLINE_USERS: 'SET_ONLINE_USERS',
    USER_ONLINE: 'USER_ONLINE',
    USER_OFFLINE: 'USER_OFFLINE',
    SET_TYPING: 'SET_TYPING',
    CLEAR_TYPING: 'CLEAR_TYPING',
    UPDATE_USER_LAST_SEEN: 'UPDATE_USER_LAST_SEEN',
    SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
    SET_CONNECTED: 'SET_CONNECTED',
    SET_HEARTBEAT_INTERVAL: 'SET_HEARTBEAT_INTERVAL',
    CLEAR_CHAT: 'CLEAR_CHAT'
};

// Reducer
function chatReducer(state, action) {
    switch (action.type) {
        case CHAT_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case CHAT_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case CHAT_ACTIONS.SET_CONVERSATIONS:
            return { ...state, conversations: action.payload, loading: false };

        case CHAT_ACTIONS.ADD_CONVERSATION:
            return {
                ...state,
                conversations: [action.payload, ...state.conversations]
            };

        case CHAT_ACTIONS.UPDATE_CONVERSATION:
            return {
                ...state,
                conversations: state.conversations.map(conv =>
                    conv._id === action.payload.conversationId ? {
                        ...conv,
                        lastMessage: action.payload.lastMessage,
                        lastMessageAt: action.payload.lastMessageAt
                    } : conv
                )
            };

        case CHAT_ACTIONS.SET_CURRENT_CONVERSATION:
            return { ...state, currentConversation: action.payload };

        case CHAT_ACTIONS.SET_MESSAGES:
            return { ...state, messages: action.payload, loading: false };

        case CHAT_ACTIONS.ADD_MESSAGE:
            // Kiểm tra duplicate trước khi thêm
            const existingMessage = state.messages.find(m =>
                m._id === action.payload._id ||
                (m.isTemp && m.content === action.payload.content && m.senderId === action.payload.senderId)
            );

            if (existingMessage) {
                console.log('⚠️ Reducer: Message already exists, skipping duplicate');
                console.log('⚠️ Reducer: Existing message:', existingMessage);
                console.log('⚠️ Reducer: New message:', action.payload);
                return state;
            }

            console.log('✅ Reducer: Adding new message');
            console.log('✅ Reducer: Message details:', action.payload);
            console.log('✅ Reducer: Current messages count:', state.messages.length);

            // Update conversations with new last message
            let updatedConversations = [...state.conversations];
            let conversationFound = false;

            // Try to update existing conversation
            updatedConversations = updatedConversations.map(conv => {
                if (conv._id === action.payload.conversationId) {
                    conversationFound = true;
                    return {
                        ...conv,
                        lastMessage: action.payload,
                        lastMessageAt: action.payload.createdAt
                    };
                }
                return conv;
            });

            // If conversation not found, we need to reload conversations
            if (!conversationFound && action.payload.conversationId) {
                console.log('🔄 Conversation not found in list, will need to reload conversations');
                // We'll trigger a reload in the component that uses this
            }

            return {
                ...state,
                messages: [...state.messages, action.payload],
                conversations: updatedConversations
            };

        case CHAT_ACTIONS.UPDATE_MESSAGE:
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg._id === action.payload._id ? action.payload : msg
                )
            };

        case CHAT_ACTIONS.DELETE_MESSAGE:
            return {
                ...state,
                messages: state.messages.filter(msg => msg._id !== action.payload)
            };

        case CHAT_ACTIONS.SET_ONLINE_USERS:
            return { ...state, onlineUsers: action.payload };

        case CHAT_ACTIONS.USER_ONLINE:
            return {
                ...state,
                onlineUsers: [...new Set([...state.onlineUsers, action.payload])],
                userLastSeen: {
                    ...state.userLastSeen,
                    [action.payload]: new Date().toISOString()
                }
            };

        case CHAT_ACTIONS.USER_OFFLINE:
            return {
                ...state,
                onlineUsers: state.onlineUsers.filter(id => id !== action.payload),
                userLastSeen: {
                    ...state.userLastSeen,
                    [action.payload]: new Date().toISOString()
                }
            };

        case CHAT_ACTIONS.UPDATE_USER_LAST_SEEN:
            return {
                ...state,
                userLastSeen: {
                    ...state.userLastSeen,
                    [action.payload.userId]: action.payload.lastSeen
                }
            };

        case CHAT_ACTIONS.SET_TYPING:
            return {
                ...state,
                typingUsers: {
                    ...state.typingUsers,
                    [action.payload.conversationId]: {
                        ...state.typingUsers[action.payload.conversationId],
                        [action.payload.userId]: action.payload.isTyping
                    }
                }
            };

        case CHAT_ACTIONS.CLEAR_TYPING:
            const newTypingUsers = { ...state.typingUsers };
            if (newTypingUsers[action.payload.conversationId]) {
                delete newTypingUsers[action.payload.conversationId][action.payload.userId];
            }
            return { ...state, typingUsers: newTypingUsers };

        case CHAT_ACTIONS.SET_UNREAD_COUNT:
            return { ...state, unreadCount: action.payload };

        case CHAT_ACTIONS.SET_CONNECTED:
            return { ...state, isConnected: action.payload };

        case CHAT_ACTIONS.SET_HEARTBEAT_INTERVAL:
            return { ...state, heartbeatInterval: action.payload };

        case CHAT_ACTIONS.CLEAR_CHAT:
            // Clear heartbeat interval when clearing chat
            if (state.heartbeatInterval) {
                clearInterval(state.heartbeatInterval);
            }
            return { ...initialState };

        default:
            return state;
    }
}

// Create context
const ChatContext = createContext();

// Provider component
export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user } = useAuth();

    // Define handleNewMessage outside useEffect
    const handleNewMessage = useCallback((message) => {
        console.log('🔔 Socket: Received newMessage:', message);
        console.log('🔔 Socket: Message ID:', message.id || message._id);
        console.log('🔔 Socket: From:', message.senderId, 'To:', message.receiverId);
        console.log('🔔 Socket: Content:', message.content);
        console.log('🔔 Socket: Current user ID:', user?._id);
        console.log('🔔 Socket: Socket connected:', socket.connected);
        console.log('🔔 Socket: Socket ID:', socket.id);

        if (!user || !user._id) {
            console.log('⚠️ Socket: No user available, ignoring message');
            return;
        }

        // Chuẩn hóa message object
        const normalizedMessage = {
            _id: message.id || message._id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            conversationId: message.conversationId,
            messageType: message.messageType || 'text',
            attachments: message.attachments || [],
            status: message.status || 'sent',
            createdAt: message.createdAt,
            isRead: message.isRead || false
        };

        // Chỉ thêm tin nhắn nếu user hiện tại là người nhận hoặc người gửi
        const currentUserId = user._id.toString();
        const messageSenderId = message.senderId.toString();
        const messageReceiverId = message.receiverId.toString();

        console.log('🔔 Socket: Comparing IDs:');
        console.log('🔔 Socket: Current user:', currentUserId);
        console.log('🔔 Socket: Message sender:', messageSenderId);
        console.log('🔔 Socket: Message receiver:', messageReceiverId);

        if (currentUserId === messageSenderId || currentUserId === messageReceiverId) {
            console.log('✅ Socket: Adding new message to UI');
            console.log('✅ Socket: Message conversation ID:', normalizedMessage.conversationId);

            dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: normalizedMessage });

            // Play notification sound if this is a received message (not sent by current user)
            if (currentUserId === messageReceiverId) {
                console.log('🔔 Playing notification sound for received message');

                // Get settings from localStorage
                const chatSettings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
                const soundEnabled = chatSettings.notifications?.sound !== false;

                if (soundEnabled) {
                    notificationSound.playNotificationSound();
                }

                // Show desktop notification if enabled
                const desktopEnabled = chatSettings.notifications?.desktop !== false;
                if (desktopEnabled) {
                    notificationSound.showDesktopNotification(
                        'Tin nhắn mới',
                        {
                            body: normalizedMessage.content,
                            icon: '/favicon.ico'
                        }
                    );
                }
            }

            // Update conversation last message sẽ được xử lý trong reducer
        } else {
            console.log('⚠️ Socket: Message not for current user, ignoring');
        }
    }, [user, dispatch]);

    // Socket event handlers
    useEffect(() => {
        if (!user || !user._id) return;

        console.log('🔄 Frontend: Setting up socket connection for user:', user._id);
        console.log('🔄 Frontend: Current socket connected:', socket.connected);

        // Đảm bảo socket luôn được connect
        const ensureConnection = () => {
            if (!socket.connected) {
                console.log('🔌 Frontend: Socket not connected, connecting...');
                socket.connect();
            } else {
                console.log('🔌 Frontend: Socket already connected, joining room...');
                // Nếu đã connected, join room ngay lập tức
                socket.emit('joinUserRoom', user._id);
                dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: true });
                startHeartbeat();
            }
        };

        // Thử connect ngay lập tức
        ensureConnection();

        // Retry connection nếu cần sau 1 giây
        const retryTimer = setTimeout(() => {
            if (!socket.connected) {
                console.log('🔄 Frontend: Retrying socket connection...');
                ensureConnection();
            }
        }, 1000);

        // Socket event listeners
        socket.on('connect', () => {
            dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: true });
            console.log('🔌 Frontend: Socket connected successfully');
            console.log('🔌 Frontend: Socket ID:', socket.id);

            // Join user room sau khi connect
            console.log('🏠 Frontend: Joining user room for user:', user._id);
            socket.emit('joinUserRoom', user._id);
            console.log('🏠 Frontend: joinUserRoom event emitted');

            // Khởi tạo heartbeat
            startHeartbeat();
        });

        // Reconnect và rejoin room khi cần
        socket.on('reconnect', () => {
            console.log('🔄 Socket reconnected, rejoining room');
            console.log('🔄 User ID for rejoin:', user._id);
            dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: true });
            socket.emit('joinUserRoom', user._id);
            startHeartbeat();
        });

        // Connection error handling
        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: false });
        });

        socket.on('reconnect_error', (error) => {
            console.error('❌ Socket reconnection error:', error);
            dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: false });
        });

        socket.on('disconnect', () => {
            dispatch({ type: CHAT_ACTIONS.SET_CONNECTED, payload: false });
            console.log('🔌 Chat socket disconnected');

            // Dừng heartbeat khi disconnect
            stopHeartbeat();
        });

        // New message received
        socket.on('newMessage', (message) => {
            console.log('🔔 Frontend: newMessage event received!', message);
            handleNewMessage(message);
        });

        // Conversation update (for updating conversation list)
        socket.on('conversationUpdate', (data) => {
            console.log('🔄 Frontend: conversationUpdate event received!', data);
            dispatch({
                type: CHAT_ACTIONS.UPDATE_CONVERSATION,
                payload: {
                    conversationId: data.conversationId,
                    lastMessage: data.lastMessage,
                    lastMessageAt: data.lastMessageAt
                }
            });
        });

        // Test event để kiểm tra connection
        socket.on('test', (data) => {
            console.log('🧪 Test event received:', data);
            console.log('🧪 Connection verified for user:', data.userId);
            console.log('🧪 Socket ID confirmed:', data.socketId);
        });

        // Message sent confirmation
        socket.on('messageSent', (response) => {
            if (response.success) {
                console.log('✅ Message sent successfully');

                // Play sent message sound
                const chatSettings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
                const soundEnabled = chatSettings.notifications?.sound !== false;

                if (soundEnabled) {
                    notificationSound.playMessageSentSound();
                }

                // Replace temp message with real message if tempId provided
                if (response.tempId && response.message) {
                    console.log('🔄 Replacing temp message:', response.tempId, 'with real message:', response.message._id);

                    // Remove temp message and add real message
                    dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: response.tempId });

                    // Add real message (but check for duplicates first)
                    const realMessage = {
                        ...response.message,
                        _id: response.message._id || response.message.id
                    };

                    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: realMessage });
                }
            } else {
                console.error('❌ Failed to send message:', response.error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: response.error });

                // Remove temp message on error
                if (response.tempId) {
                    dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: response.tempId });
                }
            }
        });

        // Message read
        socket.on('messageRead', (data) => {
            dispatch({
                type: CHAT_ACTIONS.UPDATE_MESSAGE,
                payload: {
                    _id: data.messageId,
                    status: 'read',
                    readAt: data.readAt
                }
            });
        });

        // Message deleted
        socket.on('messageDeleted', (data) => {
            console.log('🗑️ Message deleted:', data.messageId);
            dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: data.messageId });
        });

        // User online/offline
        socket.on('userOnline', (data) => {
            dispatch({ type: CHAT_ACTIONS.USER_ONLINE, payload: data.userId });
            if (data.lastSeen) {
                dispatch({
                    type: CHAT_ACTIONS.UPDATE_USER_LAST_SEEN,
                    payload: { userId: data.userId, lastSeen: data.lastSeen }
                });
            }
        });

        socket.on('userOffline', (data) => {
            dispatch({ type: CHAT_ACTIONS.USER_OFFLINE, payload: data.userId });
            if (data.lastSeen) {
                dispatch({
                    type: CHAT_ACTIONS.UPDATE_USER_LAST_SEEN,
                    payload: { userId: data.userId, lastSeen: data.lastSeen }
                });
            }
        });

        // Typing indicators
        socket.on('userTyping', (data) => {
            dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: data });

            // Clear typing after 3 seconds
            if (!data.isTyping) {
                setTimeout(() => {
                    dispatch({ type: CHAT_ACTIONS.CLEAR_TYPING, payload: data });
                }, 3000);
            }
        });

        // Cleanup
        return () => {
            // Clear retry timer
            if (retryTimer) {
                clearTimeout(retryTimer);
            }

            socket.off('connect');
            socket.off('disconnect');
            socket.off('reconnect');
            socket.off('connect_error');
            socket.off('reconnect_error');
            socket.off('newMessage', handleNewMessage);
            socket.off('conversationUpdate');
            socket.off('messageSent');
            socket.off('messageRead');
            socket.off('messageDeleted');
            socket.off('userOnline');
            socket.off('userOffline');
            socket.off('userTyping');
            socket.off('test');
        };
    }, [user, handleNewMessage]);

    // Heartbeat functions
    const startHeartbeat = useCallback(() => {
        if (state.heartbeatInterval) {
            clearInterval(state.heartbeatInterval);
        }

        const interval = setInterval(() => {
            if (socket.connected && user?._id) {
                socket.emit('heartbeat', { userId: user._id });
                console.log('💓 Heartbeat sent for user:', user._id);
            }
        }, 30000); // Gửi heartbeat mỗi 30 giây

        dispatch({ type: CHAT_ACTIONS.SET_HEARTBEAT_INTERVAL, payload: interval });
    }, [user, state.heartbeatInterval]);

    const stopHeartbeat = useCallback(() => {
        if (state.heartbeatInterval) {
            clearInterval(state.heartbeatInterval);
            dispatch({ type: CHAT_ACTIONS.SET_HEARTBEAT_INTERVAL, payload: null });
        }
    }, [state.heartbeatInterval]);

    // Heartbeat acknowledgment handler
    useEffect(() => {
        socket.on('heartbeatAck', (data) => {
            console.log('💓 Heartbeat acknowledged:', data);
        });

        return () => {
            socket.off('heartbeatAck');
        };
    }, []);

    // Actions
    const actions = {
        // Load conversations
        loadConversations: async () => {
            if (!user || !user._id) {
                console.warn('Cannot load conversations: user not available');
                return;
            }

            try {
                dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
                const response = await chatService.getConversations();
                dispatch({ type: CHAT_ACTIONS.SET_CONVERSATIONS, payload: response.data });
            } catch (error) {
                console.error('Error loading conversations:', error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
            }
        },

        // Load messages for conversation
        loadMessages: async (conversationId, conversation = null) => {
            if (!user || !user._id) {
                console.warn('Cannot load messages: user not available');
                return;
            }

            // Kiểm tra nếu là mock conversation
            if (conversation && conversation.isMock) {
                console.log('Mock conversation detected, loading mock messages');
                dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

                // Tạo mock messages để test UI
                const mockMessages = [
                    {
                        _id: 'mock_1',
                        content: 'Xin chào! Đây là tin nhắn demo.',
                        senderId: conversation.participantDetails[1]._id,
                        createdAt: new Date(Date.now() - 60000),
                        isRead: true
                    },
                    {
                        _id: 'mock_2',
                        content: 'Chào bạn! Tôi đang test giao diện chat.',
                        senderId: user._id,
                        createdAt: new Date(),
                        isRead: true
                    }
                ];

                setTimeout(() => {
                    dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: mockMessages });
                    dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
                }, 500); // Giả lập loading time
                return;
            }

            try {
                dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });
                const response = await chatService.getConversationMessages(conversationId);
                dispatch({ type: CHAT_ACTIONS.SET_MESSAGES, payload: response.data });
            } catch (error) {
                console.error('Error loading messages:', error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
            } finally {
                dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });
            }
        },

        // Send message
        sendMessage: async (receiverId, content, messageType = 'text', attachments = []) => {
            if (!user || !user._id) {
                const error = 'Cannot send message: user not available';
                console.error(error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error });
                throw new Error(error);
            }

            try {
                // Validate message
                chatService.validateMessage(content, attachments);

                // Tạo message object để hiển thị ngay lập tức
                const tempMessage = {
                    _id: `temp_${Date.now()}`,
                    content,
                    senderId: user._id,
                    receiverId,
                    messageType,
                    attachments,
                    createdAt: new Date(),
                    isRead: false,
                    isTemp: true // Flag để nhận biết tin nhắn tạm
                };

                // Thêm tin nhắn vào UI ngay lập tức
                dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: tempMessage });

                // Send via socket for real-time (chỉ gửi 1 lần)
                console.log('📤 Frontend: Sending message via socket');
                console.log('📤 Frontend: Sender ID:', user._id);
                console.log('📤 Frontend: Sender details:', {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email
                });
                console.log('📤 Frontend: Receiver ID:', receiverId);
                console.log('📤 Frontend: Content:', content);
                console.log('📤 Frontend: Socket connected:', socket.connected);
                console.log('📤 Frontend: Socket ID:', socket.id);

                socket.emit('sendMessage', {
                    senderId: user._id,
                    receiverId,
                    content,
                    messageType,
                    attachments,
                    tempId: tempMessage._id // Gửi kèm temp ID để replace
                });

                console.log('📤 Frontend: sendMessage event emitted');

                // Không gửi API backup để tránh duplicate
            } catch (error) {
                console.error('Error sending message:', error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Mark message as read
        markAsRead: async (messageId) => {
            try {
                socket.emit('markMessageRead', { messageId, userId: user._id });
                await chatService.markMessageAsRead(messageId);
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        },

        // Delete message
        deleteMessage: async (messageId) => {
            try {
                await chatService.deleteMessage(messageId);
                dispatch({ type: CHAT_ACTIONS.DELETE_MESSAGE, payload: messageId });

                // Emit socket event for real-time deletion
                socket.emit('deleteMessage', { messageId, userId: user._id });
            } catch (error) {
                console.error('Error deleting message:', error);
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Start typing
        startTyping: (conversationId) => {
            socket.emit('startTyping', { userId: user._id, conversationId });
        },

        // Stop typing
        stopTyping: (conversationId) => {
            socket.emit('stopTyping', { userId: user._id, conversationId });
        },

        // Set current conversation
        setCurrentConversation: (conversation) => {
            dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CONVERSATION, payload: conversation });
        },

        // Create conversation
        createConversation: async (participantId) => {
            try {
                const response = await chatService.createConversation(participantId);
                dispatch({ type: CHAT_ACTIONS.ADD_CONVERSATION, payload: response.data });
                return response.data;
            } catch (error) {
                dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Clear error
        clearError: () => {
            dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: null });
        },

        // Add message to current conversation
        addMessage: (message) => {
            dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: message });
        },

        // Clear chat data (on logout)
        clearChat: () => {
            dispatch({ type: CHAT_ACTIONS.CLEAR_CHAT });
        },

        // Helper functions for user status
        isUserOnline: (userId) => {
            return state.onlineUsers.includes(userId);
        },

        getUserLastSeen: (userId) => {
            return state.userLastSeen[userId];
        },

        isUserTyping: (conversationId, userId) => {
            return state.typingUsers[conversationId]?.[userId] || false;
        },

        getTypingUsers: (conversationId) => {
            const typing = state.typingUsers[conversationId] || {};
            return Object.keys(typing).filter(userId => typing[userId]);
        },

        updateUserLastSeen: (userId, lastSeen) => {
            dispatch({
                type: CHAT_ACTIONS.UPDATE_USER_LAST_SEEN,
                payload: { userId, lastSeen }
            });
        }
    };

    return (
        <ChatContext.Provider value={{ ...state, ...actions, socket }}>
            {children}
        </ChatContext.Provider>
    );
}

// Hook to use chat context
export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
