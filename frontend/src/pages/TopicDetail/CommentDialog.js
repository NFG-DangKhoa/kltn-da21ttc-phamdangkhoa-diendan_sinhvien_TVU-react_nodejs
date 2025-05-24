// CommentDialog.js
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CommentDialog = ({ open, onClose, post, showReplies, toggleReplies }) => {
    if (!post) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Bình luận cho bài: {post.title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {post.comments?.length === 0 ? (
                    <Typography variant="body2">Chưa có bình luận nào.</Typography>
                ) : (
                    post.comments.map((comment) => (
                        <Box key={comment._id} mt={2} pl={1}>
                            <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
                                👤{comment.authorId?.fullName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {comment.content}
                            </Typography>

                            {comment.replies?.length > 0 && !showReplies?.[comment._id] && (
                                <Button
                                    size="small"
                                    onClick={() => toggleReplies?.(comment._id)}
                                    sx={{ textTransform: 'none', mt: 1, fontSize: '0.75rem' }}
                                >
                                    Xem tất cả {comment.replies.length} trả lời
                                </Button>
                            )}
                            {showReplies?.[comment._id] && comment.replies?.map((reply) => (
                                <Box key={reply._id} ml={2} mt={1} pl={2} borderLeft="1px solid #ccc">
                                    <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>
                                        👤 {reply.authorId?.fullName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                        {reply.content}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CommentDialog;
