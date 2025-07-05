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
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Tvu_forum.vn</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Trang nhất</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Diễn đàn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Hỗ trợ - hướng dẫn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thư viện</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Khuyến mãi</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Sự kiện</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>TVU_FORUM.VN RSS</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Liên hệ quảng cáo</Link>
                </Grid>

                {/* Cột 2 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Diễn đàn</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thông tin</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Máy tính</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Điện thoại</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Camera</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Xe</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Khoa học công nghệ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Diễn đàn</Link>
                </Grid>

                {/* Cột 3 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Mua bán</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán điện thoại</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán máy tính</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán máy tính bảng</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán camera</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán đồ công nghệ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán xe</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán điện máy</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Mua bán sim, sim 3G</Link>
                </Grid>

                {/* Cột 4 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700', mb: 2 }}>Liên hệ</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Liên hệ quảng cáo</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Hỗ trợ - Hướng dẫn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Diễn Đàn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block" sx={{ py: 0.5, transition: 'all 0.3s ease', '&:hover': { color: '#FFD700', transform: 'translateX(5px)' } }}>Thảo luận</Link>
                </Grid>
            </Grid>

            <Box sx={{ mt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.2)', pt: 3, position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" align="center" lineHeight={1.8}>
                    Media embeds by s9e | Chịu trách nhiệm nội dung: Phạm Đăng Khôi • © 2025 Công ty Cổ phần DD DK<br />
                    Địa chỉ: 120, Đại Thôn A, H. Châu Thành, T. Trà Vinh • SĐT: 0345476413<br />
                    Giấy phép thiết lập MXH số 11/GP-BTTTT, ký ngày: 08/01/2025
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
