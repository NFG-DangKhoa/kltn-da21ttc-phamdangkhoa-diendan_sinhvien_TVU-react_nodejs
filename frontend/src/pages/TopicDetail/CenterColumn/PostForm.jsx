// PostForm.js
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

import { AuthContext } from '../../../context/AuthContext';
import { ThemeContext } from '../../../context/ThemeContext'; // Import ThemeContext
import RichTextEditor from './RichTextEditor';

import { IMAGE_URL_REGEX } from './RichTextEditor';

// Loại bỏ prop `darkMode` vì chúng ta sẽ lấy từ ThemeContext
const PostForm = ({ newPost, setNewPost, handlePostSubmit, isEditMode = false }) => {
    const { user } = useContext(AuthContext);
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext
    const [open, setOpen] = useState(false);
    const [editorContent, setEditorContent] = useState(newPost.content || '');
    const [title, setTitle] = useState(newPost.title || '');
    const [tags, setTags] = useState(newPost.tags || '');
    const [topicId, setTopicId] = useState(newPost.topicId || '');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isEditMode && newPost) {
            setTitle(newPost.title || '');
            setEditorContent(newPost.content || '');
            setTags(Array.isArray(newPost.tags) ? newPost.tags.join(',') : newPost.tags || '');
            setTopicId(newPost.topicId || '');
            setOpen(true);
        } else if (!isEditMode) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicId('');
        }
    }, [newPost, isEditMode]);

    const handleDialogOpen = () => {
        setOpen(true);
        if (!isEditMode) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicId('');
        }
    };

    const handleDialogClose = () => {
        setOpen(false);
        if (!isEditMode) {
            setTitle('');
            setEditorContent('');
            setTags('');
            setTopicId('');
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

        const formData = new FormData();
        if (isUrl) {
            formData.append('imageUrl', imageData);
        } else {
            const file = dataURLtoFile(imageData, filename);
            formData.append('image', file);
        }

        try {
            const response = await fetch('http://localhost:5000/api/uploads/image', {
                method: 'POST',
                body: formData,
            });
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
        let finalContent = editorContent;

        const parser = new DOMParser();
        const doc = parser.parseFromString(editorContent, 'text/html');
        const images = doc.querySelectorAll('img');

        const uploadPromises = [];
        const imagesToProcess = [];

        for (const img of images) {
            const src = img.getAttribute('src');
            const originalSrc = img.getAttribute('data-original-src');

            if (src && src.startsWith('data:image/')) {
                const filename = img.getAttribute('data-filename') || `uploaded_image_${Date.now()}.png`;
                imagesToProcess.push({ element: img, type: 'base64', data: src, filename: filename });
                uploadPromises.push(uploadImageToServer(src, filename, false));
            } else if (originalSrc && IMAGE_URL_REGEX.test(originalSrc)) {
                const filename = `pasted_web_image_${Date.now()}.png`;
                imagesToProcess.push({ element: img, type: 'url', data: originalSrc, filename: filename });
                uploadPromises.push(uploadImageToServer(originalSrc, filename, true));
            }
        }

        const uploadedUrls = await Promise.all(uploadPromises);

        for (let i = 0; i < imagesToProcess.length; i++) {
            const { element } = imagesToProcess[i];
            const newUrl = uploadedUrls[i];
            if (newUrl) {
                element.setAttribute('src', newUrl);
                element.removeAttribute('data-filename');
                element.removeAttribute('data-original-src');
            } else {
                console.warn('Không thể tải lên ảnh, giữ nguyên Base64/URL hoặc xóa ảnh:', element.outerHTML);
            }
        }

        finalContent = doc.body.innerHTML;

        const postDataToSend = {
            title: title,
            content: finalContent,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            topicId: topicId,
            authorId: user?._id,
        };

        if (isEditMode) {
            delete postDataToSend.authorId;
        }

        handlePostSubmit(postDataToSend);
        handleDialogClose();
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
                <RichTextEditor
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
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
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
            {/* Thanh tạo bài viết nhanh */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[1],
                }}
            >
                <Avatar
                    src={user?.profilePicture || '/default-avatar.png'}
                    alt={user?.fullName || 'Người dùng'}
                    sx={{ width: 48, height: 48 }}
                />
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleDialogOpen}
                    sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        borderRadius: '24px',
                        py: 1.5,
                        px: 2,
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.divider,
                        },
                    }}
                >
                    ✍️ {user?.fullName || 'Bạn'} ơi, bạn viết bài hoặc đặt câu hỏi gì không?
                </Button>
            </Box>

            {/* Dialog đăng bài chính */}
            <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md" sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}>
                <DialogTitle sx={{ pb: 1.5, pr: 7, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" component="span">
                        ✍️ Đăng bài mới
                    </Typography>
                    <IconButton aria-label="close" onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: isSmallScreen ? 2 : 3, position: 'relative' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Tiêu đề bài viết"
                        placeholder="Nhập tiêu đề bài viết của bạn..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {/* Bạn có thể thêm Select cho topicId nếu muốn chọn chủ đề khi tạo bài */}
                    {/* <TextField
                        fullWidth
                        variant="outlined"
                        label="ID Chủ đề"
                        placeholder="Nhập ID chủ đề"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        sx={{ mb: 2 }}
                    /> */}

                    <RichTextEditor
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
                </DialogContent>

                <DialogActions sx={{ p: isSmallScreen ? 2 : 3, borderTop: `1px solid ${theme.palette.divider}` }}>
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
                        Đăng bài
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostForm;