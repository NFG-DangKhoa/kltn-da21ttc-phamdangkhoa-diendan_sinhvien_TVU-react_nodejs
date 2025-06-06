import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminUsersPage = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Quản lý Người dùng
            </Typography>
            <Box>
                <Typography variant="body1">Nội dung quản lý người dùng sẽ ở đây.</Typography>
                {/* Thêm bảng, form, chức năng tìm kiếm người dùng */}
            </Box>
        </Container>
    );
};

export default AdminUsersPage;