// src/components/MemberList/MemberList.jsx

import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Card, CardContent, CardMedia, Grid,
    TextField, InputAdornment, Pagination, useTheme, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Dữ liệu giả định cho Context (nếu bạn không chạy trong môi trường React thực tế có Context)
const ThemeContext = React.createContext({ mode: 'light' });

// Dữ liệu thành viên giả định
const DUMMY_MEMBERS = [
    { id: 'm1', fullName: 'Nguyễn Văn A', username: 'nva_dev', avatar: 'https://via.placeholder.com/100/FF5733/FFFFFF?text=NVA', role: 'Thành viên', postsCount: 120 },
    { id: 'm2', fullName: 'Trần Thị B', username: 'thib_code', avatar: 'https://via.placeholder.com/100/33A1FF/FFFFFF?text=TTB', role: 'Quản trị viên', postsCount: 350 },
    { id: 'm3', fullName: 'Lê Văn C', username: 'levanc_design', avatar: 'https://via.placeholder.com/100/33FF57/FFFFFF?text=LVC', role: 'Thành viên', postsCount: 85 },
    { id: 'm4', fullName: 'Phạm Thị D', username: 'phamd_writer', avatar: 'https://via.placeholder.com/100/FF33E0/FFFFFF?text=PTD', role: 'Thành viên', postsCount: 210 },
    { id: 'm5', fullName: 'Hoàng Văn E', username: 'hve_mentor', avatar: 'https://via.placeholder.com/100/E0FF33/000000?text=HVE', role: 'Mod', postsCount: 450 },
    { id: 'm6', fullName: 'Đỗ Thị F', username: 'dothif_tech', avatar: 'https://via.placeholder.com/100/5733FF/FFFFFF?text=DTF', role: 'Thành viên', postsCount: 90 },
    { id: 'm7', fullName: 'Vũ Văn G', username: 'vuvang_gaming', avatar: 'https://via.placeholder.com/100/FFC300/FFFFFF?text=VVG', role: 'Thành viên', postsCount: 60 },
    { id: 'm8', fullName: 'Bùi Thị H', username: 'buih_art', avatar: 'https://via.placeholder.com/100/DAF7A6/000000?text=BTH', role: 'Thành viên', postsCount: 150 },
    { id: 'm9', fullName: 'Chu Văn I', username: 'chui_finance', avatar: 'https://via.placeholder.com/100/C70039/FFFFFF?text=CVI', role: 'Thành viên', postsCount: 75 },
    { id: 'm10', fullName: 'Đặng Thị K', username: 'dangtk_foodie', avatar: 'https://via.placeholder.com/100/900C3F/FFFFFF?text=DTK', role: 'Thành viên', postsCount: 180 },
    { id: 'm11', fullName: 'Tô Văn L', username: 'tol_travel', avatar: 'https://via.placeholder.com/100/581845/FFFFFF?text=TVL', role: 'Thành viên', postsCount: 110 },
    { id: 'm12', fullName: 'Nguyễn Thị M', username: 'ntm_music', avatar: 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=NTM', role: 'Thành viên', postsCount: 230 },
];

const MembersList = () => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();

    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 12; // Số lượng thành viên hiển thị mỗi trang

    useEffect(() => {
        // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây:
        // fetch('/api/members')
        //   .then(response => response.json())
        //   .then(data => setMembers(data))
        //   .catch(error => console.error('Error fetching members:', error));

        // Sử dụng dữ liệu giả định
        setMembers(DUMMY_MEMBERS);
    }, []);

    const filteredMembers = members.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Logic phân trang
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Box
            sx={{
                p: 3,
                borderRadius: 2,
                width: '85vw', // Adjust as needed
                ml: 8,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: theme.transitions.create(['background-color', 'color'], {
                    duration: theme.transitions.duration.standard,
                }),
                mt: 10,
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Tất cả Thành viên Diễn đàn
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm thành viên theo tên hoặc username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0',
                        color: theme.palette.text.primary,
                        '& fieldset': {
                            borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                        },
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: theme.palette.text.secondary,
                        opacity: 1, // Ensure placeholder is visible
                    },
                }}
            />

            {filteredMembers.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
                    Không tìm thấy thành viên nào.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {currentMembers.map((member) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                            <Card
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 2,
                                    boxShadow: 3,
                                    borderRadius: 3,
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6,
                                    },
                                    bgcolor: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                    height: '100%', // Ensure cards in a row have same height
                                }}
                            >
                                <Avatar
                                    alt={member.fullName}
                                    src={member.avatar}
                                    sx={{ width: 80, height: 80, mb: 2, border: `2px solid ${theme.palette.primary.main}` }}
                                />
                                <CardContent sx={{ textAlign: 'center', p: 0, '&:last-child': { pb: 0 } }}>
                                    <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                                        {member.fullName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        @{member.username}
                                    </Typography>
                                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
                                        {member.role}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {member.postsCount} bài viết
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: theme.palette.text.primary,
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default MembersList;