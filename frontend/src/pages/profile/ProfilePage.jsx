// src/pages/profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    CircularProgress,
    Tabs,
    Tab,
    Typography,
    Grid,
    Container,
    Paper,
    Fade,
    Alert
} from "@mui/material";
import {
    Person as PersonIcon,
    Timeline as TimelineIcon,
    Settings as SettingsIcon
} from "@mui/icons-material";
import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import UserActivity from "./UserActivity";

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    useEffect(() => {
        setLoading(true);

        // Get user from localStorage first for immediate display
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (localUser.fullName) {
            setUserData(localUser);
            setIsCurrentUser(true);
        }

        // Then fetch from API for updated data
        const token = localStorage.getItem("token");
        if (token) {
            axios.get("http://localhost:5000/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setUserData(res.data);
                    setIsCurrentUser(true);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Profile fetch error:", err);
                    setError("Không thể tải thông tin người dùng.");
                    setLoading(false);
                });
        } else {
            setError("Vui lòng đăng nhập để xem trang cá nhân.");
            setLoading(false);
        }
    }, []);

    const handleProfileUpdate = (newData) => {
        setUserData(prev => ({ ...prev, ...newData }));
        // Update localStorage as well
        const updatedUser = { ...userData, ...newData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Đang tải thông tin...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!userData) return null;

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Fade in={true} timeout={800}>
                <Box>
                    {/* Profile Header */}
                    <ProfileHeader
                        userData={userData}
                        isCurrentUser={isCurrentUser}
                        onProfileUpdate={handleProfileUpdate}
                    />

                    {/* Navigation Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            centered
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    minHeight: 64,
                                    '&.Mui-selected': {
                                        color: 'white',
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'white',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab
                                icon={<PersonIcon />}
                                label="Thông tin cá nhân"
                                iconPosition="start"
                                sx={{ gap: 1 }}
                            />
                            <Tab
                                icon={<TimelineIcon />}
                                label="Hoạt động"
                                iconPosition="start"
                                sx={{ gap: 1 }}
                            />
                        </Tabs>
                    </Paper>

                    {/* Tab Content */}
                    <Box sx={{ mt: 3 }}>
                        <Fade in={currentTab === 0} timeout={500}>
                            <Box sx={{ display: currentTab === 0 ? 'block' : 'none' }}>
                                <ProfileInfo userData={userData} isCurrentUser={isCurrentUser} />
                            </Box>
                        </Fade>

                        <Fade in={currentTab === 1} timeout={500}>
                            <Box sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
                                <UserActivity userId={userData._id} />
                            </Box>
                        </Fade>
                    </Box>
                </Box>
            </Fade>
        </Container>
    );
};

export default ProfilePage;