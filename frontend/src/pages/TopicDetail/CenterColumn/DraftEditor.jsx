import React, { useState, useContext, useCallback, useRef } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Box, Paper, Typography, Fade, alpha, useTheme, Button, Stack } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const DraftEditor = ({ content, onContentChange }) => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const editorRef = useRef(null);

    const isDarkMode = mode === 'dark';

    // Initialize editor state
    const [editorState, setEditorState] = useState(() => {
        if (content) {
            const contentBlock = htmlToDraft(content);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                return EditorState.createWithContent(contentState);
            }
        }
        return EditorState.createEmpty();
    });

    // Handle editor change
    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
        onContentChange(htmlContent);
    };

    // Image upload handler
    const uploadImageCallBack = (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);

            fetch('http://localhost:5000/api/uploads/image', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    console.log('🖼️ Image uploaded successfully:', data.url);
                    resolve({ data: { link: data.url } });
                })
                .catch(error => {
                    console.error('❌ Image upload failed:', error);
                    reject(error);
                });
        });
    };

    // Custom image upload handler
    const handleCustomImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    console.log('📤 Uploading image:', file.name);

                    const formData = new FormData();
                    formData.append('image', file);

                    const response = await fetch('http://localhost:5000/api/uploads/image', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Upload successful, URL:', data.url);

                        // Method 1: Try Draft.js way with persistent styling
                        try {
                            const imageHtml = `<p><img src="${data.url}" alt="Uploaded image" width="300" style="max-width: 100%; height: auto; margin: 16px auto; border-radius: 8px; display: block;" /></p>`;
                            const contentBlock = htmlToDraft(imageHtml);
                            if (contentBlock) {
                                const newContentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);

                                // Merge with existing content
                                const newEditorState = EditorState.push(
                                    editorState,
                                    newContentState,
                                    'insert-fragment'
                                );

                                setEditorState(newEditorState);
                                const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
                                onContentChange(htmlContent);

                                console.log('🖼️ Image inserted via Draft.js method');
                                return;
                            }
                        } catch (draftError) {
                            console.log('⚠️ Draft.js method failed, trying DOM method');
                        }

                        // Method 2: Direct DOM manipulation
                        const editorElement = document.querySelector('.rdw-editor-main');
                        if (editorElement) {
                            editorElement.focus();

                            // Create image element
                            const img = document.createElement('img');
                            img.src = data.url;
                            img.alt = 'Uploaded image';
                            img.style.cssText = 'max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;';

                            // Create paragraph wrapper
                            const p = document.createElement('p');
                            p.appendChild(img);

                            // Insert at the end
                            editorElement.appendChild(p);

                            // Update content
                            const newHtml = editorElement.innerHTML;
                            onContentChange(newHtml);

                            console.log('🖼️ Image inserted via DOM method');
                        }

                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (error) {
                    console.error('❌ Image upload failed:', error);
                    alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
                }
            }
        };
        input.click();
    }, [editorState, setEditorState, onContentChange]);

    // Image resize functions - simplified approach
    const resizeSelectedImage = useCallback((size) => {
        const editorElement = document.querySelector('.rdw-editor-main');
        if (editorElement) {
            const images = editorElement.querySelectorAll('img');
            if (images.length > 0) {
                const lastImage = images[images.length - 1];

                // Apply styles and attributes
                lastImage.style.width = size;
                lastImage.style.height = 'auto';
                lastImage.style.maxWidth = '100%';

                // Set width attribute for persistence
                if (size === '100%') {
                    lastImage.removeAttribute('width');
                    lastImage.style.width = '100%';
                } else {
                    const widthValue = size.replace('px', '');
                    lastImage.setAttribute('width', widthValue);
                    lastImage.style.width = size;
                }

                // Add a class for CSS targeting
                lastImage.className = `resized-image size-${size.replace('px', '').replace('%', 'percent')}`;

                // Force a content update without recreating editor state
                setTimeout(() => {
                    const htmlContent = editorElement.innerHTML;
                    onContentChange(htmlContent);
                }, 100);

                console.log(`🖼️ Image resized to: ${size}`);
            } else {
                alert('Không tìm thấy ảnh nào để thay đổi kích thước');
            }
        }
    }, [onContentChange]);

    // Image alignment functions - simplified approach
    const alignSelectedImage = useCallback((alignment) => {
        const editorElement = document.querySelector('.rdw-editor-main');
        if (editorElement) {
            const images = editorElement.querySelectorAll('img');
            if (images.length > 0) {
                const lastImage = images[images.length - 1];

                // Reset alignment classes and styles
                lastImage.className = lastImage.className.replace(/align-\w+/g, '');
                lastImage.style.display = 'block';
                lastImage.style.margin = '16px auto';
                lastImage.style.float = 'none';

                // Apply new alignment
                switch (alignment) {
                    case 'left':
                        lastImage.style.margin = '16px 16px 16px 0';
                        lastImage.style.float = 'left';
                        lastImage.setAttribute('align', 'left');
                        lastImage.className += ' align-left';
                        break;
                    case 'center':
                        lastImage.style.margin = '16px auto';
                        lastImage.setAttribute('align', 'center');
                        lastImage.className += ' align-center';
                        break;
                    case 'right':
                        lastImage.style.margin = '16px 0 16px 16px';
                        lastImage.style.float = 'right';
                        lastImage.setAttribute('align', 'right');
                        lastImage.className += ' align-right';
                        break;
                }

                // Force a content update without recreating editor state
                setTimeout(() => {
                    const htmlContent = editorElement.innerHTML;
                    onContentChange(htmlContent);
                }, 100);

                console.log(`🖼️ Image aligned: ${alignment}`);
            } else {
                alert('Không tìm thấy ảnh nào để căn chỉnh');
            }
        }
    }, [onContentChange]);

    // Editor toolbar configuration
    const toolbarConfig = {
        options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
        inline: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
            options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
        },
        blockType: {
            inDropdown: true,
            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
        },
        fontSize: {
            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
        },
        fontFamily: {
            options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
        },
        list: {
            inDropdown: false,
            options: ['unordered', 'ordered', 'indent', 'outdent'],
        },
        textAlign: {
            inDropdown: false,
            options: ['left', 'center', 'right', 'justify'],
        },
        colorPicker: {
            colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
                'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)',
                'rgb(0,168,133)', 'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)',
                'rgb(40,50,78)', 'rgb(0,0,0)', 'rgb(247,218,100)', 'rgb(251,160,38)',
                'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)', 'rgb(239,239,239)',
                'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
                'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'],
        },
        link: {
            inDropdown: false,
            showOpenOptionOnHover: true,
            defaultTargetOption: '_self',
            options: ['link', 'unlink'],
        },
        emoji: {
            emojis: [
                '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗',
                '😙', '😚', '☺️', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
                '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑',
                '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰',
                '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇',
                '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '👻',
                '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
            ],
        },
        image: {
            uploadCallback: uploadImageCallBack,
            uploadEnabled: true,
            alignmentEnabled: true,
            previewImage: true,
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            alt: { present: false, mandatory: false },
            defaultSize: {
                height: 'auto',
                width: 'auto',
            },
        },
    };

    return (
        <Box sx={{ mb: 3 }}>
            {/* Header */}
            <Fade in timeout={500}>
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.text.primary,
                            fontWeight: 600
                        }}
                    >
                        <AutoAwesomeIcon sx={{ color: theme.palette.primary.main }} />
                        Soạn thảo nội dung với Draft.js
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ✨ Editor chuyên nghiệp • 🖼️ Upload ảnh dễ dàng • 🎯 Controls tùy chỉnh ảnh
                    </Typography>
                </Box>
            </Fade>

            {/* Image Controls Panel */}
            <Fade in timeout={600}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                        🖼️ Tùy chỉnh ảnh
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {/* Upload button */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Upload:
                            </Typography>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={() => {
                                    console.log('🔘 Upload button clicked');
                                    handleCustomImageUpload();
                                }}
                                sx={{
                                    minWidth: 'auto',
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    backgroundColor: theme.palette.success.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.success.dark,
                                    }
                                }}
                            >
                                📷 Chọn ảnh
                            </Button>
                        </Box>

                        {/* Size controls */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Kích thước:
                            </Typography>
                            <Button size="small" variant="outlined" onClick={() => resizeSelectedImage('150px')}>
                                📱 Nhỏ
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => resizeSelectedImage('300px')}>
                                💻 Vừa
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => resizeSelectedImage('500px')}>
                                🖥️ Lớn
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => resizeSelectedImage('100%')}>
                                📺 Rộng
                            </Button>
                        </Box>

                        {/* Alignment controls */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Căn chỉnh:
                            </Typography>
                            <Button size="small" variant="outlined" color="success" onClick={() => alignSelectedImage('left')}>
                                ⬅️ Trái
                            </Button>
                            <Button size="small" variant="outlined" color="success" onClick={() => alignSelectedImage('center')}>
                                ⬆️ Giữa
                            </Button>
                            <Button size="small" variant="outlined" color="success" onClick={() => alignSelectedImage('right')}>
                                ➡️ Phải
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Fade>

            {/* Draft.js Editor */}
            <Fade in timeout={700}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `2px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&:focus-within': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        // Custom styles for Draft.js
                        '& .rdw-editor-toolbar': {
                            backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[50],
                            border: 'none',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            padding: '12px 16px',
                        },
                        '& .rdw-editor-main': {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            minHeight: '300px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: 1.7,
                        },
                        '& .rdw-option-wrapper': {
                            border: 'none',
                            borderRadius: '6px',
                            margin: '0 2px',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                        },
                        '& .rdw-option-active': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                        },
                        // Fix image upload dialog
                        '& .rdw-image-modal': {
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[8],
                            padding: '20px',
                            minWidth: '400px',
                            zIndex: 9999,
                        },
                        '& .rdw-image-modal-header': {
                            backgroundColor: 'transparent',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            paddingBottom: '12px',
                            marginBottom: '16px',
                        },
                        '& .rdw-image-modal-header-option': {
                            color: theme.palette.text.primary,
                            fontSize: '16px',
                            fontWeight: 600,
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                        },
                        '& .rdw-image-modal-header-option-active': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                        },
                        '& .rdw-image-modal-size': {
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            marginBottom: '16px',
                        },
                        '& .rdw-image-modal-size-option': {
                            padding: '8px 12px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                        },
                        '& .rdw-image-modal-btn': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            minWidth: '80px',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                            '&:disabled': {
                                backgroundColor: theme.palette.grey[400],
                                cursor: 'not-allowed',
                            },
                        },
                        '& .rdw-image-modal-btn-cancel': {
                            backgroundColor: 'transparent',
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.divider}`,
                            marginRight: '12px',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.05),
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                            },
                        },
                        '& .rdw-image-modal-upload-option': {
                            border: `2px dashed ${theme.palette.divider}`,
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                        },
                        '& .rdw-image-modal-upload-option-label': {
                            color: theme.palette.text.primary,
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'block',
                            marginBottom: '8px',
                        },
                        '& .rdw-image-modal-upload-option-input': {
                            display: 'none',
                        },
                    }}
                >
                    <Editor
                        ref={editorRef}
                        editorState={editorState}
                        onEditorStateChange={onEditorStateChange}
                        toolbar={toolbarConfig}
                        placeholder="✍️ Bắt đầu viết nội dung của bạn...

💡 Mẹo hữu ích:
• Sử dụng toolbar để format text
• Click nút 📷 để upload ảnh
• Sử dụng panel phía trên để tùy chỉnh ảnh
• Drag & drop ảnh vào editor
• Copy-paste ảnh từ clipboard"
                    />
                </Paper>
            </Fade>

            {/* Quick tips */}
            <Fade in timeout={900}>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💡 <strong>Pro tips:</strong> Upload ảnh bằng nút 📷 • Sử dụng panel controls để resize/align •
                        Drag & drop ảnh từ máy tính • Copy-paste ảnh từ web
                    </Typography>
                </Box>
            </Fade>
        </Box>
    );
};

export default DraftEditor;
