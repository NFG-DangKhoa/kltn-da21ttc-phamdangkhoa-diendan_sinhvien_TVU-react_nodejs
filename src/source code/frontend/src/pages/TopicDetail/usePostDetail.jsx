import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import socket from '../../socket'; // Adjust path if needed, ensure this is a connected socket instance

const usePostDetail = (topicId, postId, currentUser) => {
    const [postDetail, setPostDetail] = useState(null);
    const [comments, setComments] = useState([]); // State for comments
    const [currentCommentCount, setCurrentCommentCount] = useState(0);
    const [currentLikeCount, setCurrentLikeCount] = useState(0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState([]); // Stores user objects
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    // NEW: States for Rating
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [userRating, setUserRating] = useState(0); // Rating of the current user for this post (0 if not rated)
    const [allRatings, setAllRatings] = useState([]); // List of all detailed rating objects

    // Fetch post detail on initial load or topicId/postId change
    useEffect(() => {
        if (!topicId || !postId) {
            setPostDetail(null); // Clear postDetail if IDs are missing
            return;
        }

        const fetchPostDetail = async () => {
            try {
                // Lấy token từ localStorage
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(`http://localhost:5000/api/posts/topic/${topicId}/post/${postId}`, { headers });
                const fetchedPost = response.data;
                setPostDetail(fetchedPost);

                // Initialize comments, sort by creation date (newest first)
                const sortedComments = [...(fetchedPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(sortedComments);
                setCurrentCommentCount(fetchedPost.commentCount || fetchedPost.comments?.length || 0);

                // Initialize likes
                setCurrentLikeCount(fetchedPost.likeCount || 0);
                // CẬP NHẬT: Lấy trực tiếp mảng likedUsers từ fetchedPost
                const initialLikedUsers = fetchedPost.likedUsers || []; // SỬA ĐỔI TẠI ĐÂY
                setCurrentLikedUsers(initialLikedUsers);

                // Sử dụng isLikedByCurrentUser từ backend thay vì tự tính
                if (fetchedPost.hasOwnProperty('isLikedByCurrentUser')) {
                    setIsLikedByUser(fetchedPost.isLikedByCurrentUser);
                } else if (currentUser) {
                    // Fallback nếu backend chưa có field này
                    setIsLikedByUser(initialLikedUsers.some(user => user._id === currentUser._id));
                } else {
                    setIsLikedByUser(false);
                }

                // Reset rating states initially, fetchRatingData will populate them
                setAverageRating(0);
                setTotalRatings(0);
                setUserRating(0);
                setAllRatings([]);

            } catch (err) {
                console.error('Lỗi khi tải chi tiết bài viết:', err);
                setPostDetail(null);
            }
        };

        fetchPostDetail();
        // Also fetch rating data separately here, so it runs when postDetail is available
        // (will be called again by Socket.IO effect if postDetail is set)
        // No need to call fetchRatingData here explicitly, as the main useEffect will handle it
    }, [topicId, postId, currentUser]); // Added currentUser to dependency array for re-evaluation if user changes

    // NEW: Function to fetch rating data
    const fetchRatingData = useCallback(async () => {
        if (!postDetail?._id) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/ratings/post/${postDetail._id}`);
            const data = response.data;

            setAverageRating(data.averageRating);
            setTotalRatings(data.totalRatings);
            setAllRatings(data.ratings || []); // Store all detailed ratings

            if (currentUser && data.ratings) {
                const foundRating = data.ratings.find(r => r.userId?._id === currentUser._id);
                setUserRating(foundRating ? foundRating.rating : 0);
            } else {
                setUserRating(0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu đánh giá:', error);
            setAverageRating(0);
            setTotalRatings(0);
            setUserRating(0);
            setAllRatings([]);
        }
    }, [postDetail?._id, currentUser]);


    // Socket.IO Logic for Real-time Updates
    useEffect(() => {
        if (!postDetail?._id) return;

        console.log('Joining post room:', postDetail._id);
        socket.emit('joinPostRoom', postDetail._id);

        // NEW: Handle real-time rating updates
        const handleRatingUpdate = (data) => {
            console.log('Received ratingUpdated event:', data);
            if (data.postId === postDetail._id) {
                // Immediately update the average rating and total count
                setAverageRating(data.averageRating || 0);
                setTotalRatings(data.count || 0);

                // Also refetch all rating data to get the latest list of raters
                fetchRatingData();
            }
        };

        const handleNewComment = (newComment) => {
            if (newComment.postId === postDetail._id) {
                setComments(prevComments => {
                    if (newComment.parentCommentId) {
                        return prevComments.map(c => c._id === newComment.parentCommentId
                            ? { ...c, replies: Array.isArray(c.replies) ? [...c.replies, newComment] : [newComment], replyCount: (c.replyCount || 0) + 1 }
                            : c
                        );
                    }
                    return [newComment, ...prevComments];
                });

                setCurrentCommentCount(prevCount => prevCount + 1);

                setPostDetail(prevPost => {
                    if (!prevPost) return prevPost; // Đảm bảo prevPost không null
                    let updatedCommentsInPost = [...(prevPost.comments || [])];
                    if (newComment.parentCommentId) {
                        updatedCommentsInPost = updatedCommentsInPost.map(comment => {
                            if (comment._id === newComment.parentCommentId) {
                                const updatedReplies = Array.isArray(comment.replies) ? [...comment.replies, newComment] : [newComment];
                                return { ...comment, replies: updatedReplies, replyCount: (comment.replyCount || 0) + 1 };
                            }
                            return comment;
                        });
                    } else {
                        updatedCommentsInPost = [newComment, ...updatedCommentsInPost];
                    }
                    return { ...prevPost, comments: updatedCommentsInPost, commentCount: (prevPost.commentCount || 0) + 1 };
                });
            }
        };

        const handleDeletedComment = ({ commentId: deletedCommentId, postId: affectedPostId, parentCommentId }) => {
            if (affectedPostId === postDetail._id) {
                let commentRemoved = false;

                setComments(prevComments => {
                    if (parentCommentId) {
                        return prevComments.map(c => {
                            if (c._id === parentCommentId && c.replies) {
                                const initialReplyCount = c.replies.length;
                                const filteredReplies = c.replies.filter(reply => reply._id !== deletedCommentId);
                                if (filteredReplies.length < initialReplyCount) {
                                    commentRemoved = true;
                                }
                                return { ...c, replies: filteredReplies, replyCount: Math.max(0, (c.replyCount || 0) - 1) };
                            }
                            return c;
                        });
                    }
                    const initialCommentCount = prevComments.length;
                    const filteredComments = prevComments.filter(c => c._id !== deletedCommentId);
                    if (filteredComments.length < initialCommentCount) {
                        commentRemoved = true;
                    }
                    return filteredComments;
                });

                if (commentRemoved) {
                    setCurrentCommentCount(prevCount => Math.max(0, prevCount - 1));
                    setPostDetail(prevPost => {
                        if (!prevPost) return prevPost; // Đảm bảo prevPost không null
                        return {
                            ...prevPost,
                            commentCount: Math.max(0, (prevPost.commentCount || 0) - 1),
                            comments: prevPost.comments ? (parentCommentId
                                ? prevPost.comments.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.filter(r => r._id !== deletedCommentId), replyCount: Math.max(0, (c.replyCount || 0) - 1) } : c)
                                : prevPost.comments.filter(c => c._id !== deletedCommentId)
                            ) : []
                        };
                    });
                }
            }
        };

        const handleUpdatedComment = (updatedComment) => {
            if (updatedComment.postId === postDetail._id) {
                setComments(prevComments =>
                    prevComments.map(c => {
                        if (c._id === updatedComment._id) return updatedComment;
                        if (c.replies) {
                            return { ...c, replies: c.replies.map(r => r._id === updatedComment._id ? updatedComment : r) };
                        }
                        return c;
                    })
                );
                setPostDetail(prevPost => {
                    if (!prevPost) return prevPost; // Đảm bảo prevPost không null
                    return {
                        ...prevPost,
                        comments: prevPost.comments.map(comment => {
                            if (comment._id === updatedComment._id) return updatedComment;
                            if (comment.replies) {
                                return { ...comment, replies: comment.replies.map(reply => reply._id === updatedComment._id ? updatedComment : reply) };
                            }
                            return comment;
                        })
                    };
                });
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

                setPostDetail(prevPost => {
                    if (!prevPost) return prevPost; // Đảm bảo prevPost không null
                    // CẬP NHẬT: Thao tác với likedUsers thay vì likes
                    let updatedLikedUsersInPost = [...(prevPost.likedUsers || [])]; // SỬA ĐỔI TẠI ĐÂY
                    if (action === 'liked' && likedUser) {
                        if (!updatedLikedUsersInPost.some(user => user._id === likedUser._id)) {
                            updatedLikedUsersInPost = [...updatedLikedUsersInPost, likedUser];
                        }
                    } else if (action === 'unliked') {
                        updatedLikedUsersInPost = updatedLikedUsersInPost.filter(user => user._id !== userId);
                    }
                    // CẬP NHẬT: Trả về likedUsers thay vì likes
                    return { ...prevPost, likeCount: likeCount, likedUsers: updatedLikedUsersInPost }; // SỬA ĐỔI TẠI ĐÂY
                });
            }
        };

        const handleUpdatedPost = (updatedPost) => {
            if (updatedPost._id === postDetail._id) {
                setPostDetail(updatedPost);
                setCurrentCommentCount(updatedPost.commentCount || updatedPost.comments?.length || 0);
                setCurrentLikeCount(updatedPost.likeCount || 0);
                // CẬP NHẬT: Lấy trực tiếp từ updatedPost.likedUsers
                const updatedLikedUsers = updatedPost.likedUsers || []; // SỬA ĐỔI TẠI ĐÂY
                setCurrentLikedUsers(updatedLikedUsers);

                // Sử dụng isLikedByCurrentUser từ backend
                if (updatedPost.hasOwnProperty('isLikedByCurrentUser')) {
                    setIsLikedByUser(updatedPost.isLikedByCurrentUser);
                } else if (currentUser) {
                    // Fallback nếu backend chưa có field này
                    setIsLikedByUser(updatedLikedUsers.some(user => user._id === currentUser._id));
                } else {
                    setIsLikedByUser(false);
                }
                const sortedUpdatedComments = [...(updatedPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(sortedUpdatedComments);
            }
        };

        const handleDeletedPost = (deletedPostId) => {
            if (deletedPostId === postDetail._id) {
                setPostDetail(null);
                setComments([]);
                setCurrentCommentCount(0);
                setCurrentLikeCount(0);
                setCurrentLikedUsers([]);
                setIsLikedByUser(false);
                alert('Bài viết này đã bị xóa.');
            }
        };


        socket.on('ratingUpdated', handleRatingUpdate); // NEW: Listen for rating updates
        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('likeUpdate', handleLikeUpdate);
        socket.on('updatedPost', handleUpdatedPost);
        socket.on('deletedPost', handleDeletedPost);

        // Fetch initial rating data when component mounts or postDetail changes
        fetchRatingData();

        return () => {
            socket.emit('leavePostRoom', postDetail._id);
            socket.off('ratingUpdated', handleRatingUpdate); // NEW: Clean up rating listener
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
            socket.off('likeUpdate', handleLikeUpdate);
            socket.off('updatedPost', handleUpdatedPost);
            socket.off('deletedPost', handleDeletedPost);
        };
    }, [postDetail, currentUser, fetchRatingData]); // Added fetchRatingData to dependencies


    // API Call: Toggle Like
    const handleLikeToggle = useCallback(async () => {
        if (!currentUser) {
            alert('Bạn cần đăng nhập để thích bài viết.');
            return;
        }
        if (!postDetail?._id) {
            console.warn('Không có postDetail._id để thích/bỏ thích.');
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
            // Thêm đối tượng người dùng đầy đủ vào state
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


    const handleDeletePost = useCallback(async () => {
        if (!currentUser || !postDetail?._id) {
            alert('Bạn không có quyền hoặc không có bài viết để xóa.');
            return false;
        }

        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?");
        if (!confirmDelete) {
            return false;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Không tìm thấy token xác thực.');
            return false;
        }

        try {
            await axios.delete(`http://localhost:5000/api/posts/${postDetail._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Bài viết đã được xóa thành công!');
            setPostDetail(null);
            setComments([]);
            setCurrentCommentCount(0);
            setCurrentLikeCount(0);
            setCurrentLikedUsers([]);
            setIsLikedByUser(false);
            return true;
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
            alert('Không thể xóa bài viết. Vui lòng thử lại.');
            return false;
        }
    }, [currentUser, postDetail]);

    // NEW: Function to handle rating submission
    const handleRatePost = useCallback(async (postIdToRate, userIdToRate, ratingValue) => {
        try {
            // Optimistic update - immediately update user rating
            const previousUserRating = userRating;
            setUserRating(ratingValue);

            const token = localStorage.getItem('token');
            const payload = {
                postId: postIdToRate,
                userId: userIdToRate,
                rating: ratingValue
            };

            console.log('Submitting rating:', payload);
            const response = await axios.post('http://localhost:5000/api/ratings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status !== 200 && response.status !== 201) {
                const errorData = response.data;
                // Revert optimistic update on error
                setUserRating(previousUserRating);
                throw new Error(errorData.message || 'Failed to submit rating');
            }

            console.log('Rating submitted/updated successfully:', response.data);

            // Immediately fetch updated rating data for instant feedback
            setTimeout(() => {
                fetchRatingData();
            }, 100);

        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error.message || error);
            throw error;
        }
    }, [userRating, fetchRatingData]);


    return {
        postDetail,
        comments,
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
        handleDeletePost,
        averageRating,     // NEW: Expose averageRating
        totalRatings,      // NEW: Expose totalRatings
        userRating,        // NEW: Expose userRating
        allRatings,        // NEW: Expose allRatings
        handleRatePost,    // NEW: Expose handleRatePost
        setPostDetail,
        setComments,
    };
};

export default usePostDetail;