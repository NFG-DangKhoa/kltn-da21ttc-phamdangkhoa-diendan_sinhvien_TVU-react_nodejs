// src/components/ui/card.js
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const CustomCard = ({ title, children }) => {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6">{title}</Typography>
                {children}
            </CardContent>
        </Card>
    );
};

export default CustomCard;
