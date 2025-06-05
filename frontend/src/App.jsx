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
import React from 'react';
import PostDetail from './pages/TopicDetail/PostDetail';
import ScrollToTop from "./components/ScrollToTop";
import CreatePostPage from './pages/CreatePostPage';
import { ThemeContextProvider, ThemeContext } from './context/ThemeContext';
import { useContext } from 'react';
import ProfilePage from './pages/profile/ProfilePage';
import { Box, IconButton } from '@mui/material';
import EditPostPage from './pages/TopicDetail/EditPostPage';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightRoundIcon from './pages/TopicDetail/PostList';
import PostList from './pages/TopicDetail/PostList';
import PostDetailSingleImage from './pages/TopicDetail/PostDetailSingleImage';
import MembersList from './pages/TopicDetail/MemberList';
import ChatbotWidget from './components/ChatbotWidget' // Đảm bảo dòng này đã có và đúng đường dẫn

const App = () => {
  return (
    // Sử dụng ThemeContextProvider từ context/ThemeContext.js
    <ThemeContextProvider>
      <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <ScrollToTop />

            {/* ĐÃ BỎ NÚT CHUYỂN ĐỔI THEME CỐ ĐỊNH TẠI ĐÂY */}
            {/* <ThemeToggleButtonFixed /> */}

            <AppContent /> {/* Component con để xử lý logic Header/Footer và Routes */}

          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeContextProvider>
  );
};

// Component ThemeToggleButtonFixed này không còn được sử dụng
// Nhưng bạn có thể giữ lại hoặc xóa nó tùy ý nếu không muốn dùng nó ở bất kỳ đâu khác
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}

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

        <Route path="/edit-post/:postId" element={<EditPostPage />} />

        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Routes>

      {!isAdminRoute && <Footer />}

      {/* --- THÊM DÒNG NÀY ĐỂ HIỂN THỊ CHATBOT --- */}
      {/* Chatbot sẽ hiển thị trên mọi trang, ngoại trừ các trang admin nếu bạn không muốn */}
      {!isAdminRoute && <ChatbotWidget />}
      {/* --- KẾT THÚC PHẦN THÊM CHATBOT --- */}
    </>
  );
};

export default App;