import React, { useEffect, useState, useContext } from 'react'; // Thêm useContext
import {
    Box,
    Container,
    Typography,
    TextField,
    useTheme, // Vẫn giữ useTheme để truy cập các thuộc tính theme khác
} from '@mui/material';
import axios from 'axios';
import FeaturedPosts from '../components/FeaturedPosts';
import TrendingTopicsSection from '../components/TrendingTopicsSection';
import ThreeColumnLayout from '../components/ThreeColumnLayout';
import AboutSection from '../components/AboutSection';
import ForumStats from '../components/ForumStats';
import { School, SportsHandball, Forum, AccountCircle, HelpOutline } from '@mui/icons-material';

import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const Home = () => {
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fadeIn, setFadeIn] = useState(false); // State để kiểm soát hiệu ứng fade-in

    const theme = useTheme(); // Để truy cập theme object
    const { mode } = useContext(ThemeContext); // Lấy mode từ ThemeContext
    const isDarkMode = mode === 'dark'; // Biến tiện lợi để kiểm tra dark mode

    // Loại bỏ useState và useEffect cho darkMode ở đây vì đã được quản lý bởi ThemeContext
    // const [darkMode, setDarkMode] = useState(() => { ... });
    // useEffect(() => { ... }, [darkMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 100);

        const fetchTopics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/topics/all');
                setTopics(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách chủ đề:', error);
            }
        };

        fetchTopics();

        return () => clearTimeout(timer);
    }, []);

    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredPosts = [
        { id: 1, title: 'Làm sao để học tốt kỳ này và không bị stress?', author: 'Nguyễn Văn A', date: '2023-05-10', icon: <School />, image: 'https://picsum.photos/300/180?random=1' },
        { id: 2, title: 'Top 5 địa điểm giải trí "chill" nhất Trà Vinh!', author: 'Trần Thị B', date: '2023-05-08', icon: <SportsHandball />, image: 'https://picsum.photos/300/180?random=2' },
        { id: 3, title: 'Bí quyết tham gia hoạt động đoàn thể hiệu quả', author: 'Lê Văn C', date: '2023-05-05', icon: <Forum />, image: 'https://picsum.photos/300/180?random=3' },
        { id: 4, title: 'Kinh nghiệm tìm kiếm việc làm thêm cho sinh viên mới', author: 'Phạm Thị D', date: '2023-05-01', icon: <AccountCircle />, image: 'https://picsum.photos/300/180?random=4' },
        { id: 5, title: 'Hướng dẫn làm đồ án cuối kỳ từ A đến Z', author: 'Võ Thị E', date: '2023-04-28', icon: <School />, image: 'https://picsum.photos/300/180?random=5' },
        { id: 6, title: 'Sự kiện chào tân sinh viên 2024: Đừng bỏ lỡ!', author: 'Phạm Văn F', date: '2023-04-25', icon: <Forum />, image: 'https://picsum.photos/300/180?random=6' },
    ];

    const trendingTopics = [
        { id: 1, name: 'Học tập & Nghiên cứu', postCount: 120, icon: <School />, image: 'https://kinhte.donga.edu.vn/Portals/15/NCKH/11221610_396292900562327_6866783473345172076_n.jpg' },
        { id: 2, name: 'Đời sống Sinh viên', postCount: 95, icon: <SportsHandball />, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5iKMNUOGtlXNtp3lnPthv0WDJeDcfVpeEuQ&s' },
        { id: 3, name: 'Tuyển dụng & Việc làm', postCount: 78, icon: <AccountCircle />, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPbTRSkRkFfG4E6K8xDQGRhdwAxEsAbKYICQ&s' },
        { id: 4, name: 'Sự kiện & Hoạt động', postCount: 60, icon: <Forum />, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVHtltk-WqLJMK0THATy2WDGDWvyIPiBRt2Q&s' },
        { id: 5, name: 'Thắc mắc & Giải đáp', postCount: 55, icon: <HelpOutline />, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-XyrlwtVsyFgpj81cswkjSOUcmfPYFrc_LQ&s' },
    ];

    const getFadeInStyles = (delay = 0) => ({
        opacity: 0,
        transform: 'translateY(20px)',
        transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
        ...(fadeIn && {
            opacity: 1,
            transform: 'translateY(0)',
        }),
    });

    return (
        <Container
            sx={{
                pt: 4,
                position: 'relative',
                minHeight: '100vh',
                // Sử dụng màu chữ từ theme.palette.text.primary
                color: theme.palette.text.primary,
                transition: 'color 0.4s ease',
                fontFamily: 'Inter, sans-serif',
                marginTop: '64px',
            }}
        >
            {/* Nền mờ (không cần hiệu ứng fade-in) */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("/pattern-bg.svg")',
                    backgroundRepeat: 'repeat',
                    opacity: 0.05,
                    zIndex: -2,
                }}
            />

            {/* Banner */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    mt: 1,
                    mr: 20,
                    left: '50 %', // Lỗi cú pháp ở đây: '50 %' phải là '50%'
                    transform: 'translateX(-50%)', // Thêm transform để căn giữa
                    width: '90vw',
                    height: 250,
                    backgroundImage: 'url("/ghgfhgffhhf-9791.jpeg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    mb: 4,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    ...getFadeInStyles(0.2),
                }}
            />

            {/* Tiêu đề và Mô tả */}
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                mt={40}
                sx={{
                    fontSize: '38px',
                    // Sử dụng màu chữ chính từ theme
                    color: theme.palette.text.primary,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    // textShadow: isDarkMode ? '0 0 8px rgba(255,255,255,0.1)' : 'none', // Có thể giữ nếu bạn thích hiệu ứng này
                    ...getFadeInStyles(0.4),
                }}
            >
                DIỄN ĐÀN SINH VIÊN TVU
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                // Sử dụng màu chữ phụ từ theme
                color={theme.palette.text.secondary}
                mb={3}
                sx={{
                    fontSize: '16px',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6,
                    ...getFadeInStyles(0.6),
                }}
            >
                Nơi trao đổi, chia sẻ kiến thức và kinh nghiệm học tập, đời sống giữa sinh viên Trường Đại học Trà Vinh.
            </Typography>

            {/* Vùng Bài Viết Nổi Bật */}
            <Box sx={getFadeInStyles(1.2)}>
                <FeaturedPosts featuredPosts={featuredPosts} isDarkMode={isDarkMode} /> {/* Truyền isDarkMode */}
            </Box>

            {/* Vùng Chủ Đề Đáng Chú Ý */}
            <Box sx={getFadeInStyles(1.4)}>
                <TrendingTopicsSection trendingTopics={trendingTopics} isDarkMode={isDarkMode} /> {/* Truyền isDarkMode */}
            </Box>

            {/* Tìm kiếm */}
            <Box maxWidth={600} mx="auto" mb={5} sx={getFadeInStyles(0.8)}>
                <TextField
                    fullWidth
                    label="Tìm kiếm chủ đề..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputLabelProps={{
                        // Sử dụng màu label từ theme (palette.text.secondary đã được đặt)
                        sx: { color: theme.palette.text.secondary },
                    }}
                    InputProps={{
                        sx: {
                            // Sử dụng màu chữ chính từ theme
                            color: theme.palette.text.primary,
                            borderRadius: '12px',
                            '& fieldset': {
                                // Sử dụng màu border từ theme (hoặc tùy chỉnh nhẹ)
                                borderColor: theme.palette.divider, // Divider color for borders
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main, // Màu hover theo primary
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main, // Màu focus theo primary
                                borderWidth: '2px',
                            },
                        },
                    }}
                    sx={{
                        // Sử dụng background.paper từ theme
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '12px',
                        boxShadow: isDarkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                    }}
                />
            </Box>

            {/* Bố cục 3 cột */}
            <Box sx={getFadeInStyles(1.6)}>
                <ThreeColumnLayout
                    filteredTopics={filteredTopics}
                    trendingTopics={trendingTopics}
                    isDarkMode={isDarkMode} // Truyền isDarkMode
                />
            </Box>

            {/* Vùng Thống kê Diễn đàn */}
            <Box sx={getFadeInStyles(1.0)}>
                <ForumStats isDarkMode={isDarkMode} /> {/* Truyền isDarkMode */}
            </Box>

            {/* Vùng Thông tin Admin và Trường */}
            <Box sx={getFadeInStyles(1.8)}>
                <AboutSection isDarkMode={isDarkMode} /> {/* Truyền isDarkMode */}
            </Box>
        </Container>
    );
};

export default Home;