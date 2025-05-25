import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TopicDetail from './pages/TopicDetail/TopicDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState, useEffect } from 'react'; // Import useEffect
import PostDetail from './pages/TopicDetail/PostDetail';
import ScrollToTop from "./components/ScrollToTop";
import { ThemeContextProvider } from './context/ThemeContext'; // Import ThemeContextProvider

const App = () => {
  const [detailedPosts, setDetailedPosts] = useState([]); // Giữ nguyên state này nếu bạn đang dùng

  return (
    <ThemeContextProvider> {/* Bao bọc toàn bộ ứng dụng bằng ThemeContextProvider */}
      <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <ScrollToTop />

            <AppContent /> {/* Tạo một component con để xử lý logic Header/Footer */}

          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeContextProvider>
  );
};

// Component AppContent mới để xử lý logic hiển thị Header/Footer
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
        <Route path="/topic/:topicId" element={<TopicDetail />} />
        <Route path="/posts/detail" element={<PostDetail />} />
        <Route path="/admin/*" element={<AdminDashboard />} /> {/* Sử dụng "/*" để khớp các sub-route của admin */}
      </Routes>

      {!isAdminRoute && <Footer />} {/* Chỉ hiển thị Footer nếu không phải trang admin */}
    </>
  );
};

export default App;