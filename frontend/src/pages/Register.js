import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box, // Thêm Box để căn chỉnh tốt hơn
    useTheme, // Thêm useTheme để truy cập theme
    Paper // Thêm Paper để bao bọc form và tạo hiệu ứng đổ bóng/nền
} from '@mui/material';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link để điều hướng đến trang Login

const Register = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const navigate = useNavigate();
    const theme = useTheme(); // Khởi tạo hook useTheme

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('http://localhost:5000/api/auth/register', form);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error('Đăng ký thất bại:', err); // Log lỗi chi tiết hơn
            alert('Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)', // Đảm bảo chiếm đủ chiều cao màn hình (trừ AppBar)
                padding: theme.spacing(2), // Thêm padding tổng thể
            }}
        >
            <Paper
                elevation={3} // Thêm độ đổ bóng
                sx={{
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper, // Sử dụng màu nền Paper từ theme
                    color: theme.palette.text.primary, // Sử dụng màu chữ chính từ theme
                    boxShadow: theme.shadows[3], // Sử dụng shadow mặc định của theme
                    transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                    width: '100%', // Đảm bảo Paper chiếm toàn bộ chiều rộng Container
                    maxWidth: 450, // Giới hạn chiều rộng tối đa của form
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        color: theme.palette.text.primary, // Sử dụng màu chữ chính từ theme
                        fontWeight: 600,
                        mb: theme.spacing(3), // Khoảng cách dưới tiêu đề
                    }}
                >
                    Đăng ký tài khoản
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Họ tên"
                        fullWidth
                        margin="normal"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        variant="outlined"
                        required // Đặt là trường bắt buộc
                        sx={{ mb: 2 }}
                        // Áp dụng màu sắc từ theme cho TextField
                        InputLabelProps={{
                            style: { color: theme.palette.text.secondary }
                        }}
                        InputProps={{
                            style: { color: theme.palette.text.primary },
                            sx: {
                                '& fieldset': { borderColor: theme.palette.divider },
                                '&:hover fieldset': { borderColor: theme.palette.primary.light },
                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                            }
                        }}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        type="email" // Đặt kiểu là email
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        variant="outlined"
                        required // Đặt là trường bắt buộc
                        sx={{ mb: 2 }}
                        // Áp dụng màu sắc từ theme cho TextField
                        InputLabelProps={{
                            style: { color: theme.palette.text.secondary }
                        }}
                        InputProps={{
                            style: { color: theme.palette.text.primary },
                            sx: {
                                '& fieldset': { borderColor: theme.palette.divider },
                                '&:hover fieldset': { borderColor: theme.palette.primary.light },
                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                            }
                        }}
                    />
                    <TextField
                        label="Mật khẩu"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        variant="outlined"
                        required // Đặt là trường bắt buộc
                        sx={{ mb: 3 }} // Tăng khoảng cách dưới password
                        // Áp dụng màu sắc từ theme cho TextField
                        InputLabelProps={{
                            style: { color: theme.palette.text.secondary }
                        }}
                        InputProps={{
                            style: { color: theme.palette.text.primary },
                            sx: {
                                '& fieldset': { borderColor: theme.palette.divider },
                                '&:hover fieldset': { borderColor: theme.palette.primary.light },
                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 2,
                            padding: '12px', // Tăng padding cho nút
                            backgroundColor: theme.palette.primary.main, // Sử dụng màu primary từ theme
                            '&:hover': { backgroundColor: theme.palette.primary.dark }, // Sử dụng màu dark của primary
                            color: theme.palette.primary.contrastText, // Màu chữ tương phản với primary
                        }}
                    >
                        Đăng ký
                    </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '500' }}>
                            Đăng nhập ngay
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;