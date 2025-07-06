// src/pages/admin/AdminMainContent.jsx (Updated with new header)
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import AdminHeader from './AdminHeader';

const MainContentArea = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const AdminMainContent = ({ children, toggleColorMode, mode }) => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AdminHeader toggleColorMode={toggleColorMode} mode={mode} />
            <MainContentArea>
                <Toolbar /> {/* Space for fixed header */}
                {children}
            </MainContentArea>
        </Box>
    );
};

export default AdminMainContent;
