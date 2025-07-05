import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import socket from '../../../socket'; // Sử dụng socket chung

const usePostInteractions = (initialPost, currentUser, setDetailedPosts) => {
    // Trạng thái cục bộ cho bài viết, sẽ được cập nhật khi có tương tác (like, comment, rating)
    const [post, setPost] = useState(initialPost);
    // Trạng thái cho danh sách bình luận đã sắp xếp
    const [comments, setComments] = useState([]);

    // States riêng cho Likes để quản lý Optimistic UI
    // currentLikedUsers sẽ lưu trữ MẢNG CÁC ĐỐI TƯỢNG NGƯỜI DÙNG (User objects)
    const [currentLikeCount, setCurrentLikeCount] = useState(initialPost.likeCount || 0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState([]); // Khởi tạo rỗng, sẽ được điền trong useEffect
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    // New states for Rating
    const [averageRating, setAverageRating] = useState(initialPost.averageRating || 0);
    const [totalRatings, setTotalRatings] = useState(initialPost.totalRatings || 0);
    const [userRating, setUserRating] = useState(0); // Rating của người dùng hiện tại cho bài đăng này (0 nếu chưa đánh giá)
    const [allRatings, setAllRatings] = useState([]); // NEW: Danh sách tất cả các đối tượng đánh giá

    // Socket sẽ được quản lý bởi ChatContext, không cần kết nối riêng ở đây

    // Đồng bộ post prop từ bên ngoài vào state nội bộ và khởi tạo các trạng thái liên quan
    useEffect(() => {
        if (initialPost) {
            setPost(initialPost);
            const sortedComments = [...(initialPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setComments(sortedComments);

            setCurrentLikeCount(initialPost.likeCount || 0);
            const initialLikedUsersArray = initialPost.likes?.map(like => like.userId).filter(Boolean) || [];
            setCurrentLikedUsers(initialLikedUsersArray);
            if (currentUser && initialLikedUsersArray.some(user => user._id === currentUser._id)) {
                setIsLikedByUser(true);
            } else {
                setIsLikedByUser(false);
            }

            setAverageRating(initialPost.averageRating || 0);
            setTotalRatings(initialPost.totalRatings || 0);
            setAllRatings([]); // Reset allRatings khi initialPost thay đổi
            setUserRating(0); // Đặt về 0 ban đầu, sẽ được fetch ở fetchRatingData
        }
    }, [initialPost, currentUser]);


    // Hàm fetch dữ liệu rating ban đầu và rating của người dùng hiện tại
    const fetchRatingData = useCallback(async () => {
        if (!post?._id) return; // Đảm bảo postId tồn tại

        try {
            const response = await axios.get(`http://localhost:5000/api/ratings/post/${post._id}`);
            const data = response.data; // axios tự động parse JSON

            setAverageRating(data.averageRating);
            setTotalRatings(data.totalRatings);
            setAllRatings(data.ratings || []); // NEW: Lưu trữ danh sách đầy đủ các đánh giá

            // Tìm rating của người dùng hiện tại
            if (currentUser && data.ratings) {
                const foundRating = data.ratings.find(r => r.userId?._id === currentUser._id); // `userId` ở đây là populated user object
                setUserRating(foundRating ? foundRating.rating : 0);
            } else {
                setUserRating(0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu đánh giá:', error);
            setAverageRating(0);
            setTotalRatings(0);
            setAllRatings([]);
            setUserRating(0);
        }
    }, [post?._id, currentUser]); // Phụ thuộc vào post._id và currentUser

    // Effect để lắng nghe Socket.IO và fetch dữ liệu ban đầu (kể cả rating)
    useEffect(() => {
        if (!post?._id) return;

        // Tham gia room của bài viết để nhận các cập nhật liên quan
        socket.emit('joinPostRoom', post._id);

        // Lắng nghe sự kiện 'ratingUpdated'
        const handleRatingUpdate = (data) => {
            if (data.postId === post._id) {
                // Thay vì chỉ cập nhật averageRating và totalRatings từ event,
                // chúng ta sẽ fetch lại toàn bộ dữ liệu rating để có danh sách chi tiết
                fetchRatingData();
            }
        };

        // Lắng nghe sự kiện 'newComment'
        const handleNewComment = (newComment) => {
            if (newComment.postId === post._id) {
                setPost(prevPost => {
                    let updatedComments = [...(prevPost.comments || [])];
                    if (newComment.parentCommentId) {
                        updatedComments = updatedComments.map(comment => {
                            if (comment._id === newComment.parentCommentId) {
                                const updatedReplies = Array.isArray(comment.replies) ? [...comment.replies, newComment] : [newComment];
                                return {
                                    ...comment,
                                    replies: updatedReplies,
                                    replyCount: (comment.replyCount || 0) + 1
                                };
                            }
                            return comment;
                        });
                    } else {
                        updatedComments = [newComment, ...updatedComments];
                    }
                    return { ...prevPost, comments: updatedComments, commentCount: (prevPost.commentCount || 0) + 1 };
                });
                setComments(prevComments => {
                    if (newComment.parentCommentId) {
                        return prevComments.map(c => c._id === newComment.parentCommentId
                            ? { ...c, replies: Array.isArray(c.replies) ? [...c.replies, newComment] : [newComment], replyCount: (c.replyCount || 0) + 1 }
                            : c
                        );
                    }
                    return [newComment, ...prevComments];
                });
            }
        };

        // Lắng nghe sự kiện 'deletedComment'
        const handleDeletedComment = ({ commentId, postId, parentCommentId }) => {
            if (postId === post._id) {
                setPost(prevPost => {
                    let updatedComments = [...(prevPost.comments || [])];
                    let commentRemoved = false;

                    if (parentCommentId) {
                        updatedComments = updatedComments.map(comment => {
                            if (comment._id === parentCommentId && comment.replies) {
                                const initialReplyCount = comment.replies.length;
                                const filteredReplies = comment.replies.filter(reply => reply._id !== commentId);
                                if (filteredReplies.length < initialReplyCount) {
                                    commentRemoved = true;
                                }
                                return {
                                    ...comment,
                                    replies: filteredReplies,
                                    replyCount: Math.max(0, (comment.replyCount || 0) - 1)
                                };
                            }
                            return comment;
                        });
                    } else {
                        const initialCommentCount = updatedComments.length;
                        updatedComments = updatedComments.filter(comment => comment._id !== commentId);
                        if (updatedComments.length < initialCommentCount) {
                            commentRemoved = true;
                        }
                    }

                    return {
                        ...prevPost,
                        comments: updatedComments,
                        commentCount: commentRemoved ? Math.max(0, (prevPost.commentCount || 0) - 1) : prevPost.commentCount
                    };
                });
                setComments(prevComments => {
                    if (parentCommentId) {
                        return prevComments.map(c => c._id === parentCommentId
                            ? { ...c, replies: c.replies?.filter(reply => reply._id !== commentId), replyCount: Math.max(0, (c.replyCount || 0) - 1) }
                            : c
                        );
                    }
                    return prevComments.filter(c => c._id !== commentId);
                });
            }
        };

        // Lắng nghe sự kiện 'updatedComment'
        const handleUpdatedComment = (updatedComment) => {
            if (updatedComment.postId === post._id) {
                setPost(prevPost => {
                    const updatedComments = prevPost.comments.map(comment => {
                        if (comment._id === updatedComment._id) {
                            return updatedComment;
                        }
                        if (comment.replies) {
                            const updatedReplies = comment.replies.map(reply =>
                                reply._id === updatedComment._id ? updatedComment : reply
                            );
                            return { ...comment, replies: updatedReplies };
                        }
                        return comment;
                    });
                    return { ...prevPost, comments: updatedComments };
                });
                setComments(prevComments =>
                    prevComments.map(c => {
                        if (c._id === updatedComment._id) return updatedComment;
                        if (c.replies) {
                            return { ...c, replies: c.replies.map(r => r._id === updatedComment._id ? updatedComment : r) };
                        }
                        return c;
                    })
                );
            }
        };

        // Lắng nghe sự kiện 'likeUpdate'
        const handleLikeUpdate = ({ targetId, targetType, likeCount, userId, action, likedUser }) => {
            if (targetType === 'post' && targetId === post._id) {
                setCurrentLikeCount(likeCount);
                if (action === 'liked' && likedUser) {
                    setCurrentLikedUsers(prevUsers => {
                        if (!prevUsers.some(u => u._id === likedUser._id)) {
                            return [...prevUsers, likedUser]; // Thêm trực tiếp user object
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

                setPost(prevPost => ({
                    ...prevPost,
                    likeCount: likeCount,
                    likes: action === 'liked' && likedUser
                        ? (prevPost.likes?.some(like => like.userId?._id === likedUser._id)
                            ? prevPost.likes
                            : [...(prevPost.likes || []), { _id: likedUser._id + '_gen', userId: likedUser }]
                        )
                        : prevPost.likes?.filter(like => like.userId?._id !== userId)
                }));
            }
        };

        // Lắng nghe sự kiện 'updatedPost' (khi bài viết được chỉnh sửa)
        const handleUpdatedPost = (updatedPostData) => {
            if (updatedPostData._id === post._id) {
                setPost(updatedPostData);
                if (typeof setDetailedPosts === 'function') {
                    setDetailedPosts(prevPosts =>
                        prevPosts.map(p => (p._id === updatedPostData._id ? updatedPostData : p))
                    );
                }
            }
        };

        // Đăng ký các listeners
        socket.on('ratingUpdated', handleRatingUpdate); // Đã cập nhật để gọi fetchRatingData
        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('likeUpdate', handleLikeUpdate);
        socket.on('updatedPost', handleUpdatedPost);

        // Fetch dữ liệu rating ban đầu khi component mount hoặc post._id thay đổi
        fetchRatingData();

        // Cleanup function: Hủy đăng ký các listeners và rời khỏi room
        return () => {
            if (post._id) {
                socket.off('ratingUpdated', handleRatingUpdate);
                socket.off('newComment', handleNewComment);
                socket.off('deletedComment', handleDeletedComment);
                socket.off('updatedComment', handleUpdatedComment);
                socket.off('likeUpdate', handleLikeUpdate);
                socket.off('updatedPost', handleUpdatedPost);
                socket.emit('leavePostRoom', post._id); // Rời khỏi room khi component unmount
            }
        };
    }, [post?._id, currentUser, setDetailedPosts, fetchRatingData, post]);

    // --- Post Deletion Logic ---
    const handleDeletePost = useCallback(async (postIdToDelete) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?");
        if (!confirmDelete) {
            return false;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${postIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Bài viết đã được xóa thành công!');
            if (setDetailedPosts) {
                setDetailedPosts(prevPosts => prevPosts.filter(p => p._id !== postIdToDelete));
            }
            return true;
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
            alert('Không thể xóa bài viết. Vui lòng thử lại.');
            return false;
        }
    }, [setDetailedPosts]);

    // --- Like Toggle Logic ---
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

        // --- Optimistic UI Update ---
        const prevIsLikedByUser = isLikedByUser;
        const prevLikeCount = currentLikeCount;
        const prevLikedUsers = [...currentLikedUsers];

        setIsLikedByUser(prev => !prev);
        setCurrentLikeCount(prev => (prevIsLikedByUser ? prev - 1 : prev + 1));
        if (prevIsLikedByUser) {
            setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== currentUser._id));
        } else {
            setCurrentLikedUsers(prevUsers => [...prevUsers, currentUser]); // Thêm trực tiếp user object
        }

        try {
            const endpoint = `http://localhost:5000/api/likes/toggle`;
            await axios.post(endpoint, {
                targetId: post._id,
                targetType: 'post'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Lỗi khi thích/bỏ thích bài viết:', error);
            alert('Lỗi khi xử lý lượt thích. Vui lòng thử lại.');
            // --- Rollback UI nếu có lỗi ---
            setIsLikedByUser(prevIsLikedByUser);
            setCurrentLikeCount(prevLikeCount);
            setCurrentLikedUsers(prevLikedUsers);
        }
    }, [post._id, currentUser, isLikedByUser, currentLikeCount, currentLikedUsers]);

    // --- Comment Logic ---
    const handleAddComment = useCallback(async (newCommentData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/comments', newCommentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status !== 201) throw new Error('Failed to add comment');
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            throw error;
        }
    }, []);

    const handleDeleteComment = useCallback(async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status !== 200) throw new Error('Failed to delete comment');
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            throw error;
        }
    }, []);

    const handleUpdateComment = useCallback(async (commentId, updatedContent) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/comments/${commentId}`, { content: updatedContent }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status !== 200) throw new Error('Failed to update comment');
            return response.data.comment; // Trả về comment đã cập nhật
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            throw error;
        }
    }, []);

    // --- Rating Logic ---
    const handleRatePost = useCallback(async (postIdToRate, userIdToRate, ratingValue) => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
                postId: postIdToRate,
                userId: userIdToRate, // userId ở đây là ObjectId string
                rating: ratingValue
            };

            const response = await axios.post('http://localhost:5000/api/ratings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status !== 200 && response.status !== 201) {
                const errorData = response.data;
                throw new Error(errorData.message || 'Failed to submit rating');
            }

            console.log('Rating submitted/updated:', response.data);
            setUserRating(ratingValue);
            // averageRating, totalRatings, và allRatings sẽ được cập nhật qua Socket.IO 'ratingUpdated' event
            // (vì handleRatingUpdate sẽ gọi fetchRatingData)
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error.message || error);
            throw error; // Ném lại lỗi để component gọi có thể xử lý (ví dụ: RatingDialog)
        }
    }, []);


    return {
        post, // Bài viết đã được cập nhật
        comments, // Bình luận đã sắp xếp
        currentCommentCount: post.commentCount || 0, // Dựa vào post.commentCount
        currentLikeCount,
        currentLikedUsers, // Trả về mảng các user object
        isLikedByUser,
        handleDeletePost,
        handleLikeToggle,
        handleAddComment,
        handleDeleteComment,
        handleUpdateComment,
        averageRating,    // Điểm trung bình
        totalRatings,     // Tổng số lượt đánh giá
        userRating,       // Đánh giá của người dùng hiện tại
        allRatings,       // NEW: Danh sách tất cả các đánh giá chi tiết
        handleRatePost,   // Hàm để gửi đánh giá
    };
};

export default usePostInteractions;
