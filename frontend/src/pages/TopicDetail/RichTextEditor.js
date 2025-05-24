import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange }) => {
    const quillRef = useRef(null);

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch('http://localhost:5000/api/images/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range?.index || 0, 'image', data.url);
            } catch (err) {
                console.error('Lỗi upload ảnh:', err);
            }
        };
    };

    const modules = {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['image'],
                ['clean'],
            ],
            handlers: {
                image: handleImageUpload,
            },
        },
    };

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            style={{ minHeight: '150px' }}
        />
    );
};

export default RichTextEditor;
