// src/components/ui/tabs.js
import React from 'react';
import { Tabs, Tab } from '@mui/material';

const CustomTabs = ({ value, onChange }) => {
    return (
        <Tabs value={value} onChange={onChange} aria-label="simple tabs example">
            <Tab label="Bài Viết" value="posts" />
            <Tab label="Bình Luận" value="comments" />
            <Tab label="Thành Viên" value="users" />
        </Tabs>
    );
};

export default CustomTabs;
