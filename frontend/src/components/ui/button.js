// src/components/ui/button.js
import React from 'react';
import { Button } from '@mui/material';

const CustomButton = ({ variant = "contained", color = "primary", size = "medium", children, onClick }) => {
    return (
        <Button variant={variant} color={color} size={size} onClick={onClick}>
            {children}
        </Button>
    );
};

export default CustomButton;
