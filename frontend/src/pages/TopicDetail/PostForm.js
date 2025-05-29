import React, { useContext, useState } from 'react';
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

import { AuthContext } from '../../context/AuthContext';
import RichTextEditor from './RichTextEditor';

// Thêm dòng này để import IMAGE_URL_REGEX
import { IMAGE_URL_REGEX } from './RichTextEditor'; // Đảm bảo đường dẫn đúng
const PostForm = ({ newPost, setNewPost, handlePostSubmit }) => {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [editorContent, setEditorContent] = useState(newPost.content || '');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDialogOpen = () => {
        setOpen(true);
        setEditorContent(newPost.content || '');
    };
    const handleDialogClose = () => {
        setOpen(false);
    };

    // Hàm này sẽ tải ảnh Base64 hoặc URL ảnh về server
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
            // Nếu là URL, gửi URL lên server để server tự tải về
            formData.append('imageUrl', imageData);
        } else {
            // Nếu là Base64, chuyển đổi thành File và gửi lên
            const file = dataURLtoFile(imageData, filename);
            formData.append('image', file);
        }

        try {
            // Cập nhật endpoint nếu cần thiết, đảm bảo server của bạn có thể xử lý cả file và URL
            const response = await fetch('http://localhost:5000/api/uploads/image', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.url; // Server sẽ trả về URL của ảnh đã lưu
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
        const imagesToProcess = []; // Lưu trữ các đối tượng img cần xử lý

        images.forEach(img => {
            const src = img.getAttribute('src');
            const originalSrc = img.getAttribute('data-original-src'); // Kiểm tra ảnh dán từ URL

            if (src && src.startsWith('data:image/')) {
                // Ảnh Base64 (tải từ máy hoặc screenshot)
                const filename = img.getAttribute('data-filename') || `uploaded_image_${Date.now()}.png`;
                imagesToProcess.push({ element: img, type: 'base64', data: src, filename: filename });
                uploadPromises.push(uploadImageToServer(src, filename, false));
            } else if (originalSrc && IMAGE_URL_REGEX.test(originalSrc)) {
                // Ảnh dán từ URL mạng
                // Sử dụng Date.now() để tạo tên file duy nhất tạm thời
                const filename = `pasted_web_image_${Date.now()}.png`; // Tên file tạm trên server
                imagesToProcess.push({ element: img, type: 'url', data: originalSrc, filename: filename });
                uploadPromises.push(uploadImageToServer(originalSrc, filename, true));
            }
            // Các ảnh có src không phải base64 và không có data-original-src (đã được lưu trước đó) sẽ không cần xử lý lại
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        // Cập nhật lại src cho các ảnh trong nội dung HTML
        for (let i = 0; i < imagesToProcess.length; i++) {
            const { element } = imagesToProcess[i];
            const newUrl = uploadedUrls[i];
            if (newUrl) {
                element.setAttribute('src', newUrl);
                element.removeAttribute('data-filename'); // Xóa thuộc tính tạm thời
                element.removeAttribute('data-original-src'); // Xóa thuộc tính tạm thời
            } else {
                console.warn('Không thể tải lên ảnh, giữ nguyên Base64/URL hoặc xóa ảnh:', element.outerHTML);
                // Tùy chọn: Xóa ảnh nếu không tải lên được
                // element.remove();
            }
        }

        finalContent = doc.body.innerHTML;

        const postWithUserId = {
            ...newPost,
            content: finalContent,
            authorId: user?._id,
        };

        handlePostSubmit(postWithUserId);
        handleDialogClose();
    };

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
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
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
                        value={newPost.tags}
                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
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
                        disabled={!newPost.title || !editorContent.trim()}
                    >
                        Đăng bài
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostForm;