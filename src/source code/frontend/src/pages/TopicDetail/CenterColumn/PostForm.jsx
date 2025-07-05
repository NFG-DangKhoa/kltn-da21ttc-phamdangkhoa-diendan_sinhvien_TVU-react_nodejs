import React, { useContext, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Avatar,
    useMediaQuery,
    useTheme,
    Paper,
    Chip,
    Stack,
    Fade,
    Slide,
    alpha,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Edit as EditIcon,
    Add as AddIcon,
    AutoAwesome as MagicIcon
} from '@mui/icons-material';

import { AuthContext } from '../../../context/AuthContext';
import { ThemeContext } from '../../../context/ThemeContext';
import CustomEditor from './CustomEditor';

// Helper function to construct full URL for images
const constructUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

// Đảm bảo IMAGE_URL_REGEX được định nghĩa hoặc import từ RichTextEditor
// const IMAGE_URL_REGEX = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|webp|svg)/g; // Ví dụ regex

const PostForm = ({
    newPost = {},
    setNewPost,
    handlePostSubmit,
    isEditMode = false,
    topicId: propTopicId,
    onPostCreated,
    isModal = false
}) => {
    const { user } = useContext(AuthContext);
    const { mode } = useContext(ThemeContext);
    const [open, setOpen] = useState(isModal || false);
    const [editorContent, setEditorContent] = useState(newPost.content || '');
    const [title, setTitle] = useState(newPost.title || '');
    const [tags, setTags] = useState(newPost.tags || '');
    const [topicIdState, setTopicIdState] = useState(propTopicId || newPost.topicId || '');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isEditMode && newPost) {
            setTitle(newPost.title || '');
            setEditorContent(newPost.content || '');
            setTags(Array.isArray(newPost.tags) ? newPost.tags.join(',') : newPost.tags || '');
            setTopicIdState(newPost.topicId || '');
            setOpen(true);
        } else if (!isEditMode && !propTopicId) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicIdState('');
        }
    }, [newPost, isEditMode, propTopicId]);

    const handleDialogOpen = () => {
        setOpen(true);
        if (!isEditMode && !propTopicId) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicIdState('');
        }
    };

    const handleDialogClose = () => {
        setOpen(false);
        if (!isEditMode && !propTopicId) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicIdState('');
        }
    };

    const uploadImageToServer = async (imageData, filename, isUrl = false) => {
        const dataURLtoFile = (dataurl, filename) => {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        };

        let response;
        try {
            if (isUrl) {
                // Gửi URL ảnh đến endpoint mới
                response = await fetch('http://localhost:5000/api/uploads/image-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ imageUrl: imageData }),
                });
            } else {
                // Gửi file Base64 như trước
                const formData = new FormData();
                const file = dataURLtoFile(imageData, filename);
                formData.append('image', file);

                response = await fetch('http://localhost:5000/api/uploads/image', {
                    method: 'POST',
                    body: formData,
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên server:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !editorContent.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết');
            return;
        }

        try {
            console.log('🔄 Processing post submission...');

            // Prepare post data - backend sẽ tự động process images
            const postDataToSend = {
                title: title,
                content: editorContent, // Gửi content với data URLs, backend sẽ process
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                topicId: topicIdState,
                authorId: user?._id,
            };

            if (isEditMode) {
                delete postDataToSend.authorId;
            }

            // Submit post - backend sẽ tự động:
            // 1. Convert data URLs thành files trong public/upload
            // 2. Update content với server URLs
            // 3. Lưu post vào database
            console.log('📝 Submitting post (backend will process images)...');

            // Use appropriate callback based on usage context
            if (onPostCreated) {
                // Called from Header modal
                onPostCreated(postDataToSend);
            } else if (handlePostSubmit) {
                // Called from TopicDetail
                handlePostSubmit(postDataToSend);
            }

            handleDialogClose();

            console.log('✅ Post submitted successfully!');

        } catch (error) {
            console.error('❌ Error submitting post:', error);
            alert('Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.');
        }
    };

    if (isEditMode) {
        return (
            <Box sx={{ p: 4, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>
                <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.primary }}>Chỉnh sửa bài viết</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Tiêu đề bài viết"
                    placeholder="Nhập tiêu đề bài viết của bạn..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <CustomEditor
                    content={editorContent}
                    onContentChange={setEditorContent}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Tags (ví dụ: công nghệ, lập trình, mẹo)"
                    placeholder="Phân tách các tags bằng dấu phẩy"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    sx={{ mt: 3 }}
                />
                {/* Thêm trường TopicId nếu cần chỉnh sửa */}
                {/* <TextField
                    fullWidth
                    variant="outlined"
                    label="ID Chủ đề"
                    placeholder="Nhập ID chủ đề"
                    value={topicIdState}
                    onChange={(e) => setTopicIdState(e.target.value)}
                    sx={{ mt: 2 }}
                /> */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        onClick={handleDialogClose}
                        color="inherit"
                        sx={{ mr: 1, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        endIcon={<SendIcon />}
                        disabled={!title || !editorContent.trim()}
                    >
                        Cập nhật bài viết
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box mb={4}>
            {/* Enhanced Post Creation Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px solid ${theme.palette.divider}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-2px)',
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                        src={constructUrl(user?.avatarUrl) || '/default-avatar.png'}
                        alt={user?.fullName || 'Người dùng'}
                        sx={{
                            width: 56,
                            height: 56,
                            border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {!user?.avatarUrl && (user?.fullName?.[0] || 'U')}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                            Xin chào, {user?.fullName || 'Bạn'}! 👋
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Chia sẻ kiến thức, kinh nghiệm hoặc đặt câu hỏi với cộng đồng
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleDialogOpen}
                    startIcon={<EditIcon />}
                    sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        borderRadius: '16px',
                        py: 2,
                        px: 3,
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            transform: 'scale(1.02)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    ✨ Viết bài mới hoặc đặt câu hỏi thú vị...
                </Button>

                {/* Quick action chips */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                        icon={<MagicIcon />}
                        label="Chia sẻ kinh nghiệm"
                        variant="outlined"
                        size="small"
                        onClick={handleDialogOpen}
                        sx={{
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    />
                    <Chip
                        icon={<AddIcon />}
                        label="Đặt câu hỏi"
                        variant="outlined"
                        size="small"
                        onClick={handleDialogOpen}
                        sx={{
                            borderColor: alpha(theme.palette.secondary.main, 0.3),
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                borderColor: theme.palette.secondary.main,
                            },
                        }}
                    />
                </Stack>
            </Paper>

            {/* Enhanced Dialog */}
            <Dialog
                open={open}
                onClose={handleDialogClose}
                fullWidth
                maxWidth="lg"
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 4,
                        boxShadow: theme.shadows[24],
                        backgroundColor: theme.palette.background.paper,
                        backgroundImage: 'none',
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 2,
                        pr: 7,
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        backgroundImage: 'none',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={constructUrl(user?.avatarUrl) || '/default-avatar.png'}
                            alt={user?.fullName || 'Người dùng'}
                            sx={{
                                width: 48,
                                height: 48,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                        >
                            {!user?.avatarUrl && (user?.fullName?.[0] || 'U')}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" component="span" fontWeight="600" color="primary.main">
                                ✨ Tạo bài viết mới
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={handleDialogClose}
                        sx={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            color: theme.palette.grey[500],
                            backgroundColor: alpha(theme.palette.grey[500], 0.1),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[500], 0.2),
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: isSmallScreen ? 2 : 4, position: 'relative' }}>
                    <Fade in timeout={300}>
                        <Box>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Tiêu đề bài viết"
                                placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '1.1rem',
                                        '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            />

                            <CustomEditor
                                content={editorContent}
                                onContentChange={setEditorContent}
                            />

                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Tags"
                                placeholder="Ví dụ: công nghệ, lập trình, học tập, kinh nghiệm..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                helperText="Phân tách các tags bằng dấu phẩy để giúp người khác dễ tìm thấy bài viết"
                                sx={{
                                    mt: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: '2px',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Fade>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: isSmallScreen ? 2 : 3, gap: 1 }}>
                    <Button
                        onClick={handleDialogClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        endIcon={<SendIcon />}
                        disabled={!title || !editorContent.trim()}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                                transform: 'translateY(-1px)',
                            },
                            '&:disabled': {
                                opacity: 0.6,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Đăng bài viết
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostForm;