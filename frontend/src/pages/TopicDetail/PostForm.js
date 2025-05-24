import { useContext, useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AuthContext } from '../../context/AuthContext';

// Helper function to convert Data URL to File object
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// Custom image handler for Quill toolbar button
const imageHandler = () => {
    const quill = window.quillEditor; // Access quill instance from global
    if (!quill) return;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                // --- THAY ĐỔI Ở ĐÂY ---
                let range = quill.getSelection(true);
                // Nếu không có selection (ví dụ, editor trống), chèn vào vị trí 0
                if (!range) {
                    range = { index: 0, length: 0 };
                    quill.focus(); // Đảm bảo editor có focus để selection được tạo
                }
                // --- KẾT THÚC THAY ĐỔI ---
                quill.insertEmbed(range.index, 'image', base64Image);
                quill.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
        }
    };
};

const modules = {
    toolbar: {
        container: [
            [{ header: [1, 2, 3, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
        ],
        handlers: {
            image: imageHandler,
        },
    },
};

const PostForm = ({ newPost, setNewPost, handlePostSubmit }) => {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const quillRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageWidth, setImageWidth] = useState(300);
    const [anchorEl, setAnchorEl] = useState(null);
    const [clickedImage, setClickedImage] = useState(null);

    const handleDialogOpen = () => setOpen(true);
    const handleDialogClose = () => {
        setSelectedImage(null);
        setOpen(false);
    };

    // Effect for handling image paste
    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const handlePaste = (e) => {
            const clipboardItems = e.clipboardData?.items;
            if (!clipboardItems) return;

            for (const item of clipboardItems) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault(); // Prevent default paste behavior
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const base64Image = e.target.result;
                            // --- THAY ĐỔI Ở ĐÂY ---
                            let range = quill.getSelection(true);
                            // Nếu không có selection (ví dụ, editor trống), chèn vào vị trí 0
                            if (!range) {
                                range = { index: 0, length: 0 };
                                quill.focus(); // Đảm bảo editor có focus để selection được tạo
                            }
                            // --- KẾT THÚC THAY ĐỔI ---
                            quill.insertEmbed(range.index, 'image', base64Image);
                            quill.setSelection(range.index + 1);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        };

        quill.root.addEventListener('paste', handlePaste);
        return () => quill.root.removeEventListener('paste', handlePaste);
    }, []);

    // Effect for handling image clicks to show resize/align controls
    useEffect(() => {
        const handleImageClick = (e) => {
            if (e.target.tagName === 'IMG' && e.target.classList.contains('custom-resizable-image')) {
                e.preventDefault();
                const widthPx = e.target.style.width ? parseInt(e.target.style.width.replace('px', '')) : 300;
                setSelectedImage(e.target);
                setImageWidth(widthPx);
                setClickedImage(e.target);
            } else {
                setSelectedImage(null);
                setClickedImage(null);
            }
        };

        document.addEventListener('click', handleImageClick);
        return () => document.removeEventListener('click', handleImageClick);
    }, []);

    // Effect to apply custom styling and expose quill instance
    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        window.quillEditor = quill; // Expose quill instance to global for custom imageHandler

        const editor = quill.root;
        const imgs = editor.querySelectorAll('img');
        imgs.forEach(img => {
            if (!img.classList.contains('custom-resizable-image')) {
                img.classList.add('custom-resizable-image');
                img.style.width = '300px';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.margin = '12px auto';
            }
        });
    }, [newPost.content]);

    const handleSliderChange = (event, newValue) => {
        setImageWidth(newValue);
        if (selectedImage) {
            selectedImage.style.width = `${newValue}px`;
        }
    };

    const handleAlign = (align) => {
        if (clickedImage) {
            clickedImage.style.float = 'none';
            clickedImage.style.display = 'block';
            clickedImage.style.margin = '12px auto';

            if (align === 'left') {
                clickedImage.style.float = 'left';
                clickedImage.style.margin = '12px 12px 12px 0';
            } else if (align === 'right') {
                clickedImage.style.float = 'right';
                clickedImage.style.margin = '12px 0 12px 12px';
            }
        }
    };

    const handleSubmit = async () => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const html = quill.root.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const imgTags = tempDiv.querySelectorAll('img');
        const uploadPromises = [];

        for (const img of imgTags) {
            const src = img.getAttribute('src');

            if (!src || src.startsWith(`http://localhost:5000/uploads/`)) {
                continue;
            }

            let fileToUpload = null;
            let filename = `image_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

            if (src.startsWith('data:image/')) {
                fileToUpload = dataURLtoFile(src, filename);
            }
            else if (src.startsWith('http://') || src.startsWith('https://')) {
                try {
                    console.log(`Workspaceing remote image: ${src}`);
                    const response = await fetch(src);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch remote image: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    const contentType = blob.type;
                    const fileExtension = contentType.split('/')[1] || 'png';
                    filename = `remote_image_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
                    fileToUpload = new File([blob], filename, { type: contentType });
                } catch (err) {
                    console.error(`Error fetching remote image ${src}:`, err);
                    continue;
                }
            }

            if (fileToUpload) {
                const formData = new FormData();
                formData.append('image', fileToUpload);

                const uploadPromise = fetch('http://localhost:5000/api/uploads/image', {
                    method: 'POST',
                    body: formData,
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (data?.url) {
                            img.setAttribute('src', data.url);
                        } else {
                            console.error('URL not found in upload response:', data);
                        }
                    })
                    .catch(err => console.error('Upload ảnh lỗi:', err));

                uploadPromises.push(uploadPromise);
            }
        }

        await Promise.all(uploadPromises);

        const updatedContent = tempDiv.innerHTML;
        const postWithUserId = {
            ...newPost,
            content: updatedContent,
            authorId: user?._id,
        };

        handlePostSubmit(postWithUserId);
        handleDialogClose();
    };

    return (
        <Box mb={4}>
            <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#C0C2C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    👤
                </Box>
                <Typography variant="body1" sx={{ backgroundColor: '#B8B9BB', borderRadius: '30px', padding: '10px 16px', color: '#65676b', fontSize: '1rem', display: 'inline-block', cursor: 'pointer' }} onClick={handleDialogOpen}>
                    ✍️ {user?.fullName || 'Bạn'} ơi, bạn viết bài hoặc đặt câu hỏi gì không?
                </Typography>
            </Box>

            <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="lg">
                <DialogTitle>
                    ✍️ Đăng bài mới
                    <IconButton aria-label="close" onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, position: 'relative' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Tiêu đề"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ '& .ql-editor': { minHeight: '300px' }, '& .ql-editor p': { margin: '0.5em 0' }, '& .ql-editor img': { maxWidth: '100%', height: 'auto', cursor: 'pointer' } }}>
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={newPost.content}
                            onChange={(content) => setNewPost({ ...newPost, content })}
                            modules={modules}
                            style={{ height: '350px', marginBottom: '16px' }}
                            placeholder="Nhập nội dung tại đây..."
                        />
                    </Box>

                    {selectedImage && (
                        <Box sx={{ position: 'absolute', bottom: 50, left: 20, backgroundColor: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.15)', padding: 2, borderRadius: 2, width: 250, zIndex: 9999 }}>
                            <Typography variant="caption" gutterBottom>
                                Điều chỉnh kích thước ảnh (px)
                            </Typography>
                            <Slider
                                min={50}
                                max={800}
                                value={imageWidth}
                                onChange={handleSliderChange}
                                aria-label="Image width"
                                valueLabelDisplay="auto"
                            />
                            <Box mt={1} display="flex" justifyContent="space-between">
                                <IconButton onClick={() => handleAlign('left')}><FormatAlignLeftIcon /></IconButton>
                                <IconButton onClick={() => handleAlign('center')}><FormatAlignCenterIcon /></IconButton>
                                <IconButton onClick={() => handleAlign('right')}><FormatAlignRightIcon /></IconButton>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <TextField
                    fullWidth
                    variant="outlined"
                    label="Tags (cách nhau bằng dấu phẩy)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    sx={{ mt: 2, mx: 3 }}
                />
                <Box textAlign="right" p={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Đăng bài
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
};

export default PostForm;