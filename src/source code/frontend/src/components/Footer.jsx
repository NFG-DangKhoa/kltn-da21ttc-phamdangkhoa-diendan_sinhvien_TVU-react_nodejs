import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Matching header gradient
                color: '#fff',
                py: 6,
                px: 4,
                mt: 8,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                }
            }}
        >
            <Grid container spacing={4} sx={{ maxWidth: '1200px', mx: 'auto', ml: 30, position: 'relative', zIndex: 1 }}>
                {/* Cột 1 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Diễn đàn TVU</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Trang chủ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Diễn đàn chính</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Hướng dẫn sử dụng</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Tài liệu học tập</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thông báo & Sự kiện</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Hoạt động sinh viên</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Liên hệ hỗ trợ</Link>
                </Grid>

                {/* Cột 2 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Chủ đề nổi bật</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Học tập & Nghiên cứu</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Đời sống Sinh viên</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Tuyển dụng & Việc làm</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Sự kiện & Hoạt động</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thắc mắc & Giải đáp</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Kỹ năng mềm</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Tình nguyện</Link>
                </Grid>

                {/* Cột 3 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Chuyên mục</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thông tin tuyển sinh</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Học bổng</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thực tập & Việc làm</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Câu lạc bộ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Góc thư giãn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Chia sẻ kinh nghiệm</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Góp ý & Đề xuất</Link>
                </Grid>

                {/* Cột 4 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Thông tin liên hệ</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Email: support@tvuforum.vn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Điện thoại: 0123 456 789</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Địa chỉ: 126 Nguyễn Thiện Thành, Trà Vinh</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Fanpage Facebook</Link>
                </Grid>
            </Grid>

            <Box sx={{ mt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.2)', pt: 3, position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" align="center" lineHeight={1.8}>
                    © 2025 Diễn đàn Sinh viên TVU. Tất cả quyền được bảo lưu.<br />
                    Địa chỉ: 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh, Tỉnh Trà Vinh<br />
                    Giấy phép thiết lập MXH số 11/GP-BTTTT, ký ngày: 08/01/2025
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
