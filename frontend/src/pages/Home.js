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

    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const half = Math.ceil(filteredTopics.length / 2);
    const firstHalf = filteredTopics.slice(0, half);
    const secondHalf = filteredTopics.slice(half);

    return (
        <Container sx={{ pt: 4, position: 'relative', minHeight: '100vh' }}>
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
                    position: 'absolute',
                    top: 42,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: 399,
                    backgroundImage: 'url("/ghgfhgffhhf-9791.jpeg")',
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
                sx={{ fontSize: '38px' }}
            >
                DIỄN ĐÀN SINH VIÊN TVU
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
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
                        bgcolor: '#f9f9f9',
                        borderRadius: 2,
                        width: '20vw',
                        minWidth: 220,
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Danh mục
                    </Typography>
                    <List>
                        {['Bài mới', 'Thảo luận', 'Giải trí', 'Sinh hoạt', 'Tài khoản', 'Câu hỏi'].map((text, index) => (
                            <ListItem key={index} button>
                                {/* Thêm biểu tượng */}
                                <ListItemText
                                    primary={
                                        <>
                                            <Rocket sx={{ mr: 1 }} />
                                            {text}
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
                        bgcolor: '#ffffff',
                        borderRadius: 2,
                        flexGrow: 1,
                        maxWidth: '55vw',
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                    }}
                >
                    {/* Dòng giới thiệu nằm trong khung bo tròn */}
                    <Box
                        sx={{
                            bgcolor: '#f0f4f8',
                            borderRadius: '16px',
                            px: 3,
                            py: 2,
                            mb: 2,
                            border: '1px solid #cfd8dc',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            TVU_FORUM.VN
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tổng hợp các chủ đề diễn đàn
                        </Typography>
                    </Box>

                    {/* Bảng danh sách chủ đề */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên chủ đề</TableCell>
                                <TableCell>Mô tả</TableCell>
                                <TableCell>Mới nhất</TableCell> {/* Cột mới */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...firstHalf, ...secondHalf].map((topic, index) => (
                                <TableRow key={topic._id}>
                                    {/* Cột 1: Tên chủ đề */}
                                    <TableCell sx={{ width: '40%' }}>
                                        <Box>
                                            <TopicCard
                                                topic={topic}
                                                variant="table"
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5, ml: 1 }}
                                            >
                                                Bài viết: {topic.postCount ?? 0}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Cột 2: Mô tả */}
                                    <TableCell>{topic.description || 'Không có mô tả'}</TableCell>

                                    {/* Cột 3: Bài viết mới nhất */}
                                    <TableCell>
                                        {topic.latestPost ? (
                                            <Box>
                                                <Typography variant="body2" color="text.primary">
                                                    {topic.latestPost.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {topic.latestPost.author}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(topic.latestPost.date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
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
                        bgcolor: '#f1f1f1',
                        borderRadius: 2,
                        width: '20vw',
                        minWidth: 220,
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Bài viết nổi bật
                    </Typography>
                    <List>
                        <ListItem button>
                            {/* Thêm biểu tượng */}
                            <ListItemText
                                primary={
                                    <>
                                        <Science sx={{ mr: 1 }} />
                                        Làm sao để học tốt kỳ này?
                                    </>
                                }
                            />
                        </ListItem>
                        <ListItem button>
                            <ListItemText
                                primary={
                                    <>
                                        <Forum sx={{ mr: 1 }} />
                                        Giải trí giữa mùa thi
                                    </>
                                }
                            />
                        </ListItem>
                        <ListItem button>
                            <ListItemText
                                primary={
                                    <>
                                        <SportsHandball sx={{ mr: 1 }} />
                                        Tips sử dụng thư viện hiệu quả
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
