import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box, Typography, Button, Divider,
    Dialog, DialogTitle, DialogContent, IconButton,
    FormControl, InputLabel, Select, MenuItem, TextField,
    ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { ViewList, ViewDay } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../../../context/ThemeContext';

// Import các component con đã được tách
import PostForm from './PostForm';
import PostCard from './PostCard';
import PostsTable from './PostsTable';
import ImageModal from '../../../utils/ImageModal';

const CenterColumn = ({
    user, topic, topicId,
    newPost, setNewPost,
    handlePostSubmit, detailedPosts,
    setDetailedPosts,
    sortBy, setSortBy,
    searchTerm, setSearchTerm, filteredPosts,
    loadingPosts,
    viewMode, setViewMode
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
                p: 3,
                backgroundColor: darkMode ? '#242526' : '#ffffff',
                color: darkMode ? '#e4e6eb' : '#1c1e21',
                width: '100%',
                height: '100%',
                minHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.4s ease, color 0.4s ease',
            }}
        >

            {!isEditingPost && user && (
                <PostForm
                    user={user}
                    newPost={newPost}
                    setNewPost={setNewPost}
                    handlePostSubmit={handlePostSubmit}
                    isEditMode={false}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newViewMode) => {
                        if (newViewMode !== null) {
                            setViewMode(newViewMode);
                        }
                    }}
                    aria-label="view mode"
                >
                    <ToggleButton value="table" aria-label="table view">
                        <ViewList />
                        <Typography sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>Dạng bảng</Typography>
                    </ToggleButton>
                    <ToggleButton value="quick" aria-label="quick view">
                        <ViewDay />
                        <Typography sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>Xem nhanh</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <TextField
                label="Tìm kiếm bài viết"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: darkMode ? '#3a3b3c' : '#ccc',
                        },
                        '&:hover fieldset': {
                            borderColor: darkMode ? '#555' : '#999',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: darkMode ? '#90caf9' : 'primary.main',
                        },
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                    },
                    '& .MuiInputLabel-root': {
                        color: darkMode ? '#b0b3b8' : '#65676b',
                    },
                }}
            />

            {!isEditingPost && !user && (
                <Box
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        bgcolor: 'grey.50',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" color="text.secondary" mb={1}>
                        Đăng nhập để tham gia thảo luận
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Bạn cần đăng nhập để có thể đăng bài viết và tham gia thảo luận trong chủ đề này
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.href = '/login'}
                        sx={{ borderRadius: 2 }}
                    >
                        Đăng nhập ngay
                    </Button>
                </Box>
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

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" gutterBottom
                    sx={{
                        fontSize: '1.2rem',
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                        fontWeight: 'bold',
                        mt: 2,
                        mb: 0, // Đặt mb về 0 vì Box cha đã có mb
                    }}
                >
                    Bài viết ({filteredPosts.length})
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mt: 2 }}>
                    <InputLabel id="sort-by-label" sx={{ color: darkMode ? '#b0b3b8' : '#65676b' }}>Sắp xếp theo</InputLabel>
                    <Select
                        labelId="sort-by-label"
                        id="sort-by-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="Sắp xếp theo"
                        sx={{
                            color: darkMode ? '#e4e6eb' : '#1c1e21',
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#3a3b3c' : '#ccc',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#555' : '#999',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: darkMode ? '#90caf9' : 'primary.main',
                            },
                            '.MuiSvgIcon-root': {
                                color: darkMode ? '#e4e6eb' : '#1c1e21',
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: darkMode ? '#3a3b3c' : '#ffffff',
                                    color: darkMode ? '#e4e6eb' : '#1c1e21',
                                },
                            },
                        }}
                    >
                        <MenuItem value="newest">Mới nhất</MenuItem>
                        <MenuItem value="oldest">Cũ nhất</MenuItem>
                        <MenuItem value="most_liked">Nhiều lượt thích nhất</MenuItem>
                        <MenuItem value="most_commented">Nhiều bình luận nhất</MenuItem>
                        <MenuItem value="highest_rating">Đánh giá cao nhất</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {filteredPosts.length > 0 ? (
                viewMode === 'quick' ? (
                    <Box sx={{
                        width: '100%',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        {filteredPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                user={user}
                                toggleExpanded={toggleExpanded}
                                expandedPosts={expandedPosts}
                                goToDetail={goToDetail}
                                setDetailedPosts={setDetailedPosts}
                                handleEditPostFromCenterColumn={handleEditPostFromPostCard}
                            />
                        ))}
                    </Box>
                ) : (
                    <PostsTable posts={filteredPosts} topicId={topicId} loading={loadingPosts} />
                )
            ) : (
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px'
                }}>
                    <Typography variant="body1" sx={{
                        fontSize: '1rem',
                        color: darkMode ? '#b0b3b8' : 'text.secondary',
                        textAlign: 'center'
                    }}>
                        Chưa có bài viết nào trong chủ đề này.
                    </Typography>
                </Box>
            )}

            <ImageModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} darkMode={darkMode} />
        </Box>
    );
};

export default CenterColumn;
