import React, { useEffect, useState, useMemo } from 'react';
import { Breadcrumbs, Typography, Box, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TopicIcon from '@mui/icons-material/Topic';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const BreadcrumbNavigation = ({
    customBreadcrumbs = null,
    topicName = null,
    postTitle = null,
    userName = null,
    searchQuery = null,
    darkMode = false
}) => {
    const theme = useTheme();
    const location = useLocation();
    const [forceUpdate, setForceUpdate] = useState(0);

    // Force update when props change
    useEffect(() => {
        setForceUpdate(prev => prev + 1);
    }, [topicName, postTitle, userName, searchQuery]);

    // Nếu có custom breadcrumbs, sử dụng chúng
    if (customBreadcrumbs) {
        return (
            <Box sx={{
                py: 2,
                px: 3,
                backgroundColor: darkMode ? '#1a1b1c' : '#f8f9fa',
                borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`
            }}>
                <Breadcrumbs
                    aria-label="breadcrumb"
                    sx={{
                        '& .MuiBreadcrumbs-separator': {
                            color: darkMode ? '#b0b3b8' : 'text.secondary'
                        }
                    }}
                >
                    {customBreadcrumbs}
                </Breadcrumbs>
            </Box>
        );
    }

    // Auto-generate breadcrumbs dựa trên route với useMemo
    const generateBreadcrumbs = useMemo(() => {
        const breadcrumbs = [];
        const pathname = location.pathname;

        // Luôn có Trang chủ với enhanced styling
        breadcrumbs.push(
            <Link
                key="home"
                to="/"
                style={{
                    textDecoration: 'none',
                    color: darkMode ? '#90caf9' : theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    background: darkMode
                        ? 'rgba(144, 202, 249, 0.1)'
                        : 'rgba(25, 118, 210, 0.08)',
                    border: `1px solid ${darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.15)'}`,
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = darkMode
                        ? '0 4px 12px rgba(144, 202, 249, 0.3)'
                        : '0 4px 12px rgba(25, 118, 210, 0.2)';
                    e.target.style.background = darkMode
                        ? 'rgba(144, 202, 249, 0.2)'
                        : 'rgba(25, 118, 210, 0.12)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = darkMode
                        ? 'rgba(144, 202, 249, 0.1)'
                        : 'rgba(25, 118, 210, 0.08)';
                }}
            >
                <HomeIcon sx={{
                    mr: 1,
                    fontSize: 18,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }} />
                Trang chủ
            </Link>
        );

        // Xác định breadcrumbs dựa trên pathname

        // FORCE RENDER FOR POST-DETAIL - Support both routes
        if (pathname.includes('/post-detail') || pathname.includes('/posts/detail')) {
            // Post Detail page
            const topicId = new URLSearchParams(location.search).get('topicId');



            // Enhanced topic breadcrumb
            breadcrumbs.push(
                <Link
                    key="topic"
                    to={`/topic/${topicId}`}
                    style={{
                        textDecoration: 'none',
                        color: darkMode ? '#90caf9' : theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        background: darkMode
                            ? 'rgba(144, 202, 249, 0.1)'
                            : 'rgba(25, 118, 210, 0.08)',
                        border: `1px solid ${darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.15)'}`,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = darkMode
                            ? '0 4px 12px rgba(144, 202, 249, 0.3)'
                            : '0 4px 12px rgba(25, 118, 210, 0.2)';
                        e.target.style.background = darkMode
                            ? 'rgba(144, 202, 249, 0.2)'
                            : 'rgba(25, 118, 210, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = darkMode
                            ? 'rgba(144, 202, 249, 0.1)'
                            : 'rgba(25, 118, 210, 0.08)';
                    }}
                >
                    <TopicIcon sx={{
                        mr: 1,
                        fontSize: 18,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }} />
                    {topicName || 'Đang tải...'}
                </Link>
            );

            // Enhanced post breadcrumb (current page)
            breadcrumbs.push(
                <Typography
                    key="post"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : '#1c1e21',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        background: darkMode
                            ? 'linear-gradient(135deg, #3a3b3c 0%, #2a2b2c 100%)'
                            : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                        border: `1px solid ${darkMode ? '#4a4b4c' : '#d0d0d0'}`,
                        boxShadow: darkMode
                            ? 'inset 0 1px 3px rgba(0,0,0,0.3)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            borderRadius: '8px 8px 0 0'
                        }
                    }}
                >
                    <ArticleIcon sx={{
                        mr: 1,
                        fontSize: 18,
                        color: theme.palette.primary.main,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }} />
                    {postTitle || 'Đang tải...'}
                </Typography>
            );
        } else if (pathname.includes('/topic/') && topicName) {
            // Topic Detail page
            breadcrumbs.push(
                <Typography
                    key="topic"
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <TopicIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    {topicName}
                </Typography>
            );
        } else if (pathname.includes('/profile') && userName) {
            // Profile page
            breadcrumbs.push(
                <Typography
                    key="profile"
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Hồ sơ - {userName}
                </Typography>
            );
        } else if (pathname.includes('/search') && searchQuery) {
            // Search page
            breadcrumbs.push(
                <Typography
                    key="search"
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <SearchIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Tìm kiếm: "{searchQuery}"
                </Typography>
            );
        } else if (pathname === '/about') {
            // About page
            breadcrumbs.push(
                <Typography
                    key="about"
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <InfoIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Giới thiệu
                </Typography>
            );
        } else if (pathname === '/contact') {
            // Contact page
            breadcrumbs.push(
                <Typography
                    key="contact"
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <ContactMailIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Liên hệ
                </Typography>
            );
        }

        return breadcrumbs;
    }, [location.pathname, topicName, postTitle, userName, searchQuery, darkMode, theme]);

    return (
        <Box sx={{
            py: { xs: 1.5, md: 2 },
            px: { xs: 2, md: 4 },
            mt: 8,
            background: darkMode
                ? 'linear-gradient(135deg, #1a1b1c 0%, #242526 50%, #1a1b1c 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
            borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
            boxShadow: darkMode
                ? '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            position: 'sticky',
            top: 64,
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            borderTop: `2px solid ${darkMode ? '#3a3b3c' : theme.palette.primary.main}`,
            transition: 'all 0.3s ease'
        }}>
            <Breadcrumbs
                aria-label="breadcrumb"
                separator={
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mx: 1,
                        color: darkMode ? '#b0b3b8' : '#666',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}>
                        ›
                    </Box>
                }
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        margin: 0
                    },
                    '& .MuiBreadcrumbs-ol': {
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 1
                    },
                    '& .MuiBreadcrumbs-li': {
                        display: 'flex',
                        alignItems: 'center'
                    }
                }}
            >
                {generateBreadcrumbs}
            </Breadcrumbs>
        </Box>
    );
};

export default BreadcrumbNavigation;
