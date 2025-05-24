// LikeDialog.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LikeDialog = ({ open, onClose, likedUsers }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                Danh sách người đã thích bài viết
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    {likedUsers && likedUsers.length > 0 ? (
                        likedUsers.map((user, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`👤 ${user.fullName}`} />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Chưa có ai thích bài viết này" />
                        </ListItem>
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default LikeDialog;
