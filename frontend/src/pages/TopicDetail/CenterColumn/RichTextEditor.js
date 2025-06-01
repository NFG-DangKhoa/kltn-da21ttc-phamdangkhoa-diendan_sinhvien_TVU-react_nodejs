import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
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
    useTheme // Import useTheme to access the MUI theme
} from '@mui/material';
import DOMPurify from 'dompurify';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CodeIcon from '@mui/icons-material/Code';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import { ThemeContext } from '../../../context/ThemeContext'; // Correctly import ThemeContext

// --- Helper Functions ---
const getSelectionRange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }
    return null;
};

const setSelectionRange = (range) => {
    if (range) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
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
    const currentSelectionRange = useRef(null); // Sử dụng useRef để lưu range

    const [showImageControls, setShowImageControls] = useState(false);

    // Get the current theme mode from ThemeContext
    const { mode } = useContext(ThemeContext);
    const theme = useTheme(); // Use useTheme to access the Material-UI theme palette

    // Now, derive colors directly from the Material-UI theme palette
    // This is the primary change to align with the theming approach
    const paperBorderColor = theme.palette.mode === 'dark' ? '#555' : '#ccc';
    const toolbarBgColor = theme.palette.mode === 'dark' ? '#222' : theme.palette.grey[100];
    const toolbarButtonColor = theme.palette.text.primary; // Already correctly set by the theme's text.primary
    const dividerColor = theme.palette.divider; // Using theme.palette.divider for consistency
    const editorBgColor = theme.palette.background.default; // Using theme.palette.background.default
    const editorTextColor = theme.palette.text.primary; // Using theme.palette.text.primary
    const codeBlockBgColor = theme.palette.mode === 'dark' ? '#2d2d2d' : '#f4f4f4';
    const codeBlockTextColor = theme.palette.mode === 'dark' ? '#a9b7c6' : '#333';
    const linkColor = theme.palette.primary.main; // Already correctly set by the theme's primary.main
    const dialogBgColor = theme.palette.background.paper; // Using theme.palette.background.paper
    const dialogTextColor = theme.palette.text.primary; // Using theme.palette.text.primary
    const inputLabelColor = theme.palette.text.secondary; // Using theme.palette.text.secondary
    const inputBorderColor = theme.palette.mode === 'dark' ? '#777' : '#ccc';
    const inputHoverBorderColor = theme.palette.mode === 'dark' ? '#999' : '#999';
    const inputFocusBorderColor = theme.palette.primary.main; // Consistent with primary color

    // --- Cập nhật nội dung editor khi prop 'content' thay đổi từ bên ngoài ---
    // Chỉ cập nhật innerHTML nếu content prop thay đổi và khác với nội dung hiện tại của editor
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
            // Đặt con trỏ ở cuối nội dung sau khi load ban đầu hoặc cập nhật từ prop
            const range = document.createRange();
            const selection = window.getSelection();
            if (editorRef.current.lastChild) {
                range.setStartAfter(editorRef.current.lastChild);
            } else {
                range.setStart(editorRef.current, 0);
            }
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [content]);


    // Effect để xử lý logic chọn ảnh và lắng nghe sự kiện input
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

        const handleInput = () => {
            // Cập nhật nội dung thông qua onContentChange
            onContentChange(editorRef.current.innerHTML);
            // Lưu lại vùng chọn hiện tại sau mỗi lần gõ
            currentSelectionRange.current = getSelectionRange();
        };

        // Lắng nghe sự kiện click để chọn ảnh
        editorElement.addEventListener('click', handleEditorClick);
        // Lắng nghe sự kiện input để cập nhật nội dung sau mỗi lần gõ phím
        editorElement.addEventListener('input', handleInput);
        // Lắng nghe sự kiện keyup để cập nhật vùng chọn sau khi gõ
        editorElement.addEventListener('keyup', handleInput); // Also listen to keyup for better cursor position handling

        return () => {
            editorElement.removeEventListener('click', handleEditorClick);
            editorElement.removeEventListener('input', handleInput);
            editorElement.removeEventListener('keyup', handleInput);
        };
    }, [onContentChange]);


    const handleFormat = useCallback((command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus(); // Đảm bảo editor có focus
            const range = getSelectionRange(); // Lưu vùng chọn trước khi thực hiện lệnh
            document.execCommand(command, false, value);
            setSelectionRange(range); // Khôi phục vùng chọn về vị trí cũ

            // Sau khi định dạng, cập nhật nội dung
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
        }
    }, [onContentChange]);

    const handleHeader = useCallback((level) => {
        if (editorRef.current) {
            editorRef.current.focus();
            const range = getSelectionRange();
            document.execCommand('formatBlock', false, `<h${level}>`);
            setSelectionRange(range);
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
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
            currentSelectionRange.current = getSelectionRange(); // Lưu vùng chọn hiện tại vào useRef
            setOpenLinkDialog(true);
        } else {
            alert('Vui lòng chọn văn bản để tạo link.');
        }
    };

    const handleInsertLink = () => {
        if (editorRef.current && currentSelectionRange.current) {
            editorRef.current.focus();
            setSelectionRange(currentSelectionRange.current); // Khôi phục vùng chọn đã lưu
            handleFormat('createLink', linkUrl); // Gọi handleFormat để cập nhật nội dung
        }
        setOpenLinkDialog(false);
        setLinkUrl('');
        currentSelectionRange.current = null; // Xóa vùng chọn đã lưu
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const rangeBeforeFileRead = getSelectionRange(); // Lưu vị trí con trỏ trước khi đọc file

        const reader = new FileReader();
        reader.onload = async (e) => {
            const tempBase64Url = e.target.result;
            const fileName = file.name;

            if (editorRef.current && rangeBeforeFileRead) {
                editorRef.current.focus();
                setSelectionRange(rangeBeforeFileRead); // Khôi phục con trỏ

                const initialWidth = IMAGE_SIZES[1].value;
                const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;

                // Chèn ảnh
                document.execCommand('insertHTML', false, `<img src="${tempBase64Url}" data-filename="${fileName}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`);

                // Tìm ảnh vừa chèn để set nó là ảnh đang chọn
                const imgs = editorRef.current.querySelectorAll(`img[src="${tempBase64Url}"]`);
                const insertedImg = imgs[imgs.length - 1];

                if (insertedImg) {
                    setSelectedImage(insertedImg);
                    setImageWidth(initialWidth);
                    setShowImageControls(true);
                }
                const newContent = editorRef.current.innerHTML;
                onContentChange(newContent);

                // Quan trọng: Đặt con trỏ sau hình ảnh đã chèn
                const newRange = document.createRange();
                newRange.setStartAfter(insertedImg);
                newRange.collapse(true);
                setSelectionRange(newRange);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = null; // Xóa input để có thể chọn lại cùng một file
    }, [onContentChange]);

    const handleImageSizeChange = useCallback((event) => {
        const newValue = event.target.value;
        setImageWidth(newValue);
        if (selectedImage) {
            const widthStyle = typeof newValue === 'number' ? `${newValue}px` : newValue;
            selectedImage.style.width = widthStyle;
            selectedImage.style.height = 'auto'; // Giữ tỷ lệ khung hình
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
            editorRef.current.focus(); // Giữ focus trên editor sau khi thay đổi
            setSelectionRange(getSelectionRange()); // Cập nhật lại vùng chọn
        }
    }, [selectedImage, onContentChange]);

    const handleAlign = useCallback((align) => {
        if (selectedImage) {
            selectedImage.style.float = 'none'; // Reset float
            selectedImage.style.display = 'block';
            selectedImage.style.margin = '12px auto'; // Mặc định căn giữa

            if (align === 'left') {
                selectedImage.style.float = 'left';
                selectedImage.style.margin = '12px 12px 12px 0'; // Margin cho ảnh căn trái
            } else if (align === 'right') {
                selectedImage.style.float = 'right';
                selectedImage.style.margin = '12px 0 12px 12px'; // Margin cho ảnh căn phải
            }

            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
            editorRef.current.focus(); // Giữ focus trên editor
            setSelectionRange(getSelectionRange()); // Cập nhật lại vùng chọn
        } else {
            // Áp dụng căn chỉnh văn bản
            const range = getSelectionRange();
            handleFormat(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
            setSelectionRange(range); // Khôi phục vùng chọn
        }
    }, [selectedImage, onContentChange, handleFormat]);

    const handlePaste = useCallback(async (event) => {
        event.preventDefault();

        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        let handled = false;
        const currentRange = getSelectionRange(); // Lưu vùng chọn trước khi dán

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const tempBase64Url = e.target.result;
                        const fileName = `pasted_image_${Date.now()}.png`;
                        const initialWidth = IMAGE_SIZES[1].value;
                        const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                        const imgTag = `<img src="${tempBase64Url}" data-filename="${fileName}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`;

                        setSelectionRange(currentRange); // Khôi phục vùng chọn
                        document.execCommand('insertHTML', false, imgTag);
                        const newContent = editorRef.current.innerHTML;
                        onContentChange(newContent);

                        // Đặt con trỏ sau hình ảnh đã chèn
                        const imgs = editorRef.current.querySelectorAll(`img[src="${tempBase64Url}"]`);
                        const insertedImg = imgs[imgs.length - 1];
                        if (insertedImg) {
                            const newRange = document.createRange();
                            newRange.setStartAfter(insertedImg);
                            newRange.collapse(true);
                            setSelectionRange(newRange);
                        }
                    };
                    reader.readAsDataURL(file);
                    handled = true;
                    break;
                }
            }

            if (item.type === 'text/plain') {
                const text = await new Promise(resolve => item.getAsString(resolve));
                if (IMAGE_URL_REGEX.test(text.trim())) {
                    const imageUrl = text.trim();
                    const initialWidth = IMAGE_SIZES[1].value;
                    const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                    const imgTag = `<img src="${imageUrl}" data-original-src="${imageUrl}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`;

                    setSelectionRange(currentRange); // Khôi phục vùng chọn
                    document.execCommand('insertHTML', false, imgTag);
                    const newContent = editorRef.current.innerHTML;
                    onContentChange(newContent);

                    // Đặt con trỏ sau hình ảnh đã chèn
                    const imgs = editorRef.current.querySelectorAll(`img[src="${imageUrl}"]`);
                    const insertedImg = imgs[imgs.length - 1];
                    if (insertedImg) {
                        const newRange = document.createRange();
                        newRange.setStartAfter(insertedImg);
                        newRange.collapse(true);
                        setSelectionRange(newRange);
                    }
                    handled = true;
                    break;
                }
            }

            if (item.type === 'text/html') {
                const html = await new Promise(resolve => item.getAsString(resolve));
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const imagesInPastedHtml = tempDiv.querySelectorAll('img');

                if (imagesInPastedHtml.length > 0) {
                    imagesInPastedHtml.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && IMAGE_URL_REGEX.test(src)) {
                            img.setAttribute('data-original-src', src);
                            const initialWidth = IMAGE_SIZES[1].value;
                            const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;
                            img.style.width = img.style.width || widthStyle;
                            img.style.height = 'auto';
                            img.style.display = 'block';
                            img.style.margin = '12px auto';
                        }
                    });
                    setSelectionRange(currentRange); // Khôi phục vùng chọn
                    const sanitizedHtml = DOMPurify.sanitize(tempDiv.innerHTML); // Sanitize HTML from clipboard
                    document.execCommand('insertHTML', false, sanitizedHtml);
                    const newContent = editorRef.current.innerHTML;
                    onContentChange(newContent);
                    handled = true;
                    break;
                } else {
                    setSelectionRange(currentRange); // Khôi phục vùng chọn
                    const safeHtml = DOMPurify.sanitize(html);
                    document.execCommand('insertHTML', false, safeHtml);
                    const newContent = editorRef.current.innerHTML;
                    onContentChange(newContent);
                    handled = true;
                    break;
                }
            }
        }

        if (!handled) {
            // Fallback for plain text if no image or rich HTML is found
            const text = await new Promise(resolve => items[0].getAsString(resolve));
            setSelectionRange(currentRange); // Khôi phục vùng chọn
            document.execCommand('insertText', false, text);
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
        }
    }, [onContentChange]);


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
            <Paper
                elevation={0}
                sx={{
                    border: `1px solid ${paperBorderColor}`, // Màu border
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1,
                    backgroundColor: toolbarBgColor, // Nền của thanh công cụ
                }}
            >
                <Box
                    sx={{
                        p: 1,
                        borderBottom: `1px solid ${dividerColor}`, // Đường kẻ dưới
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        backgroundColor: toolbarBgColor, // Nền của các nút
                        color: toolbarButtonColor, // Màu chữ cho các icon/text
                    }}
                >
                    {/* Text Formatting */}
                    <Tooltip title="In đậm">
                        <IconButton size="small" onClick={handleBold} sx={{ color: toolbarButtonColor }}>
                            <FormatBoldIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="In nghiêng">
                        <IconButton size="small" onClick={handleItalic} sx={{ color: toolbarButtonColor }}>
                            <FormatItalicIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gạch chân">
                        <IconButton size="small" onClick={handleUnderline} sx={{ color: toolbarButtonColor }}>
                            <FormatUnderlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gạch ngang">
                        <IconButton size="small" onClick={handleStrikethrough} sx={{ color: toolbarButtonColor }}>
                            <StrikethroughSIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Tiêu đề lớn (H1)">
                        <IconButton size="small" onClick={() => handleHeader(1)} sx={{ color: toolbarButtonColor }}>
                            <LooksOneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Tiêu đề vừa (H2)">
                        <IconButton size="small" onClick={() => handleHeader(2)} sx={{ color: toolbarButtonColor }}>
                            <LooksTwoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Khối code">
                        <IconButton size="small" onClick={handleCode} sx={{ color: toolbarButtonColor }}>
                            <CodeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, bgcolor: dividerColor }} /> {/* Màu divider */}

                    {/* List & Link */}
                    <Tooltip title="Danh sách không thứ tự">
                        <IconButton size="small" onClick={handleUnorderedList} sx={{ color: toolbarButtonColor }}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chèn liên kết">
                        <IconButton size="small" onClick={handleLinkClick} sx={{ color: toolbarButtonColor }}>
                            <LinkIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, bgcolor: dividerColor }} /> {/* Màu divider */}

                    {/* Image Controls & Alignment */}
                    <Tooltip title="Chèn ảnh">
                        <IconButton size="small" onClick={handleImageClick} sx={{ color: toolbarButtonColor }}>
                            <InsertPhotoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {showImageControls && selectedImage ? (
                        <>
                            <FormControl sx={{ ml: 1, minWidth: 120 }} size="small">
                                <InputLabel id="image-size-select-label" sx={{ color: inputLabelColor }}>Kích thước ảnh</InputLabel>
                                <Select
                                    labelId="image-size-select-label"
                                    id="image-size-select"
                                    value={imageWidth}
                                    label="Kích thước ảnh"
                                    onChange={handleImageSizeChange}
                                    sx={{
                                        color: editorTextColor, // Màu chữ trong select
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor }, // Màu border của select
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: inputFocusBorderColor }, // Màu border khi focus
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputHoverBorderColor },
                                        '.MuiSvgIcon-root': { color: toolbarButtonColor }, // Màu mũi tên dropdown
                                    }}
                                >
                                    {IMAGE_SIZES.map((size) => (
                                        <MenuItem key={size.value} value={size.value} sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
                                            {size.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Tooltip title="Căn trái ảnh">
                                <IconButton size="small" onClick={() => handleAlign('left')} sx={{ color: toolbarButtonColor }}>
                                    <FormatAlignLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn giữa ảnh">
                                <IconButton size="small" onClick={() => handleAlign('center')} sx={{ color: toolbarButtonColor }}>
                                    <FormatAlignCenterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn phải ảnh">
                                <IconButton size="small" onClick={() => handleAlign('right')} sx={{ color: toolbarButtonColor }}>
                                    <FormatAlignRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Căn trái văn bản">
                                <IconButton size="small" onClick={() => handleAlign('left')} sx={{ color: toolbarButtonColor }}>
                                    <FormatAlignLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn giữa văn bản">
                                <IconButton size="small" onClick={() => handleAlign('center')} sx={{ color: toolbarButtonColor }}>
                                    <FormatAlignCenterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Căn phải văn bản">
                                <IconButton size="small" onClick={() => handleAlign('right')} sx={{ color: toolbarButtonColor }}>
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
                    border: `1px solid ${paperBorderColor}`, // Border của editor
                    borderRadius: 1,
                    outline: 'none',
                    cursor: 'text',
                    backgroundColor: editorBgColor, // Nền của khu vực soạn thảo
                    color: editorTextColor, // Màu chữ chính
                    '&:focus': { borderColor: inputFocusBorderColor, boxShadow: `0 0 0 1px ${inputFocusBorderColor}` }, // Highlight khi focus
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                    '& p': { margin: '0.8em 0' },
                    '& ul, & ol': { margin: '0.8em 0', paddingLeft: '2.5em' },
                    '& h1': { fontSize: '2em', margin: '0.67em 0', color: editorTextColor },
                    '& h2': { fontSize: '1.5em', margin: '0.75em 0', color: editorTextColor },
                    '& pre': {
                        backgroundColor: codeBlockBgColor, // Nền của khối code
                        padding: '1em',
                        borderRadius: '4px',
                        overflowX: 'auto',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: codeBlockTextColor, // Màu chữ trong khối code
                    },
                    '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        boxSizing: 'border-box',
                        border: selectedImage ? `2px solid ${inputFocusBorderColor}` : '1px solid transparent', // Highlight ảnh khi chọn
                        '&:hover': { outline: `1px dashed ${inputFocusBorderColor}` }, // Highlight ảnh khi hover
                    },
                    // Thêm màu cho các phần tử HTML mặc định khác nếu cần
                    '& a': { color: linkColor }, // Màu link
                }}
            />

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <Dialog
                open={openLinkDialog}
                onClose={() => setOpenLinkDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: dialogBgColor, // Nền dialog
                        color: dialogTextColor, // Màu chữ dialog
                    }
                }}
            >
                <DialogTitle sx={{ color: dialogTextColor }}>Chèn Liên Kết</DialogTitle>
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
                        InputLabelProps={{
                            sx: { color: inputLabelColor }, // Màu label input
                        }}
                        InputProps={{
                            sx: {
                                color: editorTextColor, // Màu chữ input
                                '.MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputHoverBorderColor },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: inputFocusBorderColor },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLinkDialog(false)} sx={{ color: theme.palette.text.secondary }}>Hủy</Button>
                    <Button onClick={handleInsertLink} variant="contained" sx={{
                        backgroundColor: theme.palette.primary.main, // Sử dụng primary.main
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark, // Sử dụng primary.dark
                        }
                    }}>Chèn</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default RichTextEditor;