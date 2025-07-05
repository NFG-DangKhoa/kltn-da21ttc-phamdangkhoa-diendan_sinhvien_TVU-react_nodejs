import React, { useContext, useRef, useMemo, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    useTheme,
    alpha,
    Chip,
    Typography,
    Fade,
    Stack,
    ButtonGroup,
    Button,
    Tooltip
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../styles/quill-custom.css';
import { ThemeContext } from '../../../context/ThemeContext';
import {
    PhotoSizeSelectSmall as SmallIcon,
    PhotoSizeSelectActual as MediumIcon,
    PhotoSizeSelectLarge as LargeIcon,
    AspectRatio as FullIcon,
    FormatAlignCenter as CenterIcon,
    FormatAlignLeft as LeftIcon,
    FormatAlignRight as RightIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {
    AutoAwesome as MagicIcon,
    Keyboard as KeyboardIcon,
    Image as ImageIcon,
    Link as LinkIcon
} from '@mui/icons-material';

const RichTextEditor = ({ content, onContentChange }) => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const quillRef = useRef(null);

    const isDarkMode = mode === 'dark';

    // Enhanced image click handler with better controls
    const handleImageClick = useCallback((event) => {
        console.log('🖱️ Image clicked!', event.target);

        const img = event.target;
        if (img.tagName === 'IMG') {
            event.preventDefault();
            event.stopPropagation();

            console.log('✅ Image click handler triggered');

            // Remove existing controls
            const existingControls = document.querySelector('.image-controls-overlay');
            if (existingControls) {
                existingControls.remove();
            }

            // Create overlay controls
            const overlay = document.createElement('div');
            overlay.className = 'image-controls-overlay';

            const imgRect = img.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            overlay.style.cssText = `
                position: absolute;
                top: ${imgRect.top + scrollTop - 50}px;
                left: ${imgRect.left + scrollLeft}px;
                width: ${imgRect.width}px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 8px;
                padding: 8px;
                z-index: 1000;
                display: flex;
                gap: 4px;
                justify-content: center;
                animation: fadeInDown 0.2s ease;
            `;

            // Size buttons
            const sizes = [
                { label: '📱', width: '150px', tooltip: 'Nhỏ (150px)' },
                { label: '💻', width: '300px', tooltip: 'Vừa (300px)' },
                { label: '🖥️', width: '500px', tooltip: 'Lớn (500px)' },
                { label: '📺', width: '100%', tooltip: 'Rộng (100%)' }
            ];

            sizes.forEach(size => {
                const btn = document.createElement('button');
                btn.innerHTML = size.label;
                btn.title = size.tooltip;
                btn.style.cssText = `
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    color: #333;
                `;

                btn.addEventListener('mouseenter', () => {
                    btn.style.background = '#1976d2';
                    btn.style.color = 'white';
                    btn.style.transform = 'scale(1.1)';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(255, 255, 255, 0.9)';
                    btn.style.color = '#333';
                    btn.style.transform = 'scale(1)';
                });

                btn.addEventListener('click', () => {
                    img.style.width = size.width;
                    img.style.height = 'auto';
                    img.style.maxWidth = '100%';
                    overlay.remove();
                    if (quillRef.current) {
                        onContentChange(quillRef.current.getEditor().root.innerHTML);
                    }
                });

                overlay.appendChild(btn);
            });

            // Alignment buttons
            const alignments = [
                { label: '⬅️', align: 'left', tooltip: 'Căn trái' },
                { label: '⬆️', align: 'center', tooltip: 'Căn giữa' },
                { label: '➡️', align: 'right', tooltip: 'Căn phải' }
            ];

            // Add separator
            const separator = document.createElement('div');
            separator.style.cssText = `
                width: 1px;
                background: rgba(255, 255, 255, 0.3);
                margin: 0 4px;
            `;
            overlay.appendChild(separator);

            alignments.forEach(alignment => {
                const btn = document.createElement('button');
                btn.innerHTML = alignment.label;
                btn.title = alignment.tooltip;
                btn.style.cssText = `
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    color: #333;
                `;

                btn.addEventListener('mouseenter', () => {
                    btn.style.background = '#4caf50';
                    btn.style.color = 'white';
                    btn.style.transform = 'scale(1.1)';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(255, 255, 255, 0.9)';
                    btn.style.color = '#333';
                    btn.style.transform = 'scale(1)';
                });

                btn.addEventListener('click', () => {
                    // Reset all alignment styles
                    img.style.display = 'block';
                    img.style.margin = '16px auto';
                    img.style.float = 'none';

                    if (alignment.align === 'left') {
                        img.style.margin = '16px auto 16px 0';
                    } else if (alignment.align === 'right') {
                        img.style.margin = '16px 0 16px auto';
                    } else if (alignment.align === 'center') {
                        img.style.margin = '16px auto';
                    }

                    overlay.remove();
                    if (quillRef.current) {
                        onContentChange(quillRef.current.getEditor().root.innerHTML);
                    }
                });

                overlay.appendChild(btn);
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Xóa ảnh';
            deleteBtn.style.cssText = `
                background: rgba(244, 67, 54, 0.9);
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s ease;
                color: white;
                margin-left: 8px;
            `;

            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.background = '#d32f2f';
                deleteBtn.style.transform = 'scale(1.1)';
            });

            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.background = 'rgba(244, 67, 54, 0.9)';
                deleteBtn.style.transform = 'scale(1)';
            });

            deleteBtn.addEventListener('click', () => {
                img.remove();
                overlay.remove();
                if (quillRef.current) {
                    onContentChange(quillRef.current.getEditor().root.innerHTML);
                }
            });

            overlay.appendChild(deleteBtn);
            document.body.appendChild(overlay);

            // Auto remove after 10 seconds or when clicking elsewhere
            const removeOverlay = (e) => {
                if (!overlay.contains(e.target) && e.target !== img) {
                    overlay.remove();
                    document.removeEventListener('click', removeOverlay);
                }
            };

            setTimeout(() => {
                document.addEventListener('click', removeOverlay);
            }, 100);

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 10000);
        }
    }, [onContentChange]);

    // Function to attach image event listeners
    const attachImageListeners = useCallback(() => {
        if (quillRef.current) {
            const editorElement = quillRef.current.getEditor().root;
            const images = editorElement.querySelectorAll('img');

            console.log(`🖼️ Found ${images.length} images, attaching listeners...`);

            images.forEach((img, index) => {
                // Remove existing listeners to prevent duplicates
                img.removeEventListener('click', handleImageClick);

                // Add click listener
                img.addEventListener('click', handleImageClick);

                // Style the image
                img.style.cursor = 'pointer';
                img.style.border = '2px solid transparent';
                img.style.transition = 'all 0.2s ease';
                img.style.position = 'relative';

                // Add a visual indicator
                img.setAttribute('data-clickable', 'true');
                img.title = 'Click để thay đổi kích thước và căn chỉnh';

                // Add hover effects
                const handleMouseEnter = () => {
                    img.style.border = '2px solid #1976d2';
                    img.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                    img.style.transform = 'scale(1.02)';
                };

                const handleMouseLeave = () => {
                    img.style.border = '2px solid transparent';
                    img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    img.style.transform = 'scale(1)';
                };

                img.removeEventListener('mouseenter', handleMouseEnter);
                img.removeEventListener('mouseleave', handleMouseLeave);
                img.addEventListener('mouseenter', handleMouseEnter);
                img.addEventListener('mouseleave', handleMouseLeave);

                console.log(`✅ Image ${index + 1} listeners attached`);
            });
        }
    }, []);

    // Simple event delegation setup
    useEffect(() => {
        const timer = setTimeout(() => {
            if (quillRef.current) {
                const editorElement = quillRef.current.getEditor().root;

                // Simple click handler
                const handleClick = (event) => {
                    console.log('🔍 Click detected on:', event.target.tagName, event.target);

                    if (event.target.tagName === 'IMG') {
                        console.log('🖱️ Image clicked!', event.target);
                        console.log('🎯 Creating overlay controls...');

                        // Call the image click handler directly
                        const img = event.target;
                        event.preventDefault();
                        event.stopPropagation();

                        console.log('✅ Image click handler triggered');

                        // Remove existing controls
                        const existingControls = document.querySelector('.image-controls-overlay');
                        if (existingControls) {
                            existingControls.remove();
                        }

                        // Create overlay controls
                        const overlay = document.createElement('div');
                        overlay.className = 'image-controls-overlay';

                        const imgRect = img.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                        // Calculate better position
                        const overlayTop = Math.max(10, imgRect.top + scrollTop - 60);
                        const overlayLeft = imgRect.left + scrollLeft;

                        overlay.style.cssText = `
                            position: fixed;
                            top: ${Math.max(10, imgRect.top - 60)}px;
                            left: ${imgRect.left}px;
                            min-width: 300px;
                            background: rgba(0, 0, 0, 0.9);
                            border-radius: 12px;
                            padding: 12px;
                            z-index: 9999;
                            display: flex;
                            gap: 6px;
                            justify-content: center;
                            animation: fadeInDown 0.2s ease;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        `;

                        // Size buttons
                        const sizes = [
                            { label: '📱', width: '150px', tooltip: 'Nhỏ (150px)' },
                            { label: '💻', width: '300px', tooltip: 'Vừa (300px)' },
                            { label: '🖥️', width: '500px', tooltip: 'Lớn (500px)' },
                            { label: '📺', width: '100%', tooltip: 'Rộng (100%)' }
                        ];

                        sizes.forEach(size => {
                            const btn = document.createElement('button');
                            btn.innerHTML = size.label;
                            btn.title = size.tooltip;
                            btn.style.cssText = `
                                background: rgba(255, 255, 255, 0.95);
                                border: none;
                                padding: 10px 16px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 18px;
                                font-weight: bold;
                                transition: all 0.2s ease;
                                color: #333;
                                min-width: 50px;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                            `;

                            btn.addEventListener('mouseenter', () => {
                                btn.style.background = '#1976d2';
                                btn.style.color = 'white';
                                btn.style.transform = 'scale(1.1)';
                            });

                            btn.addEventListener('mouseleave', () => {
                                btn.style.background = 'rgba(255, 255, 255, 0.9)';
                                btn.style.color = '#333';
                                btn.style.transform = 'scale(1)';
                            });

                            btn.addEventListener('click', () => {
                                img.style.width = size.width;
                                img.style.height = 'auto';
                                img.style.maxWidth = '100%';
                                overlay.remove();
                                if (quillRef.current) {
                                    onContentChange(quillRef.current.getEditor().root.innerHTML);
                                }
                            });

                            overlay.appendChild(btn);
                        });

                        // Alignment buttons
                        const alignments = [
                            { label: '⬅️', align: 'left', tooltip: 'Căn trái' },
                            { label: '⬆️', align: 'center', tooltip: 'Căn giữa' },
                            { label: '➡️', align: 'right', tooltip: 'Căn phải' }
                        ];

                        // Add separator
                        const separator = document.createElement('div');
                        separator.style.cssText = `
                            width: 1px;
                            background: rgba(255, 255, 255, 0.3);
                            margin: 0 4px;
                        `;
                        overlay.appendChild(separator);

                        alignments.forEach(alignment => {
                            const btn = document.createElement('button');
                            btn.innerHTML = alignment.label;
                            btn.title = alignment.tooltip;
                            btn.style.cssText = `
                                background: rgba(255, 255, 255, 0.95);
                                border: none;
                                padding: 10px 16px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 18px;
                                font-weight: bold;
                                transition: all 0.2s ease;
                                color: #333;
                                min-width: 50px;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                            `;

                            btn.addEventListener('mouseenter', () => {
                                btn.style.background = '#4caf50';
                                btn.style.color = 'white';
                                btn.style.transform = 'scale(1.1)';
                            });

                            btn.addEventListener('mouseleave', () => {
                                btn.style.background = 'rgba(255, 255, 255, 0.9)';
                                btn.style.color = '#333';
                                btn.style.transform = 'scale(1)';
                            });

                            btn.addEventListener('click', () => {
                                // Reset all alignment styles
                                img.style.display = 'block';
                                img.style.margin = '16px auto';
                                img.style.float = 'none';

                                if (alignment.align === 'left') {
                                    img.style.margin = '16px auto 16px 0';
                                } else if (alignment.align === 'right') {
                                    img.style.margin = '16px 0 16px auto';
                                } else if (alignment.align === 'center') {
                                    img.style.margin = '16px auto';
                                }

                                overlay.remove();
                                if (quillRef.current) {
                                    onContentChange(quillRef.current.getEditor().root.innerHTML);
                                }
                            });

                            overlay.appendChild(btn);
                        });

                        // Delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.innerHTML = '🗑️';
                        deleteBtn.title = 'Xóa ảnh';
                        deleteBtn.style.cssText = `
                            background: rgba(244, 67, 54, 0.95);
                            border: none;
                            padding: 10px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 18px;
                            font-weight: bold;
                            transition: all 0.2s ease;
                            color: white;
                            margin-left: 12px;
                            min-width: 50px;
                            box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
                        `;

                        deleteBtn.addEventListener('mouseenter', () => {
                            deleteBtn.style.background = '#d32f2f';
                            deleteBtn.style.transform = 'scale(1.1)';
                        });

                        deleteBtn.addEventListener('mouseleave', () => {
                            deleteBtn.style.background = 'rgba(244, 67, 54, 0.9)';
                            deleteBtn.style.transform = 'scale(1)';
                        });

                        deleteBtn.addEventListener('click', () => {
                            img.remove();
                            overlay.remove();
                            if (quillRef.current) {
                                onContentChange(quillRef.current.getEditor().root.innerHTML);
                            }
                        });

                        overlay.appendChild(deleteBtn);
                        document.body.appendChild(overlay);

                        console.log('🎉 Overlay created and added to DOM!', overlay);
                        console.log('📍 Overlay position:', overlay.style.top, overlay.style.left);

                        // Auto remove after 10 seconds or when clicking elsewhere
                        const removeOverlay = (e) => {
                            if (!overlay.contains(e.target) && e.target !== img) {
                                overlay.remove();
                                document.removeEventListener('click', removeOverlay);
                            }
                        };

                        setTimeout(() => {
                            document.addEventListener('click', removeOverlay);
                        }, 100);

                        setTimeout(() => {
                            if (overlay.parentNode) {
                                overlay.remove();
                            }
                        }, 10000);
                    }
                };

                editorElement.addEventListener('click', handleClick);
                editorElement.addEventListener('dblclick', handleClick);

                console.log('🎯 Event listeners attached to editor');

                return () => {
                    editorElement.removeEventListener('click', handleClick);
                    editorElement.removeEventListener('dblclick', handleClick);
                };
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content, onContentChange]);

    // Custom image handler with size control
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('http://localhost:5000/api/uploads/image', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection();

                        // Insert image with controlled size
                        quill.insertEmbed(range.index, 'image', data.url);

                        // Set image size after insertion
                        setTimeout(() => {
                            const images = quill.container.querySelectorAll('img');
                            const lastImage = images[images.length - 1];
                            if (lastImage) {
                                lastImage.style.maxWidth = '100%';
                                lastImage.style.width = 'auto';
                                lastImage.style.height = 'auto';
                                lastImage.style.maxHeight = '400px';
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
                }
            }
        };
    }, []);

    // Handle paste events for images
    const handlePaste = useCallback(async (event) => {
        const clipboardData = event.clipboardData || window.clipboardData;
        const items = clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Handle image files from clipboard
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();

                if (file.size > 5 * 1024 * 1024) {
                    alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('http://localhost:5000/api/uploads/image', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection();

                        quill.insertEmbed(range.index, 'image', data.url);

                        // Set image size
                        setTimeout(() => {
                            const images = quill.container.querySelectorAll('img');
                            const lastImage = images[images.length - 1];
                            if (lastImage) {
                                lastImage.style.maxWidth = '100%';
                                lastImage.style.width = 'auto';
                                lastImage.style.height = 'auto';
                                lastImage.style.maxHeight = '400px';
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error uploading pasted image:', error);
                    alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
                }
                return;
            }

            // Handle image URLs from clipboard
            if (item.type === 'text/plain') {
                item.getAsString(async (text) => {
                    const imageUrlRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
                    if (imageUrlRegex.test(text.trim())) {
                        event.preventDefault();

                        try {
                            const response = await fetch('http://localhost:5000/api/uploads/image-url', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ imageUrl: text.trim() }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection();

                                quill.insertEmbed(range.index, 'image', data.url);

                                // Set image size
                                setTimeout(() => {
                                    const images = quill.container.querySelectorAll('img');
                                    const lastImage = images[images.length - 1];
                                    if (lastImage) {
                                        lastImage.style.maxWidth = '100%';
                                        lastImage.style.width = 'auto';
                                        lastImage.style.height = 'auto';
                                        lastImage.style.maxHeight = '400px';
                                    }
                                }, 100);
                            }
                        } catch (error) {
                            console.error('Error uploading image from URL:', error);
                            // Fallback: insert URL directly
                            const quill = quillRef.current.getEditor();
                            const range = quill.getSelection();
                            quill.insertEmbed(range.index, 'image', text.trim());
                        }
                    }
                });
            }
        }
    }, []);

    // Custom toolbar ID for React Quill
    const toolbarId = 'custom-toolbar';

    // Image resize handlers
    const resizeImage = useCallback((size) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();

            if (range) {
                const [leaf] = editor.getLeaf(range.index);
                if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
                    const img = leaf.domNode;
                    img.style.width = size;
                    img.style.height = 'auto';
                    img.style.maxWidth = '100%';
                    onContentChange(editor.root.innerHTML);
                    console.log(`🖼️ Image resized to: ${size}`);
                } else {
                    // Find selected image in a different way
                    const images = editor.root.querySelectorAll('img');
                    if (images.length > 0) {
                        const lastImage = images[images.length - 1];
                        lastImage.style.width = size;
                        lastImage.style.height = 'auto';
                        lastImage.style.maxWidth = '100%';
                        onContentChange(editor.root.innerHTML);
                        console.log(`🖼️ Last image resized to: ${size}`);
                    } else {
                        alert('Vui lòng chọn ảnh hoặc đặt con trỏ gần ảnh để thay đổi kích thước');
                    }
                }
            } else {
                // No selection, resize last image
                const images = editor.root.querySelectorAll('img');
                if (images.length > 0) {
                    const lastImage = images[images.length - 1];
                    lastImage.style.width = size;
                    lastImage.style.height = 'auto';
                    lastImage.style.maxWidth = '100%';
                    onContentChange(editor.root.innerHTML);
                    console.log(`🖼️ Last image resized to: ${size}`);
                } else {
                    alert('Không tìm thấy ảnh nào để thay đổi kích thước');
                }
            }
        }
    }, [onContentChange]);

    // Image alignment handlers
    const alignImage = useCallback((alignment) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();

            let targetImage = null;

            if (range) {
                const [leaf] = editor.getLeaf(range.index);
                if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
                    targetImage = leaf.domNode;
                }
            }

            if (!targetImage) {
                const images = editor.root.querySelectorAll('img');
                if (images.length > 0) {
                    targetImage = images[images.length - 1];
                } else {
                    alert('Không tìm thấy ảnh nào để căn chỉnh');
                    return;
                }
            }

            // Reset alignment styles
            targetImage.style.display = 'block';
            targetImage.style.margin = '16px auto';
            targetImage.style.float = 'none';

            // Apply new alignment
            switch (alignment) {
                case 'left':
                    targetImage.style.margin = '16px auto 16px 0';
                    break;
                case 'center':
                    targetImage.style.margin = '16px auto';
                    break;
                case 'right':
                    targetImage.style.margin = '16px 0 16px auto';
                    break;
            }

            onContentChange(editor.root.innerHTML);
            console.log(`🖼️ Image aligned: ${alignment}`);
        }
    }, [onContentChange]);

    // Quill modules configuration - simplified
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);

    // Quill formats
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background',
        'align', 'code-block'
    ];

    // Custom styles for Quill editor
    const quillStyles = {
        '& .ql-toolbar': {
            borderTop: `1px solid ${theme.palette.divider}`,
            borderLeft: `1px solid ${theme.palette.divider}`,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderBottom: 'none',
            backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[50],
            borderRadius: '12px 12px 0 0',
            padding: '12px 16px',
        },
        '& .ql-container': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderLeft: `1px solid ${theme.palette.divider}`,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            fontSize: '16px',
            fontFamily: theme.typography.fontFamily,
        },
        '& .ql-editor': {
            minHeight: '250px',
            padding: '20px',
            color: theme.palette.text.primary,
            lineHeight: 1.7,
            '&.ql-blank::before': {
                color: theme.palette.text.secondary,
                fontStyle: 'normal',
                opacity: 0.6,
                fontSize: '16px',
            },
            '& p': {
                marginBottom: '12px',
            },
            '& h1, & h2, & h3': {
                marginTop: '20px',
                marginBottom: '12px',
                fontWeight: 600,
                color: theme.palette.text.primary,
            },
            '& h1': {
                fontSize: '2rem',
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                paddingBottom: '8px',
            },
            '& h2': {
                fontSize: '1.5rem',
                color: theme.palette.primary.main,
            },
            '& h3': {
                fontSize: '1.25rem',
            },
            '& blockquote': {
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                paddingLeft: '16px',
                marginLeft: 0,
                fontStyle: 'italic',
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                padding: '16px 20px',
                borderRadius: '8px',
                margin: '16px 0',
            },
            '& pre': {
                backgroundColor: isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100],
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            },
            '& img': {
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                maxHeight: '400px',
                borderRadius: '12px',
                margin: '16px 0',
                boxShadow: theme.shadows[2],
                objectFit: 'contain',
                display: 'block',
            },
            '& a': {
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                    textDecoration: 'underline',
                },
            },
            '& ul, & ol': {
                paddingLeft: '24px',
                marginBottom: '16px',
            },
            '& li': {
                marginBottom: '4px',
            },
        },
        '& .ql-toolbar .ql-stroke': {
            stroke: theme.palette.text.primary,
        },
        '& .ql-toolbar .ql-fill': {
            fill: theme.palette.text.primary,
        },
        '& .ql-toolbar button': {
            borderRadius: '6px',
            margin: '0 2px',
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            '&.ql-active': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                color: theme.palette.primary.main,
            },
        },
        '& .ql-picker-label': {
            color: theme.palette.text.primary,
        },
        '& .ql-picker-options': {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: theme.shadows[8],
        },
    };

    // Custom Toolbar Component
    const CustomToolbar = () => (
        <Box id={toolbarId} sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[50],
            padding: '8px 12px',
        }}>
            {/* Row 1: Basic formatting */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="ql-header" defaultValue="">
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                    <option value="">Normal</option>
                </select>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <button className="ql-bold" title="Bold"></button>
                    <button className="ql-italic" title="Italic"></button>
                    <button className="ql-underline" title="Underline"></button>
                    <button className="ql-strike" title="Strike"></button>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <select className="ql-color" title="Text Color"></select>
                    <select className="ql-background" title="Background Color"></select>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <button className="ql-list" value="ordered" title="Ordered List"></button>
                    <button className="ql-list" value="bullet" title="Bullet List"></button>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <button className="ql-indent" value="-1" title="Decrease Indent"></button>
                    <button className="ql-indent" value="+1" title="Increase Indent"></button>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <select className="ql-align" title="Text Align"></select>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <button className="ql-blockquote" title="Blockquote"></button>
                    <button className="ql-code-block" title="Code Block"></button>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <button className="ql-link" title="Link"></button>
                    <button className="ql-image" title="Image"></button>
                    <button className="ql-video" title="Video"></button>
                </Box>

                <button className="ql-clean" title="Remove Formatting"></button>
            </Box>

            {/* Row 2: Image controls */}
            <Box sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                pt: 1,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                flexWrap: 'wrap'
            }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    📷 Ảnh:
                </Typography>

                {/* Image size controls */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-image-small"
                        onClick={() => resizeImage('150px')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.main,
                            }
                        }}
                    >
                        📱 Nhỏ
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-image-medium"
                        onClick={() => resizeImage('300px')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.main,
                            }
                        }}
                    >
                        💻 Vừa
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-image-large"
                        onClick={() => resizeImage('500px')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.main,
                            }
                        }}
                    >
                        🖥️ Lớn
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-image-full"
                        onClick={() => resizeImage('100%')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.main,
                            }
                        }}
                    >
                        📺 Rộng
                    </Button>
                </Box>

                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, ml: 2 }}>
                    📐 Căn chỉnh:
                </Typography>

                {/* Image alignment controls */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-align-left"
                        onClick={() => alignImage('left')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.success.main, 0.3),
                            color: theme.palette.success.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                borderColor: theme.palette.success.main,
                            }
                        }}
                    >
                        ⬅️ Trái
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-align-center"
                        onClick={() => alignImage('center')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.success.main, 0.3),
                            color: theme.palette.success.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                borderColor: theme.palette.success.main,
                            }
                        }}
                    >
                        ⬆️ Giữa
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        className="ql-align-right"
                        onClick={() => alignImage('right')}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            borderColor: alpha(theme.palette.success.main, 0.3),
                            color: theme.palette.success.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                borderColor: theme.palette.success.main,
                            }
                        }}
                    >
                        ➡️ Phải
                    </Button>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ mb: 3 }}>
            {/* Header with tips */}
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
                        <MagicIcon sx={{ color: theme.palette.primary.main }} />
                        Soạn thảo nội dung
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Sử dụng trình soạn thảo với toolbar mở rộng để tùy chỉnh ảnh dễ dàng
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

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Size controls */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Kích thước:
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => resizeImage('150px')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        borderColor: theme.palette.primary.main,
                                    }
                                }}
                            >
                                📱 Nhỏ
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => resizeImage('300px')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        borderColor: theme.palette.primary.main,
                                    }
                                }}
                            >
                                💻 Vừa
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => resizeImage('500px')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        borderColor: theme.palette.primary.main,
                                    }
                                }}
                            >
                                🖥️ Lớn
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => resizeImage('100%')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        borderColor: theme.palette.primary.main,
                                    }
                                }}
                            >
                                📺 Rộng
                            </Button>
                        </Box>

                        {/* Alignment controls */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Căn chỉnh:
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => alignImage('left')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                    color: theme.palette.success.main,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        borderColor: theme.palette.success.main,
                                    }
                                }}
                            >
                                ⬅️ Trái
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => alignImage('center')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                    color: theme.palette.success.main,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        borderColor: theme.palette.success.main,
                                    }
                                }}
                            >
                                ⬆️ Giữa
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => alignImage('right')}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                    color: theme.palette.success.main,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        borderColor: theme.palette.success.main,
                                    }
                                }}
                            >
                                ➡️ Phải
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Fade>

            {/* Quill Editor */}
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
                        ...quillStyles,
                    }}
                >
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={content}
                        onChange={(value) => {
                            onContentChange(value);
                            // Style images after content changes
                            setTimeout(() => {
                                if (quillRef.current) {
                                    const images = quillRef.current.getEditor().root.querySelectorAll('img');
                                    console.log(`📸 Styling ${images.length} images...`);
                                    images.forEach((img, i) => {
                                        img.style.cursor = 'pointer';
                                        img.style.border = '2px solid transparent';
                                        img.style.transition = 'all 0.2s ease';
                                        img.title = 'Click để thay đổi kích thước và căn chỉnh';

                                        // Add hover effect
                                        img.addEventListener('mouseenter', () => {
                                            img.style.border = '2px solid #1976d2';
                                            img.style.transform = 'scale(1.02)';
                                            img.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                                        });

                                        img.addEventListener('mouseleave', () => {
                                            img.style.border = '2px solid transparent';
                                            img.style.transform = 'scale(1)';
                                            img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                        });

                                        console.log(`✅ Image ${i + 1} styled and ready`);
                                    });
                                }
                            }, 300);
                        }}
                        modules={modules}
                        formats={formats}
                        onPaste={handlePaste}
                        placeholder="✍️ Bắt đầu viết nội dung của bạn...

