import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import socket from '../../socket';
import { useAuth } from '../../context/AuthContext';

const SocketDebug = () => {
    const [socketStatus, setSocketStatus] = useState('disconnected');
    const [events, setEvents] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Socket event listeners for debugging
        socket.on('connect', () => {
            setSocketStatus('connected');
            addEvent('Socket connected', 'success');
        });

        socket.on('disconnect', () => {
            setSocketStatus('disconnected');
            addEvent('Socket disconnected', 'error');
        });

        socket.on('test', (data) => {
            addEvent(`Test event received: ${JSON.stringify(data)}`, 'info');
        });

        socket.on('newMessage', (message) => {
            addEvent(`New message received: ${message.content}`, 'success');
        });

        socket.on('messageDeleted', (data) => {
            addEvent(`Message deleted: ${data.messageId}`, 'warning');
        });

        socket.on('messageSent', (response) => {
            addEvent(`Message sent response: ${response.success}`, response.success ? 'success' : 'error');
        });

        // Check initial connection status
        setSocketStatus(socket.connected ? 'connected' : 'disconnected');

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('test');
            socket.off('newMessage');
            socket.off('messageDeleted');
            socket.off('messageSent');
        };
    }, []);

    const addEvent = (message, type) => {
        const timestamp = new Date().toLocaleTimeString();
        setEvents(prev => [...prev.slice(-9), { message, type, timestamp }]);
    };

    const testConnection = () => {
        if (user) {
            socket.emit('joinUserRoom', user._id);
            addEvent(`Joining user room: ${user._id}`, 'info');
        }
    };

    const testMessage = () => {
        if (user) {
            socket.emit('sendMessage', {
                senderId: user._id,
                receiverId: user._id, // Send to self for testing
                content: 'Test message from debug',
                messageType: 'text',
                attachments: []
            });
            addEvent('Test message sent', 'info');
        }
    };

    const clearEvents = () => {
        setEvents([]);
    };

    const getStatusColor = () => {
        switch (socketStatus) {
            case 'connected': return 'success';
            case 'connecting': return 'warning';
            default: return 'error';
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'success': return 'success';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    return (
        <Paper sx={{ p: 2, m: 2, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
                Socket Debug Panel
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Status:</Typography>
                <Chip 
                    label={socketStatus} 
                    color={getStatusColor()}
                    size="small"
                />
                <Typography variant="body2">Socket ID: {socket.id || 'N/A'}</Typography>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={testConnection}
                    disabled={!user}
                >
                    Test Connection
                </Button>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={testMessage}
                    disabled={!user || socketStatus !== 'connected'}
                >
                    Test Message
                </Button>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={clearEvents}
                >
                    Clear Events
                </Button>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
                Recent Events:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {events.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No events yet...
                    </Typography>
                ) : (
                    events.map((event, index) => (
                        <Box key={index} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {event.timestamp}
                            </Typography>
                            <Chip 
                                label={event.message} 
                                color={getEventColor(event.type)}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    ))
                )}
            </Box>
        </Paper>
    );
};

export default SocketDebug;
