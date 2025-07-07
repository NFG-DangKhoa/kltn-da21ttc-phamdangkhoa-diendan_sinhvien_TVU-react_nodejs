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
const WIDGET_SETTINGS_API_URL = 'http://localhost:5000/api/chatbot-widget-settings';

const ChatbotWidget = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showGreeting, setShowGreeting] = useState(false);
    const [widgetSettings, setWidgetSettings] = useState(null); // New state for settings

    const messagesEndRef = useRef(null);

    const { user } = useAuth();
    const userAvatarUrl = user?.avatarUrl || '/user-avatar.png';

    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    // Fetch widget settings on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(WIDGET_SETTINGS_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setWidgetSettings(data.data);
                // Apply autoOpen setting
                if (data.data.autoOpen) {
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Error fetching widget settings:', error);
                // Fallback to default settings or handle error gracefully
            }
        };
        fetchSettings();
    }, []);

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
        let cycleTimer;

        const startGreetingCycle = () => {
            // Use widgetSettings.greetingDelay if available, otherwise default to 5000
            const delay = widgetSettings?.greetingDelay || 5000;
            if (!isOpen && messages.length === 0) {
                greetingShowTimer = setTimeout(() => {
                    setShowGreeting(true);
                    greetingHideTimer = setTimeout(() => {
                        setShowGreeting(false);
                        cycleTimer = setTimeout(() => {
                            if (!isOpen && messages.length === 0) {
                                startGreetingCycle();
                            }
                        }, delay); // Use delay here
                    }, delay); // Use delay here
                }, delay); // Use delay here
            } else {
                setShowGreeting(false);
                clearTimeout(greetingShowTimer);
                clearTimeout(greetingHideTimer);
                clearTimeout(cycleTimer);
            }
        };

        // Only start greeting cycle if settings are loaded and autoOpen is false
        if (widgetSettings && !widgetSettings.autoOpen) {
            startGreetingCycle();
        }


        return () => {
            clearTimeout(greetingShowTimer);
            clearTimeout(greetingHideTimer);
            clearTimeout(cycleTimer);
        };
    }, [isOpen, messages.length, widgetSettings]); // Add widgetSettings to dependency array

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
                body: JSON.stringify({ message: userMessage.text, sessionId, userId: user?._id }),
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

    const toggleChatbot = async () => {
        const newState = !isOpen;
        setIsOpen(newState);
        setShowGreeting(false);

        // If the chatbot is being closed and there are messages in the current session
        if (!newState && messages.length > 0 && sessionId) {
            try {
                await fetch('http://localhost:5000/api/end-chatbot-conversation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });
                console.log('Chatbot conversation ended successfully.');
                // Optionally, reset messages and sessionId for a fresh start next time
                setMessages([]);
                setSessionId(uuidv4()); // Generate a new session ID for the next conversation
            } catch (error) {
                console.error('Error ending chatbot conversation:', error);
            }
        }
    };

    // Helper to get position styles
    const getPositionStyles = (position) => {
        switch (position) {
            case 'top-left': return { top: 16, left: 16, bottom: 'auto', right: 'auto' };
            case 'top-right': return { top: 16, right: 16, bottom: 'auto', left: 'auto' };
            case 'bottom-left': return { bottom: 16, left: 16, top: 'auto', right: 'auto' };
            case 'bottom-right':
            default: return { bottom: 16, right: 16, top: 'auto', left: 'auto' };
        }
    };

    // Helper to get size styles
    const getSizeStyles = (size) => {
        switch (size) {
            case 'small': return { width: 300, height: 350 };
            case 'large': return { width: 400, height: 500 };
            case 'medium':
            default: return { width: 350, height: 420 };
        }
    };

    if (!widgetSettings) {
        return null; // Or a loading spinner
    }

    const { primaryColor, secondaryColor, textColor, greetingMessage, position, size, showAvatar } = widgetSettings;

    const currentPositionStyles = getPositionStyles(position);
    const currentSizeStyles = getSizeStyles(size);

    return (
        <Box sx={{
            position: 'fixed',
            zIndex: 1001,
            ...currentPositionStyles, // Apply position styles
        }}>
            {showGreeting && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        bottom: 24,
                        right: 80,
                        bgcolor: darkMode ? '#4a4b4c' : secondaryColor, // Use secondaryColor
                        color: darkMode ? '#e4e6eb' : textColor, // Use textColor
                        p: 1,
                        borderRadius: '8px',
                        boxShadow: 3,
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: showGreeting ? 1 : 0,
                        pointerEvents: 'none',
                    }}
                >
                    {greetingMessage}!
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
                    backgroundColor: primaryColor, // Use primaryColor
                    '&:hover': {
                        backgroundColor: primaryColor, // Use primaryColor
                    },
                }}
            >
                {showAvatar && ( // Conditionally render avatar
                    <Avatar
                        alt="Chatbot Icon"
                        src={chatbotAvatar}
                        sx={{ width: '100%', height: '100%', bgcolor: 'transparent' }}
                    />
                )}
            </Fab>

            <Paper
                elevation={6}
                sx={{
                    mt: 20,
                    ...currentSizeStyles, // Apply size styles
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
                    backgroundColor: darkMode ? '#3a3b3c' : secondaryColor, // Use secondaryColor
                    border: darkMode ? '1px solid #555' : `1px solid ${primaryColor}`, // Use primaryColor for border
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: primaryColor, // Use primaryColor
                        color: 'white', // Text color on header is always white for contrast
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    }}
                >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {showAvatar && ( // Conditionally render avatar
                            <Avatar
                                alt="Chatbot Icon"
                                src={chatbotAvatar}
                                sx={{ width: 24, height: 24, mr: 0.5 }}
                            />
                        )}
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
                            {msg.sender === 'bot' && showAvatar && ( // Conditionally render avatar
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
                                        ? primaryColor // Use primaryColor for user messages
                                        : (darkMode ? '#4a4b4c' : 'white'),
                                    color: msg.sender === 'user' ? 'white' : (darkMode ? '#e4e6eb' : textColor), // Use textColor for bot messages
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
                        borderTop: darkMode ? '1px solid #555' : `1px solid ${primaryColor}`, // Use primaryColor for border
                        bgcolor: darkMode ? '#3a3b3c' : secondaryColor // Use secondaryColor
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
                                    borderColor: primaryColor, // Use primaryColor
                                    color: primaryColor, // Use primaryColor
                                    '&:hover': {
                                        backgroundColor: primaryColor, // Use primaryColor
                                        borderColor: primaryColor, // Use primaryColor
                                        color: 'white', // White text on hover
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
                    borderTop: darkMode ? '1px solid #555' : `1px solid ${primaryColor}`, // Use primaryColor for border
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: darkMode ? '#3a3b3c' : secondaryColor // Use secondaryColor
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
                                color: darkMode ? '#e4e6eb' : textColor, // Use textColor
                                '& fieldset': {
                                    borderColor: primaryColor, // Use primaryColor
                                },
                                '&:hover fieldset': {
                                    borderColor: primaryColor, // Use primaryColor
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: primaryColor, // Use primaryColor
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
                                        <CircularProgress size={24} sx={{ color: primaryColor }} /> // Use primaryColor
                                    ) : (
                                        <IconButton onClick={() => sendMessage()} edge="end" color="primary" disabled={input.trim() === ''}>
                                            <SendIcon sx={{ color: primaryColor }} /> {/* Use primaryColor */}
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
