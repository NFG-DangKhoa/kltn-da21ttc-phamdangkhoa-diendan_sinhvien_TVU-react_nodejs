import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box, Typography, Button, Divider,
    Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../../../context/ThemeContext';

// Import các component con đã được tách
import PostForm from './PostForm';
import PostCard from './PostCard';
import ImageModal from '../../../utils/ImageModal';

const CenterColumn = ({
    user, topic, topicId,
    newPost, setNewPost,
    handlePostSubmit, detailedPosts,
    setDetailedPosts
}) => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    const [expandedPosts, setExpandedPosts] = useState({});
    const [selectedImage, setSelectedImage] = useState(null); // Giữ lại nếu bạn có logic ImageModal riêng ở đây

    const [isEditingPost, setIsEditingPost] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState(null);

    // Bỏ contentRefs ở đây, logic sẽ được chuyển xuống PostCard

    const navigate = useNavigate();

    // Hàm để mở rộng/thu gọn nội dung bài viết (truyền xuống PostCard)
    const toggleExpanded = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Hàm chuyển hướng đến trang chi tiết bài viết (truyền xuống PostCard)
    const goToDetail = (postId) => {
        navigate(`/posts/detail?topicId=${topicId}&postId=${postId}`);
    };

    // Hàm để PostCard gọi khi muốn chỉnh sửa bài viết
    const handleEditPostFromPostCard = (postToEdit) => {
        setCurrentEditingPost(postToEdit);
        setIsEditingPost(true);
    };

    // Logic cập nhật bài viết (giữ nguyên ở CenterColumn)
    const handleUpdatePostSubmit = async (updatedPostData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/posts/${currentEditingPost._id}`, updatedPostData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDetailedPosts(prevPosts => prevPosts.map(post =>
                post._id === response.data._id ? response.data : post
            ));
            alert('Bài viết đã được cập nhật thành công!');
            setIsEditingPost(false);
            setCurrentEditingPost(null);
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
            alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
        }
    };

    const handleCloseEditMode = () => {
        setIsEditingPost(false);
        setCurrentEditingPost(null);
    };

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: darkMode ? '#242526' : '#f0f2f5',
                color: darkMode ? '#e4e6eb' : '#1c1e21',
                borderRadius: 2,
                width: '45vw',
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                boxShadow: darkMode ? '0px 0px 5px rgba(255,255,255,0.1)' : '0px 0px 5px rgba(0,0,0,0.1)',
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
            }}
        >

            {!isEditingPost && (
                <PostForm
                    user={user}
                    newPost={newPost}
                    setNewPost={setNewPost}
                    handlePostSubmit={handlePostSubmit}
                    isEditMode={false}
                />
            )}

            {isEditingPost && currentEditingPost && (
                <Dialog
                    open={isEditingPost}
                    onClose={handleCloseEditMode}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            backgroundColor: darkMode ? '#242526' : '#ffffff',
                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                            boxShadow: darkMode ? '0px 0px 10px rgba(255,255,255,0.2)' : '0px 0px 10px rgba(0,0,0,0.2)',
                            transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                        }
                    }}
                >
                    <DialogTitle sx={{
                        backgroundColor: darkMode ? '#242526' : '#ffffff',
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                        borderBottom: darkMode ? '1px solid #3a3b3c' : '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        Chỉnh sửa bài viết
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseEditMode}
                            sx={{ color: darkMode ? '#b0b3b8' : (theme) => theme.palette.grey[500], }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{
                        backgroundColor: darkMode ? '#242526' : '#ffffff',
                        p: 2
                    }}>
                        <PostForm
                            user={user}
                            newPost={currentEditingPost}
                            setNewPost={setCurrentEditingPost}
                            handlePostSubmit={handleUpdatePostSubmit}
                            isEditMode={true}
                        />
                    </DialogContent>
                </Dialog>
            )}

            <Typography variant="h6" gutterBottom
                sx={{ fontSize: '1rem', color: darkMode ? '#e4e6eb' : '#1c1e21', mt: 3 }}
            >
                Bài viết gần đây
            </Typography>
            <Box sx={{ maxWidth: 5000, mx: 'auto', width: '100%' }}>
                {detailedPosts.length > 0 ? (
                    detailedPosts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            user={user}
                            toggleExpanded={toggleExpanded}
                            expandedPosts={expandedPosts}
                            goToDetail={goToDetail}
                            setDetailedPosts={setDetailedPosts}
                            handleEditPostFromCenterColumn={handleEditPostFromPostCard}
                        // Bỏ prop contentRefs ở đây
                        />
                    ))
                ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                        Chưa có bài viết nào.
                    </Typography>
                )}
            </Box>

            <ImageModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} darkMode={darkMode} />
        </Box>
    );
};

export default CenterColumn;