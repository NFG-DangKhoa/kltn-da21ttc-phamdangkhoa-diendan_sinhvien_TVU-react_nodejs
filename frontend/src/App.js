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
import React, { useState, useEffect } from 'react';
import PostDetail from './pages/TopicDetail/PostDetail';
import ScrollToTop from "./components/ScrollToTop";
import CreatePostPage from './pages/CreatePostPage';
// Import các components và hook từ ThemeWrapper
import { ThemeWrapper, ThemeToggleButton, useColorMode } from './pages/profile/ThemeWrapper';
import ProfilePage from './pages/profile/ProfilePage';
import { Box } from '@mui/material'; // Import Box từ Material-UI

// -- Các component con của bạn vẫn giữ nguyên --

const App = () => {
  const [detailedPosts, setDetailedPosts] = useState([]); // Giữ nguyên state này nếu bạn đang dùng

  return (
    // Thay thế ThemeContextProvider bằng ThemeWrapper
    <ThemeWrapper>
      <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <ScrollToTop />

            {/* Thêm nút chuyển đổi theme cố định ở đây */}
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
                p: 0.5
              }}
            >
              <ThemeToggleButton />
            </Box>

            <AppContent /> {/* Component con để xử lý logic Header/Footer và Routes */}

          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeWrapper>
  );
};

// Component AppContent mới để xử lý logic hiển thị Header/Footer và Routes
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin'); // Kiểm tra xem đường dẫn có bắt đầu bằng '/admin' không

  // Sử dụng hook useColorMode nếu bạn cần truy cập theme mode trong AppContent
  // const { toggleColorMode } = useColorMode(); // Ví dụ nếu muốn nút ở trong Header

  return (
    <>
      {!isAdminRoute && <Header />} {/* Chỉ hiển thị Header nếu không phải trang admin */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CreatePostPage" element={<CreatePostPage />} />
        <Route path="/topic/:topicId" element={<TopicDetail />} />
        <Route path="/posts/detail" element={<PostDetail />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Thêm Route cho trang cá nhân ProfilePage */}
        {/* ':userId' là một tham số động, bạn có thể truyền ID người dùng vào đây */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
        {/* Bạn có thể thêm một route mặc định cho profile của người dùng đang đăng nhập nếu cần */}
        {/* <Route path="/profile" element={<ProfilePage userId={currentUser?.id} />} /> */}
      </Routes>

      {!isAdminRoute && <Footer />} {/* Chỉ hiển thị Footer nếu không phải trang admin */}
    </>
  );
};

export default App;