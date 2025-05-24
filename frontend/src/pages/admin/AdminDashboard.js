// src/pages/admin/AdminDashboard.js
import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import CustomCard from '../../components/ui/card';
import CustomButton from '../../components/ui/button';
import CustomTabs from '../../components/ui/tabs';
import CustomTable from '../../components/ui/table';

const AdminDashboard = () => {
    const [tabValue, setTabValue] = useState('posts'); // Trạng thái lưu giá trị tab

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue); // Xử lý thay đổi tab
    };

    const postData = [
        {
            title: 'Làm thế nào để học tốt hơn?',
            author: 'Nguyễn Văn A',
            time: '02/05/2025',
            actions: <CustomButton variant="contained">Duyệt</CustomButton>
        }
    ];

    return (
        <AdminLayout>
            {/* Các tab để chuyển đổi giữa bài viết, bình luận và thành viên */}
            <CustomTabs value={tabValue} onChange={handleTabChange} />

            {/* Hiển thị nội dung tùy theo tab đã chọn */}
            {tabValue === 'posts' && (
                <CustomCard title="Bài Viết Chờ Duyệt">
                    <CustomTable data={postData} />
                </CustomCard>
            )}
            {tabValue === 'comments' && (
                <CustomCard title="Bình Luận Cần Kiểm Duyệt">
                    <CustomTable data={postData} />
                </CustomCard>
            )}
            {tabValue === 'users' && (
                <CustomCard title="Danh Sách Thành Viên">
                    <CustomTable data={postData} />
                </CustomCard>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
