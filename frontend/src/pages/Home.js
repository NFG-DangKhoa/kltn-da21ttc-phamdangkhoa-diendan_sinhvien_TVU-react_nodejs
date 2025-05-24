import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemText,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Link
} from '@mui/material';
import TopicCard from '../components/TopicCard';
import axios from 'axios';
import { Rocket, Science, Forum, SportsHandball } from '@mui/icons-material';

const Home = () => {
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Đọc trạng thái darkMode từ localStorage
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

    // Cập nhật style cho body khi darkMode thay đổi
    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f2f5';
        document.body.style.color = darkMode ? '#ffffff' : '#1c1e21';
    }, [darkMode]);


    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const half = Math.ceil(filteredTopics.length / 2);
    const firstHalf = filteredTopics.slice(0, half);
    const secondHalf = filteredTopics.slice(half);

    return (
        <Container
            sx={{
                pt: 4,
                position: 'relative',
                minHeight: '100vh',
                // Nền chính của trang: màu đen cho ban đêm, màu trắng xám cho ban ngày
                // Chúng ta sẽ để màu nền mặc định của body qua useEffect, không đặt ở đây để tránh conflict
                // và chỉ quản lý màu chữ và các thành phần bên trong.
                color: darkMode ? '#ffffff' : '#1c1e21', // Áp dụng màu chữ cho Container
                transition: 'color 0.4s ease', // Chỉ chuyển đổi màu chữ
            }}
        >
            {/* Nền mờ (giữ nguyên opacity để không làm mờ hình nền) */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("/pattern-bg.svg")', // GIỮ NGUYÊN HÌNH NỀN
                    backgroundRepeat: 'repeat',
                    opacity: 0.05, // GIỮ NGUYÊN OPACITY ĐỂ KHÔNG BỊ MỜ HƠN TRONG DARK MODE
                    zIndex: -2,
                    // Không cần transition cho opacity nếu nó không thay đổi
                }}
            />

            {/* Banner (giữ nguyên vì là ảnh) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 42,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: 399,
                    backgroundImage: 'url("/ghgfhgffhhf-9791.jpeg")', // GIỮ NGUYÊN HÌNH NỀN
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    borderBottomLeftRadius: 80,
                    borderBottomRightRadius: 80,
                }}
            />

            {/* Tiêu đề */}
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                mt={62}
                sx={{ fontSize: '38px', color: darkMode ? '#ffffff' : 'text.primary' }}
            >
                DIỄN ĐÀN SINH VIÊN TVU
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                color={darkMode ? '#bdbdbd' : 'text.secondary'}
                mb={3}
                sx={{ fontSize: '15px' }}
            >
                Nơi trao đổi, chia sẻ kiến thức và kinh nghiệm học tập giữa sinh viên Trường Đại học Trà Vinh.
            </Typography>

            {/* Tìm kiếm */}
            <Box maxWidth={600} mx="auto" mb={4}>
                <TextField
                    fullWidth
                    label="Tìm kiếm chủ đề..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputLabelProps={{
                        sx: { color: darkMode ? '#bdbdbd' : 'inherit' }, // Màu label
                    }}
                    InputProps={{
                        sx: {
                            color: darkMode ? '#ffffff' : 'inherit', // Màu chữ input
                            borderColor: darkMode ? '#616161' : 'inherit', // Màu border
                            '& fieldset': {
                                borderColor: darkMode ? '#616161' : 'inherit',
                            },
                            '&:hover fieldset': {
                                borderColor: darkMode ? '#9e9e9e' : 'inherit',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: darkMode ? '#90caf9' : 'primary.main',
                            },
                        },
                    }}
                    sx={{
                        backgroundColor: darkMode ? '#2e2e2e' : '#ffffff', // Nền TextField
                        borderRadius: 1,
                    }}
                />
            </Box>

            {/* Bố cục 3 cột */}
            <Box
                display="flex"
                justifyContent="space-between"
                gap={2}
                sx={{ mt: 2 }}
            >
                {/* Cột trái */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#121212' : '#f0f2f5', // Nền cột
                        borderRadius: 2,
                        width: '20vw',
                        minWidth: 220,
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        color: darkMode ? '#e0e0e0' : '#1c1e21', // Màu chữ
                        transition: 'background-color 0.4s ease, color 0.4s ease',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                        Danh mục
                    </Typography>
                    <List>
                        {['Bài mới', 'Thảo luận', 'Giải trí', 'Sinh hoạt', 'Tài khoản', 'Câu hỏi'].map((text, index) => (
                            <ListItem key={index} button sx={{
                                '&:hover': {
                                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                }
                            }}>
                                <ListItemText
                                    primary={
                                        <>
                                            {/* Biểu tượng */}
                                            {text === 'Bài mới' && <Rocket sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />}
                                            {text === 'Thảo luận' && <Forum sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />}
                                            {text === 'Giải trí' && <SportsHandball sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />}
                                            {text === 'Sinh hoạt' && <Science sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />}
                                            {/* Thêm các biểu tượng khác nếu cần */}
                                            <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }}>
                                                {text}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Cột giữa */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#121212' : '#f0f2f5', // Nền cột
                        borderRadius: 2,
                        flexGrow: 1,
                        maxWidth: '55vw',
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        color: darkMode ? '#e0e0e0' : '#1c1e21', // Màu chữ
                        transition: 'background-color 0.4s ease, color 0.4s ease',
                    }}
                >
                    {/* Dòng giới thiệu nằm trong khung bo tròn */}
                    <Box
                        sx={{
                            backgroundColor: darkMode ? '#2c2c2c' : '#f0f4f8', // Nền Box giới thiệu
                            borderRadius: '16px',
                            px: 3,
                            py: 2,
                            mb: 2,
                            border: `1px solid ${darkMode ? '#424242' : '#cfd8dc'}`, // Border Box giới thiệu
                            transition: 'background-color 0.4s ease, border-color 0.4s ease',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: darkMode ? '#ffffff' : 'text.primary' }}>
                            TVU_FORUM.VN
                        </Typography>
                        <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                            Tổng hợp các chủ đề diễn đàn
                        </Typography>
                    </Box>

                    {/* Bảng danh sách chủ đề */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: darkMode ? '#bdbdbd' : 'text.secondary' }}>Tên chủ đề</TableCell>
                                <TableCell sx={{ color: darkMode ? '#bdbdbd' : 'text.secondary' }}>Mô tả</TableCell>
                                <TableCell sx={{ color: darkMode ? '#bdbdbd' : 'text.secondary' }}>Mới nhất</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...firstHalf, ...secondHalf].map((topic, index) => (
                                <TableRow key={topic._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: darkMode ? '#282828' : '#f5f5f5' } }}>
                                    {/* Cột 1: Tên chủ đề */}
                                    <TableCell sx={{ width: '40%', color: darkMode ? '#e0e0e0' : 'text.primary' }}>
                                        <Box>
                                            <TopicCard
                                                topic={topic}
                                                variant="table"
                                                darkMode={darkMode} // Truyền darkMode prop cho TopicCard
                                            />
                                            <Typography
                                                variant="body2"
                                                color={darkMode ? '#bdbdbd' : 'text.secondary'}
                                                sx={{ mt: 0.5, ml: 1 }}
                                            >
                                                Bài viết: {topic.postCount ?? 0}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Cột 2: Mô tả */}
                                    <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }}>{topic.description || 'Không có mô tả'}</TableCell>

                                    {/* Cột 3: Bài viết mới nhất */}
                                    <TableCell>
                                        {topic.latestPost ? (
                                            <Box>
                                                <Typography variant="body2" color={darkMode ? '#ffffff' : 'text.primary'}>
                                                    <Link
                                                        href={`/topic-details/${topic._id}?postId=${topic.latestPost._id}`}
                                                        sx={{ color: darkMode ? '#90caf9' : 'primary.main', textDecoration: 'none' }}
                                                    >
                                                        {topic.latestPost.title}
                                                    </Link>
                                                </Typography>
                                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                                    {topic.latestPost.author}
                                                </Typography>
                                                <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                                    {new Date(topic.latestPost.date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color={darkMode ? '#bdbdbd' : 'text.secondary'}>
                                                Chưa có bài viết mới
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                {/* Cột phải */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: darkMode ? '#121212' : '#f0f2f5', // Nền cột
                        borderRadius: 2,
                        width: '20vw',
                        minWidth: 220,
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        color: darkMode ? '#e0e0e0' : '#1c1e21', // Màu chữ
                        transition: 'background-color 0.4s ease, color 0.4s ease',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                        Bài viết nổi bật
                    </Typography>
                    <List>
                        <ListItem button sx={{
                            '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }
                        }}>
                            <ListItemText
                                primary={
                                    <>
                                        <Science sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />
                                        <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }}>
                                            Làm sao để học tốt kỳ này?
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        <ListItem button sx={{
                            '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }
                        }}>
                            <ListItemText
                                primary={
                                    <>
                                        <Forum sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />
                                        <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }}>
                                            Giải trí giữa mùa thi
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        <ListItem button sx={{
                            '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }
                        }}>
                            <ListItemText
                                primary={
                                    <>
                                        <SportsHandball sx={{ mr: 1, color: darkMode ? '#bbdefb' : 'inherit' }} />
                                        <Typography component="span" sx={{ color: darkMode ? '#e0e0e0' : 'text.primary' }}>
                                            Tips sử dụng thư viện hiệu quả
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;