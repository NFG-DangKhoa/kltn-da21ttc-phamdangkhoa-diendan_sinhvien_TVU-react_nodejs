import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import axios from 'axios';

const TestTrending = () => {
    const [trendingData, setTrendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                console.log('Fetching trending topics...');
                const response = await axios.get('http://localhost:5000/api/home/trending-topics?limit=10');
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    setTrendingData(response.data.data);
                    console.log('Trending topics data:', response.data.data);
                } else {
                    setError('API returned success=false');
                }
            } catch (err) {
                console.error('Error fetching trending data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, []);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" mb={3}>Test Trending Topics</Typography>
            
            {trendingData.map((topic, index) => (
                <Card key={topic._id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6">{topic.name}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            {topic.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                                label={`Posts: ${topic.postCount || 0}`} 
                                size="small" 
                                color="primary" 
                            />
                            <Chip 
                                label={`Recent: ${topic.recentPostCount || 0}`} 
                                size="small" 
                                color="secondary" 
                            />
                            <Chip 
                                label={`Category: ${topic.category || 'N/A'}`} 
                                size="small" 
                            />
                            {topic.trending && (
                                <Chip 
                                    label="🔥 TRENDING" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#FF5722', 
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }} 
                                />
                            )}
                        </Box>
                        <Typography variant="caption" display="block" mt={1}>
                            Trending: {topic.trending ? 'TRUE' : 'FALSE'}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default TestTrending;
