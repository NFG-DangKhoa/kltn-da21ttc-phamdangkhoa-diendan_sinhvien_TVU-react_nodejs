// src/pages/admin/AdminMainContent.jsx (Updated with new header)
import React from 'react';
import { Box } from '@mui/material';

import AdminHeader from './AdminHeader';

const AdminMainContent = ({ children, toggleColorMode, mode }) => {
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <AdminHeader toggleColorMode={toggleColorMode} mode={mode} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminMainContent;
