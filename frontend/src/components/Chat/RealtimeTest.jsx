import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import socket from '../../socket';
import { useAuth } from '../../context/AuthContext';

const RealtimeTest = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(`[RealtimeTest] ${message}`);
    };

    useEffect(() => {
        if (!user) return;

        // Check initial connection status
        setConnectionStatus(socket.connected ? 'Connected' : 'Disconnected');
        addLog(`Initial socket status: ${socket.connected ? 'Connected' : 'Disconnected'}`);

        // Connect socket if not connected
        if (!socket.connected) {
            addLog('Attempting to connect socket...');
            socket.connect();
        } else {
            // If already connected, join room immediately
            socket.emit('joinUserRoom', user._id);
            addLog(`Already connected, joined user room: user_${user._id}`);
        }

        // Socket event listeners
        socket.on('connect', () => {
            setConnectionStatus('Connected');
            addLog(`Socket connected with ID: ${socket.id}`);

            // Join user room
            socket.emit('joinUserRoom', user._id);
            addLog(`Joined user room: user_${user._id}`);
        });

        socket.on('disconnect', () => {
            setConnectionStatus('Disconnected');
            addLog('Socket disconnected');
        });

        socket.on('test', (data) => {
            addLog(`Test event received: ${JSON.stringify(data)}`);
        });

        socket.on('newMessage', (message) => {
            addLog(`New message received: ${message.content}`);
            setMessages(prev => [...prev, {
                id: message._id || message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                timestamp: new Date().toLocaleTimeString(),
                type: 'received'
            }]);
        });

        socket.on('messageSent', (response) => {
            if (response.success) {
                addLog(`Message sent successfully: ${response.message._id}`);
            } else {
                addLog(`Message send failed: ${response.error}`);
            }
        });

        socket.on('conversationUpdate', (data) => {
            addLog(`Conversation update: ${data.conversationId}`);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('test');
            socket.off('newMessage');
            socket.off('messageSent');
            socket.off('conversationUpdate');
        };
    }, [user]);

    const sendTestMessage = () => {
        if (!newMessage.trim() || !receiverId.trim()) {
            addLog('Please enter both message and receiver ID');
            return;
        }

        const messageData = {
            senderId: user._id,
            receiverId: receiverId.trim(),
            content: newMessage.trim(),
            messageType: 'text',
            attachments: [],
            tempId: `temp_${Date.now()}`
        };

        addLog(`Sending message: "${newMessage}" to ${receiverId}`);
        socket.emit('sendMessage', messageData);

        // Add to local messages for display
        setMessages(prev => [...prev, {
            id: messageData.tempId,
            content: messageData.content,
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            timestamp: new Date().toLocaleTimeString(),
            type: 'sent'
        }]);

        setNewMessage('');
    };

    const clearLogs = () => {
        setLogs([]);
        setMessages([]);
    };

    if (!user) {
        return (
            <Box p={2}>
                <Typography>Please login to test real-time messaging</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                Real-time Messaging Test
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
                Current User: {user.fullName} (ID: {user._id})
            </Typography>

            <Typography variant="body2" color={connectionStatus === 'Connected' ? 'success.main' : 'error.main'} gutterBottom>
                Status: {connectionStatus}
            </Typography>

            <Box mb={2}>
                <TextField
                    fullWidth
                    label="Receiver User ID"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    placeholder="Enter receiver's user ID"
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Enter your message"
                    margin="normal"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendTestMessage();
                        }
                    }}
                />
                <Box mt={1}>
                    <Button
                        variant="contained"
                        onClick={sendTestMessage}
                        disabled={!newMessage.trim() || !receiverId.trim()}
                        sx={{ mr: 1 }}
                    >
                        Send Message
                    </Button>
                    <Button variant="outlined" onClick={clearLogs}>
                        Clear Logs
                    </Button>
                </Box>
            </Box>

            <Box display="flex" gap={2}>
                <Paper sx={{ flex: 1, p: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Messages</Typography>
                    <List dense>
                        {messages.map((msg) => (
                            <ListItem key={msg.id}>
                                <ListItemText
                                    primary={msg.content}
                                    secondary={`${msg.type === 'sent' ? 'Sent' : 'Received'} at ${msg.timestamp}`}
                                    sx={{
                                        color: msg.type === 'sent' ? 'primary.main' : 'text.primary'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Paper sx={{ flex: 1, p: 2, maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Debug Logs</Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {logs.map((log, index) => (
                            <div key={index}>{log}</div>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default RealtimeTest;
