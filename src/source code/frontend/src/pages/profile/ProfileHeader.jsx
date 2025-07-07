// filepath: d:\HỌC CNTT\HK2 2024-2025\KHÓA LUẬN TỐT NGHIỆP\DU AN\hilu-auau\frontend\src\pages\profile\ProfileHeader.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Avatar, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Switch, FormControlLabel, IconButton } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../../context/AuthContext";
import ImageCropper from '../../components/ImageCropper';

const constructUrl = (url) => {
    if (url && url.startsWith('/upload')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

const ProfileHeader = ({ userData, isCurrentUser, onProfileUpdate }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const { updateUser } = useAuth(); // Use the updateUser function from AuthContext
    const [openEdit, setOpenEdit] = useState(false);
    const [form, setForm] = useState({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        isPhoneNumberHidden: userData.isPhoneNumberHidden || false,
        bio: userData.bio || '',
    });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        postCount: 0,
        commentCount: 0,
        likeCount: 0
    });

    // Image Cropper states
    const [imageToCrop, setImageToCrop] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageTypeToCrop, setImageTypeToCrop] = useState(null); // 'avatar' or 'cover'
    const [croppedAvatarBase64, setCroppedAvatarBase64] = useState(null);
    const [croppedCoverBase64, setCroppedCoverBase64] = useState(null);
    const [isCropperForDirectUpdate, setIsCropperForDirectUpdate] = useState(false); // New state to differentiate cropper usage

    // New states for image preview
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [currentImagePreviewUrl, setCurrentImagePreviewUrl] = useState(null);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    useEffect(() => {
        setForm({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            isPhoneNumberHidden: userData.isPhoneNumberHidden || false,
            bio: userData.bio || '',
            avatarUrl: userData.avatarUrl || '',
            coverPhotoUrl: userData.coverPhotoUrl || ''
        });
    }, [userData]);

    const joinedDate = new Date(userData.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios.get(
                    `http://localhost:5000/api/users/stats/${userData._id}`,
                    config
                );
                setStats(response.data);

            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };

        if (userData && userData._id) {
            fetchCounts();
        }
    }, [userData]);

    const handleOpenEdit = () => {
        setForm({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            isPhoneNumberHidden: userData.isPhoneNumberHidden || false,
            bio: userData.bio || '',
            avatarUrl: userData.avatarUrl || '',
            coverPhotoUrl: userData.coverPhotoUrl || ''
        });
        setOpenEdit(true);
    };
    const handleCloseEdit = () => setOpenEdit(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            let updatedUser = { ...form };

            if (croppedAvatarBase64) {
                const avatarResponse = await axios.post(
                    `http://localhost:5000/api/users/upload-image`,
                    {
                        image: croppedAvatarBase64,
                        imageType: 'avatar',
                        crop: { x: 0, y: 0, width: 1, height: 1 },
                        zoom: 1,
                        rotation: 0
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                updatedUser.avatarUrl = avatarResponse.data.imageUrl;
            }

            if (croppedCoverBase64) {
                const coverResponse = await axios.post(
                    `http://localhost:5000/api/users/upload-image`,
                    {
                        image: croppedCoverBase64,
                        imageType: 'cover',
                        crop: { x: 0, y: 0, width: 1, height: 1 },
                        zoom: 1,
                        rotation: 0
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                updatedUser.coverPhotoUrl = coverResponse.data.imageUrl;
            }

            const response = await axios.put('http://localhost:5000/api/users/me', updatedUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (onProfileUpdate) onProfileUpdate(response.data.user);
            updateUser(response.data.user); // Update AuthContext with the latest user data
            setOpenEdit(false);
            setCroppedAvatarBase64(null);
            setCroppedCoverBase64(null);
        } catch (err) {
            console.error("Update error:", err.response ? err.response.data : err);
            alert('Cập nhật thất bại!');
        }
        setLoading(false);
    };

    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setImageTypeToCrop(type);
                setShowCropper(true);
                setIsCropperForDirectUpdate(false); // Opened from edit dialog
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImageBlobUrl) => {
        try {
            const responseBlob = await fetch(croppedImageBlobUrl);
            const blob = await responseBlob.blob();

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result;
                const token = localStorage.getItem("token");

                // Determine if this is a direct update from profile view or from edit dialog
                const isDirectUpdate = isCropperForDirectUpdate; // Use the state captured when opening the preview

                if (isDirectUpdate) {
                    // Direct update: send to backend immediately
                    try {
                        const response = await axios.post(
                            `http://localhost:5000/api/users/upload-image`,
                            {
                                image: base64data,
                                imageType: imageTypeToCrop,
                                crop: { x: 0, y: 0, width: 1, height: 1 },
                                zoom: 1,
                                rotation: 0
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                        onProfileUpdate(response.data.user); // Update parent component's state
                        updateUser(response.data.user); // Update AuthContext
                        setForm(prev => ({ ...prev, [imageTypeToCrop === 'avatar' ? 'avatarUrl' : 'coverPhotoUrl']: response.data.imageUrl }));
                        setShowCropper(false);
                        setImageToCrop(null);
                        setImageTypeToCrop(null);
                    } catch (error) {
                        console.error("Error uploading cropped image:", error);
                        // Handle error (e.g., show a snackbar message)
                    }
                } else {
                    // Update from edit dialog: store temporarily
                    if (imageTypeToCrop === 'avatar') {
                        setCroppedAvatarBase64(base64data);
                        setForm(prev => ({ ...prev, avatarUrl: croppedImageBlobUrl })); // Update form with blob URL for preview
                    } else if (imageTypeToCrop === 'cover') {
                        setCroppedCoverBase64(base64data);
                        setForm(prev => ({ ...prev, coverPhotoUrl: croppedImageBlobUrl })); // Update form with blob URL for preview
                    }
                    setShowCropper(false);
                    setImageToCrop(null);
                    setImageTypeToCrop(null);
                }
            };
        } catch (error) {
            console.error("Error processing cropped image blob:", error);
        }
    };

    const handleCloseCropper = () => {
        setShowCropper(false);
        setImageToCrop(null);
        setImageTypeToCrop(null);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 4,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 8px rgba(0,0,0,0.05)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            {/* Ảnh bìa với gradient overlay */}
            <Box
                sx={{
                    height: { xs: 180, sm: 220, md: 280 },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer', // Add cursor pointer
                    '&:hover': { // Add hover effect
                        opacity: 0.9,
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
                        pointerEvents: 'none'
                    }
                }}
                onClick={() => {
                    setCurrentImagePreviewUrl(constructUrl(userData.coverPhotoUrl));
                    setImageTypeToCrop('cover');
                    setIsCropperForDirectUpdate(true); // Direct update from profile view
                    setShowImagePreview(true);
                }}
            >
                {userData.coverPhotoUrl && !userData.isCoverPhotoBlocked && (
                    <Box
                        key={constructUrl(userData.coverPhotoUrl)}
                        component="img"
                        src={constructUrl(userData.coverPhotoUrl)}
                        alt="Cover Photo"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0,
                        }}
                    />
                )}
                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)',
                        zIndex: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.3)',
                        }}
                    />
                </Box>
            </Box>

            {/* Avatar và thông tin */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-end' },
                    p: { xs: 2, md: 3 },
                    mt: { xs: -8, md: -10 },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Avatar với hiệu ứng đẹp */}
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        key={constructUrl(userData.avatarUrl)}
                        alt={userData.fullName}
                        src={userData.avatarUrl && !userData.isAvatarBlocked ? constructUrl(userData.avatarUrl) : '/admin-avatar.png'}
                        sx={{
                            width: { xs: 140, sm: 160, md: 180 },
                            height: { xs: 140, sm: 160, md: 180 },
                            border: `6px solid ${theme.palette.background.paper}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            zIndex: 2,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer', // Add cursor pointer
                            '&:hover': { // Add hover effect
                                transform: 'scale(1.05)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                            },
                        }}
                        onClick={() => {
                            setCurrentImagePreviewUrl(constructUrl(userData.avatarUrl));
                            setImageTypeToCrop('avatar');
                            setIsCropperForDirectUpdate(true); // Direct update from profile view
                            setShowImagePreview(true);
                        }}
                    />
                    {/* Online status indicator */}
                    {userData.isOnline && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#4CAF50',
                                border: `4px solid ${theme.palette.background.paper}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 3,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '60%',
                                    height: '60%',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                }
                            }}
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        ml: { xs: 0, md: 3 },
                        mt: { xs: 2, md: 0 },
                        textAlign: { xs: 'center', md: 'left' },
                        flexGrow: 1,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {userData.fullName || userData.username}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: theme.palette.text.secondary,
                            mb: 1,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        @{userData.username}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.text.secondary,
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {userData.bio || "Chưa có mô tả"}
                    </Typography>

                    {/* Thống kê nhanh */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            gap: { xs: 2, sm: 4 },
                            mt: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <PostAddIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.postCount} Bài viết</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.commentCount} Bình luận</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{stats.likeCount} Lượt thích</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
                            <CakeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Tham gia: {joinedDate}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Nút chỉnh sửa (chỉ hiện nếu là trang của mình) */}
                <Box
                    sx={{
                        mt: { xs: 2, md: 0 },
                        ml: { xs: 0, md: 'auto' },
                        display: 'flex',
                        gap: 2,
                    }}
                >
                    {!isCurrentUser && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ChatIcon />}
                            onClick={() => navigate(`/chat`, { state: { recipientId: userData._id } })}
                            sx={{
                                borderRadius: 5,
                                px: 3,
                                py: 1,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2 30%, #19B3DA 90%)',
                                    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                                }
                            }}
                        >
                            Chat
                        </Button>
                    )}
                    {isCurrentUser && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            sx={{
                                px: 3,
                                py: 1,
                                borderRadius: 5,
                                minWidth: 150,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 5px rgba(0,0,0,0.2)',
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            }}
                            onClick={handleOpenEdit}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Dialog chỉnh sửa */}
            <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
                <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <IconButton onClick={() => avatarInputRef.current.click()} sx={{ p: 0 }}>
                            <Avatar
                                src={constructUrl(form.avatarUrl) || '/default-avatar.png'}
                                alt="Avatar"
                                sx={{ width: 120, height: 120, mb: 2, cursor: 'pointer', border: '2px solid', borderColor: 'primary.main' }}
                            />
                            <input
                                type="file"
                                hidden
                                ref={avatarInputRef}
                                onChange={(e) => handleFileChange(e, 'avatar')}
                                accept="image/*"
                            />
                        </IconButton>
                        <Typography variant="caption" display="block" mt={1}>Cập nhật ảnh đại diện</Typography>
                    </Box>

                    {/* Cover Photo Upload Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Ảnh bìa</Typography>
                        <IconButton onClick={() => coverInputRef.current.click()} sx={{ p: 0, width: '100%' }}>
                            <Box
                                sx={{
                                    width: '100%', height: 120, bgcolor: 'grey.200', borderRadius: 2,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '2px solid', borderColor: 'secondary.main'
                                }}
                            >
                                {form.coverPhotoUrl ? (
                                    <img src={constructUrl(form.coverPhotoUrl)} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <PhotoCameraIcon sx={{ fontSize: 50, color: 'grey.500' }} />
                                )}
                            </Box>
                            <input
                                type="file"
                                hidden
                                ref={coverInputRef}
                                onChange={(e) => handleFileChange(e, 'cover')}
                                accept="image/*"
                            />
                        </IconButton>
                        <Typography variant="caption" display="block" mt={1}>Cập nhật ảnh bìa</Typography>
                    </Box>

                    <TextField
                        margin="normal"
                        label="Họ tên"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="normal"
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        fullWidth
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isPhoneNumberHidden}
                                onChange={(e) => setForm({ ...form, isPhoneNumberHidden: e.target.checked })}
                                name="isPhoneNumberHidden"
                            />
                        }
                        label="Ẩn số điện thoại"
                    />
                    <TextField
                        margin="normal"
                        label="Mô tả bản thân"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Hủy</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : "Lưu"}
                    </Button>
                </DialogActions>
            </Dialog>

            {showCropper && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onClose={handleCloseCropper}
                    aspect={imageTypeToCrop === 'avatar' ? 1 / 1 : 16 / 9} // Aspect ratio for avatar (square) or cover (widescreen)
                    cropShape={imageTypeToCrop === 'avatar' ? 'round' : 'rect'}
                />
            )}

            {/* Image Preview Dialog */}
            <Dialog open={showImagePreview} onClose={() => setShowImagePreview(false)} maxWidth="md" fullWidth>
                <DialogTitle>Xem ảnh</DialogTitle>
                <DialogContent>
                    {currentImagePreviewUrl && (
                        <Box
                            component="img"
                            src={currentImagePreviewUrl}
                            alt="Preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                display: 'block',
                                margin: 'auto',
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowImagePreview(false)}>Đóng</Button>
                    {isCurrentUser && ( // Only show edit button if it's the current user's profile
                        <Button
                            onClick={() => {
                                setShowImagePreview(false); // Close preview
                                setImageToCrop(currentImagePreviewUrl); // Set image for cropper
                                setShowCropper(true); // Open cropper
                            }}
                            variant="contained"
                            color="primary"
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileHeader;

