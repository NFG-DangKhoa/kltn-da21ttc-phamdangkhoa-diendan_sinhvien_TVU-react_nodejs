import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socket from '../../socket'; // Adjust path if needed

const usePostDetail = (topicId, postId, currentUser) => {
    const [postDetail, setPostDetail] = useState(null);
    const [currentCommentCount, setCurrentCommentCount] = useState(0);
    const [currentLikeCount, setCurrentLikeCount] = useState(0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState([]);
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    // Fetch post detail
    useEffect(() => {
        if (!topicId || !postId) return;

        const fetchPostDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/posts/topic/${topicId}/post/${postId}`);
                const fetchedPost = response.data;
                setPostDetail(fetchedPost);
                setCurrentCommentCount(fetchedPost.commentCount || fetchedPost.comments?.length || 0);
                setCurrentLikeCount(fetchedPost.likeCount || fetchedPost.likedUsers?.length || 0);
                setCurrentLikedUsers(fetchedPost.likedUsers || []);
                if (currentUser && fetchedPost.likedUsers) {
                    setIsLikedByUser(fetchedPost.likedUsers.some(like => like._id === currentUser._id));
                }
            } catch (err) {
                console.error('Lỗi khi tải chi tiết bài viết:', err);
                // Handle error (e.g., show a toast notification)
            }
        };
        fetchPostDetail();
    }, [topicId, postId, currentUser]); // Added currentUser to dependency array

    // Socket.IO Logic for Real-time Updates (similar to usePostInteractions)
    useEffect(() => {
        if (!postDetail?._id) return;

        socket.emit('joinPostRoom', postDetail._id);

        const handleNewComment = (comment) => {
            if (comment.postId === postDetail._id) {
                setCurrentCommentCount(prevCount => prevCount + 1);
                // Potentially update postDetail.comments if the full comment object is needed
            }
        };

        const handleDeletedComment = ({ commentId: deletedCommentId, postId: affectedPostId }) => {
            if (affectedPostId === postDetail._id) {
                setCurrentCommentCount(prevCount => Math.max(0, prevCount - 1));
            }
        };

        const handleLikeUpdate = ({ targetId, targetType, likeCount, userId, action, likedUser }) => {
            if (targetType === 'post' && targetId === postDetail._id) {
                setCurrentLikeCount(likeCount);
                if (action === 'liked' && likedUser) {
                    setCurrentLikedUsers(prevUsers => {
                        if (!prevUsers.some(u => u._id === likedUser._id)) {
                            return [...prevUsers, likedUser];
                        }
                        return prevUsers;
                    });
                    if (currentUser && likedUser._id === currentUser._id) {
                        setIsLikedByUser(true);
                    }
                } else if (action === 'unliked') {
                    setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
                    if (currentUser && userId === currentUser._id) {
                        setIsLikedByUser(false);
                    }
                }
            }
        };

        const handleUpdatedPost = (updatedPost) => {
            if (updatedPost._id === postDetail._id) {
                setPostDetail(updatedPost);
                setCurrentCommentCount(updatedPost.commentCount || updatedPost.comments?.length || 0);
                setCurrentLikeCount(updatedPost.likeCount || updatedPost.likedUsers?.length || 0);
                setCurrentLikedUsers(updatedPost.likedUsers || []);
                if (currentUser) {
                    setIsLikedByUser(updatedPost.likedUsers?.some(like => like._id === currentUser._id) || false);
                }
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('likeUpdate', handleLikeUpdate);
        socket.on('updatedPost', handleUpdatedPost);


        return () => {
            socket.emit('leavePostRoom', postDetail._id);
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('likeUpdate', handleLikeUpdate);
            socket.off('updatedPost', handleUpdatedPost);
        };
    }, [postDetail, currentUser]);

    // API Call: Toggle Like (similar to usePostInteractions)
    const handleLikeToggle = useCallback(async () => {
        if (!currentUser) {
            alert('Bạn cần đăng nhập để thích bài viết.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Không tìm thấy token xác thực.');
            return;
        }

        // Optimistic UI update
        const prevIsLikedByUser = isLikedByUser;
        const prevLikeCount = currentLikeCount;
        const prevLikedUsers = [...currentLikedUsers];

        setIsLikedByUser(prev => !prev);
        setCurrentLikeCount(prev => (prevIsLikedByUser ? prev - 1 : prev + 1));
        if (prevIsLikedByUser) {
            setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== currentUser._id));
        } else {
            setCurrentLikedUsers(prevUsers => [...prevUsers, { _id: currentUser._id, fullName: currentUser.fullName, avatarUrl: currentUser.avatarUrl }]);
        }

        try {
            await axios.post(`http://localhost:5000/api/likes/toggle`, {
                targetId: postDetail._id,
                targetType: 'post'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Lỗi khi thích/bỏ thích bài viết:', error);
            alert('Lỗi khi xử lý lượt thích. Vui lòng thử lại.');
            // Revert UI if API call fails
            setIsLikedByUser(prevIsLikedByUser);
            setCurrentLikeCount(prevLikeCount);
            setCurrentLikedUsers(prevLikedUsers);
        }
    }, [postDetail, currentUser, isLikedByUser, currentLikeCount, currentLikedUsers]);


    return {
        postDetail,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
        setPostDetail // Expose setPostDetail to allow external updates if needed
    };
};

export default usePostDetail;