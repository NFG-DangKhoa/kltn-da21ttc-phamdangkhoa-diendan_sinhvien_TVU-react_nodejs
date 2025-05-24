// src/components/ui/badge.js
import React from 'react';
import { Badge } from '@mui/material';

const CustomBadge = ({ status }) => {
    return (
        <Badge badgeContent={status} color={status === 'Hoạt động' ? 'success' : 'error'} />
    );
};

export default CustomBadge;
