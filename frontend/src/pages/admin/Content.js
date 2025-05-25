import React from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, Grid, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { styled } from '@mui/system';

// Import the SalesChart component
import SalesChart from './SalesChart'; // Adjust the path if necessary

const MainContent = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'dark' ? '#2c3242' : '#eef2f6', // Lighter background for dark mode
    minHeight: '100vh',
}));

const drawerWidth = 240; // Should match the Sidebar's drawerWidth

const Content = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                sx={{
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#1a202c' : theme.palette.primary.main,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        sx={{ mr: 2, display: { sm: 'none' } }} // Hide on desktop, show on mobile
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Dashboard Overview
                    </Typography>
                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton color="inherit">
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <MainContent>
                <Toolbar /> {/* This is important to push content below the AppBar */}
                <Typography variant="h4" gutterBottom>
                    Welcome, Admin!
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h3" sx={{ mt: 2 }}>
                                1,234
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                            <Typography variant="h6">Total Products</Typography>
                            <Typography variant="h3" sx={{ mt: 2 }}>
                                567
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200 }}>
                            <Typography variant="h6">Revenue</Typography>
                            <Typography variant="h3" sx={{ mt: 2 }}>
                                $12,345
                            </Typography>
                        </Paper>
                    </Grid>
                    {/* Add the SalesChart here */}
                    <Grid item xs={12}>
                        <SalesChart />
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                            <Typography variant="h6">Recent Activity</Typography>
                            {/* Add more detailed content here, e.g., a data table or charts */}
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    No recent activities to display.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </MainContent>
        </Box>
    );
};

export default Content;