// src/pages/profile/ProfileInfo.jsx
import React from 'react';
import { 
    Box, 
    Typography, 
    useTheme, 
    Chip, 
    Grid,
    Card,
    CardContent,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Email as EmailIcon,
    CalendarToday as CalendarTodayIcon,
    LocationOn as LocationOnIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Star as StarIcon,
    Favorite as FavoriteIcon,
    Comment as CommentIcon,
    Article as ArticleIcon,
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

const ProfileInfo = ({ userData, isCurrentUser }) => {
    const theme = useTheme();

    if (!userData) return null;

    // Mock data for demonstration
    const profileStats = {
        posts: 24,
        comments: 156,
        likes: 89,
        followers: 45,
        following: 32,
        joinDate: new Date(userData.createdAt || '2024-01-01').toLocaleDateString('vi-VN'),
        level: 'Thành viên tích cực',
        points: 1250
    };

    const achievements = [
        { name: 'Người mới', icon: '🌟', description: 'Hoàn thành hồ sơ cá nhân' },
        { name: 'Tác giả', icon: '✍️', description: 'Đăng 10 bài viết đầu tiên' },
        { name: 'Thảo luận viên', icon: '💬', description: 'Bình luận 50 lần' },
        { name: 'Được yêu thích', icon: '❤️', description: 'Nhận 100 lượt thích' }
    ];

    return (
        <Grid container spacing={3}>
            {/* Personal Information Card */}
            <Grid item xs={12} md={8}>
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        {/* Header Section */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Thông tin cá nhân
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Chi tiết về {userData.fullName || userData.username}
                            </Typography>
                        </Box>

                        {/* Basic Info */}
                        <List sx={{ mb: 3 }}>
                            <ListItem>
                                <ListItemIcon>
                                    <EmailIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Email"
                                    secondary={userData.email || 'Chưa cập nhật'}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <CalendarTodayIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Ngày tham gia"
                                    secondary={profileStats.joinDate}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <LocationOnIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Vị trí"
                                    secondary={userData.location || 'Trà Vinh University'}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <WorkIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Nghề nghiệp"
                                    secondary={userData.occupation || 'Sinh viên'}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <SchoolIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Trình độ"
                                    secondary={profileStats.level}
                                />
                            </ListItem>
                        </List>

                        {/* Bio Section */}
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Giới thiệu
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {userData.bio || "Chưa có mô tả về bản thân. Hãy cập nhật để mọi người hiểu rõ hơn về bạn!"}
                            </Typography>
                        </Box>

                        {/* Social Links */}
                        {userData.socialLinks && Object.keys(userData.socialLinks || {}).length > 0 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Box>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Liên kết xã hội
                                    </Typography>
                                    <Box display="flex" gap={2} flexWrap="wrap">
                                        {userData.socialLinks.github && (
                                            <Chip
                                                icon={<GitHubIcon />}
                                                label="GitHub"
                                                component="a"
                                                href={userData.socialLinks.github}
                                                target="_blank"
                                                clickable
                                                variant="outlined"
                                            />
                                        )}
                                        {userData.socialLinks.linkedin && (
                                            <Chip
                                                icon={<LinkedInIcon />}
                                                label="LinkedIn"
                                                component="a"
                                                href={userData.socialLinks.linkedin}
                                                target="_blank"
                                                clickable
                                                variant="outlined"
                                            />
                                        )}
                                        {userData.socialLinks.twitter && (
                                            <Chip
                                                icon={<TwitterIcon />}
                                                label="Twitter"
                                                component="a"
                                                href={userData.socialLinks.twitter}
                                                target="_blank"
                                                clickable
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Statistics & Achievements Sidebar */}
            <Grid item xs={12} md={4}>
                {/* Statistics Card */}
                <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            📊 Thống kê hoạt động
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
                                    <ArticleIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{profileStats.posts}</Typography>
                                    <Typography variant="caption">Bài viết</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'white' }}>
                                    <CommentIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{profileStats.comments}</Typography>
                                    <Typography variant="caption">Bình luận</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'error.light', color: 'white' }}>
                                    <FavoriteIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{profileStats.likes}</Typography>
                                    <Typography variant="caption">Lượt thích</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'warning.light', color: 'white' }}>
                                    <StarIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{profileStats.points}</Typography>
                                    <Typography variant="caption">Điểm</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        {/* Level Progress */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold">Cấp độ</Typography>
                                <Typography variant="body2" color="text.secondary">{profileStats.level}</Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={75} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                    }
                                }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                75% đến cấp độ tiếp theo
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Achievements Card */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            🏆 Thành tích
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {achievements.map((achievement, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 2, 
                                        borderRadius: 2, 
                                        bgcolor: 'grey.50',
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            borderColor: 'primary.main',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ fontSize: '2rem', mr: 2 }}>
                                        {achievement.icon}
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {achievement.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            {achievement.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* Badge Collection */}
                        {userData.badges && userData.badges.length > 0 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    🎖️ Huy hiệu
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {userData.badges.map((badge, index) => (
                                        <Chip
                                            key={index}
                                            label={badge.name}
                                            icon={<EmojiEventsIcon />}
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ProfileInfo;
