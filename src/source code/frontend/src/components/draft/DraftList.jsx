// src/components/DraftList.js
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/system';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#3a3a3a' : '#f5f5f5',
    borderRadius: '8px',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: theme.shadows[6],
    },
}));

const DraftList = ({ drafts, onEdit, onDelete, onView }) => {
    if (!drafts || drafts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h6" color="text.secondary">
                    Bạn chưa có bản nháp nào. Hãy tạo một cái mới!
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {drafts.map((draft) => (
                <StyledListItem key={draft.id}>
                    <ListItemText
                        primary={
                            <Typography variant="h6" component="h2">
                                {draft.title || 'Bản nháp không tiêu đề'}
                            </Typography>
                        }
                        secondary={
                            <>
                                <Typography variant="body2" color="text.secondary">
                                    Cập nhật: {new Date(draft.lastSaved).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 'calc(100% - 100px)' // Adjust based on icon width
                                }}>
                                    {draft.content ? draft.content.substring(0, 100) + (draft.content.length > 100 ? '...' : '') : 'Không có nội dung.'}
                                </Typography>
                            </>
                        }
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="view" onClick={() => onView(draft.id)}>
                            <VisibilityIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="edit" onClick={() => onEdit(draft.id)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => onDelete(draft.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </StyledListItem>
            ))}
        </List>
    );
};

export default DraftList;