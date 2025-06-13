import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Image as ImageIcon,
    EmojiEmotions as EmojiIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const MessageInput = ({ conversation }) => {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const textFieldRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    const { sendMessage, startTyping, stopTyping } = useChat();
    const { user } = useAuth();

    // Get other participant
    const otherParticipant = conversation?.participantDetails?.find(
        p => p._id !== user.id
    );

    // Handle typing indicators
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            startTyping(conversation._id);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(conversation._id);
        }, 1000);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() && attachments.length === 0) {
            return;
        }

        try {
            setError(null);
            
            // Stop typing
            if (isTyping) {
                setIsTyping(false);
                stopTyping(conversation._id);
            }

            // Determine message type
            let messageType = 'text';
            if (attachments.length > 0) {
                const hasImages = attachments.some(att => chatService.isImageFile({ type: att.mimeType }));
                messageType = hasImages ? 'image' : 'file';
            }

            await sendMessage(
                otherParticipant._id,
                message.trim(),
                messageType,
                attachments
            );

            // Clear input
            setMessage('');
            setAttachments([]);
            textFieldRef.current?.focus();

        } catch (error) {
            setError(error.message);
        }
    };

    const handleFileUpload = async (files, type = 'file') => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`);
                }

                const response = await chatService.uploadFile(file);
                return {
                    fileName: file.name,
                    fileUrl: response.data.url,
                    fileSize: file.size,
                    mimeType: file.type
                };
            });

            const uploadedFiles = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedFiles]);

        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const renderAttachmentPreview = (attachment, index) => {
        const isImage = chatService.isImageFile({ type: attachment.mimeType });

        return (
            <Chip
                key={index}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isImage ? <ImageIcon fontSize="small" /> : <AttachFileIcon fontSize="small" />}
                        <Typography variant="caption" noWrap sx={{ maxWidth: 100 }}>
                            {attachment.fileName}
                        </Typography>
                    </Box>
                }
                onDelete={() => handleRemoveAttachment(index)}
                deleteIcon={<CloseIcon />}
                variant="outlined"
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
            />
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Error Alert */}
            {error && (
                <Alert 
                    severity="error" 
                    onClose={() => setError(null)}
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {/* Attachment Previews */}
            {attachments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        File đính kèm:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {attachments.map((attachment, index) => 
                            renderAttachmentPreview(attachment, index)
                        )}
                    </Box>
                </Box>
            )}

            {/* Message Input */}
            <Paper
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 1,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    '&:focus-within': {
                        borderColor: 'primary.main',
                    }
                }}
            >
                {/* Attachment Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                    <Tooltip title="Đính kèm file">
                        <IconButton
                            size="small"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            sx={{ mb: 0.5 }}
                        >
                            <AttachFileIcon />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Đính kèm hình ảnh">
                        <IconButton
                            size="small"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <ImageIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Text Input */}
                <TextField
                    ref={textFieldRef}
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={handleMessageChange}
                    onKeyPress={handleKeyPress}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '0.875rem' }
                    }}
                    disabled={uploading}
                />

                {/* Send Button */}
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && attachments.length === 0) || uploading}
                    sx={{
                        ml: 1,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        '&:disabled': {
                            backgroundColor: 'action.disabledBackground',
                            color: 'action.disabled',
                        }
                    }}
                >
                    {uploading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <SendIcon />
                    )}
                </IconButton>
            </Paper>

            {/* Hidden File Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files, 'file')}
            />
            
            <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files, 'image')}
            />

            {/* Character Count */}
            {message.length > 1800 && (
                <Typography 
                    variant="caption" 
                    color={message.length > 2000 ? 'error' : 'warning.main'}
                    sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
                >
                    {message.length}/2000
                </Typography>
            )}
        </Box>
    );
};

export default MessageInput;
