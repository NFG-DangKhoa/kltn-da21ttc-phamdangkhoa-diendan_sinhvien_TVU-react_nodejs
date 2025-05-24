import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TopicDetail from './pages/TopicDetail/TopicDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState } from 'react';
import PostDetail from './pages/TopicDetail/PostDetail';
import ScrollToTop from "./components/ScrollToTop"; // ✅ đường dẫn đúng với vị trí file của bạn

const App = () => {
  const [detailedPosts, setDetailedPosts] = useState([]);

  return (
    <GoogleOAuthProvider clientId="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <ScrollToTop /> {/* ✅ Đặt ở đây */}

          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/topic/:topicId" element={<TopicDetail />} />
            <Route path="/posts/detail" element={<PostDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>

          <Footer />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
