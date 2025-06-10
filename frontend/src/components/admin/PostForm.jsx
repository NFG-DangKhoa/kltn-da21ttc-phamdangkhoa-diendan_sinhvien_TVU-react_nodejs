import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography,
    CircularProgress, Alert
} from '@mui/material';
import CustomEditor from '../../pages/TopicDetail/CenterColumn/CustomEditor';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PostForm = ({ post, onSubmit, onCancel }) => {
    const { user, getToken } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [topicId, setTopicId] = useState('');
    const [tags, setTags] = useState([]);
    const [status, setStatus] = useState('pending');
    // FIX: Khởi tạo useState đúng cách
    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [errorTopics, setErrorTopics] = useState('');

    // Removed quillRef as we're using CustomEditor now

    useEffect(() => {
        if (post) {
            setTitle(post.title || '');
            setContent(post.content || '');
            setTopicId(post.topicId?._id || '');
            setTags(post.tags || []);
            setStatus(post.status || 'pending');
        } else {
            setTitle('');
            setContent('');
            setTopicId('');
            setTags([]);
            setStatus('pending');
        }
    }, [post]);

    useEffect(() => {
        const fetchTopics = async () => {
            setLoadingTopics(true);
            setErrorTopics('');
            try {
                const token = getToken();
                const response = await axios.get('http://localhost:5000/api/topics/all', {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : ''
                    }
                });
                setTopics(response.data);
                setLoadingTopics(false);
            } catch (err) {
                console.error('Error fetching topics:', err);
                setErrorTopics('Không thể tải danh sách chủ đề.');
                setLoadingTopics(false);
            }
        };
        fetchTopics();
    }, [getToken]);

    // Removed imageHandler - CustomEditor handles image upload internally

    // Removed handlePaste - CustomEditor handles paste internally

    // Removed handleDrop and useEffect - CustomEditor handles all interactions internally

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Tiêu đề không được để trống!');
            return;
        }
        // Kiểm tra content có phải là rỗng hoặc chỉ chứa thẻ p rỗng
        if (!content.trim() || content === '<p><br></p>' || content === '<p></p>') {
            alert('Nội dung bài viết không được để trống!');
            return;
        }
        if (!topicId) {
            alert('Vui lòng chọn một chủ đề!');
            return;
        }
        if (!user || !user._id) {
            alert('Không có thông tin người dùng. Vui lòng thử đăng nhập lại.');
            console.error("Không có thông tin người dùng để tạo bài viết.");
            return;
        }

        // Gửi toàn bộ nội dung (có thể chứa Base64 hoặc URL bên ngoài) lên backend.
        onSubmit({ title, content, topicId, tags, status, authorId: user._id });
    };

    const handleTagsChange = (event) => {
        const { target: { value }, } = event;
        setTags(typeof value === 'string' ? value.split(',') : value);
    };

    // Removed ReactQuill modules and formats - using CustomEditor instead

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                margin="normal"
            />

            <FormControl fullWidth required margin="normal">
                <InputLabel>Chủ đề</InputLabel>
                <Select
                    value={topicId}
                    label="Chủ đề"
                    onChange={(e) => setTopicId(e.target.value)}
                    disabled={loadingTopics}
                >
                    {loadingTopics ? (
                        <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải chủ đề...
                        </MenuItem>
                    ) : errorTopics ? (
                        <MenuItem disabled>
                            <Alert severity="error" sx={{ width: '100%' }}>{errorTopics}</Alert>
                        </MenuItem>
                    ) : (
                        topics.map((topic) => (
                            <MenuItem key={topic._id} value={topic._id}>
                                {topic.name}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Tags</InputLabel>
                <Select
                    multiple
                    value={tags}
                    onChange={handleTagsChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                >
                    {['react', 'node', 'javascript', 'mongodb', 'express', 'css', 'html', 'python', 'java', 'csharp', 'php', 'typescript', 'frontend', 'backend', 'fullstack', 'database', 'api', 'security', 'devops', 'cloud', 'machine-learning', 'ai', 'data-science', 'blockchain', 'mobile', 'web', 'design', 'ux', 'ui', 'performance', 'testing', 'deployment', 'serverless', 'graphql', 'rest'].map((tag) => (
                        <MenuItem
                            key={tag}
                            value={tag}
                        >
                            {tag}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth required margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                    value={status}
                    label="Trạng thái"
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <MenuItem value="draft">Bản nháp</MenuItem>
                    <MenuItem value="pending">Đang chờ duyệt</MenuItem>
                    <MenuItem value="published">Đã xuất bản</MenuItem>
                    <MenuItem value="archived">Lưu trữ</MenuItem>
                    <MenuItem value="flagged">Bị gắn cờ</MenuItem>
                    <MenuItem value="deleted">Đã xóa</MenuItem>
                </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Nội dung:</Typography>
            <Box sx={{ mt: 2 }}>
                <CustomEditor
                    content={content}
                    onContentChange={setContent}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={onCancel} variant="outlined">
                    Hủy
                </Button>
                <Button type="submit" variant="contained">
                    {post ? 'Cập nhật' : 'Tạo'}
                </Button>
            </Box>
        </Box>
    );
};

export default PostForm;