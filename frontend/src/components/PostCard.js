import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
    Chip,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ marginY: 2 }}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginY: 1 }}>
                    {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', marginY: 1 }}>
                    {post.tags && post.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" color="primary" />
                    ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    Lượt xem: {post.views} - Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={() => navigate(`/posts/${post._id}`)}>
                    Xem chi tiết
                </Button>
            </CardActions>
        </Card>
    );
};

export default PostCard;
