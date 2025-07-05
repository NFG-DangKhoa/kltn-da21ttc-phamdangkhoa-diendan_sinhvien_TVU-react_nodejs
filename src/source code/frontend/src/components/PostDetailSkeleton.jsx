import React, { useContext } from 'react';
import {
    Box, Container, Grid, Paper, Skeleton, Stack, Card, CardContent
} from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';

const PostDetailSkeleton = () => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: darkMode ? '#18191a' : '#f0f2f5' }}>
            <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={8}>
                        {/* Breadcrumbs Skeleton */}
                        <Box sx={{ mb: 3 }}>
                            <Skeleton variant="text" width={300} height={24} />
                        </Box>

                        {/* Main Article Card */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            {/* Article Header */}
                            <Box sx={{ p: 4, pb: 2 }}>
                                {/* Title Skeleton */}
                                <Skeleton variant="text" width="90%" height={48} sx={{ mb: 3 }} />
                                
                                {/* Author Meta Skeleton */}
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Skeleton variant="circular" width={48} height={48} />
                                        <Box>
                                            <Skeleton variant="text" width={120} height={24} />
                                            <Skeleton variant="text" width={200} height={20} />
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Skeleton variant="circular" width={40} height={40} />
                                    </Box>
                                </Box>

                                {/* Tags Skeleton */}
                                <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} variant="rounded" width={80} height={24} />
                                    ))}
                                </Box>
                            </Box>

                            {/* Content Skeleton */}
                            <Box sx={{ p: 4 }}>
                                {/* Featured Image Skeleton */}
                                <Skeleton 
                                    variant="rectangular" 
                                    width="100%" 
                                    height={300} 
                                    sx={{ mb: 4, borderRadius: 2 }} 
                                />

                                {/* Article Body Skeleton */}
                                <Stack spacing={2}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <Skeleton 
                                            key={i} 
                                            variant="text" 
                                            width={i % 3 === 0 ? '70%' : '100%'} 
                                            height={24} 
                                        />
                                    ))}
                                </Stack>
                            </Box>

                            {/* Actions Skeleton */}
                            <Box sx={{ p: 4, pt: 3 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={3}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Skeleton variant="circular" width={40} height={40} />
                                            <Skeleton variant="text" width={30} height={20} />
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Skeleton variant="circular" width={40} height={40} />
                                            <Skeleton variant="text" width={100} height={20} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Comments Section Skeleton */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                mt: 3,
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            <Box sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                    <Skeleton variant="text" width={200} height={32} />
                                    <Skeleton variant="rounded" width={120} height={36} />
                                </Box>
                                <Skeleton variant="text" width="60%" height={20} />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        {/* Author Info Card Skeleton */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                mb: 3,
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
                                    <Box>
                                        <Skeleton variant="text" width={100} height={24} />
                                        <Skeleton variant="text" width={80} height={20} />
                                    </Box>
                                </Box>
                                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                                <Skeleton variant="rounded" width="100%" height={36} />
                            </Box>
                        </Paper>

                        {/* Related Posts Skeleton */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                mb: 3,
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Skeleton variant="text" width={150} height={28} sx={{ mb: 3 }} />
                                
                                <Stack spacing={2}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Card
                                            key={i}
                                            sx={{
                                                backgroundColor: darkMode ? '#3a3b3c' : '#f8f9fa',
                                                border: darkMode ? '1px solid #555' : '1px solid #e0e0e0',
                                            }}
                                        >
                                            <Box display="flex" p={1.5}>
                                                <Skeleton 
                                                    variant="rectangular" 
                                                    width={80} 
                                                    height={60} 
                                                    sx={{ borderRadius: 1, mr: 2 }} 
                                                />
                                                <Box flex={1}>
                                                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                                                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <Skeleton variant="circular" width={16} height={16} />
                                                        <Skeleton variant="text" width={60} height={16} />
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Skeleton variant="text" width={30} height={16} />
                                                        <Skeleton variant="text" width={30} height={16} />
                                                        <Skeleton variant="text" width={30} height={16} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Trending Posts Skeleton */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                mb: 3,
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Skeleton variant="text" width={150} height={28} sx={{ mb: 3 }} />
                                
                                <Stack spacing={2}>
                                    {[1, 2, 3].map((i) => (
                                        <Box key={i} sx={{ p: 1.5 }}>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Skeleton variant="text" width={24} height={24} sx={{ mr: 2 }} />
                                                <Skeleton variant="text" width="100%" height={20} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2} ml={4}>
                                                <Skeleton variant="text" width={40} height={16} />
                                                <Skeleton variant="text" width={60} height={16} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Tags Cloud Skeleton */}
                        <Paper
                            elevation={darkMode ? 0 : 1}
                            sx={{
                                backgroundColor: darkMode ? '#242526' : '#fff',
                                borderRadius: 3,
                                border: darkMode ? '1px solid #3a3b3c' : 'none'
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <Skeleton 
                                            key={i} 
                                            variant="rounded" 
                                            width={Math.random() * 60 + 40} 
                                            height={24} 
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PostDetailSkeleton;
