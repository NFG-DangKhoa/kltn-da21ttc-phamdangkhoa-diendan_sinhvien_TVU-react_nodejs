import { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';

// --- Helper Functions (moved from RichTextEditor.jsx) ---
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

export const IMAGE_SIZES = [
    { value: 150, label: 'Nhỏ (150px)' },
    { value: 300, label: 'Vừa (300px)' },
    { value: 500, label: 'Lớn (500px)' },
    { value: 700, label: 'Rộng (700px)' },
    { value: '100%', label: 'Đầy đủ (100%)' },
];

export const useRichTextEditor = (editorRef, content, onContentChange) => {
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageWidth, setImageWidth] = useState(IMAGE_SIZES[1].value);

    const [openLinkDialog, setOpenLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const currentSelectionRange = useRef(null);

    const [showImageControls, setShowImageControls] = useState(false);

    // --- Cập nhật nội dung editor khi prop 'content' thay đổi từ bên ngoài ---
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
    }, [content, editorRef]); // Add editorRef to dependencies

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
            onContentChange(editorRef.current.innerHTML);
            currentSelectionRange.current = getSelectionRange();
        };

        editorElement.addEventListener('click', handleEditorClick);
        editorElement.addEventListener('input', handleInput);
        editorElement.addEventListener('keyup', handleInput);

        return () => {
            editorElement.removeEventListener('click', handleEditorClick);
            editorElement.removeEventListener('input', handleInput);
            editorElement.removeEventListener('keyup', handleInput);
        };
    }, [onContentChange, editorRef]); // Add editorRef to dependencies

    const handleFormat = useCallback((command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            const range = getSelectionRange();
            document.execCommand(command, false, value);
            setSelectionRange(range);
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
        }
    }, [onContentChange, editorRef]);

    const handleHeader = useCallback((level) => {
        if (editorRef.current) {
            editorRef.current.focus();
            const range = getSelectionRange();
            document.execCommand('formatBlock', false, `<h${level}>`);
            setSelectionRange(range);
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
        }
    }, [onContentChange, editorRef]);

    const handleBold = () => handleFormat('bold');
    const handleItalic = () => handleFormat('italic');
    const handleUnderline = () => handleFormat('underline');
    const handleStrikethrough = () => handleFormat('strikeThrough');
    const handleCode = () => handleFormat('formatBlock', '<pre>');
    const handleUnorderedList = () => handleFormat('insertUnorderedList');

    const handleLinkClick = () => {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            currentSelectionRange.current = getSelectionRange();
            setOpenLinkDialog(true);
        } else {
            alert('Vui lòng chọn văn bản để tạo link.');
        }
    };

    const handleInsertLink = () => {
        if (editorRef.current && currentSelectionRange.current) {
            editorRef.current.focus();
            setSelectionRange(currentSelectionRange.current);
            handleFormat('createLink', linkUrl);
        }
        setOpenLinkDialog(false);
        setLinkUrl('');
        currentSelectionRange.current = null;
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const rangeBeforeFileRead = getSelectionRange();

        const reader = new FileReader();
        reader.onload = async (e) => {
            const tempBase64Url = e.target.result;
            const fileName = file.name;

            if (editorRef.current && rangeBeforeFileRead) {
                editorRef.current.focus();
                setSelectionRange(rangeBeforeFileRead);

                const initialWidth = IMAGE_SIZES[1].value;
                const widthStyle = typeof initialWidth === 'number' ? `${initialWidth}px` : initialWidth;

                document.execCommand('insertHTML', false, `<img src="${tempBase64Url}" data-filename="${fileName}" style="width:${widthStyle}; height:auto; display:block; margin:12px auto;">`);

                const imgs = editorRef.current.querySelectorAll(`img[src="${tempBase64Url}"]`);
                const insertedImg = imgs[imgs.length - 1];

                if (insertedImg) {
                    setSelectedImage(insertedImg);
                    setImageWidth(initialWidth);
                    setShowImageControls(true);
                }
                const newContent = editorRef.current.innerHTML;
                onContentChange(newContent);

                const newRange = document.createRange();
                newRange.setStartAfter(insertedImg);
                newRange.collapse(true);
                setSelectionRange(newRange);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = null;
    }, [onContentChange, editorRef]);

    const handleImageSizeChange = useCallback((event) => {
        const newValue = event.target.value;
        setImageWidth(newValue);
        if (selectedImage) {
            const widthStyle = typeof newValue === 'number' ? `${newValue}px` : newValue;
            selectedImage.style.width = widthStyle;
            selectedImage.style.height = 'auto';
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
            editorRef.current.focus();
            setSelectionRange(getSelectionRange());
        }
    }, [selectedImage, onContentChange, editorRef]);

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

            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
            editorRef.current.focus();
            setSelectionRange(getSelectionRange());
        } else {
            const range = getSelectionRange();
            handleFormat(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
            setSelectionRange(range);
        }
    }, [selectedImage, onContentChange, handleFormat, editorRef]);

    const handlePaste = useCallback(async (event) => {
        event.preventDefault();

        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        let handled = false;
        const currentRange = getSelectionRange();

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

                        setSelectionRange(currentRange);
                        document.execCommand('insertHTML', false, imgTag);
                        const newContent = editorRef.current.innerHTML;
                        onContentChange(newContent);

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

                    setSelectionRange(currentRange);
                    document.execCommand('insertHTML', false, imgTag);
                    const newContent = editorRef.current.innerHTML;
                    onContentChange(newContent);

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
                    setSelectionRange(currentRange);
                    const sanitizedHtml = DOMPurify.sanitize(tempDiv.innerHTML);
                    document.execCommand('insertHTML', false, sanitizedHtml);
                    const newContent = editorRef.current.innerHTML;
                    onContentChange(newContent);
                    handled = true;
                    break;
                } else {
                    setSelectionRange(currentRange);
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
            const text = await new Promise(resolve => items[0].getAsString(resolve));
            setSelectionRange(currentRange);
            document.execCommand('insertText', false, text);
            const newContent = editorRef.current.innerHTML;
            onContentChange(newContent);
        }
    }, [onContentChange, editorRef]);

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
    }, [handlePaste, editorRef]); // Add editorRef to dependencies

    return {
        fileInputRef,
        selectedImage,
        imageWidth,
        openLinkDialog,
        setOpenLinkDialog,
        linkUrl,
        setLinkUrl,
        showImageControls,
        handleBold,
        handleItalic,
        handleUnderline,
        handleStrikethrough,
        handleCode,
        handleUnorderedList,
        handleLinkClick,
        handleInsertLink,
        handleImageClick,
        handleFileChange,
        handleImageSizeChange,
        handleAlign,
        handleHeader, // Expose handleHeader
    };
};