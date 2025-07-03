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
                position: 'fixed',
                top: '64px', // Sát mép dưới header (64px là chiều cao chuẩn của AppBar)
                left: 0,
                right: 0,
                py: { xs: 0.5, md: 0.75 }, // Tăng padding một chút để dễ nhìn hơn
                px: { xs: 2, md: 3 },
                backgroundColor: darkMode ? '#1a1b1c' : '#f8f9fa',
                borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
                zIndex: (theme) => theme.zIndex.appBar - 1,
                backdropFilter: 'blur(8px)',
                width: '100%',
                boxSizing: 'border-box'
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
            >
                <HomeIcon sx={{ mr: 1, fontSize: 18 }} />
                Trang chủ
            </Link>
        );

        // Post Detail page
        if ((pathname.includes('/post-detail') || pathname.includes('/posts/detail')) && topicName && postTitle) {
            const topicId = new URLSearchParams(location.search).get('topicId');
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
                >
                    <TopicIcon sx={{ mr: 1, fontSize: 18 }} />
                    {topicName}
                </Link>
            );
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
                        border: darkMode ? '1px solid #4a4b4c' : '1px solid #d0d0d0',
                        boxShadow: darkMode
                            ? 'inset 0 1px 3px rgba(0,0,0,0.3)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                    }}
                >
                    <ArticleIcon sx={{ mr: 1, fontSize: 18, color: theme.palette.primary.main }} />
                    {postTitle}
                </Typography>
            );
        } else if (pathname.includes('/topic/') && topicName) {
            // Topic Detail page
            breadcrumbs.push(
                <Typography
                    key="topic"
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
        } else if (pathname === '/topics') {
            // Topics page
            breadcrumbs.push(
                <Typography
                    key="topics"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: darkMode ? '#e4e6eb' : 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}
                >
                    <TopicIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Chủ đề
                </Typography>
            );
        }
        return breadcrumbs;
    }, [location.pathname, topicName, postTitle, userName, searchQuery, darkMode, theme]);

    return (
        <Box sx={{
            position: 'fixed',
            top: '64px', // Sát mép dưới header (64px là chiều cao chuẩn của AppBar)
            left: 0,
            right: 0,
            py: { xs: 0.5, md: 0.75 }, // Tăng padding một chút để dễ nhìn hơn
            px: { xs: 2, md: 3 },
            backgroundColor: darkMode ? '#1a1b1c' : '#f8f9fa',
            borderBottom: `1px solid ${darkMode ? '#3a3b3c' : '#e0e0e0'}`,
            zIndex: (theme) => theme.zIndex.appBar - 1,
            backdropFilter: 'blur(8px)',
            width: '100%',
            boxSizing: 'border-box'
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
