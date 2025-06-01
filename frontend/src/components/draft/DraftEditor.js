// src/components/DraftEditor.js
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
// Import trình soạn thảo rich-text bạn chọn (ví dụ: react-quill)
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css'; // hoặc 'react-quill/dist/quill.bubble.css'

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '12px',
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.mode === 'dark' ? '#2e2e2e' : '#ffffff',
    color: theme.palette.text.primary,
}));

const DraftEditor = ({ initialDraft = {}, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialDraft.title || '');
    const [content, setContent] = useState(initialDraft.content || '');
    const [isSaving, setIsSaving] = useState(false);

    // Giả sử có một logic tự động lưu
    useEffect(() => {
        const autoSaveTimer = setTimeout(() => {
            if (title || content) {
                // Logic tự động lưu ở đây
                console.log("Tự động lưu nháp...");
                // onSave({ ...initialDraft, title, content, lastSaved: new Date().toISOString() }, true);
            }
        }, 5000); // Tự động lưu sau 5 giây không hoạt động
        return () => clearTimeout(autoSaveTimer);
    }, [title, content, onSave, initialDraft]);


    const handleSave = () => {
        setIsSaving(true);
        onSave({ ...initialDraft, title, content, lastSaved: new Date().toISOString() });
        setIsSaving(false); // Hoặc setIsSaving(false) sau khi lưu thành công
    };

    return (
        <StyledPaper>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {initialDraft.id ? 'Chỉnh sửa Bản nháp' : 'Tạo Bản nháp mới'}
            </Typography>
            <TextField
                fullWidth
                label="Tiêu đề bản nháp"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3 }}
            />
            {/* Thay thế bằng trình soạn thảo rich-text thực tế */}
            {/* <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Viết nội dung bản nháp của bạn..."
                style={{ marginBottom: '24px', height: '200px' }}
            /> */}
            <TextField
                fullWidth
                multiline
                rows={8}
                label="Nội dung bản nháp"
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="Viết nội dung bản nháp của bạn..."
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="secondary" onClick={onCancel}>
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isSaving || (!title && !content)}
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
                </Button>
            </Box>
        </StyledPaper>
    );
};

export default DraftEditor;