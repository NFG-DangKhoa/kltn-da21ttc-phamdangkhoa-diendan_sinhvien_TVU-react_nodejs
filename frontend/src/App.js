// src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TopicDetail from './pages/TopicDetail/TopicDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react'; // Không cần useState, useEffect nếu không sử dụng detailedPosts
import PostDetail from './pages/TopicDetail/PostDetail';
import ScrollToTop from "./components/ScrollToTop";
import CreatePostPage from './pages/CreatePostPage';
// Import ThemeContextProvider thay vì ThemeWrapper nếu ThemeContext.js là nơi định nghĩa provider
import { ThemeContextProvider, ThemeContext } from './context/ThemeContext'; // Import ThemeContextProvider và ThemeContext
import { useContext } from 'react'; // Thêm useContext để dùng ThemeContext
import ProfilePage from './pages/profile/ProfilePage';
import { Box, IconButton } from '@mui/material'; // Import Box và IconButton từ Material-UI
import EditPostPage from './pages/TopicDetail/EditPostPage';
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Icon mặt trời
import NightlightRoundIcon from '@mui/icons-material/NightlightRound'; // Icon mặt trăng
import PostList from './pages/TopicDetail/PostList';
import PostDetailSingleImage from './pages/TopicDetail/PostDetailSingleImage';
import MembersList from './pages/TopicDetail/MemberList';


const App = () => {
  return (
    // Sử dụng ThemeContextProvider từ context/ThemeContext.js
    <ThemeContextProvider>
      <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <ScrollToTop />

            {/* Nút chuyển đổi theme cố định */}
            <ThemeToggleButtonFixed />

            <AppContent /> {/* Component con để xử lý logic Header/Footer và Routes */}

          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeContextProvider>
  );
};

// Component riêng cho nút chuyển đổi theme cố định
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
        backgroundColor: 'rgba(0,0,0,0.1)', // Nền mờ cho nút
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0.5,
        // Đảm bảo nút không bị che bởi AppBar nếu có
        '@media (min-width: 600px)': { // Ví dụ: trên màn hình lớn hơn, có thể điều chỉnh top
          top: 24,
          right: 24,
        }
      }}
    >
      <IconButton
        onClick={toggleColorMode}
        aria-label="toggle dark mode"
        sx={{
          color: darkMode ? '#f9d71c' : '#4a4a4a', // Màu icon tùy thuộc vào mode
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
  const isAdminRoute = location.pathname.startsWith('/admin'); // Kiểm tra xem đường dẫn có bắt đầu bằng '/admin' không

  return (
    <>
      {!isAdminRoute && <Header />} {/* Chỉ hiển thị Header nếu không phải trang admin */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CreatePostPage" element={<CreatePostPage />} />
        <Route path="/topic/:topicId" element={<TopicDetail />} />
        <Route path="/PostList" element={<PostList />} />
        <Route path="/PostDetailSingleImage" element={<PostDetailSingleImage />} />
        <Route path="/MembersList" element={<MembersList />} />
        <Route path="/posts/detail" element={<PostDetail />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Route cho trang chỉnh sửa bài viết */}
        <Route path="/edit-post/:postId" element={<EditPostPage />} />

        {/* Route cho trang cá nhân ProfilePage */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Routes>

      {!isAdminRoute && <Footer />} {/* Chỉ hiển thị Footer nếu không phải trang admin */}
    </>
  );
};

export default App;