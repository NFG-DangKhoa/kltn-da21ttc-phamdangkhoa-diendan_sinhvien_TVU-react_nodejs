// File đăng bài chính
import React, { useState } from 'react';
import {
    Container, TextField, Button, Typography,
    Select, MenuItem, FormControl, InputLabel,
    Chip, Box, Paper, Grid
} from '@mui/material';
// Giả định bạn sử dụng một thư viện Rich Text Editor như Quill, Slate, hoặc TipTap tích hợp với MUI
// Ví dụ: import { RichTextEditor } from 'your-mui-compatible-rich-text-editor';

function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Nội dung từ Rich Text Editor
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');

    // Xử lý thêm thẻ (tag)
    const handleAddTag = () => {
        if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
            setTags([...tags, newTagInput.trim()]);
            setNewTagInput('');
        }
    };

    // Xử lý xóa thẻ (tag)
    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    // Xử lý khi người dùng nhấn nút Đăng bài
    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert('Vui lòng nhập tiêu đề và nội dung bài viết!');
            return;
        }
        console.log({
            title,
            content,
            category,
            tags
        });
        // TODO: Gửi dữ liệu bài viết lên API server
        alert('Bài viết của bạn đã được gửi đi thành công!');
        // Reset form sau khi gửi
        setTitle('');
        setContent('');
        setCategory('');
        setTags([]);
        setNewTagInput('');
    };

    return (
        <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom
                    sx={{
                        mb: 3,
                        mt: 10,
                        fontWeight: 'bold',
                        color: 'primary.main',
                        textAlign: 'center'
                    }}>
                    Tạo Bài Viết Mới
                </Typography>

                <Grid container spacing={3}>
                    {/* Tiêu đề bài viết */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Tiêu đề bài viết"
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Tối ưu hiệu năng ứng dụng React với useMemo và useCallback"
                            required
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    {/* Nội dung bài viết - Rich Text Editor */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 1, color: 'text.secondary' }}>
                            Nội dung bài viết
                        </Typography>
                        <Box sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            minHeight: 300,
                            p: 1
                        }}>
                            {/*
                Đây là nơi tích hợp Rich Text Editor.
                Bạn sẽ cần cài đặt và sử dụng một thư viện như Quill, Slate.js hoặc TipTap.
                Ví dụ: <QuillEditor value={content} onChange={setContent} theme="snow" modules={editorModules} />
                Hãy đảm bảo nó hỗ trợ syntax highlighting cho code!
              */}
                            <TextField
                                fullWidth
                                multiline
                                rows={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bắt đầu viết bài của bạn tại đây... Hỗ trợ định dạng văn bản và chèn code!"
                                variant="standard" // Dùng standard để không có border mặc định
                                InputProps={{ disableUnderline: true }} // Bỏ gạch chân mặc định
                                sx={{ '& textarea': { p: 1 } }}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Mẹo: Sử dụng Markdown hoặc các nút trong trình soạn thảo để định dạng code.
                        </Typography>
                    </Grid>

                    {/* Chuyên mục */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                            <InputLabel id="category-label">Chuyên mục</InputLabel>
                            <Select
                                labelId="category-label"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                label="Chuyên mục"
                                required
                            >
                                <MenuItem value="">
                                    <em>Chọn chuyên mục phù hợp</em>
                                </MenuItem>
                                <MenuItem value="ui-ux-design">Thiết kế UI/UX với MUI</MenuItem>
                                <MenuItem value="frontend-development">Phát triển Frontend & React</MenuItem>
                                <MenuItem value="jsx-best-practices">Mẹo và Thủ thuật JSX</MenuItem>
                                <MenuItem value="material-ui-guides">Hướng dẫn Material-UI</MenuItem>
                                <MenuItem value="community-news">Tin tức Cộng đồng</MenuItem>
                                <MenuItem value="performance-optimization">Tối ưu hiệu năng</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Thẻ (Tags) */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Thêm thẻ (Tags)"
                            variant="outlined"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddTag();
                                    e.preventDefault(); // Ngăn ngừa gửi form
                                }
                            }}
                            placeholder="Nhập thẻ và nhấn Enter (ví dụ: React, Hooks, CSS-in-JS)"
                            sx={{ mt: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={handleAddTag} disabled={!newTagInput.trim()}>
                                        Thêm
                                    </Button>
                                ),
                            }}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ bgcolor: 'primary.light', borderColor: 'primary.main' }}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* Nút hành động */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                    <Button variant="outlined" color="secondary" size="large">
                        Lưu nháp
                    </Button>
                    <Button variant="contained" color="primary" size="large" onClick={handleSubmit}>
                        Đăng bài
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default CreatePostPage;