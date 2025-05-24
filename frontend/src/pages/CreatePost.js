import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Đây là nơi bạn sẽ xử lý gửi dữ liệu lên API (sử dụng axios hoặc fetch)
        console.log('Tạo bài viết mới:', { title, content });

        // Sau khi tạo bài viết thành công, điều hướng đến trang Home
        navigate('/');
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Tạo Bài Viết Mới
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Tiêu đề"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    label="Nội dung"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Tạo Bài Viết
                </Button>
            </form>
        </Container>
    );
};

export default CreatePost;
