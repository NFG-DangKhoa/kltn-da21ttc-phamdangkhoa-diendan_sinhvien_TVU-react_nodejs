import React from 'react';
import { Box, Typography } from '@mui/material';

const RightColumn = () => {
    return (
        <Box
            sx={{
                p: 2,
                bgcolor: '#f4f6f8',
                borderRadius: 2,
                width: '15vw',
                ml: 2,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
            }}
        >
            <Typography variant="h6" gutterBottom>📈 Bài viết được yêu thích</Typography>
            <ul style={{ paddingLeft: 16 }}>
                <li><Typography variant="body2">Làm chủ React Hooks</Typography></li>
                <li><Typography variant="body2">Responsive với MUI</Typography></li>
                <li><Typography variant="body2">Deploy React lên Vercel</Typography></li>
            </ul>
        </Box>
    );
};

export default RightColumn;
