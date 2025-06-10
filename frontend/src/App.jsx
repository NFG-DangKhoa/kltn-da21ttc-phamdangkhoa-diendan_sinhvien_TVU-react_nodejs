// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Box, IconButton, CircularProgress, Typography } from '@mui/material'; // Import CircularProgress và Typography
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';

// Import custom styles
import './styles/animations.css';
import './styles/responsive.css';

// Components dùng chung
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from "./components/ScrollToTop";
import ChatbotWidget from './components/ChatbotWidget';
import LoadingScreen from './components/LoadingScreen';

// Contexts
import { AuthProvider, AuthContext } from './context/AuthContext'; // Import AuthContext để sử dụng useContext
import { ThemeContextProvider, ThemeContext } from './context/ThemeContext';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/profile/ProfilePage';

// Topic/Post Related Pages
import TopicDetail from './pages/TopicDetail/TopicDetail';
import PostDetail from './pages/TopicDetail/PostDetail';
import EditPostPage from './pages/TopicDetail/EditPostPage';
import PostList from './pages/TopicDetail/PostList';
import PostDetailSingleImage from './pages/TopicDetail/PostDetailSingleImage';
import MembersList from './pages/TopicDetail/MemberList';

// Test Components
import BreadcrumbTest from './components/BreadcrumbTest';

// Admin Dashboard Layout
import AdminDashboard from './layouts/AdminDashboard';

// Đây là component chính của ứng dụng
const App = () => {
  return (
    <ThemeContextProvider>
      <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeContextProvider>
  );
};

// Component ThemeToggleButtonFixed này không còn được sử dụng ở đây
const ThemeToggleButtonFixed = () => {
  const { toggleColorMode, mode } = useContext(ThemeContext);
  const darkMode = mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0.5,
        '@media (min-width: 600px)': {
          top: 24,
          right: 24,
        }
      }}
    >
      <IconButton
        onClick={toggleColorMode}
        aria-label="toggle dark mode"
        sx={{
          color: darkMode ? '#f9d71c' : '#4a4a4a',
          transition: 'color 0.3s ease',
          '&:hover': {
            color: darkMode ? '#fff176' : '#616161',
          }
        }}
      >
        {darkMode ? <WbSunnyIcon fontSize="large" /> : <NightlightRoundIcon fontSize="large" />}
      </IconButton>
    </Box>
  );
};

// Component AppContent mới để xử lý logic hiển thị Header/Footer và Routes
const AppContent = () => {
  const location = useLocation();
  // Xác định xem có phải là route admin hay không
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Lấy trạng thái loading từ AuthContext
  const { loading } = useContext(AuthContext); // <--- Đã thêm dòng này

  // Hiển thị màn hình loading nếu AuthContext đang trong quá trình khôi phục trạng thái
  if (loading) {
    return <LoadingScreen message="Đang tải ứng dụng và thông tin người dùng..." />;
  }

  return (
    <>
      {/* Hiển thị Header chỉ khi không phải là trang admin */}
      {!isAdminRoute && <Header />}

      {/* Định tuyến các trang */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CreatePostPage" element={<CreatePostPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        {/* Topic and Post Routes */}
        <Route path="/topic/:topicId" element={<TopicDetail />} />
        <Route path="/PostList" element={<PostList />} />
        <Route path="/PostDetailSingleImage" element={<PostDetailSingleImage />} />
        <Route path="/MembersList" element={<MembersList />} />
        <Route path="/posts/detail" element={<PostDetail />} />
        <Route path="/post-detail" element={<PostDetail />} />
        <Route path="/edit-post/:postId" element={<EditPostPage />} />

        {/* Test Routes */}
        <Route path="/test/breadcrumb" element={<BreadcrumbTest />} />

        {/* Admin Dashboard Route */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Catch-all route cho các trang không tìm thấy */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>

      {/* Hiển thị Footer chỉ khi không phải là trang admin */}
      {!isAdminRoute && <Footer />}

      {/* ChatbotWidget sẽ hiển thị trên mọi trang, ngoại trừ các trang admin */}
      {!isAdminRoute && <ChatbotWidget />}
    </>
  );
};

export default App;