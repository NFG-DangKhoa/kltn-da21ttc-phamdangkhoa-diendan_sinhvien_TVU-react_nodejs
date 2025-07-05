import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage'; // We will create this utility
import { Box, Slider, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const ImageCropper = ({ image, onCropComplete, onClose, aspect, cropShape = 'rect' }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = useCallback((crop) => {
        setCrop(crop);
    }, []);

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom);
    }, []);

    const onRotationChange = useCallback((rotation) => {
        setRotation(rotation);
    }, []);

    const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation
            );
            onCropComplete(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        }
    }, [image, croppedAreaPixels, rotation, onCropComplete, onClose]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Cắt ảnh</DialogTitle>
            <DialogContent dividers sx={{ position: 'relative', height: 400, background: '#333' }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onRotationChange={onRotationChange}
                    onCropComplete={onCropAreaChange}
                    cropShape={cropShape}
                    showGrid={true}
                />
            </DialogContent>
            <DialogActions sx={{ flexDirection: 'column', p: 2 }}>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography gutterBottom>Zoom</Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="zoom-slider"
                        onChange={(e, newZoom) => setZoom(newZoom)}
                    />
                </Box>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography gutterBottom>Xoay</Typography>
                    <Slider
                        value={rotation}
                        min={0}
                        max={360}
                        step={1}
                        aria-labelledby="rotation-slider"
                        onChange={(e, newRotation) => setRotation(newRotation)}
                    />
                </Box>
                <Button
                    onClick={showCroppedImage}
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    Hoàn tất
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageCropper;
