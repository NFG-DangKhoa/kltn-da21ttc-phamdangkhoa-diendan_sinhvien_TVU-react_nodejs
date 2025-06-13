import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';

const RealtimeTestPanel = () => {
    const { user } = useAuth();
    const { onlineUsers, isConnected } = useChat();
    const [testMessage, setTestMessage] = useState('');
    const [socketEvents, setSocketEvents] = useState([]);
    const [heartbeatStatus, setHeartbeatStatus] = useState('Unknown');

    useEffect(() => {
        // Listen to all socket events for debugging
        const eventLogger = (eventName) => (data) => {
            const timestamp = new Date().toLocaleTimeString();
            setSocketEvents(prev => [...prev.slice(-9), {
                timestamp,
                event: eventName,
                data: JSON.stringify(data, null, 2)
            }]);
        };

        // Socket event listeners
        socket.on('connect', eventLogger('connect'));
        socket.on('disconnect', eventLogger('disconnect'));
        socket.on('newMessage', eventLogger('newMessage'));
        socket.on('userOnline', eventLogger('userOnline'));
        socket.on('userOffline', eventLogger('userOffline'));
        socket.on('heartbeatAck', (data) => {
            setHeartbeatStatus('OK');
            eventLogger('heartbeatAck')(data);
        });
        socket.on('userTyping', eventLogger('userTyping'));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('newMessage');
            socket.off('userOnline');
            socket.off('userOffline');
            socket.off('heartbeatAck');
            socket.off('userTyping');
        };
    }, []);

    const sendTestMessage = () => {
        if (!testMessage.trim() || !user) return;

        // Find another user to send test message to
        const otherUser = onlineUsers.find(userId => userId !== user._id);
        if (!otherUser) {
            alert('Không có user online khác để test!');
            return;
        }

        socket.emit('sendMessage', {
            senderId: user._id,
            receiverId: otherUser,
            content: `[TEST] ${testMessage}`,
            messageType: 'text',
            attachments: []
        });

        setTestMessage('');
    };

    const sendHeartbeat = () => {
        if (user) {
            socket.emit('heartbeat', { userId: user._id });
            setHeartbeatStatus('Sent...');
        }
    };

    const requestUserActivities = () => {
        socket.emit('getUserActivities');
    };

    return (
        <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            <Typography variant="h4" gutterBottom sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 3,
                textAlign: 'center'
            }}>
                🧪 Real-time Chat Test Panel
            </Typography>

            {/* Connection Status */}
            <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
                    📡 Connection Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={`Socket: ${isConnected ? 'Connected' : 'Disconnected'}`}
                        color={isConnected ? 'success' : 'error'}
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Socket ID: ${socket.id || 'N/A'}`}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Heartbeat: ${heartbeatStatus}`}
                        color={heartbeatStatus === 'OK' ? 'success' : 'warning'}
                        sx={{ fontWeight: 500 }}
                    />
                </Box>
                <Button
                    variant="outlined"
                    onClick={sendHeartbeat}
                    disabled={!isConnected}
                    sx={{ mr: 1 }}
                >
                    Send Heartbeat
                </Button>
                <Button
                    variant="outlined"
                    onClick={requestUserActivities}
                    disabled={!isConnected}
                >
                    Get User Activities
                </Button>
            </Paper>

            {/* Online Users */}
            <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
                    👥 Online Users ({onlineUsers.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {onlineUsers.map(userId => (
                        <Chip
                            key={userId}
                            label={userId === user?._id ? `${userId} (You)` : userId}
                            color={userId === user?._id ? 'primary' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                    ))}
                </Box>
                {onlineUsers.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>No users online</Alert>
                )}
            </Paper>

            {/* Test Message */}
            <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
                    💬 Send Test Message
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Enter test message..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={sendTestMessage}
                        disabled={!testMessage.trim() || !isConnected}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                            }
                        }}
                    >
                        Send
                    </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Will send to first available online user
                </Typography>
            </Paper>

            {/* Socket Events Log */}
            <Paper sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#374151', fontWeight: 600 }}>
                    📋 Socket Events Log (Last 10)
                </Typography>
                <List dense sx={{
                    maxHeight: 400,
                    overflow: 'auto',
                    backgroundColor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                }}>
                    {socketEvents.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="No events yet..." />
                        </ListItem>
                    ) : (
                        socketEvents.map((event, index) => (
                            <React.Fragment key={index}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={event.event}
                                                    size="small"
                                                    color="primary"
                                                />
                                                <Typography variant="caption">
                                                    {event.timestamp}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <pre style={{
                                                fontSize: '0.75rem',
                                                margin: 0,
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '100px',
                                                overflow: 'auto'
                                            }}>
                                                {event.data}
                                            </pre>
                                        }
                                    />
                                </ListItem>
                                {index < socketEvents.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default RealtimeTestPanel;
