import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageModal = ({ selectedImage, onClose }) => {
    return (
        <Dialog open={!!selectedImage} onClose={onClose} maxWidth="md">
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: 'white', zIndex: 1 }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                <img
                    src={selectedImage}
                    alt="Preview"
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '80vh' }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ImageModal;
