import React from 'react';
import {
    Grid,
    Box,
    Typography,
    Zoom,
    Fade
} from '@mui/material';
import TopicCard from './TopicCard';

const TopicGrid = ({ 
    topics = [], 
    isDarkMode = false, 
    visible = true, 
    title = "Chủ đề",
    subtitle = "",
    variant = "default",
    maxItems = 8,
    columns = { xs: 12, sm: 6, md: 4, lg: 3 }
}) => {
    if (!topics || topics.length === 0) {
        return (
            <Fade in={visible} timeout={1000}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        Không có chủ đề nào để hiển thị
                    </Typography>
                </Box>
            </Fade>
        );
    }

    const displayTopics = topics.slice(0, maxItems);

    return (
        <Fade in={visible} timeout={1000}>
            <Box>
                {title && (
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            component="h2"
                            fontWeight="bold"
                            color="text.primary"
                            mb={1}
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                maxWidth="600px"
                                mx="auto"
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}

                <Grid container spacing={3}>
                    {displayTopics.map((topic, index) => (
                        <Grid 
                            item 
                            {...columns}
                            key={topic._id || topic.id || index}
                        >
                            <Zoom 
                                in={visible} 
                                timeout={400 + index * 50}
                                style={{ transitionDelay: visible ? `${index * 50}ms` : '0ms' }}
                            >
                                <Box sx={{ height: '100%' }}>
                                    <TopicCard 
                                        topic={topic} 
                                        isDarkMode={isDarkMode}
                                        variant={variant}
                                    />
                                </Box>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                {topics.length > maxItems && (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Hiển thị {maxItems} trong tổng số {topics.length} chủ đề
                        </Typography>
                    </Box>
                )}
            </Box>
        </Fade>
    );
};

export default TopicGrid;
