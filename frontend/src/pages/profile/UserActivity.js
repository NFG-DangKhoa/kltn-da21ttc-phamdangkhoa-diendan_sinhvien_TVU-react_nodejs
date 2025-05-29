// src/components/UserActivity.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Alert, useTheme } from '@mui/material';
import ActivityCard from './ActivityCard';

const UserActivity = ({ currentTab, userId }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activities, setActivities] = useState([]);

    // Mock data for demonstration purposes
    const mockPosts = [
        { id: 1, title: 'Hướng dẫn sử dụng React Hooks hiệu quả', content: 'React Hooks đã thay đổi cách chúng ta viết các component trong React. Tìm hiểu cách tận dụng chúng để tối ưu hóa hiệu suất và khả năng tái sử dụng code.', timestamp: '2025-05-20T10:00:00Z', likes: 120, comments: 25, type: 'post', link: '/post/1' },
        { id: 2, title: 'Tối ưu hóa hiệu suất ứng dụng Next.js', content: 'Next.js là một framework mạnh mẽ cho React. Bài viết này sẽ đi sâu vào các kỹ thuật tối ưu hóa để ứng dụng của bạn chạy nhanh hơn.', timestamp: '2025-05-15T14:30:00Z', likes: 85, comments: 18, type: 'post', link: '/post/2' },
        { id: 3, title: 'Thiết kế UI/UX đẹp và thân thiện người dùng', content: 'Khám phá các nguyên tắc cơ bản và thực tiễn tốt nhất để tạo ra giao diện người dùng hấp dẫn và trải nghiệm người dùng mượt mà.', timestamp: '2025-05-10T09:00:00Z', likes: 150, comments: 30, type: 'post', link: '/post/3' },
    ];

    const mockComments = [
        { id: 1, content: 'Bình luận rất hay, cảm ơn bạn đã chia sẻ!', timestamp: '2025-05-28T18:00:00Z', likes: 10, targetTitle: 'React Hooks hiệu quả', link: '/post/1#comment-abc', type: 'comment' },
        { id: 2, content: 'Tôi đã thử cách này và hiệu suất cải thiện đáng kể.', timestamp: '2025-05-27T11:45:00Z', likes: 5, targetTitle: 'Tối ưu hóa Next.js', link: '/post/2#comment-xyz', type: 'comment' },
        { id: 3, content: 'Thật tuyệt vời! Một bài viết đầy đủ và dễ hiểu. Rất hữu ích cho những người mới bắt đầu.', timestamp: '2025-05-26T09:20:00Z', likes: 8, targetTitle: 'Thiết kế UI/UX đẹp', link: '/post/3#comment-def', type: 'comment' },
    ];

    const mockLikes = [
        { id: 1, title: '10 mẹo CSS bạn nên biết', timestamp: '2025-05-25T16:00:00Z', type: 'liked_post', link: '/post/4' },
        { id: 2, title: 'Bình luận về bài "JavaScript cơ bản"', timestamp: '2025-05-24T10:00:00Z', type: 'liked_comment', link: '/post/5#comment-ghi' },
    ];

    const mockAllActivity = [
        ...mockPosts.map(p => ({ ...p, activityType: 'Bài viết' })),
        ...mockComments.map(c => ({ ...c, activityType: 'Bình luận' })),
        ...mockLikes.map(l => ({ ...l, activityType: 'Thích' })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sắp xếp theo thời gian mới nhất

    useEffect(() => {
        setLoading(true);
        setError(null);
        let fetchedData = [];

        // Simulate API call delay
        setTimeout(() => {
            try {
                switch (currentTab) {
                    case 0: // Posts
                        fetchedData = mockPosts;
                        break;
                    case 1: // Comments
                        fetchedData = mockComments;
                        break;
                    case 2: // Likes
                        fetchedData = mockLikes;
                        break;
                    case 3: // Activity
                        fetchedData = mockAllActivity;
                        break;
                    default:
                        fetchedData = [];
                }
                setActivities(fetchedData);
            } catch (err) {
                setError('Không thể tải dữ liệu hoạt động. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 500); // Simulate network delay
    }, [currentTab, userId]); // Refetch when tab or userId changes

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (activities.length === 0) {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                    Chưa có hoạt động nào trong mục này.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {activities.map((activity) => (
                <ActivityCard
                    key={activity.id}
                    type={activity.activityType || activity.type} // Sử dụng activityType cho tab Hoạt động tổng hợp
                    title={activity.title || activity.targetTitle}
                    content={activity.content || (activity.type === 'liked_post' ? `Đã thích bài viết: "${activity.title}"` : `Đã thích bình luận: "${activity.title}"`)}
                    timestamp={activity.timestamp}
                    likes={activity.likes}
                    comments={activity.comments}
                    link={activity.link}
                />
            ))}
        </Box>
    );
};

export default UserActivity;