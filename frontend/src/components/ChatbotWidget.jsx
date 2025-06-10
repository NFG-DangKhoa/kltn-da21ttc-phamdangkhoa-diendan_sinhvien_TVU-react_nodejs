import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box, TextField, Typography, Paper, CircularProgress,
    List, ListItem, ListItemText, InputAdornment, IconButton, Fab,
    Button, Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

import chatbotAvatar from '/chatbot-avatar.png';

import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

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

    const { user } = useAuth();
    const userAvatarUrl = user?.avatarUrl || '/user-avatar.png';

    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    useEffect(() => {
        setSessionId(uuidv4());
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        let greetingShowTimer;
        let greetingHideTimer;

        const startGreetingCycle = () => {
            if (!isOpen && messages.length === 0) {
                greetingShowTimer = setTimeout(() => {
                    setShowGreeting(true);
                    greetingHideTimer = setTimeout(() => {
                        setShowGreeting(false);
                        setTimeout(startGreetingCycle, 5000);
                    }, 5000);
                }, 5000);
            } else {
                setShowGreeting(false);
                clearTimeout(greetingShowTimer);
                clearTimeout(greetingHideTimer);
            }
        };

        startGreetingCycle();

        return () => {
            clearTimeout(greetingShowTimer);
            clearTimeout(greetingHideTimer);
        };
    }, [isOpen, messages.length]);

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
        setShowGreeting(false);

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

            const botMessage = { text: data.fulfillmentText || "Xin lỗi, tôi không hiểu.", sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            let newSuggestions = [];

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
                const extractedObject = {};
                for (const key in valueObject) {
                    if (valueObject.hasOwnProperty(key)) {
                        extractedObject[key] = extractProtobufValue(valueObject[key]);
                    }
                }
                return extractedObject;
            };

            const findChipsInRichContent = (content) => {
                if (!content) return null;

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

            setSuggestions(newSuggestions || []);

        } catch (error) {
            console.error('Error sending message to Dialogflow:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Xin lỗi, có lỗi xảy ra khi kết nối với chatbot. Vui lòng thử lại sau.', sender: 'bot' }
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
        setShowGreeting(false);
    };

    return (
        <Box sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
        }}>
            {showGreeting && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        right: 80,
                        bgcolor: darkMode ? '#4a4b4c' : 'background.paper',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        p: 1,
                        borderRadius: '8px',
                        boxShadow: 3,
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: showGreeting ? 1 : 0,
                        pointerEvents: 'none',
                    }}
                >
                    Hù, bạn cần hỗ trợ gì không nè!
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
                    backgroundColor: darkMode ? '#1877F2' : '#2196F3',
                    '&:hover': {
                        backgroundColor: darkMode ? '#166FEF' : '#1976D2',
                    },
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
                    mt: 20,
                    width: 350,
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    transform: isOpen ? 'translateY(0)' : 'translateY(100px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    boxShadow: 8,
                    position: 'absolute',
                    bottom: 40,
                    right: 0,
                    backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                    border: darkMode ? '1px solid #555' : '1px solid #ccc',
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: darkMode ? '#242526' : 'primary.main',
                        color: darkMode ? '#e4e6eb' : 'white',
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
                        bgcolor: darkMode ? '#2d2e2f' : 'grey.100',
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
                                    bgcolor: msg.sender === 'user'
                                        ? (darkMode ? '#1877F2' : 'primary.light')
                                        : (darkMode ? '#4a4b4c' : 'white'),
                                    color: msg.sender === 'user' ? 'white' : (darkMode ? '#e4e6eb' : 'text.primary'),
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
                                    src={userAvatarUrl}
                                    sx={{ width: 32, height: 32, ml: 1, bgcolor: 'transparent' }}
                                />
                            )}
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>

                {suggestions.length > 0 && (
                    <Box sx={{
                        p: 1.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        borderTop: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
                        bgcolor: darkMode ? '#3a3b3c' : 'background.paper'
                    }}>
                        {suggestions.map((sugg, idx) => (
                            <Button
                                key={idx}
                                variant="outlined"
                                size="small"
                                onClick={() => sendSuggestion(sugg.postback)}
                                sx={{
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    borderColor: darkMode ? '#65676b' : 'grey.400',
                                    color: darkMode ? '#90caf9' : 'primary.main',
                                    '&:hover': {
                                        backgroundColor: darkMode ? '#555' : 'action.hover',
                                        borderColor: darkMode ? '#90caf9' : 'primary.main',
                                    }
                                }}
                            >
                                {sugg.text}
                            </Button>
                        ))}
                    </Box>
                )}

                <Box sx={{
                    p: 1.5,
                    borderTop: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: darkMode ? '#3a3b3c' : 'background.paper'
                }}>
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
                                backgroundColor: darkMode ? '#4a4b4c' : 'white',
                                color: darkMode ? '#e4e6eb' : 'text.primary',
                                '& fieldset': {
                                    borderColor: darkMode ? '#65676b' : 'grey.400',
                                },
                                '&:hover fieldset': {
                                    borderColor: darkMode ? '#8a8d91' : 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: darkMode ? '#1877F2' : 'primary.main',
                                },
                            },
                            // Thêm style cho phần input bên trong TextField
                            '& .MuiOutlinedInput-input': {
                                height: '24px', // Chiều cao cố định, có thể điều chỉnh**
                                minHeight: '24px', // Đảm bảo chiều cao tối thiểu**
                                padding: '8px 14px', // Điều chỉnh padding để văn bản hiển thị đẹp hơn
                            },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {loading ? (
                                        <CircularProgress size={24} sx={{ color: darkMode ? '#90caf9' : 'primary.main' }} />
                                    ) : (
                                        <IconButton onClick={() => sendMessage()} edge="end" color="primary" disabled={input.trim() === ''}>
                                            <SendIcon sx={{ color: darkMode ? '#90caf9' : 'primary.main' }} />
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