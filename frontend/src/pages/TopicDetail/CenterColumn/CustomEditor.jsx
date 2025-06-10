import React, { useRef, useContext, useCallback, useEffect } from 'react';
import { Box, Paper, Typography, Fade, alpha, useTheme, Button, Stack, Divider } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';

const CustomEditor = ({ content, onContentChange }) => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const editorRef = useRef(null);

    const isDarkMode = mode === 'dark';

    // Debounced content change to avoid excessive calls
    const debouncedContentChange = useCallback(() => {
        if (editorRef.current) {
            const htmlContent = editorRef.current.innerHTML;
            onContentChange(htmlContent);
        }
    }, [onContentChange]);

    // Handle content change - ĐỊNH NGHĨA TRƯỚC với cursor preservation
    const handleContentChange = useCallback(() => {
        // Use setTimeout to debounce and avoid cursor jumping
        setTimeout(debouncedContentChange, 100);
    }, [debouncedContentChange]);

    // Initialize editor content
    useEffect(() => {
        if (editorRef.current && content) {
            console.log('🔄 Loading content into CustomEditor:', content.substring(0, 200));

            // Fix URLs in content before setting
            let fixedContent = content;
            // Fix relative URLs to absolute
            fixedContent = fixedContent.replace(/src="\/upload\//g, 'src="http://localhost:5000/upload/');
            // Fix wrong port URLs
            fixedContent = fixedContent.replace(/http:\/\/localhost:5173\/upload\//g, 'http://localhost:5000/upload/');
            // Ensure YouTube iframes have proper attributes
            fixedContent = fixedContent.replace(
                /<iframe([^>]*src=["'][^"']*youtube\.com\/embed\/[^"']*["'][^>]*)>/gi,
                '<iframe$1 frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>'
            );

            console.log('🔧 Fixed content URLs:', fixedContent.substring(0, 200));

            editorRef.current.innerHTML = fixedContent;

            // Check if images are loaded after setting content
            setTimeout(() => {
                const images = editorRef.current.querySelectorAll('img');
                console.log(`🖼️ Found ${images.length} images in CustomEditor`);
                images.forEach((img, index) => {
                    console.log(`📸 Editor Image ${index + 1}:`, {
                        src: img.src,
                        width: img.width,
                        height: img.height,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        complete: img.complete
                    });

                    // Add click handler for existing images
                    img.addEventListener('click', () => selectImage(img));

                    // Check loading status
                    if (img.complete && img.naturalWidth > 0) {
                        console.log(`✅ Editor Image ${index + 1} loaded successfully`);
                    } else {
                        console.log(`❌ Editor Image ${index + 1} failed to load`);
                        img.onload = () => console.log(`✅ Editor Image ${index + 1} loaded after retry`);
                        img.onerror = () => console.log(`❌ Editor Image ${index + 1} failed to load permanently`);
                    }
                });
            }, 500);
        }
    }, [content]);

    // Helper function to insert image element into editor
    const insertImageElement = (src, filename, type) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = type === 'external' ? 'External image' : 'Uploaded image';
        img.setAttribute('data-original-file', filename);
        img.setAttribute('data-image-type', type); // 'local' or 'external'
        img.style.cssText = `
            max-width: 100%;
            width: 300px;
            height: auto;
            margin: 16px auto;
            border-radius: 8px;
            display: block;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        // Add resize functionality
        img.addEventListener('click', () => selectImage(img));

        // Insert at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.collapse(false);
        } else {
            editorRef.current.appendChild(img);
        }

        handleContentChange();
        console.log(`🖼️ ${type === 'external' ? 'External' : 'Local'} image displayed in editor`);
    };

    // Helper function to insert image from file
    const insertImageFromFile = (file, defaultName) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            insertImageElement(dataUrl, file.name || defaultName, 'local');
        };
        reader.readAsDataURL(file);
    };

    // Helper function to insert image from URL
    const insertImageFromUrl = (url) => {
        // Create a temporary image to check if URL is valid
        const tempImg = new Image();
        tempImg.onload = () => {
            console.log('✅ External image URL is valid:', url);
            insertImageElement(url, 'external-image', 'external');
        };
        tempImg.onerror = () => {
            console.error('❌ Invalid image URL:', url);
            alert('URL ảnh không hợp lệ hoặc không thể truy cập.');
        };
        tempImg.src = url;
    };

    // Helper function to extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Helper function to insert YouTube video
    const insertYouTubeVideo = (url) => {
        const videoId = extractYouTubeId(url);

        if (!videoId) {
            console.error('❌ Invalid YouTube URL:', url);
            alert('URL YouTube không hợp lệ.');
            return;
        }

        console.log('✅ Valid YouTube URL, video ID:', videoId);

        // Create iframe element for YouTube embed
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.width = '560';
        iframe.height = '315';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('data-youtube-id', videoId);
        iframe.setAttribute('data-original-url', url);

        // Add styling
        iframe.style.cssText = `
            max-width: 100%;
            width: 560px;
            height: 315px;
            margin: 16px auto;
            border-radius: 8px;
            display: block;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        // Insert at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(iframe);
            range.collapse(false);
        } else {
            editorRef.current.appendChild(iframe);
        }

        handleContentChange();
        console.log('🎬 YouTube video embedded in editor');
    };

    // Handle paste events for images and URLs
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        // Check for image files first
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    console.log('📋 Pasted image file from clipboard:', file.name);
                    insertImageFromFile(file, 'pasted-image.png');
                    return;
                }
            }
        }

        // Check for text that might contain image URLs or YouTube URLs
        for (const item of items) {
            if (item.type === 'text/plain') {
                item.getAsString((text) => {
                    // Check for YouTube URLs first
                    const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/gi;
                    const youtubeMatches = text.match(youtubeUrlRegex);

                    if (youtubeMatches && youtubeMatches.length > 0) {
                        e.preventDefault();
                        console.log('📋 Pasted YouTube URL from clipboard:', youtubeMatches[0]);
                        insertYouTubeVideo(youtubeMatches[0]);
                        return;
                    }

                    // Check for image URLs
                    const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp)(?:\?[^\s]*)?)/gi;
                    const imageMatches = text.match(imageUrlRegex);

                    if (imageMatches && imageMatches.length > 0) {
                        e.preventDefault();
                        console.log('📋 Pasted image URL from clipboard:', imageMatches[0]);
                        insertImageFromUrl(imageMatches[0]);
                        return;
                    }
                });
                break;
            }
        }
    };

    // Add paste event listener for images
    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener('paste', handlePaste);
            return () => {
                editor.removeEventListener('paste', handlePaste);
            };
        }
    }, [handleContentChange]);

    // Format commands
    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    }, [handleContentChange]);

    // Image upload handler - chỉ hiển thị, không lưu file
    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    console.log('📤 Processing image for display:', file.name);
                    insertImageFromFile(file, file.name);
                } catch (error) {
                    console.error('❌ Image processing failed:', error);
                    alert('Lỗi khi xử lý ảnh. Vui lòng thử lại.');
                }
            }
        };
        input.click();
    }, [handleContentChange]);

    // YouTube upload handler
    const handleYouTubeUpload = useCallback(() => {
        const url = prompt('Nhập URL YouTube:');
        if (url && url.trim()) {
            insertYouTubeVideo(url.trim());
        }
    }, []);

    // Image selection and resize handles
    const selectImage = useCallback((img) => {
        // Remove existing selection
        document.querySelectorAll('.image-resize-container').forEach(container => {
            const originalImg = container.querySelector('img');
            container.parentNode.replaceChild(originalImg, container);
        });

        // Create resize container
        const container = document.createElement('div');
        container.className = 'image-resize-container';
        container.style.cssText = `
            position: relative;
            display: inline-block;
            border: 2px solid #1976d2;
            margin: 16px auto;
        `;

        // Wrap image in container
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);

        // Create resize handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${position}`;
            handle.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: #1976d2;
                border: 2px solid white;
                cursor: ${position}-resize;
                z-index: 1000;
            `;

            // Position handles
            switch (position) {
                case 'nw':
                    handle.style.top = '-6px';
                    handle.style.left = '-6px';
                    break;
                case 'ne':
                    handle.style.top = '-6px';
                    handle.style.right = '-6px';
                    break;
                case 'sw':
                    handle.style.bottom = '-6px';
                    handle.style.left = '-6px';
                    break;
                case 'se':
                    handle.style.bottom = '-6px';
                    handle.style.right = '-6px';
                    break;
            }

            // Add resize functionality
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = parseInt(window.getComputedStyle(img).width, 10);
                const startHeight = parseInt(window.getComputedStyle(img).height, 10);

                const handleMouseMove = (e) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    if (position.includes('e')) {
                        newWidth = startWidth + deltaX;
                    } else if (position.includes('w')) {
                        newWidth = startWidth - deltaX;
                    }

                    if (position.includes('s')) {
                        newHeight = startHeight + deltaY;
                    } else if (position.includes('n')) {
                        newHeight = startHeight - deltaY;
                    }

                    // Maintain aspect ratio
                    const aspectRatio = startWidth / startHeight;
                    if (e.shiftKey) {
                        newHeight = newWidth / aspectRatio;
                    }

                    // Apply constraints
                    newWidth = Math.max(50, Math.min(800, newWidth));
                    newHeight = Math.max(50, Math.min(600, newHeight));

                    img.style.width = newWidth + 'px';
                    img.style.height = newHeight + 'px';
                };

                const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    handleContentChange();
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });

            container.appendChild(handle);
        });

        // Click outside to deselect
        const handleClickOutside = (e) => {
            if (!container.contains(e.target)) {
                const originalImg = container.querySelector('img');
                container.parentNode.replaceChild(originalImg, container);
                document.removeEventListener('click', handleClickOutside);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

    }, [handleContentChange]);

    // Image resize functions
    const resizeSelectedImage = useCallback((size) => {
        const selectedContainer = document.querySelector('.image-resize-container');
        const img = selectedContainer ? selectedContainer.querySelector('img') :
            document.querySelector('#custom-editor img:last-of-type');

        if (img) {
            img.style.width = size;
            img.style.height = 'auto';
            handleContentChange();
            console.log(`🖼️ Image resized to: ${size}`);
        } else {
            alert('Vui lòng click vào ảnh trước khi thay đổi kích thước');
        }
    }, [handleContentChange]);

    // Image alignment functions
    const alignSelectedImage = useCallback((alignment) => {
        const selectedContainer = document.querySelector('.image-resize-container');
        const img = selectedContainer ? selectedContainer.querySelector('img') :
            document.querySelector('#custom-editor img:last-of-type');

        if (img) {
            img.style.display = 'block';
            img.style.float = 'none';

            switch (alignment) {
                case 'left':
                    img.style.margin = '16px auto 16px 0';
                    img.style.float = 'left';
                    break;
                case 'center':
                    img.style.margin = '16px auto';
                    break;
                case 'right':
                    img.style.margin = '16px 0 16px auto';
                    img.style.float = 'right';
                    break;
            }

            handleContentChange();
            console.log(`🖼️ Image aligned: ${alignment}`);
        } else {
            alert('Vui lòng click vào ảnh trước khi căn chỉnh');
        }
    }, [handleContentChange]);

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
                        Custom Editor với Image Resize
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ✨ Click ảnh để hiện resize handles • 🖱️ Kéo góc để resize • 🎯 Sử dụng controls để tùy chỉnh
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
                                onClick={handleImageUpload}
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

            {/* Toolbar */}
            <Fade in timeout={650}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: '12px 12px 0 0',
                        border: `1px solid ${theme.palette.divider}`,
                        borderBottom: 'none',
                        backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[50],
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Button size="small" onClick={() => execCommand('bold')} startIcon={<FormatBoldIcon />}>
                            Bold
                        </Button>
                        <Button size="small" onClick={() => execCommand('italic')} startIcon={<FormatItalicIcon />}>
                            Italic
                        </Button>
                        <Button size="small" onClick={() => execCommand('underline')} startIcon={<FormatUnderlinedIcon />}>
                            Underline
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <Button size="small" onClick={() => execCommand('insertUnorderedList')} startIcon={<FormatListBulletedIcon />}>
                            Bullet List
                        </Button>
                        <Button size="small" onClick={() => execCommand('insertOrderedList')} startIcon={<FormatListNumberedIcon />}>
                            Number List
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <Button size="small" onClick={handleImageUpload} startIcon={<ImageIcon />}>
                            Image
                        </Button>
                        <Button size="small" onClick={handleYouTubeUpload} startIcon={<span>🎬</span>}>
                            YouTube
                        </Button>
                    </Stack>
                </Paper>
            </Fade>

            {/* Editor */}
            <Fade in timeout={700}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '0 0 12px 12px',
                        overflow: 'hidden',
                        border: `2px solid ${theme.palette.divider}`,
                        borderTop: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&:focus-within': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                    }}
                >
                    <Box
                        id="custom-editor"
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => {
                            // Debounce input to prevent cursor jumping
                            clearTimeout(window.editorInputTimeout);
                            window.editorInputTimeout = setTimeout(() => {
                                debouncedContentChange();
                            }, 500); // 500ms debounce for typing
                        }}
                        sx={{
                            minHeight: '300px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: 1.7,
                            color: theme.palette.text.primary,
                            backgroundColor: theme.palette.background.paper,
                            outline: 'none',
                            '&:empty::before': {
                                content: '"✍️ Bắt đầu viết nội dung của bạn..."',
                                color: theme.palette.text.secondary,
                                fontStyle: 'italic',
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                margin: '16px 0',
                                display: 'block',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                },
                            },
                            '& .image-resize-container': {
                                display: 'inline-block',
                                position: 'relative',
                                margin: '16px auto',
                            },
                            '& .resize-handle': {
                                position: 'absolute',
                                width: '10px',
                                height: '10px',
                                background: theme.palette.primary.main,
                                border: '2px solid white',
                                borderRadius: '2px',
                                zIndex: 1000,
                            },
                        }}
                    />
                </Paper>
            </Fade>

            {/* Quick tips */}
            <Fade in timeout={900}>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💡 <strong>Pro tips:</strong> Click ảnh để hiện resize handles • Kéo góc để resize •
                        Shift + kéo để giữ tỷ lệ • Sử dụng buttons để resize/align nhanh
                    </Typography>
                </Box>
            </Fade>
        </Box>
    );
};

export default CustomEditor;
