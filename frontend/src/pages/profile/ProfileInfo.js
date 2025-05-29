// src/components/ProfileInfo.js
import React from 'react';
import { Box, Typography, Paper, Divider, Link, useTheme, Chip, IconButton } from '@mui/material'; // <-- Thêm IconButton vào đây
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import LanguageIcon from '@mui/icons-material/Language';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const ProfileInfo = ({ userData }) => {
    const theme = useTheme();

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 8px rgba(0,0,0,0.05)',
                transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}>
                Thông tin cá nhân
            </Typography>
            <Divider sx={{ mb: 2, borderColor: theme.palette.divider }} />

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                    {userData.location}
                </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <WorkIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                    {userData.occupation}
                </Typography>
            </Box>
            {userData.website && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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

            {Object.keys(userData.socialLinks).length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Liên kết xã hội:
                    </Typography>
                    <Box display="flex" gap={1}>
                        {userData.socialLinks.github && (
                            <IconButton href={userData.socialLinks.github} target="_blank" rel="noopener" size="small">
                                <GitHubIcon sx={{ color: theme.palette.text.secondary }} />
                            </IconButton>
                        )}
                        {userData.socialLinks.linkedin && (
                            <IconButton href={userData.socialLinks.linkedin} target="_blank" rel="noopener" size="small">
                                <LinkedInIcon sx={{ color: theme.palette.text.secondary }} />
                            </IconButton>
                        )}
                        {userData.socialLinks.twitter && (
                            <IconButton href={userData.socialLinks.twitter} target="_blank" rel="noopener" size="small">
                                <TwitterIcon sx={{ color: theme.palette.text.secondary }} />
                            </IconButton>
                        )}
                        {/* Thêm các liên kết khác nếu cần */}
                    </Box>
                </Box>
            )}

            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

            {userData.badges && userData.badges.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}>
                        Danh hiệu
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
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