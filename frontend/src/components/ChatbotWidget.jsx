import React, { useState, useEffect, useRef } from 'react';
import {
    Box, TextField, Typography, Paper, CircularProgress,
    List, ListItem, ListItemText, InputAdornment, IconButton, Fab,
    Button, Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

import chatbotAvatar from '/chatbot-avatar.png';
// import userAvatar from '/user-avatar.png'; // BỎ DÒNG NÀY ĐI HOẶC COMMENT LẠI

// Import useAuth từ AuthContext của bạn
import { useAuth } from '../context/AuthContext'; // Đảm bảo đường dẫn này đúng

const BACKEND_API_URL = 'http://localhost:5000/api/dialogflow-text-input';

const ChatbotWidget = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showGreeting, setShowGreeting] = useState(false);

    const messagesEndRef = useRef(null);

    // Lấy user object từ AuthContext
    const { user } = useAuth();
    // Định nghĩa userAvatarUrl, ưu tiên avatarUrl từ user, nếu không có thì dùng avatar mặc định
    const userAvatarUrl = user?.avatarUrl || '/user-avatar.png'; // Đường dẫn avatar mặc định

    // Initialize session ID
    useEffect(() => {
        setSessionId(uuidv4());
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    // Manage greeting visibility: appear for 5 seconds, disappear, repeat every 5 seconds
    useEffect(() => {
        let greetingShowTimer;
        let greetingHideTimer;

        const startGreetingCycle = () => {
            // Clear any existing timers to prevent multiple cycles
            clearTimeout(greetingShowTimer);
            clearTimeout(greetingHideTimer);

            // Show greeting after 5 seconds
            greetingShowTimer = setTimeout(() => {
                if (!isOpen && messages.length === 0) { // Only show if chatbot is closed and no messages
                    setShowGreeting(true);
                    // Hide greeting after another 5 seconds
                    greetingHideTimer = setTimeout(() => {
                        setShowGreeting(false);
                        // Start the cycle again after it has been hidden for the remaining time (5s - 5s = 0, but effectively after a short delay for next cycle)
                        // To make it appear every 5 seconds (5s visible, then wait 0s, then 5s visible), we start the next show timer after the current one has finished.
                        // If you want it to appear for 5s, then be hidden for 5s, then appear again, the total cycle is 10s.
                        // Let's assume you want "appear for 5s, then hidden for 5s, then appear".
                        startGreetingCycle(); // Loop the cycle
                    }, 5000); // Hide after 5 seconds of being shown
                } else {
                    // If conditions are not met, don't show and try again later
                    startGreetingCycle(); // Re-evaluate after a short delay
                }
            }, 5000); // First show after 5 seconds of component mount or previous hide
        };

        if (!isOpen) {
            // Only start the cycle if the chatbot is not open
            startGreetingCycle();
        } else {
            // If chatbot is open, hide greeting immediately and clear timers
            setShowGreeting(false);
            clearTimeout(greetingShowTimer);
            clearTimeout(greetingHideTimer);
        }

        // Cleanup function
        return () => {
            clearTimeout(greetingShowTimer);
            clearTimeout(greetingHideTimer);
        };
    }, [isOpen, messages.length]); // Re-run when chatbot opens/closes or messages change

    const sendSuggestion = (text) => {
        setInput(text);
        sendMessage(text);
        setSuggestions([]);
    };

    const sendMessage = async (messageText = input) => {
        if (messageText.trim() === '' || !sessionId) return;

        const userMessage = { text: messageText, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setLoading(true);
        setSuggestions([]);
        setShowGreeting(false); // Hide greeting immediately when user sends a message

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text, sessionId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(`HTTP error! Status: ${response.status}, message: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Data from Dialogflow (Frontend):', data);

            const botMessage = { text: data.fulfillmentText || "Sorry, I didn't understand that.", sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            let newSuggestions = [];

            // Helper function to extract protobuf values
            const extractProtobufValue = (valueObject) => {
                if (valueObject === null || typeof valueObject !== 'object') {
                    return valueObject;
                }
                if (valueObject.hasOwnProperty('stringValue')) {
                    return valueObject.stringValue;
                }
                if (valueObject.hasOwnProperty('numberValue')) {
                    return valueObject.numberValue;
                }
                if (valueObject.hasOwnProperty('boolValue')) {
                    return valueObject.boolValue;
                }
                if (valueObject.hasOwnProperty('listValue') && valueObject.listValue.hasOwnProperty('values') && Array.isArray(valueObject.listValue.values)) {
                    return valueObject.listValue.values.map(extractProtobufValue);
                }
                if (valueObject.hasOwnProperty('structValue') && valueObject.structValue.hasOwnProperty('fields')) {
                    const extractedStruct = {};
                    for (const key in valueObject.structValue.fields) {
                        extractedStruct[key] = extractProtobufValue(valueObject.structValue.fields[key]);
                    }
                    return extractedStruct;
                }
                // Fallback for objects that don't match specific protobuf types but might contain nested values
                const extractedObject = {};
                for (const key in valueObject) {
                    if (valueObject.hasOwnProperty(key)) {
                        extractedObject[key] = extractProtobufValue(valueObject[key]);
                    }
                }
                return extractedObject;
            };

            // Function to recursively find chips in richContent structure
            const findChipsInRichContent = (content) => {
                if (!content) return null;

                // Handle nested arrays and objects
                if (Array.isArray(content)) {
                    for (const item of content) {
                        const result = findChipsInRichContent(item);
                        if (result) return result;
                    }
                } else if (typeof content === 'object') {
                    const extractedItem = extractProtobufValue(content);
                    if (extractedItem && extractedItem.type === 'chips' && Array.isArray(extractedItem.options) && extractedItem.options.length > 0) {
                        return extractedItem.options;
                    }
                    for (const key in content) {
                        if (content.hasOwnProperty(key)) {
                            const result = findChipsInRichContent(content[key]);
                            if (result) return result;
                        }
                    }
                }
                return null;
            };

            // Prioritized search for suggestions
            if (data.richContent) {
                newSuggestions = findChipsInRichContent(data.richContent);
            }

            if (!newSuggestions && data.fulfillmentMessages && Array.isArray(data.fulfillmentMessages)) {
                for (const message of data.fulfillmentMessages) {
                    if (message.payload && message.payload.richContent) {
                        newSuggestions = findChipsInRichContent(message.payload.richContent);
                        if (newSuggestions) break;
                    }
                }
            }

            if (!newSuggestions && data.webhookPayload && data.webhookPayload.richContent) {
                newSuggestions = findChipsInRichContent(data.webhookPayload.richContent);
            }

            setSuggestions(newSuggestions || []); // Ensure suggestions is always an array

        } catch (error) {
            console.error('Error sending message to Dialogflow:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Sorry, there was an error communicating with the chatbot. Please try again later.', sender: 'bot' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        setShowGreeting(false); // Hide greeting immediately when clicking the icon
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
            {/* Greeting text outside the icon */}
            {showGreeting && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        right: 80,
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        p: 1,
                        borderRadius: '8px',
                        boxShadow: 3,
                        whiteSpace: 'nowrap',
                        animation: 'fadeInOut 4s infinite', // Keep this animation for smooth transition
                        '@keyframes fadeInOut': {
                            '0%, 100%': { opacity: 0 }, // Start and end hidden
                            '25%, 75%': { opacity: 1 }, // Visible during the middle part
                        },
                        // You can remove this if you want it to snap
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: showGreeting ? 1 : 0,
                        pointerEvents: 'none',
                    }}
                >
                    Hù , Bạn cần hổ trợ gì không nè!
                </Typography>
            )}

            <Fab
                color="primary"
                aria-label="chat"
                onClick={toggleChatbot}
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    boxShadow: 6,
                    transform: isOpen ? 'scale(0)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <Avatar
                    alt="Chatbot Icon"
                    src={chatbotAvatar}
                    sx={{ width: '100%', height: '100%', bgcolor: 'transparent' }}
                />
            </Fab>

            <Paper
                elevation={6}
                sx={{
                    width: 350,
                    height: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    transform: isOpen ? 'translateY(0)' : 'translateY(100px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    boxShadow: 8,
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    }}
                >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            alt="Chatbot Icon"
                            src={chatbotAvatar}
                            sx={{ width: 24, height: 24, mr: 0.5 }}
                        />
                        Chatbot Hỗ Trợ
                    </Typography>
                    <IconButton size="small" onClick={toggleChatbot} color="inherit">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <List
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 2,
                        bgcolor: 'grey.100',
                    }}
                >
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1,
                            }}
                        >
                            {msg.sender === 'bot' && (
                                <Avatar
                                    alt="Chatbot Avatar"
                                    src={chatbotAvatar}
                                    sx={{ width: 32, height: 32, mr: 1, bgcolor: 'transparent' }}
                                />
                            )}
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1.2,
                                    borderRadius: '16px',
                                    bgcolor: msg.sender === 'user' ? 'primary.light' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'text.primary',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    wordBreak: 'break-word',
                                }}
                            >
                                <ListItemText primary={msg.text} sx={{ m: 0 }} />
                            </Paper>
                            {msg.sender === 'user' && (
                                <Avatar
                                    alt="User Avatar"
                                    // SỬ DỤNG userAvatarUrl TỪ AUTHCONTEXT Ở ĐÂY
                                    src={userAvatarUrl}
                                    sx={{ width: 32, height: 32, ml: 1, bgcolor: 'transparent' }}
                                />
                            )}
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>

                {suggestions.length > 0 && (
                    <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, borderTop: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
                        {suggestions.map((sugg, idx) => (
                            <Button
                                key={idx}
                                variant="outlined"
                                size="small"
                                onClick={() => sendSuggestion(sugg.postback)}
                                sx={{ borderRadius: '20px', textTransform: 'none' }}
                            >
                                {sugg.text}
                            </Button>
                        ))}
                    </Box>
                )}

                <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Nhập câu hỏi của bạn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                                pr: 0.5,
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {loading ? (
                                        <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                                    ) : (
                                        <IconButton onClick={() => sendMessage()} edge="end" color="primary" disabled={input.trim() === ''}>
                                            <SendIcon />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default ChatbotWidget;