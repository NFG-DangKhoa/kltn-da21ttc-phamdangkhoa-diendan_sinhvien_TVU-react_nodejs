import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    useMediaQuery,
    useTheme,
    Grid, // Import Grid for better layout control
    Card, // For displaying featured posts and trending topics
    CardContent,
    CardMedia,
    Button,
} from '@mui/material';
import TopicCard from '../components/TopicCard'; // Đảm bảo TopicCard có thể hiển thị ảnh đại diện
import axios from 'axios';
import {
    Rocket,
    Forum,
    SportsHandball,
    School,
    AccountCircle,
    HelpOutline,
    Star,
    ChevronLeft,
    ChevronRight,
    Whatshot, // Icon cho chủ đề nổi bật
} from '@mui/icons-material';

const Home = () => {
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLeftColumn, setShowLeftColumn] = useState(true);
    const [showRightColumn, setShowRightColumn] = useState(true);

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true' ? true : false;
    });

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/topics/all');
                setTopics(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách chủ đề:', error);
            }
        };

        fetchTopics();
    }, []);

    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f2f5';
        document.body.style.color = darkMode ? '#ffffff' : '#1c1e21';
    }, [darkMode]);

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
        { id: 1, name: 'Học tập & Nghiên cứu', postCount: 120, icon: <School /> },
        { id: 2, name: 'Đời sống Sinh viên', postCount: 95, icon: <SportsHandball /> },
        { id: 3, name: 'Tuyển dụng & Việc làm', postCount: 78, icon: <AccountCircle /> },
        { id: 4, name: 'Sự kiện & Hoạt động', postCount: 60, icon: <Forum /> },
        { id: 5, name: 'Thắc mắc & Giải đáp', postCount: 55, icon: <HelpOutline /> },
    ];

    return (
        <Container
            sx={{
                pt: 4,
                position: 'relative',
                minHeight: '100vh',
                color: darkMode ? '#ffffff' : '#1c1e21',
                transition: 'color 0.4s ease',
                fontFamily: 'Inter, sans-serif',
                marginTop: '64px', // Để tránh header cố định che mất nội dung
            }}
        >
            {/* Nền mờ */}
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
                    position: 'relative',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% + 48px)', // Kéo dài ra ngoài container
                    height: 250,
                    backgroundImage: 'url("/ghgfhgffhhf-9791.jpeg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    mb: 4,
                    ml: '-24px', // Đẩy lề trái ra ngoài
                    mr: '-24px', // Đẩy lề phải ra ngoài
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)', // Thêm shadow cho banner
                }}
            />

            {/* Tiêu đề và Mô tả */}
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                mt={4}
                sx={{
                    fontSize: '38px',
                    color: darkMode ? '#ffffff' : 'text.primary',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textShadow: darkMode ? '0 0 8px rgba(255,255,255,0.1)' : 'none',
                }}
            >
                DIỄN ĐÀN SINH VIÊN TVU
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                color={darkMode ? '#bdbdbd' : 'text.secondary'}
                mb={3}
                sx={{
                    fontSize: '16px', // Tăng kích thước font một chút
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.6, // Tăng khoảng cách dòng
                }}
            >
                Nơi trao đổi, chia sẻ kiến thức và kinh nghiệm học tập, đời sống giữa sinh viên Trường Đại học Trà Vinh.
            </Typography>

            {/* Tìm kiếm */}
            <Box maxWidth={600} mx="auto" mb={5}>
                <TextField
                    fullWidth
                    label="Tìm kiếm chủ đề hoặc bài viết..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputLabelProps={{
                        sx: { color: darkMode ? '#bdbdbd' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                    InputProps={{
                        sx: {
                            color: darkMode ? '#ffffff' : '#1c1e21',
                            borderRadius: '12px', // Bo tròn góc TextField
                            '& fieldset': {
                                borderColor: darkMode ? '#616161' : 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: darkMode ? '#90caf9' : 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: darkMode ? '#90caf9' : 'primary.main',
                                borderWidth: '2px', // Tăng độ dày border khi focus
                            },
                        },
                    }}
                    sx={{
                        backgroundColor: darkMode ? '#2e2e2e' : '#ffffff',
                        borderRadius: '12px',
                        boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                    }}
                />
            </Box>

            {/* Vùng Bài Viết Nổi Bật (hiển thị ngang) */}
            <Box mb={6}>
                <Typography
                    variant="h5"
                    mb={3}
                    sx={{
                        fontWeight: 700,
                        color: darkMode ? '#ffffff' : 'text.primary',
                        textAlign: 'center',
                        borderBottom: `2px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                        pb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Star sx={{ mr: 1, color: '#FFD700' }} /> Bài Viết Nổi Bật
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        overflowX: 'auto', // Cho phép cuộn ngang
                        scrollSnapType: 'x mandatory', // Cuộn theo từng card
                        gap: 3, // Khoảng cách giữa các card
                        py: 2,
                        px: 1,
                        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                        borderRadius: 3,
                        boxShadow: darkMode ? '0px 4px 15px rgba(0,0,0,0.5)' : '0px 4px 15px rgba(0,0,0,0.15)',
                        // Scrollbar styling
                        '&::-webkit-scrollbar': { height: '8px' },
                        '&::-webkit-scrollbar-track': { background: darkMode ? '#2c2c2c' : '#e0e0e0', borderRadius: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: darkMode ? '#555' : '#888', borderRadius: '4px' },
                        '&::-webkit-scrollbar-thumb:hover': { background: darkMode ? '#777' : '#555' },
                    }}
                >
                    {featuredPosts.map((post) => (
                        <Card
                            key={post.id}
                            sx={{
                                flexShrink: 0,
                                width: { xs: '90%', sm: '45%', md: '320px' }, // Responsive width
                                borderRadius: 3,
                                boxShadow: darkMode ? '0px 6px 12px rgba(0,0,0,0.4)' : '0px 6px 12px rgba(0,0,0,0.1)',
                                backgroundColor: darkMode ? '#2c2c2c' : '#f8f8f8',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: darkMode ? '0px 10px 20px rgba(0,0,0,0.6)' : '0px 10px 20px rgba(0,0,0,0.2)',
                                },
                                scrollSnapAlign: 'start', // Giúp cuộn mượt mà
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="160"
                                image={post.image}
                                alt={post.title}
                                sx={{
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    objectFit: 'cover',
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{
                                        fontWeight: 600,
                                        color: darkMode ? '#e0e0e0' : 'text.primary',
                                        mb: 1,
                                        minHeight: '48px', // Đảm bảo chiều cao cố định để không bị giật layout
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {post.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color={darkMode ? '#bdbdbd' : 'text.secondary'}
                                    sx={{ mt: 'auto' }} // Đẩy thông tin tác giả xuống dưới
                                >
                                    {post.author} - {new Date(post.date).toLocaleDateString()}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        mt: 2,
                                        alignSelf: 'flex-end', // Đặt nút về bên phải
                                        borderColor: darkMode ? '#64b5f6' : 'primary.main',
                                        color: darkMode ? '#64b5f6' : 'primary.main',
                                        '&:hover': {
                                            backgroundColor: darkMode ? 'rgba(100, 181, 246, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                                        },
                                    }}
                                >
                                    Xem chi tiết
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>

            {/* Vùng Chủ Đề Đáng Chú Ý (hiển thị dọc) */}
            <Box mb={6}>
                <Typography
                    variant="h5"
                    mb={3}
                    sx={{
                        fontWeight: 700,
                        color: darkMode ? '#ffffff' : 'text.primary',
                        textAlign: 'center',
                        borderBottom: `2px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                        pb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Whatshot sx={{ mr: 1, color: '#FF5722' }} /> Chủ Đề Đáng Chú Ý
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    {trendingTopics.map((topic) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={topic.id}>
                            <Card
                                sx={{
                                    backgroundColor: darkMode ? '#2c2c2c' : '#ffffff',
                                    borderRadius: 2,
                                    boxShadow: darkMode ? '0px 4px 8px rgba(0,0,0,0.3)' : '0px 4px 8px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                    },
                                }}
                            >
                                <Box sx={{ mr: 2, color: topic.icon.props.color || (darkMode ? '#bbdefb' : 'primary.main') }}>
                                    {topic.icon}
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            color: darkMode ? '#e0e0e0' : 'text.primary',
                                        }}
                                    >
                                        {topic.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color={darkMode ? '#bdbdbd' : 'text.secondary'}
                                    >
                                        {topic.postCount} bài viết
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Bố cục 3 cột */}
            <Box
                display="flex"
                justifyContent="center"
                gap={3}
                sx={{ mt: 5, flexDirection: { xs: 'column', md: 'row' } }}
            >
                {/* Nút bật/tắt cột trái (chỉ hiện trên mobile/tablet) */}
                {!isDesktop && (
                    <IconButton
                        onClick={() => setShowLeftColumn(!showLeftColumn)}
                        sx={{
                            position: 'sticky', // sticky thay vì absolute để giữ vị trí khi cuộn
                            top: '50%', // Điều chỉnh vị trí vertical
                            transform: 'translateY(-50%)',
                            left: 0,
                            zIndex: 10,
                            backgroundColor: darkMode ? '#333' : '#eee',
                            '&:hover': { backgroundColor: darkMode ? '#555' : '#ccc' },
                            color: darkMode ? '#fff' : '#000',
                            display: { xs: 'block', md: 'none' },
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)', // Thêm shadow
                        }}
                    >
                        {showLeftColumn ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                )}

                {/* Cột trái: Danh mục */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                        borderRadius: 3,
                        boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                        width: { xs: '100%', md: '220px' }, // Tăng width cho cột trái
                        minWidth: { xs: 'auto', md: '220px' },
                        color: darkMode ? '#e0e0e0' : '#1c1e21',
                        transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                        flexShrink: 0,
                        display: { xs: showLeftColumn ? 'block' : 'none', md: 'block' },
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            color: darkMode ? '#ffffff' : 'text.primary',
                            fontWeight: 600,
                            mb: 2,
                            borderBottom: `1px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                            pb: 1,
                        }}
                    >
                        Danh mục
                    </Typography>
                    <List disablePadding>
                        {['Bài mới', 'Thảo luận', 'Giải trí', 'Sinh hoạt', 'Tài khoản', 'Câu hỏi'].map((text, index) => (
                            <ListItem
                                key={index}
                                button
                                sx={{
                                    borderRadius: '8px',
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center">
                                            {text === 'Bài mới' && <Rocket sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'primary.main' }} />}
                                            {text === 'Thảo luận' && <Forum sx={{ mr: 1, color: darkMode ? '#81c784' : '#4caf50' }} />}
                                            {text === 'Giải trí' && <SportsHandball sx={{ mr: 1, color: darkMode ? '#ffb74d' : '#ff9800' }} />}
                                            {text === 'Sinh hoạt' && <School sx={{ mr: 1, color: darkMode ? '#ef9a9a' : '#f44336' }} />}
                                            {text === 'Tài khoản' && <AccountCircle sx={{ mr: 1, color: darkMode ? '#b39ddb' : '#9c27b0' }} />}
                                            {text === 'Câu hỏi' && <HelpOutline sx={{ mr: 1, color: darkMode ? '#a1887f' : '#795548' }} />}
                                            <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary', fontWeight: 500 }}>
                                                {text}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Cột giữa: Chủ đề chính (hiển thị dọc) */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#1e1e1e' : '#f0f2f5',
                        borderRadius: 3,
                        boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                        flexGrow: 1,
                        width: {
                            xs: '100%',
                            md: (showLeftColumn && showRightColumn) ? 'calc(100% - 480px - 24px)' : // 220px * 2 + 30px * 2 (gaps) = 440 + 60 = 500, trừ gap 24px
                                (showLeftColumn || showRightColumn) ? 'calc(100% - 240px - 24px)' : '100%', // 220px + 30px (gap)
                        },
                        color: darkMode ? '#e0e0e0' : '#1c1e21',
                        transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: darkMode ? '#2c2c2c' : '#f0f4f8',
                            borderRadius: '16px',
                            px: 3,
                            py: 2,
                            mb: 3,
                            border: `1px solid ${darkMode ? '#424242' : '#cfd8dc'}`,
                            transition: 'background-color 0.4s ease, border-color 0.4s ease',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : 'text.primary' }}>
                            <Forum sx={{ verticalAlign: 'middle', mr: 1, color: '#3498DB' }} /> TVU_FORUM.VN
                        </Typography>
                        <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                            Tổng hợp các chủ đề diễn đàn
                        </Typography>
                    </Box>

                    {/* Danh sách chủ đề hiển thị dọc */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column', // Hiển thị theo chiều dọc
                            gap: 2, // Khoảng cách giữa các TopicCard
                            overflowY: 'auto', // Cho phép cuộn dọc nếu cần
                            maxHeight: { xs: 'none', md: 'calc(100vh - 400px)' }, // Giới hạn chiều cao và cho phép cuộn trên desktop (điều chỉnh 400px tùy ý)
                            pr: 1, // Padding phải để tránh scrollbar che nội dung
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-track': { background: darkMode ? '#2c2c2c' : '#e0e0e0', borderRadius: '4px' },
                            '&::-webkit-scrollbar-thumb': { background: darkMode ? '#555' : '#888', borderRadius: '4px' },
                            '&::-webkit-scrollbar-thumb:hover': { background: darkMode ? '#777' : '#555' },
                        }}
                    >
                        {filteredTopics.length > 0 ? (
                            filteredTopics.map((topic) => (
                                <Box key={topic._id} sx={{ width: '100%' }}>
                                    <TopicCard
                                        topic={topic}
                                        darkMode={darkMode}
                                        variant="vertical" // Đảm bảo TopicCard hiển thị ảnh đại diện và thông tin theo chiều dọc
                                    />
                                </Box>
                            ))
                        ) : (
                            <Typography align="center" color={darkMode ? '#bdbdbd' : 'text.secondary'} mt={4} sx={{ width: '100%' }}>
                                Không tìm thấy chủ đề nào.
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Nút bật/tắt cột phải (chỉ hiện trên mobile/tablet) */}
                {!isDesktop && (
                    <IconButton
                        onClick={() => setShowRightColumn(!showRightColumn)}
                        sx={{
                            position: 'sticky',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: 0,
                            zIndex: 10,
                            backgroundColor: darkMode ? '#333' : '#eee',
                            '&:hover': { backgroundColor: darkMode ? '#555' : '#ccc' },
                            color: darkMode ? '#fff' : '#000',
                            display: { xs: 'block', md: 'none' },
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}
                    >
                        {showRightColumn ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                )}

                {/* Cột phải: Trending Topics (hiển thị dọc) */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                        borderRadius: 3,
                        boxShadow: darkMode ? '0px 4px 10px rgba(0,0,0,0.4)' : '0px 4px 10px rgba(0,0,0,0.1)',
                        width: { xs: '100%', md: '220px' }, // Tăng width cho cột phải
                        minWidth: { xs: 'auto', md: '220px' },
                        color: darkMode ? '#e0e0e0' : '#1c1e21',
                        transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, width 0.3s ease',
                        flexShrink: 0,
                        display: { xs: showRightColumn ? 'block' : 'none', md: 'block' },
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            color: darkMode ? '#ffffff' : 'text.primary',
                            fontWeight: 600,
                            mb: 2,
                            borderBottom: `1px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
                            pb: 1,
                        }}
                    >
                        Chủ đề phổ biến
                    </Typography>
                    <List disablePadding>
                        {trendingTopics.map((topic) => (
                            <ListItem
                                key={topic.id}
                                button
                                sx={{
                                    borderRadius: '8px',
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center">
                                            <Whatshot fontSize="small" sx={{ mr: 1, color: '#FF5722' }} />
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: darkMode ? '#e0e0e0' : 'text.primary',
                                                    fontWeight: 500,
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {topic.name}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color={darkMode ? '#bdbdbd' : 'text.secondary'} sx={{ ml: 3 }}>
                                            {topic.postCount} bài viết
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                        <Divider sx={{ mt: 2, mb: 2, borderColor: darkMode ? '#424242' : '#e0e0e0' }} />
                        <Button
                            fullWidth
                            variant="text"
                            sx={{
                                color: darkMode ? '#90caf9' : 'primary.main',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.04)' },
                            }}
                        >
                            Xem tất cả chủ đề
                        </Button>
                    </List>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;