import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import SalesChart from '../../components/admin/SalesChart'; // Đảm bảo đường dẫn đúng

const AdminDashboardOverview = () => {
    return (
        <>
            <Typography variant="h4" gutterBottom>
                Chào mừng, Admin!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                        <Typography variant="h6">Tổng số người dùng</Typography>
                        <Typography variant="h3" sx={{ mt: 2 }}>
                            1,234
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                        <Typography variant="h6">Tổng số sản phẩm</Typography>
                        <Typography variant="h3" sx={{ mt: 2 }}>
                            567
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                        <Typography variant="h6">Doanh thu</Typography>
                        <Typography variant="h3" sx={{ mt: 2 }}>
                            $12,345
                        </Typography>
                    </Paper>
                </Grid>
                {/* Thêm SalesChart ở đây */}
                <Grid item xs={12}>
                    <SalesChart />
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                        <Typography variant="h6">Hoạt động gần đây</Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Không có hoạt động gần đây để hiển thị.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default AdminDashboardOverview;