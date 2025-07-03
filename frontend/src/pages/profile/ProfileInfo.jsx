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
    Phone as PhoneIcon,
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

    const joinDate = new Date(userData.createdAt || '2024-01-01').toLocaleDateString('vi-VN');
    const level = 'Thành viên tích cực'; // This can be calculated based on stats
    const points = (userData.stats?.totalPosts || 0) * 10 + (userData.stats?.totalComments || 0) * 2 + (userData.stats?.totalLikes || 0);

    const achievements = [
        { name: 'Người mới', icon: '🌟', description: 'Hoàn thành hồ sơ cá nhân' },
        { name: 'Tác giả', icon: '✍️', description: 'Đăng 10 bài viết đầu tiên' },
        { name: 'Thảo luận viên', icon: '💬', description: 'Bình luận 50 lần' },
        { name: 'Được yêu thích', icon: '❤️', description: 'Nhận 100 lượt thích' }
    ];

    return (
        <Grid container spacing={4} justifyContent="center">
            {/* Personal Information Card */}
            <Grid item xs={12} md={7}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'all 0.4s ease',
                        background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                        '&:hover': {
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            transform: 'translateY(-4px)'
                        }
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        {/* Header Section */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Thông tin cá nhân
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Chi tiết về {userData.fullName || userData.username}
                            </Typography>
                        </Box>

                        {/* Basic Info */}
                        <List sx={{ mb: 3 }}>
                            <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>
                                    <EmailIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Email"
                                    secondary={userData.email || 'Chưa cập nhật'}
                                />
                            </ListItem>

                            {(userData.phoneNumber && (!userData.isPhoneNumberHidden || isCurrentUser)) && (
                                <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <ListItemIcon>
                                        <PhoneIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Số điện thoại"
                                        secondary={userData.isPhoneNumberHidden && !isCurrentUser ? 'Đã ẩn' : userData.phoneNumber}
                                    />
                                </ListItem>
                            )}

                            <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>
                                    <CalendarTodayIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Ngày tham gia"
                                    secondary={joinDate}
                                />
                            </ListItem>

                            <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>
                                    <LocationOnIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Vị trí"
                                    secondary={userData.location || 'Trà Vinh University'}
                                />
                            </ListItem>

                            <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>
                                    <WorkIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Nghề nghiệp"
                                    secondary={userData.occupation || 'Sinh viên'}
                                />
                            </ListItem>

                            <ListItem sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>
                                    <SchoolIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Trình độ"
                                    secondary={level}
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
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
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
            <Grid item xs={12} md={5}>
                {/* Statistics Card */}
                <Card sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            📊 Thống kê hoạt động
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', color: 'white', boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)' }}>
                                    <ArticleIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{(userData.stats && userData.stats.totalPosts) || 0}</Typography>
                                    <Typography variant="caption">Bài viết</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white', boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)' }}>
                                    <CommentIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{(userData.stats && userData.stats.totalComments) || 0}</Typography>
                                    <Typography variant="caption">Bình luận</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', color: 'white', boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)' }}>
                                    <FavoriteIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{(userData.stats && userData.stats.totalLikes) || 0}</Typography>
                                    <Typography variant="caption">Lượt thích</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ textAlign: 'center', p: 2, borderRadius: 3, background: 'linear-gradient(45deg, #FFC107 30%, #FF9800 90%)', color: 'white', boxShadow: '0 3px 5px 2px rgba(255, 203, 107, .3)' }}>
                                    <StarIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{points}</Typography>
                                    <Typography variant="caption">Điểm</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        {/* Level Progress */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold">Cấp độ</Typography>
                                <Typography variant="body2" color="text.secondary">{level}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={75}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
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
                <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
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