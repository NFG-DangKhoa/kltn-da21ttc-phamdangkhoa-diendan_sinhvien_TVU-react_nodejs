// src/components/ProfileInfo.js
import React from 'react';
import { Box, Typography, Paper, Divider, Link, useTheme, Chip, IconButton, Avatar, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import LanguageIcon from '@mui/icons-material/Language';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const ProfileInfo = ({ userData }) => {
    const theme = useTheme();

    if (!userData) return null;

    return (
        <Paper
            sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 4px 24px rgba(0,0,0,0.07)',
                transition: 'background-color 0.4s, box-shadow 0.4s',
                maxWidth: 600,
                mx: 'auto',
                mt: 3,
            }}
        >
            {/* Avatar + Tên + Vai trò */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                    src={userData.avatarUrl || '/admin-avatar.png'}
                    alt={userData.fullName || userData.username}
                    sx={{
                        width: 110,
                        height: 110,
                        mb: 1,
                        border: `3px solid ${theme.palette.primary.main}`,
                        boxShadow: theme.palette.mode === 'dark' ? '0 0 0 2px #222' : '0 2px 12px rgba(0,0,0,0.10)'
                    }}
                />
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                    {userData.fullName || userData.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {userData.email}
                </Typography>
                {userData.role === 'admin' && (
                    <Chip
                        icon={<VerifiedUserIcon sx={{ color: '#fff !important' }} />}
                        label="Admin"
                        color="primary"
                        sx={{
                            fontWeight: 'bold',
                            color: '#fff',
                            mb: 1,
                            px: 2,
                            background: 'linear-gradient(90deg, #1976d2 60%, #00bcd4 100%)'
                        }}
                    />
                )}
            </Box>

            <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />

            {/* Mô tả */}
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', color: theme.palette.text.secondary }}>
                {userData.bio || "Chưa có mô tả"}
            </Typography>

            {/* Thông tin chi tiết */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                        {userData.location || "Chưa cập nhật vị trí"}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WorkIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                        {userData.occupation || "Chưa cập nhật nghề nghiệp"}
                    </Typography>
                </Box>
                {userData.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LanguageIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Link
                            href={userData.website}
                            target="_blank"
                            rel="noopener"
                            variant="body2"
                            sx={{
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            {userData.website.replace(/(^\w+:|^)\/\//, '')}
                        </Link>
                    </Box>
                )}
            </Box>

            {/* Liên kết xã hội */}
            {userData.socialLinks && Object.keys(userData.socialLinks || {}).length > 0 && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Liên kết xã hội:
                    </Typography>
                    <Box display="flex" justifyContent="center" gap={1}>
                        {userData.socialLinks.github && (
                            <Tooltip title="GitHub">
                                <IconButton href={userData.socialLinks.github} target="_blank" rel="noopener" size="small">
                                    <GitHubIcon sx={{ color: theme.palette.text.secondary }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {userData.socialLinks.linkedin && (
                            <Tooltip title="LinkedIn">
                                <IconButton href={userData.socialLinks.linkedin} target="_blank" rel="noopener" size="small">
                                    <LinkedInIcon sx={{ color: theme.palette.text.secondary }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {userData.socialLinks.twitter && (
                            <Tooltip title="Twitter">
                                <IconButton href={userData.socialLinks.twitter} target="_blank" rel="noopener" size="small">
                                    <TwitterIcon sx={{ color: theme.palette.text.secondary }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {/* Thêm các liên kết khác nếu cần */}
                    </Box>
                </Box>
            )}

            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

            {/* Danh hiệu */}
            {userData.badges && userData.badges.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary, textAlign: 'center' }}>
                        Danh hiệu
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                        {userData.badges.map((badge, index) => (
                            <Chip
                                key={index}
                                label={badge.name}
                                icon={<EmojiEventsIcon />}
                                variant="outlined"
                                color="primary"
                                sx={{
                                    borderColor: theme.palette.primary.light,
                                    color: theme.palette.text.primary,
                                    '.MuiChip-icon': { color: theme.palette.primary.main },
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default ProfileInfo;