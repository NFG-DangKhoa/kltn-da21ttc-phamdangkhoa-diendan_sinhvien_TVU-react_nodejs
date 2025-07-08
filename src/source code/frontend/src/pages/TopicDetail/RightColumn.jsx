import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Tooltip, Button, CircularProgress, Paper, Chip } from '@mui/material';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, People, Campaign } from '@mui/icons-material';
import axios from 'axios';
import { OnlineBadge } from '../../components/Chat/OnlineIndicator';

const RightColumn = () => {
    const { mode } = useContext(ThemeContext);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const darkMode = mode === 'dark';

    const [activeMembers, setActiveMembers] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);

    // Fetch recent active members
    useEffect(() => {
        const fetchActiveMembers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users/members', {
                    params: { limit: 5 }
                });

                if (response.data.success) {
                    setActiveMembers(response.data.data.members);
                }
            } catch (error) {
                console.error('Error fetching active members:', error);
                // Fallback to dummy data if API fails
                setActiveMembers([
                    { _id: 1, fullName: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?img=1', role: 'user' },
                    { _id: 2, fullName: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?img=2', role: 'user' },
                    { _id: 3, fullName: 'Peter Jones', avatarUrl: 'https://i.pravatar.cc/150?img=3', role: 'user' },
                    { _id: 4, fullName: 'Alice Brown', avatarUrl: 'https://i.pravatar.cc/150?img=4', role: 'user' },
                    { _id: 5, fullName: 'Michael Green', avatarUrl: 'https://i.pravatar.cc/150?img=5', role: 'admin' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        const fetchFeaturedPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/posts/featured');
                if (response.data.success) {
                    setFeaturedPosts(response.data.data.slice(0, 4)); // Lấy 4 bài viết nổi bật
                }
            } catch (error) {
                console.error('Error fetching featured posts:', error);
                // Fallback to dummy data if API fails
                setFeaturedPosts([
                    { _id: 1, title: 'React Hooks Advanced', author: { fullName: 'John Doe' }, createdAt: new Date() },
                    { _id: 2, title: 'Responsive Design with MUI', author: { fullName: 'Jane Smith' }, createdAt: new Date() },
                    { _id: 3, title: 'Deploy to Vercel', author: { fullName: 'Peter Jones' }, createdAt: new Date() },
                    { _id: 4, title: 'Node.js REST API', author: { fullName: 'Alice Brown' }, createdAt: new Date() },
                ]);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchActiveMembers();
        fetchFeaturedPosts();
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Active Members Section - Compact */}
            {isLoggedIn && (
                <Paper
                    elevation={0}
                    sx={{
                        background: '#ffffff',
                        borderRadius: 2.5,
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ p: 2.5, pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{
                                color: '#1e293b',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.9rem'
                            }}>
                                <People sx={{ mr: 1, color: '#3b82f6', fontSize: '1.1rem' }} />
                                Thành viên
                            </Typography>
                            <Button
                                component={Link}
                                to="/MembersList"
                                size="small"
                                sx={{
                                    color: '#3b82f6',
                                    textTransform: 'none',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    minWidth: 'auto',
                                    px: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                    },
                                }}
                            >
                                Tất cả
                            </Button>
                        </Box>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <List sx={{ pt: 0, pb: 1 }}>
                            {activeMembers.slice(0, 4).map((member, index) => (
                                <ListItem
                                    key={member._id}
                                    component={Link}
                                    to={`/profile/${member._id}`}
                                    sx={{
                                        px: 2.5,
                                        py: 1,
                                        textDecoration: 'none',
                                        borderBottom: index < 3 ? '1px solid #f1f5f9' : 'none',
                                        '&:hover': {
                                            backgroundColor: '#f8fafc',
                                            '& .member-name': {
                                                color: '#3b82f6'
                                            }
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 36 }}>
                                        <OnlineBadge
                                            userId={member._id}
                                            size="small"
                                            showTooltip={true}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        >
                                            <Avatar
                                                alt={member.fullName}
                                                src={member.avatarUrl}
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    background: member.role === 'admin'
                                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {!member.avatarUrl && member.fullName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </OnlineBadge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={member.fullName}
                                        secondary={
                                            <Chip
                                                size="small"
                                                label={member.role === 'admin' ? 'Admin' : 'Member'}
                                                color={member.role === 'admin' ? 'error' : 'primary'}
                                                sx={{
                                                    fontSize: '0.6rem',
                                                    height: 16,
                                                    mt: 0.3
                                                }}
                                            />
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                        primaryTypographyProps={{
                                            className: 'member-name',
                                            color: '#374151',
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                            transition: 'color 0.2s ease',
                                            lineHeight: 1.2,
                                            noWrap: true
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}

            {/* Advertisement Section - Compact */}
            <Paper
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: 2.5,
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 2.5, textAlign: 'center' }}>
                    <Campaign sx={{ fontSize: 28, color: '#ffffff', mb: 1.5 }} />
                    <Typography variant="subtitle2" sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '0.85rem'
                    }}>
                        Khóa học Front-end
                    </Typography>
                    <Typography variant="caption" sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        mb: 1.5,
                        lineHeight: 1.4,
                        display: 'block',
                        fontSize: '0.75rem'
                    }}>
                        Nâng cao kỹ năng lập trình
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: '#ffffff',
                            color: '#3b82f6',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 2,
                            '&:hover': {
                                backgroundColor: '#f8fafc'
                            }
                        }}
                    >
                        Tìm hiểu
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default RightColumn;
