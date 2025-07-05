import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminSettingsPage = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Cài đặt
            </Typography>
            <Box>
                <Typography variant="body1">Nội dung cài đặt quản trị sẽ ở đây.</Typography>
                {/* Thêm các tùy chọn cài đặt hệ thống */}
            </Box>
        </Container>
    );
};

export default AdminSettingsPage;