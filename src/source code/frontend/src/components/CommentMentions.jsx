import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText,
    Paper, Popper, ClickAwayListener, TextField, InputAdornment, Chip
} from '@mui/material';
import { Search as SearchIcon, AlternateEmail as MentionIcon } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const CommentMentions = ({
    text,
    onTextChange,
    onMention,
    textFieldRef,
    disabled = false
}) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [anchorEl, setAnchorEl] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mentionStart, setMentionStart] = useState(-1);
    const [loading, setLoading] = useState(false);

    // Search for users when mention is triggered
    const searchUsers = async (query) => {
        if (!query || query.length < 2) {
            setUsers([]);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/users/search?q=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setUsers([]);
        }
        setLoading(false);
    };

    // Handle text change and detect mentions
    const handleTextChange = (newText) => {
        onTextChange(newText);

        // Get cursor position
        const textarea = textFieldRef.current?.querySelector('textarea');
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = newText.substring(0, cursorPos);

        // Find the last @ symbol before cursor
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            // Check if @ is at start or preceded by whitespace
            const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
            if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
                const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

                // Check if there's no space after @
                if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                    setMentionStart(lastAtIndex);
                    setSearchTerm(textAfterAt);
                    setAnchorEl(textarea);
                    searchUsers(textAfterAt);
                    return;
                }
            }
        }

        // Close mention popup if no valid mention found
        setAnchorEl(null);
        setMentionStart(-1);
        setSearchTerm('');
        setUsers([]);
    };

    // Handle user selection
    const handleUserSelect = (user) => {
        if (mentionStart === -1) return;

        const textarea = textFieldRef.current?.querySelector('textarea');
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const textBeforeMention = text.substring(0, mentionStart);
        const textAfterCursor = text.substring(cursorPos);

        const mention = `@${user.username}`;
        const newText = textBeforeMention + mention + ' ' + textAfterCursor;

        onTextChange(newText);

        // Set cursor position after mention
        setTimeout(() => {
            const newCursorPos = mentionStart + mention.length + 1;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);

        // Close popup
        setAnchorEl(null);
        setMentionStart(-1);
        setSearchTerm('');
        setUsers([]);

        // Notify parent about mention
        if (onMention) {
            onMention(user);
        }
    };

    // Close popup
    const handleClose = () => {
        setAnchorEl(null);
        setMentionStart(-1);
        setSearchTerm('');
        setUsers([]);
    };

    // Extract mentions from text for display
    const extractMentions = (text) => {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push({
                username: match[1],
                start: match.index,
                end: match.index + match[0].length
            });
        }

        return mentions;
    };

    // Render text with highlighted mentions
    const renderTextWithMentions = (text) => {
        const mentions = extractMentions(text);
        if (mentions.length === 0) return text;

        const parts = [];
        let lastIndex = 0;

        mentions.forEach((mention, index) => {
            // Add text before mention
            if (mention.start > lastIndex) {
                parts.push(text.substring(lastIndex, mention.start));
            }

            // Add mention as chip
            parts.push(
                <Chip
                    key={index}
                    label={`@${mention.username}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{
                        mx: 0.25,
                        height: 20,
                        fontSize: '0.75rem'
                    }}
                />
            );

            lastIndex = mention.end;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    return (
        <>
            {/* Mention suggestions popup */}
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="top-start"
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                ]}
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper
                        sx={{
                            backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                            borderRadius: 1,
                            boxShadow: darkMode
                                ? '0px 4px 20px rgba(0,0,0,0.5)'
                                : '0px 4px 20px rgba(0,0,0,0.1)',
                            maxWidth: 300,
                            maxHeight: 200,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Search header */}
                        <Box sx={{ p: 1, borderBottom: `1px solid ${darkMode ? '#555' : '#ddd'}` }}>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                Tìm kiếm: @{searchTerm}
                            </Typography>
                        </Box>

                        {/* User list */}
                        <List sx={{ p: 0, maxHeight: 150, overflow: 'auto' }}>
                            {loading ? (
                                <ListItem>
                                    <ListItemText
                                        primary="Đang tìm kiếm..."
                                        sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                                    />
                                </ListItem>
                            ) : users.length > 0 ? (
                                users.slice(0, 5).map((user) => (
                                    <ListItem
                                        key={user._id}
                                        button
                                        onClick={() => handleUserSelect(user)}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5'
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={constructUrl(user.avatarUrl || user.avatar)}
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {user.fullName?.[0] || user.username?.[0] || '?'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#000' }}>
                                                    @{user.username}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                                    {user.fullName}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : searchTerm.length >= 2 ? (
                                <ListItem>
                                    <ListItemText
                                        primary="Không tìm thấy người dùng"
                                        sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                                    />
                                </ListItem>
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary="Nhập ít nhất 2 ký tự để tìm kiếm"
                                        sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>

                        {/* Footer */}
                        <Box sx={{ p: 1, borderTop: `1px solid ${darkMode ? '#555' : '#ddd'}` }}>
                            <Typography variant="caption" sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                Nhấn Tab hoặc Enter để chọn
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
};

// Hook to use mention functionality
export const useMentions = (initialText = '') => {
    const [text, setText] = useState(initialText);
    const [mentions, setMentions] = useState([]);

    const handleTextChange = (newText) => {
        setText(newText);
    };

    const handleMention = (user) => {
        setMentions(prev => {
            const exists = prev.find(m => m._id === user._id);
            if (!exists) {
                return [...prev, user];
            }
            return prev;
        });
    };

    return {
        text,
        mentions,
        handleTextChange,
        handleMention,
        setText,
        setMentions
    };
};

export default CommentMentions;
