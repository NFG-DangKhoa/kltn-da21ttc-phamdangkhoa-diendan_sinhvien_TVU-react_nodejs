// src/pages/DraftsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Snackbar, Alert, Dialog, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DraftList from '../components/DraftList';
import DraftEditor from '../components/DraftEditor';
import { useDrafts } from '../hooks/useDrafts'; // Custom hook để quản lý data
import { styled } from '@mui/system';

const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    minHeight: '80vh',
}));

const DraftsPage = () => {
    const { drafts, addDraft, updateDraft, deleteDraft, loading, error } = useDrafts();
    const [editingDraft, setEditingDraft] = useState(null); // Bản nháp đang được chỉnh sửa
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleNewDraft = () => {
        setEditingDraft(null); // Reset để tạo bản nháp mới
        setIsEditorOpen(true);
    };

    const handleEditDraft = useCallback((id) => {
        const draftToEdit = drafts.find(d => d.id === id);
        setEditingDraft(draftToEdit);
        setIsEditorOpen(true);
    }, [drafts]);

    const handleDeleteDraft = useCallback((id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bản nháp này?')) {
            deleteDraft(id);
            setSnackbarMessage('Đã xóa bản nháp thành công!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    }, [deleteDraft]);

    const handleSaveDraft = useCallback((draftData, isAutoSave = false) => {
        if (draftData.id) {
            updateDraft(draftData);
            if (!isAutoSave) {
                setSnackbarMessage('Đã cập nhật bản nháp thành công!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setIsEditorOpen(false);
            }
        } else {
            addDraft(draftData);
            if (!isAutoSave) {
                setSnackbarMessage('Đã lưu bản nháp mới thành công!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setIsEditorOpen(false);
            }
        }
    }, [addDraft, updateDraft]);

    const handleCancelEdit = () => {
        setIsEditorOpen(false);
        setEditingDraft(null);
    };

    const handleViewDraft = (id) => {
        const draftToView = drafts.find(d => d.id === id);
        // Hiện thị nội dung bản nháp trong một modal hoặc trang xem chi tiết
        alert(`Xem bản nháp: ${draftToView.title}\nNội dung: ${draftToView.content}`);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (error) {
            setSnackbarMessage(`Lỗi: ${error}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }, [error]);

    return (
        <PageContainer maxWidth="md">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Bản Nháp Của Bạn
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleNewDraft}
                >
                    Tạo bản nháp mới
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <DraftList
                    drafts={drafts}
                    onEdit={handleEditDraft}
                    onDelete={handleDeleteDraft}
                    onView={handleViewDraft}
                />
            )}

            <Dialog open={isEditorOpen} onClose={handleCancelEdit} maxWidth="md" fullWidth>
                <DialogContent>
                    <DraftEditor
                        initialDraft={editingDraft}
                        onSave={handleSaveDraft}
                        onCancel={handleCancelEdit}
                    />
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default DraftsPage;