import React, { useContext } from 'react';
import { Container, Typography, Box, Switch, FormControlLabel, Paper } from '@mui/material';
import { ThemeContext } from '../../context/ThemeContext';

const AdminSettingsPage = () => {
    const { mode, toggleColorMode } = useContext(ThemeContext);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Cài đặt
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Cài đặt giao diện
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={mode === 'dark'}
                            onChange={() => {
                                console.log('Switch clicked. Current mode:', mode);
                                toggleColorMode();
                            }}
                        />
                    }
                    label={mode === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
                />
            </Paper>
            <Box sx={{ mt: 4 }}>
                <Typography variant="body1">Nội dung cài đặt quản trị khác sẽ ở đây.</Typography>
                {/* Thêm các tùy chọn cài đặt hệ thống */}
            </Box>
        </Container>
    );
};

export default AdminSettingsPage;