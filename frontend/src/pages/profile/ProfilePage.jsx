// src/components/ProfilePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, CircularProgress, Tabs, Tab, Typography, Grid } from "@mui/material";
import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";
import UserActivity from "./UserActivity";

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isCurrentUser, setIsCurrentUser] = useState(false); // Kiểm tra có phải trang của mình không

    useEffect(() => {
        setLoading(true);
        axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                setUserData(res.data);
                setIsCurrentUser(true); // Giả sử luôn là trang của mình (cần sửa nếu có trang user khác)
                setLoading(false);
            })
            .catch(err => {
                setError("Không thể tải thông tin người dùng.");
                setLoading(false);
            });
    }, []);

    const handleProfileUpdate = (newData) => {
        setUserData(prev => ({ ...prev, ...newData }));
    };

    if (loading) return <Box sx={{ textAlign: "center", mt: 6 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userData) return null;

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
            <ProfileHeader userData={userData} isCurrentUser={isCurrentUser} onProfileUpdate={handleProfileUpdate} />
            <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
                <Tab label="Thông tin" />
                <Tab label="Hoạt động" />
            </Tabs>
            {currentTab === 0 && <ProfileInfo userData={userData} />}
            {currentTab === 1 && <UserActivity userId={userData._id} />}
        </Box>
    );
};

export default ProfilePage;