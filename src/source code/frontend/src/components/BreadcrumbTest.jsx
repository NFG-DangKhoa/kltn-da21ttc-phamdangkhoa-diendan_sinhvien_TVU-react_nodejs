import React from 'react';
import { Box, Typography } from '@mui/material';
import BreadcrumbNavigation from './BreadcrumbNavigation';

const BreadcrumbTest = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🧪 Breadcrumb Test Component
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2 }}>
                Test 1: PostDetail Breadcrumb
            </Typography>
            <BreadcrumbNavigation
                topicName="Khoa học máy tính"
                postTitle="Test Post Title"
                darkMode={false}
            />
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Test 2: Topic Breadcrumb
            </Typography>
            <BreadcrumbNavigation
                topicName="JavaScript"
                darkMode={false}
            />
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Test 3: Home Only
            </Typography>
            <BreadcrumbNavigation
                darkMode={false}
            />
            
            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                Check browser console for debug logs
            </Typography>
        </Box>
    );
};

export default BreadcrumbTest;
