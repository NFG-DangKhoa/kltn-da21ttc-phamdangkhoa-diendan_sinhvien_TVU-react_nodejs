import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box sx={{ bgcolor: '#1d2731', color: '#fff', py: 6, px: 4, mt: 8 }}>
            <Grid container spacing={4} sx={{ maxWidth: '1200px', mx: 'auto', ml: 30 }}>
                {/* Cột 1 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom>Tvu_forum.vn</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block">Trang nhất</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Diễn đàn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Hỗ trợ - hướng dẫn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Thư viện</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Khuyến mãi</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Sự kiện</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">TVU_FORUM.VN RSS</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Liên hệ quảng cáo</Link>
                </Grid>

                {/* Cột 2 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom>Diễn đàn</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block">Thông tin</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Máy tính</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Điện thoại</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Camera</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Xe</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Khoa học công nghệ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Diễn đàn</Link>
                </Grid>

                {/* Cột 3 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom>Mua bán</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán điện thoại</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán máy tính</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán máy tính bảng</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán camera</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán đồ công nghệ</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán xe</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán điện máy</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Mua bán sim, sim 3G</Link>
                </Grid>

                {/* Cột 4 */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom>Liên hệ</Typography>
                    <Link href="#" underline="hover" color="inherit" display="block">Liên hệ quảng cáo</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Hỗ trợ - Hướng dẫn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Diễn Đàn</Link>
                    <Link href="#" underline="hover" color="inherit" display="block">Thảo luận</Link>
                </Grid>
            </Grid>

            <Box sx={{ mt: 6, borderTop: '1px solid #444', pt: 3 }}>
                <Typography variant="body2" color="#bbb" align="center" lineHeight={1.8}>
                    Media embeds by s9e | Chịu trách nhiệm nội dung: Phạm Đăng Khôi • © 2025 Công ty Cổ phần DD DK<br />
                    Địa chỉ: 120, Đại Thôn A, H. Châu Thành, T. Trà Vinh • SĐT: 0345476413<br />
                    Giấy phép thiết lập MXH số 11/GP-BTTTT, ký ngày: 08/01/2025
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
