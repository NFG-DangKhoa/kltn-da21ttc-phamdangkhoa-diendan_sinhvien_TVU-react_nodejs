import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';

// --- Helper Functions ---
const getSelectionRange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }
    return null;
};




// Regex để kiểm tra URL ảnh cơ bản
export const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg|\.gif|\.webp))/g;

const IMAGE_SIZES = [
    { value: 150, label: 'Nhỏ (150px)' },
    { value: 300, label: 'Vừa (300px)' },
    { value: 500, label: 'Lớn (500px)' },
    { value: 700, label: 'Rộng (700px)' },
    { value: '100%', label: 'Đầy đủ (100%)' },
];

const RichTextEditor = ({ content, onContentChange }) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageWidth, setImageWidth] = useState(IMAGE_SIZES[1].value);

    const [openLinkDialog, setOpenLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [currentSelectionRange, setCurrentSelectionRange] = useState(null);

    const [showImageControls, setShowImageControls] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    useEffect(() => {
        const editorElement = editorRef.current;
        if (!editorElement) return;

        const handleEditorClick = (e) => {
            if (e.target.tagName === 'IMG') {
                setSelectedImage(e.target);
                const currentWidth = e.target.style.width || `${IMAGE_SIZES[1].value}px`;
                setImageWidth(currentWidth.replace('px', '').replace('%', ''));
                setShowImageControls(true);
            } else {
                setSelectedImage(null);
                setShowImageControls(false);
            }
        };

        editorElement.addEventListener('click', handleEditorClick);
        return () => editorElement.removeEventListener('click', handleEditorClick);
    }, []);

    const handleFormat = useCallback((command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onContentChange(editorRef.current.innerHTML);
        }
    }, [onContentChange]);

    const handleHeader = useCallback((level) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand('formatBlock', false, `<h${level}>`);
        if (editorRef.current) {
            onContentChange(editorRef.current.innerHTML);
        }
    }, [onContentChange]);


    const handleBold = () => handleFormat('bold');
    const handleItalic = () => handleFormat('italic');
    const handleUnderline = () => handleFormat('underline');
    const handleStrikethrough = () => handleFormat('strikeThrough');
    const handleCode = () => handleFormat('formatBlock', '<pre>');
    const handleUnorderedList = () => handleFormat('insertUnorderedList');

    const handleLinkClick = () => {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            setCurrentSelectionRange(getSelectionRange());
            setOpenLinkDialog(true);
        } else {
            alert('Vui lòng chọn văn bản để tạo link.');
        }
    };

    const handleInsertLink = () => {
        if (editorRef.current && currentSelectionRange) {
            editorRef.current.focus();
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(currentSelectionRange);
            handleFormat('createLink', linkUrl);
        }
        setOpenLinkDialog(false);
        setLinkUrl('');
        setCurrentSelectionRange(null);
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const currentRange = getSelectionRange();

        const reader = new FileReader();
        reader.onload = async (e) => {
            const tempBase64Url = e.target.result;
            const fileName = file.name;

            if (editorRef.current && currentRange) {
                editorRef.current.focus();
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(currentRange);

                const initialWidth = IMAGE_SIZES[1].value;
                const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;

                const imgTag = `<img src="${tempBase64Url}" data-filename="${fileName}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`;
                document.execCommand('insertHTML', false, imgTag);

                const imgs = editorRef.current.querySelectorAll(`img[src="${tempBase64Url}"]`);
                const insertedImg = imgs[imgs.length - 1];

                if (insertedImg) {
                    setSelectedImage(insertedImg);
                    setImageWidth(initialWidth);
                    setShowImageControls(true);
                    onContentChange(editorRef.current.innerHTML);
                }
            }
        };
        reader.readAsDataURL(file);
        event.target.value = null;
    }, [onContentChange]);

    const handleEditorInput = useCallback(() => {
        if (editorRef.current) {
            onContentChange(editorRef.current.innerHTML);
        }
    }, [onContentChange]);

    const handleImageSizeChange = useCallback((event) => {
        const newValue = event.target.value;
        setImageWidth(newValue);
        if (selectedImage) {
            const widthStyle = typeof newValue === 'number' ? `${newValue}px` : newValue;
            selectedImage.style.width = widthStyle;
            selectedImage.style.height = 'auto';
            onContentChange(editorRef.current.innerHTML);
        }
    }, [selectedImage, onContentChange]);

    const handleAlign = useCallback((align) => {
        if (selectedImage) {
            selectedImage.style.float = 'none';
            selectedImage.style.display = 'block';
            selectedImage.style.margin = '12px auto';

            if (align === 'left') {
                selectedImage.style.float = 'left';
                selectedImage.style.margin = '12px 12px 12px 0';
            } else if (align === 'right') {
                selectedImage.style.float = 'right';
                selectedImage.style.margin = '12px 0 12px 12px';
            }

            onContentChange(editorRef.current.innerHTML);
        } else {
            handleFormat(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
        }
    }, [selectedImage, onContentChange, handleFormat]);

    // --- NEW: Xử lý sự kiện paste ---
    const handlePaste = useCallback(async (event) => {
        event.preventDefault(); // Ngăn chặn hành vi dán mặc định

        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        let handled = false;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Case 1: Dán ảnh trực tiếp từ clipboard (ví dụ: screenshot)
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const tempBase64Url = e.target.result;
                        const fileName = `pasted_image_${Date.now()}.png`; // Tên file tạm
                        const initialWidth = IMAGE_SIZES[1].value;
                        const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                        const imgTag = `<img src="${tempBase64Url}" data-filename="${fileName}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`;
                        document.execCommand('insertHTML', false, imgTag);
                        onContentChange(editorRef.current.innerHTML);
                    };
                    reader.readAsDataURL(file);
                    handled = true;
                    break;
                }
            }

            // Case 2: Dán văn bản, kiểm tra nếu là URL ảnh
            if (item.type === 'text/plain') {
                const text = await new Promise(resolve => item.getAsString(resolve));
                if (IMAGE_URL_REGEX.test(text.trim())) {
                    const imageUrl = text.trim();
                    const initialWidth = IMAGE_SIZES[1].value;
                    const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                    // Sử dụng data-original-src để biết đây là ảnh dán từ URL
                    const imgTag = `<img src="${imageUrl}" data-original-src="${imageUrl}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`;
                    document.execCommand('insertHTML', false, imgTag);
                    onContentChange(editorRef.current.innerHTML);
                    handled = true;
                    break;
                }
            }

            // Case 3: Dán HTML, ví dụ từ trang web khác
            if (item.type === 'text/html') {
                const html = await new Promise(resolve => item.getAsString(resolve));
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const imagesInPastedHtml = tempDiv.querySelectorAll('img');

                if (imagesInPastedHtml.length > 0) {
                    imagesInPastedHtml.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && IMAGE_URL_REGEX.test(src)) {
                            // Giữ nguyên src nếu là URL ảnh hợp lệ, đánh dấu để xử lý sau
                            img.setAttribute('data-original-src', src);
                            // Bạn có thể giữ nguyên kích thước hoặc áp dụng kích thước mặc định
                            const initialWidth = IMAGE_SIZES[1].value;
                            const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                            img.style.width = img.style.width || widthStyle; // Giữ nguyên width nếu có, nếu không thì áp dụng default
                            img.style.height = 'auto';
                            img.style.display = 'block';
                            img.style.margin = '12px auto';
                        }
                    });
                    document.execCommand('insertHTML', false, tempDiv.innerHTML);
                    onContentChange(editorRef.current.innerHTML);
                    handled = true;
                    break;
                }
            }
        }

        // Nếu không có ảnh hoặc URL ảnh được xử lý, cho phép dán văn bản thuần
        if (!handled) {
            const text = await new Promise(resolve => items[0].getAsString(resolve));
            document.execCommand('insertText', false, text);
            onContentChange(editorRef.current.innerHTML);
        }
    }, [onContentChange]);


    // Đăng ký sự kiện paste khi component mount
    useEffect(() => {
        const editorElement = editorRef.current;
        if (editorElement) {
            editorElement.addEventListener('paste', handlePaste);
        }
        return () => {
            if (editorElement) {
                editorElement.removeEventListener('paste', handlePaste);
            }
        };
    }, [handlePaste]);


    return (
        <React.Fragment>
            <Paper elevation={0} sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden', mb: 1 }}>
                <Box sx={{
                    p: 1,
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9',
                }}>
                    {/* Text Formatting */}
                    <Tooltip title="In đậm">
                        <IconButton size="small" onClick={handleBold}>
                            <FormatBoldIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="In nghiêng">
                        <IconButton size="small" onClick={handleItalic}>
                            <FormatItalicIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gạch chân">
                        <IconButton size="small" onClick={handleUnderline}>
                            <FormatUnderlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gạch ngang">
                        <IconButton size="small" onClick={handleStrikethrough}>
                            <StrikethroughSIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Tiêu đề lớn (H1)">
                        <IconButton size="small" onClick={() => handleHeader(1)}>
                            <LooksOneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Tiêu đề vừa (H2)">
                        <IconButton size="small" onClick={() => handleHeader(2)}>
                            <LooksTwoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Khối code">
                        <IconButton size="small" onClick={handleCode}>
                            <CodeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    {/* List & Link */}
                    <Tooltip title="Danh sách không thứ tự">
                        <IconButton size="small" onClick={handleUnorderedList}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chèn liên kết">
                        <IconButton size="small" onClick={handleLinkClick}>
                            <LinkIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    {/* Image Controls & Alignment */}
                    <Tooltip title="Chèn ảnh">
                        <IconButton size="small" onClick={handleImageClick}>
                            <ImageIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {showImageControls && selectedImage ? (
                        <>
                            <FormControl sx={{ ml: 1, minWidth: 120 }} size="small">
                                <InputLabel id="image-size-select-label">Kích thước ảnh</InputLabel>
                                <Select
                                    labelId="image-size-select-label"
                                    id="image-size-select"
                                    value={imageWidth}
                                    label="Kích thước ảnh"
                                    onChange={handleImageSizeChange}
                                >
                                    {IMAGE_SIZES.map((size) => (
                                        <MenuItem key={size.value} value={size.value}>
                                            {size.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Tooltip title="Căn trái ảnh">
                                <IconButton size="small" onClick={() => handleAlign('left')}>
                                    <FormatAlignLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn giữa ảnh">
                                <IconButton size="small" onClick={() => handleAlign('center')}>
                                    <FormatAlignCenterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn phải ảnh">
                                <IconButton size="small" onClick={() => handleAlign('right')}>
                                    <FormatAlignRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Căn trái văn bản">
                                <IconButton size="small" onClick={() => handleAlign('left')}>
                                    <FormatAlignLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn giữa văn bản">
                                <IconButton size="small" onClick={() => handleAlign('center')}>
                                    <FormatAlignCenterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn phải văn bản">
                                <IconButton size="small" onClick={() => handleAlign('right')}>
                                    <FormatAlignRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </Paper>

            <Box
                ref={editorRef}
                contentEditable="true"
                sx={{
                    minHeight: '350px',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    outline: 'none',
                    cursor: 'text',
                    backgroundColor: 'white',
                    '&:focus': { borderColor: 'primary.main', boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.5)' },
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                    '& p': { margin: '0.8em 0' },
                    '& ul, & ol': { margin: '0.8em 0', paddingLeft: '2.5em' },
                    '& h1': { fontSize: '2em', margin: '0.67em 0' },
                    '& h2': { fontSize: '1.5em', margin: '0.75em 0' },
                    '& pre': {
                        backgroundColor: '#f4f4f4',
                        padding: '1em',
                        borderRadius: '4px',
                        overflowX: 'auto',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                    },
                    '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        boxSizing: 'border-box',
                        border: selectedImage ? '2px solid primary.main' : '1px solid transparent',
                        '&:hover': { outline: '1px dashed rgba(0, 0, 255, 0.5)' },
                    },
                }}
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={handleEditorInput}
            />

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Chèn Liên Kết</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="URL"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="e.g., https://example.com"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLinkDialog(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleInsertLink} disabled={!linkUrl} variant="contained">Chèn</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default RichTextEditor;