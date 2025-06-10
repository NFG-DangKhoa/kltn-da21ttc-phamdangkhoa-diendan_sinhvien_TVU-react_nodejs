import React, { useRef, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Paper, Typography, Fade, alpha, useTheme } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const TinyMCEEditor = ({ content, onContentChange }) => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const editorRef = useRef(null);

    const isDarkMode = mode === 'dark';

    // Image upload handler
    const handleImageUpload = (blobInfo, success, failure, progress) => {
        const formData = new FormData();
        formData.append('image', blobInfo.blob(), blobInfo.filename());

        // Show progress
        progress(0);

        fetch('http://localhost:5000/api/uploads/image', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                progress(50);
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                return response.json();
            })
            .then(data => {
                progress(100);
                success(data.url);
                console.log('🖼️ Image uploaded successfully:', data.url);
            })
            .catch(error => {
                console.error('❌ Image upload failed:', error);
                failure('Image upload failed: ' + error.message);
            });
    };

    // TinyMCE configuration
    const editorConfig = {
        height: 400,
        menubar: false,
        branding: false,
        statusbar: false,

        // Plugins for rich editing and image handling
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'imagetools',
            'paste', 'autoresize'
        ],

        // Comprehensive toolbar with image controls
        toolbar: [
            'undo redo | blocks | bold italic underline strikethrough | fontfamily fontsize',
            'forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            'link image media table | blockquote code | removeformat help'
        ].join(' | '),

        // Image configuration - THE MAGIC PART!
        image_title: true,
        image_description: false,
        automatic_uploads: true,
        file_picker_types: 'image',
        images_upload_handler: handleImageUpload,

        // Image editing tools - BUILT-IN RESIZE & ALIGNMENT!
        imagetools_cors_hosts: ['localhost'],
        imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',

        // Image resize handles - DRAG TO RESIZE!
        object_resizing: true,
        resize_img_proportional: true,

        // Image alignment options
        image_class_list: [
            { title: 'Responsive', value: 'img-responsive' },
            { title: 'Left align', value: 'img-left' },
            { title: 'Center align', value: 'img-center' },
            { title: 'Right align', value: 'img-right' }
        ],

        // Content styling
        content_style: `
            body { 
                font-family: ${theme.typography.fontFamily}; 
                font-size: 16px; 
                line-height: 1.7;
                color: ${isDarkMode ? '#ffffff' : '#333333'};
                background-color: ${isDarkMode ? '#1a1a1a' : '#ffffff'};
                padding: 20px;
            }
            
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                margin: 16px 0;
            }
            
            img.img-left {
                float: left;
                margin: 16px 16px 16px 0;
            }
            
            img.img-right {
                float: right;
                margin: 16px 0 16px 16px;
            }
            
            img.img-center {
                display: block;
                margin: 16px auto;
            }
            
            h1, h2, h3 {
                color: ${theme.palette.primary.main};
                margin-top: 24px;
                margin-bottom: 12px;
            }
            
            h1 {
                font-size: 2rem;
                border-bottom: 2px solid ${theme.palette.primary.main};
                padding-bottom: 8px;
            }
            
            blockquote {
                border-left: 4px solid ${theme.palette.primary.main};
                padding-left: 16px;
                margin-left: 0;
                font-style: italic;
                background-color: ${alpha(theme.palette.primary.main, 0.05)};
                padding: 16px 20px;
                border-radius: 8px;
                margin: 16px 0;
            }
            
            pre {
                background-color: ${isDarkMode ? '#2d2d2d' : '#f5f5f5'};
                padding: 16px;
                border-radius: 8px;
                overflow: auto;
                border: 1px solid ${theme.palette.divider};
            }
            
            a {
                color: ${theme.palette.primary.main};
                text-decoration: none;
            }
            
            a:hover {
                text-decoration: underline;
            }
        `,

        // Skin for dark/light mode
        skin: isDarkMode ? 'oxide-dark' : 'oxide',
        content_css: isDarkMode ? 'dark' : 'default',

        // Paste configuration
        paste_data_images: true,
        paste_as_text: false,

        // Setup callback
        setup: (editor) => {
            editor.on('change', () => {
                const content = editor.getContent();
                onContentChange(content);
            });

            editor.on('init', () => {
                console.log('✅ TinyMCE Editor initialized successfully!');
            });
        }
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
                        Soạn thảo nội dung với TinyMCE
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ✨ Kéo thả để resize ảnh • 🎯 Right-click ảnh để căn chỉnh • 🖼️ Drag & drop để upload
                    </Typography>
                </Box>
            </Fade>

            {/* TinyMCE Editor */}
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
                    }}
                >
                    <Editor
                        ref={editorRef}
                        apiKey="YOUR_API_KEY_HERE" // Thay bằng API key từ tiny.cloud
                        value={content}
                        init={editorConfig}
                        onEditorChange={(content) => onContentChange(content)}
                    />
                </Paper>
            </Fade>

            {/* Quick tips */}
            <Fade in timeout={900}>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💡 <strong>Pro tips:</strong> Kéo góc ảnh để resize • Right-click ảnh → Properties để căn chỉnh •
                        Drag & drop ảnh từ máy tính • Copy-paste ảnh từ web
                    </Typography>
                </Box>
            </Fade>
        </Box>
    );
};

export default TinyMCEEditor;
