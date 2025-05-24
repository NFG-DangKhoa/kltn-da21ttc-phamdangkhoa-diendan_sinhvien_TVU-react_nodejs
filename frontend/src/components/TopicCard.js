import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TopicCard = ({ topic, icon, variant = 'card' }) => {
    const navigate = useNavigate();

    if (variant === 'table') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: '#1976d2',
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => navigate(`/topic/${topic._id}`)}
            >
                {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
                {topic.name}
            </Box>
        );
    }

    // Mặc định: hiển thị dạng Card
    return (
        <Card
            sx={{
                maxWidth: 345,
                m: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                },
                '&:active': {
                    transform: 'scale(0.98)',
                    boxShadow: 1,
                },
            }}
        >
            <CardActionArea onClick={() => navigate(`/topic/${topic._id}`)}>
                <CardContent>
                    <Box display="flex" alignItems="center">
                        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
                        <Typography gutterBottom variant="h6" component="div">
                            {topic.name}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {topic.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default TopicCard;

