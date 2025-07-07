// src/pages/profile/ProfilePage.jsx
// src/pages/profile/ProfilePage.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
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
    Settings as SettingsIcon,
} from "@mui/icons-material";
import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import UserActivity from "./UserActivity";
import ActivityVisibilitySettings from "./ActivityVisibilitySettings";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation/BreadcrumbNavigation";

const ProfilePage = () => {
    const { userId } = useParams(); // Lấy userId từ URL
    const { user: currentUser } = useContext(AuthContext); // Lấy người dùng đang đăng nhập từ context
    const { mode } = useContext(ThemeContext);
    const isDarkMode = mode === 'dark';

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            // Kiểm tra xem profile đang xem có phải của người dùng hiện tại không
            const viewingOwnProfile = currentUser && currentUser._id === userId;
            setIsCurrentUser(viewingOwnProfile);

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError("Không thể tải thông tin người dùng. Người dùng có thể không tồn tại.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        } else {
            // If no userId in URL, it might be the current user's page
            // Or redirect to home/login page
            if (currentUser) {
                // Redirect to current user's profile page
                window.location.href = `/profile/${currentUser._id}`;
            } else {
                setError("Không tìm thấy ID người dùng.");
                setLoading(false);
            }
        }
    }, [userId, currentUser]); // Re-run effect when userId or currentUser changes

    const handleProfileUpdate = (newData) => {
        setUserData(prev => ({ ...prev, ...newData }));
        // Nếu là người dùng hiện tại, cập nhật cả localStorage
        if (isCurrentUser) {
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = { ...localUser, ...newData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleVisibilityChange = (newVisibilitySettings) => {
        setUserData(prev => ({
            ...prev,
            activityVisibility: newVisibilitySettings
        }));
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
        <>
            <BreadcrumbNavigation
                userName={userData?.fullName}
                darkMode={isDarkMode}
            />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Fade in={true} timeout={800}>
                    <Box>
                        {/* Profile Header */}
                        <ProfileHeader
                            userData={userData}
                            isCurrentUser={isCurrentUser}
                            onProfileUpdate={handleProfileUpdate}
                            currentUser={currentUser}
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
                                {isCurrentUser && (
                                    <Tab
                                        icon={<SettingsIcon />}
                                        label="Cài đặt"
                                        iconPosition="start"
                                        sx={{ gap: 1 }}
                                    />
                                )}
                            </Tabs>
                        </Paper>

                        {/* Tab Content */}
                        <Box sx={{ mt: 3 }}>
                            {currentTab === 0 && (
                                <Fade in={currentTab === 0} timeout={500}>
                                    <Box>
                                        <ProfileInfo userData={userData} isCurrentUser={isCurrentUser} />
                                    </Box>
                                </Fade>
                            )}

                            {currentTab === 1 && (
                                <Fade in={currentTab === 1} timeout={500}>
                                    <Box>
                                        <UserActivity
                                            userId={userData._id}
                                            currentUser={currentUser}
                                            activityVisibility={userData.activityVisibility}
                                        />
                                    </Box>
                                </Fade>
                            )}

                            {isCurrentUser && currentTab === 2 && (
                                <Fade in={currentTab === 2} timeout={500}>
                                    <Box>
                                        <ActivityVisibilitySettings
                                            initialSettings={userData.activityVisibility}
                                            onSettingsChange={handleVisibilityChange}
                                        />
                                    </Box>
                                </Fade>
                            )}
                        </Box>
                    </Box>
                </Fade>
            </Container>
        </>
    );
};

export default ProfilePage;
