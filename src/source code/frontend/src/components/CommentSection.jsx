import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    const handleCommentSubmit = async () => {
        try {
            await axios.post(`/api/posts/${postId}/comments`, { content: comment });
            setComment('');
            fetchComments();
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    return (
        <div>
            <TextField
                label="Add a comment"
                variant="outlined"
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleCommentSubmit} variant="contained" sx={{ marginTop: 1 }}>
                Submit
            </Button>
            <List>
                {comments.map((comment) => (
                    <ListItem key={comment.id}>
                        <ListItemText primary={comment.content} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default CommentSection;
