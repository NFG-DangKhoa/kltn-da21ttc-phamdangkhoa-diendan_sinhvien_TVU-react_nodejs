import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography,
    CircularProgress, Alert
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
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

    const quillRef = useRef(null);

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

    // Custom image handler cho ReactQuill (upload từ file)
    const imageHandler = useCallback(() => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(); // Lấy vùng chọn hiện tại

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64data = reader.result; // Kết quả là Data URL (Base64)
                    // Sử dụng range.index nếu có, nếu không thì chèn vào cuối
                    const insertIndex = range ? range.index : editor.getLength();
                    editor.insertEmbed(insertIndex, 'image', base64data);
                    editor.setSelection(insertIndex + 1);
                };
                reader.readAsDataURL(file); // Đọc file thành Data URL
            }
        };
    }, []);

    // Xử lý sự kiện paste
    const handlePaste = useCallback(async (evt) => {
        const clipboardData = evt.clipboardData || window.clipboardData;
        const items = clipboardData.items;
        const editor = quillRef.current.getEditor();
        let range = editor.getSelection(); // Lấy vùng chọn hiện tại

        // Nếu không có vùng chọn, đặt vùng chọn về cuối nội dung để chèn vào đó
        if (!range) {
            const length = editor.getLength();
            editor.setSelection(length, 0); // Đặt con trỏ ở cuối
            range = editor.getSelection(); // Lấy lại vùng chọn sau khi đã set
        }

        let imageHandled = false;

        // Ưu tiên xử lý các item là ảnh trực tiếp (từ clipboard)
        for (const item of items) {
            // console.log('Paste item:', item.type, item.kind); // Debugging line

            if (item.type.startsWith('image/') && item.kind === 'file') {
                evt.preventDefault(); // Ngăn Quill xử lý mặc định
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64data = reader.result;
                        editor.insertEmbed(range.index, 'image', base64data);
                        editor.setSelection(range.index + 1);
                    };
                    reader.readAsDataURL(file);
                    imageHandled = true;
                    break;
                }
            }
        }

        // Nếu không có ảnh trực tiếp nào được xử lý, kiểm tra text/plain cho URL ảnh
        if (!imageHandled) {
            for (const item of items) {
                if (item.type === 'text/plain' && item.kind === 'string') {
                    item.getAsString((text) => {
                        const imageUrlRegex = /(https?:\/\/[^\s$.?#].[^\s]*?\.(?:jpe?g|gif|png|webp|svg|bmp|tiff))/gi;
                        const matches = text.match(imageUrlRegex);
                        if (matches && matches.length > 0) {
                            evt.preventDefault();
                            const urlToEmbed = matches[0];
                            editor.insertEmbed(range.index, 'image', urlToEmbed);
                            editor.setSelection(range.index + 1);
                            imageHandled = true;
                        }
                    });
                    if (imageHandled) {
                        break;
                    }
                }
            }
        }
    }, []);

    // Xử lý sự kiện Drop (kéo thả ảnh)
    const handleDrop = useCallback(async (evt) => {
        evt.preventDefault();
        const editor = quillRef.current.getEditor();
        let range = editor.getSelection(); // Lấy vùng chọn hiện tại

        // Nếu không có vùng chọn, đặt vùng chọn về cuối nội dung để chèn vào đó
        if (!range) {
            const length = editor.getLength();
            editor.setSelection(length, 0); // Đặt con trỏ ở cuối
            range = editor.getSelection(); // Lấy lại vùng chọn sau khi đã set
        }

        const files = evt.dataTransfer.files;
        if (files.length > 0) {
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64data = reader.result;
                        editor.insertEmbed(range.index, 'image', base64data);
                        editor.setSelection(range.index + 1);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.getModule('toolbar').addHandler('image', imageHandler);

            const quillEditorEl = editor.root;
            quillEditorEl.addEventListener('paste', handlePaste);
            quillEditorEl.addEventListener('drop', handleDrop);

            // Cleanup function
            return () => {
                quillEditorEl.removeEventListener('paste', handlePaste);
                quillEditorEl.removeEventListener('drop', handleDrop);
            };
        }
    }, [imageHandler, handlePaste, handleDrop]);

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

    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
        },
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image', 'video'
    ];

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
            <Box sx={{ '& .ql-container': { minHeight: '300px' } }}>
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
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