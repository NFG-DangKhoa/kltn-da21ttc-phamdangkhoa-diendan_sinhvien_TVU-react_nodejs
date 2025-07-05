import React, { useState, useRef, useContext } from 'react';
import {
    Box, TextField, IconButton, Tooltip, Popover, Grid, Typography,
    Button, Chip, Avatar, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    EmojiEmotions as EmojiIcon,
    AttachFile as AttachIcon,
    Send as SendIcon,
    AlternateEmail as MentionIcon,
    FormatBold as BoldIcon,
    FormatItalic as ItalicIcon,
    FormatUnderlined as UnderlineIcon,
    Code as CodeIcon,
    Link as LinkIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';

// Emoji data - simplified version
const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Objects': ['💻', '📱', '⌚', '📷', '🎮', '🎧', '📚', '✏️', '📝', '💡', '🔍', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎵', '🎶']
};

const RichCommentEditor = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Viết bình luận của bạn...",
    replyingTo = null,
    onCancelReply = null,
    disabled = false,
    maxLength = 1000,
    showFormatting = true,
    showEmoji = true,
    showMention = true,
    showAttachment = false
}) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const textFieldRef = useRef(null);
    const [emojiAnchor, setEmojiAnchor] = useState(null);
    const [mentionAnchor, setMentionAnchor] = useState(null);
    const [selectedEmoji, setSelectedEmoji] = useState('Smileys');
    const [cursorPosition, setCursorPosition] = useState(0);

    // Handle emoji insertion
    const insertEmoji = (emoji) => {
        const textarea = textFieldRef.current?.querySelector('textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + emoji + value.substring(end);
            onChange(newValue);

            // Set cursor position after emoji
            setTimeout(() => {
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                textarea.focus();
            }, 0);
        }
        setEmojiAnchor(null);
    };

    // Handle text formatting
    const formatText = (format) => {
        const textarea = textFieldRef.current?.querySelector('textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = value.substring(start, end);

            let formattedText = '';
            switch (format) {
                case 'bold':
                    formattedText = `**${selectedText}**`;
                    break;
                case 'italic':
                    formattedText = `*${selectedText}*`;
                    break;
                case 'underline':
                    formattedText = `__${selectedText}__`;
                    break;
                case 'code':
                    formattedText = `\`${selectedText}\``;
                    break;
                case 'link':
                    formattedText = `[${selectedText}](url)`;
                    break;
                default:
                    formattedText = selectedText;
            }

            const newValue = value.substring(0, start) + formattedText + value.substring(end);
            onChange(newValue);

            // Set cursor position
            setTimeout(() => {
                textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
                textarea.focus();
            }, 0);
        }
    };

    // Handle mention insertion
    const insertMention = (username) => {
        const textarea = textFieldRef.current?.querySelector('textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const mention = `@${username} `;
            const newValue = value.substring(0, start) + mention + value.substring(end);
            onChange(newValue);

            setTimeout(() => {
                textarea.setSelectionRange(start + mention.length, start + mention.length);
                textarea.focus();
            }, 0);
        }
        setMentionAnchor(null);
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && onSubmit) {
                onSubmit();
            }
        }
    };

    // Handle cursor position tracking
    const handleSelectionChange = (e) => {
        setCursorPosition(e.target.selectionStart);
    };

    const remainingChars = maxLength - value.length;
    const isOverLimit = remainingChars < 0;

    return (
        <Box>
            {/* Reply indicator */}
            {replyingTo && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        backgroundColor: darkMode ? '#333' : '#f0f0f0',
                        borderRadius: 1,
                        border: `1px solid ${darkMode ? '#555' : '#ddd'}`
                    }}
                >
                    <Typography variant="body2" sx={{ flexGrow: 1, color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                        Đang trả lời: <strong>{replyingTo.authorId?.fullName || replyingTo.authorId?.username}</strong>
                        {replyingTo.content && ` - "${replyingTo.content.substring(0, 50)}..."`}
                    </Typography>
                    {onCancelReply && (
                        <IconButton size="small" onClick={onCancelReply}>
                            <CloseIcon sx={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }} />
                        </IconButton>
                    )}
                </Box>
            )}

            {/* Formatting toolbar */}
            {showFormatting && (
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Đậm">
                        <IconButton size="small" onClick={() => formatText('bold')}>
                            <BoldIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Nghiêng">
                        <IconButton size="small" onClick={() => formatText('italic')}>
                            <ItalicIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gạch chân">
                        <IconButton size="small" onClick={() => formatText('underline')}>
                            <UnderlineIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Code">
                        <IconButton size="small" onClick={() => formatText('code')}>
                            <CodeIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Link">
                        <IconButton size="small" onClick={() => formatText('link')}>
                            <LinkIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            {/* Main text field */}
            <Box sx={{ position: 'relative' }}>
                <TextField
                    ref={textFieldRef}
                    fullWidth
                    multiline
                    rows={3}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onSelect={handleSelectionChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    error={isOverLimit}
                    helperText={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <span>{isOverLimit ? 'Vượt quá giới hạn ký tự' : ''}</span>
                            <span style={{ color: isOverLimit ? '#f44336' : 'inherit' }}>
                                {remainingChars} ký tự còn lại
                            </span>
                        </Box>
                    }
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: darkMode ? '#3a3b3c' : '#f0f2f5',
                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: darkMode ? '#555' : '#ccc' },
                            '&.Mui-focused fieldset': { borderColor: darkMode ? '#90caf9' : 'primary.main' },
                        },
                        '& .MuiInputBase-input': {
                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                        },
                    }}
                />

                {/* Action buttons */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        display: 'flex',
                        gap: 0.5,
                        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                        borderRadius: 1,
                        p: 0.5
                    }}
                >
                    {showEmoji && (
                        <Tooltip title="Emoji">
                            <IconButton
                                size="small"
                                onClick={(e) => setEmojiAnchor(e.currentTarget)}
                            >
                                <EmojiIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {showMention && (
                        <Tooltip title="Mention">
                            <IconButton
                                size="small"
                                onClick={(e) => setMentionAnchor(e.currentTarget)}
                            >
                                <MentionIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {showAttachment && (
                        <Tooltip title="Đính kèm">
                            <IconButton size="small">
                                <AttachIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Gửi">
                        <IconButton
                            size="small"
                            onClick={onSubmit}
                            disabled={!value.trim() || disabled || isOverLimit}
                            color="primary"
                        >
                            <SendIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Emoji Picker Popover */}
            <Popover
                open={Boolean(emojiAnchor)}
                anchorEl={emojiAnchor}
                onClose={() => setEmojiAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Box sx={{ width: 300, maxHeight: 400, p: 2 }}>
                    {/* Emoji categories */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                size="small"
                                variant={selectedEmoji === category ? 'filled' : 'outlined'}
                                onClick={() => setSelectedEmoji(category)}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>

                    {/* Emoji grid */}
                    <Grid container spacing={0.5} sx={{ maxHeight: 250, overflow: 'auto' }}>
                        {EMOJI_CATEGORIES[selectedEmoji]?.map((emoji, index) => (
                            <Grid item key={index}>
                                <Button
                                    sx={{
                                        minWidth: 32,
                                        height: 32,
                                        fontSize: '1.2rem',
                                        p: 0
                                    }}
                                    onClick={() => insertEmoji(emoji)}
                                >
                                    {emoji}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Popover>

            {/* Mention Menu */}
            <Menu
                anchorEl={mentionAnchor}
                open={Boolean(mentionAnchor)}
                onClose={() => setMentionAnchor(null)}
            >
                <MenuItem onClick={() => insertMention('admin')}>
                    <ListItemIcon>
                        <Avatar sx={{ width: 24, height: 24 }}>A</Avatar>
                    </ListItemIcon>
                    <ListItemText primary="@admin" secondary="Quản trị viên" />
                </MenuItem>
                <MenuItem onClick={() => insertMention('moderator')}>
                    <ListItemIcon>
                        <Avatar sx={{ width: 24, height: 24 }}>M</Avatar>
                    </ListItemIcon>
                    <ListItemText primary="@moderator" secondary="Điều hành viên" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default RichCommentEditor;