💡 Mẹo hữu ích:
• Sử dụng tiêu đề (H1, H2, H3) để tổ chức nội dung
• Thêm hình ảnh bằng nút 📷 trong toolbar
• Sử dụng toolbar để thay đổi kích thước và căn chỉnh ảnh
• Sử dụng danh sách để dễ đọc
• Thêm liên kết để tham khảo
• Sử dụng blockquote để nhấn mạnh
• Thêm code block cho ví dụ lập trình
• Copy-paste ảnh từ web hoặc clipboard"
                        style={{
                            backgroundColor: 'transparent',
                        }}
                    />
                </Paper>
            </Fade>

            {/* Quick tips */}
            <Fade in timeout={900}>
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            icon={<KeyboardIcon />}
                            size="small"
                            label="Ctrl+B: In đậm"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                            }}
                        />
                        <Chip
                            icon={<ImageIcon />}
                            size="small"
                            label="📷 Toolbar: resize + căn chỉnh ảnh"
                            variant="outlined"
                            onClick={() => {
                                console.log('🔧 Testing image listeners...');
                                if (quillRef.current) {
                                    const images = quillRef.current.getEditor().root.querySelectorAll('img');
                                    console.log(`Found ${images.length} images`);
                                    images.forEach((img, i) => {
                                        img.style.border = '2px solid red';
                                        img.style.cursor = 'pointer';
                                        console.log(`Image ${i + 1} styled`);
                                    });
                                }
                            }}
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.text.secondary,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                            }}
                        />
                        <Chip
                            icon={<LinkIcon />}
                            size="small"
                            label="Ctrl+K: Liên kết"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                },
                            }}
                        />
                        <Chip
                            size="small"
                            label="🧪 Test Overlay"
                            variant="filled"
                            color="secondary"
                            onClick={() => {
                                console.log('🧪 Creating test overlay...');

                                // Create test overlay
                                const overlay = document.createElement('div');
                                overlay.className = 'image-controls-overlay';
                                overlay.style.cssText = `
                                    position: fixed;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    background: rgba(0, 0, 0, 0.8);
                                    border-radius: 8px;
                                    padding: 16px;
                                    z-index: 1000;
                                    display: flex;
                                    gap: 8px;
                                    color: white;
                                    font-family: Arial;
                                `;

                                overlay.innerHTML = `
                                    <button style="background: #1976d2; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">📱 Nhỏ</button>
                                    <button style="background: #1976d2; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">💻 Vừa</button>
                                    <button style="background: #1976d2; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🖥️ Lớn</button>
                                    <button style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">⬅️ Trái</button>
                                    <button style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">⬆️ Giữa</button>
                                    <button style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">➡️ Phải</button>
                                    <button style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️ Xóa</button>
                                `;

                                document.body.appendChild(overlay);

                                setTimeout(() => {
                                    overlay.remove();
                                }, 3000);

                                console.log('✅ Test overlay created!');
                            }}
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                cursor: 'pointer',
                            }}
                        />
                    </Stack>
                </Box>
            </Fade>
        </Box>
    );
};

export default RichTextEditor;
