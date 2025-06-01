// src/components/central/usePostInteractions.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: false });

const usePostInteractions = (initialPost, currentUser, setDetailedPosts) => {
    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState([]);

    // States riêng cho Likes để quản lý Optimistic UI
    // currentLikedUsers sẽ lưu trữ MẢNG CÁC ĐỐI TƯỢNG NGƯỜI DÙNG (User objects),
    // không phải Like objects có lồng User.
    const [currentLikeCount, setCurrentLikeCount] = useState(initialPost.likeCount || 0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState(initialPost.likes?.map(like => like.userId) || []); // CHỈNH SỬA Ở ĐÂY
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    const isSocketConnected = useRef(false);

    useEffect(() => {
        if (!isSocketConnected.current) {
            socket.connect();
            isSocketConnected.current = true;
        }
        return () => {
            // socket.disconnect(); // Tạm thời comment
            // isSocketConnected.current = false;
        };
    }, []);

    useEffect(() => {
        if (initialPost) {
            setPost(initialPost);
            const sortedComments = [...(initialPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setComments(sortedComments);

            // Cập nhật trạng thái like từ initialPost, đảm bảo lấy userId từ object like
            setCurrentLikeCount(initialPost.likeCount || 0);
            // CHỈNH SỬA Ở ĐÂY: Chuyển đổi mảng 'likes' thành mảng 'userId' (user object)
            const initialLikedUsers = initialPost.likes?.map(like => like.userId).filter(Boolean) || [];
            setCurrentLikedUsers(initialLikedUsers);
            if (currentUser && initialLikedUsers.some(user => user._id === currentUser._id)) {
                setIsLikedByUser(true);
            } else {
                setIsLikedByUser(false);
            }
        }
    }, [initialPost, currentUser]);

    useEffect(() => {
        if (!post?._id) return;

        socket.emit('joinPostRoom', post._id);

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

        const handleLikeUpdate = ({ targetId, targetType, likeCount, userId, action, likedUser }) => {
            if (targetType === 'post' && targetId === post._id) {
                setCurrentLikeCount(likeCount);
                if (action === 'liked' && likedUser) {
                    setCurrentLikedUsers(prevUsers => {
                        // CHỈNH SỬA Ở ĐÂY: Kiểm tra trực tiếp _id của user object
                        if (!prevUsers.some(u => u._id === likedUser._id)) {
                            return [...prevUsers, likedUser]; // Thêm trực tiếp user object
                        }
                        return prevUsers;
                    });
                    if (currentUser && likedUser._id === currentUser._id) {
                        setIsLikedByUser(true);
                    }
                } else if (action === 'unliked') {
                    // CHỈNH SỬA Ở ĐÂY: Lọc bỏ user object theo _id
                    setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
                    if (currentUser && userId === currentUser._id) {
                        setIsLikedByUser(false);
                    }
                }

                // Cập nhật post object chính cũng cần khớp cấu trúc
                setPost(prevPost => ({
                    ...prevPost,
                    likeCount: likeCount,
                    // CHỈNH SỬA Ở ĐÂY: Đảm bảo 'likes' trong 'post' cũng có cấu trúc tương tự server
                    // Giả định server gửi về 'likes' là một mảng các đối tượng like đầy đủ
                    // Ví dụ: [{ _id: 'like_id', userId: { _id: 'user_id', fullName: '...' } }, ...]
                    likes: action === 'liked' && likedUser
                        ? (prevPost.likes?.some(like => like.userId?._id === likedUser._id)
                            ? prevPost.likes // đã có, không thêm
                            : [...(prevPost.likes || []), { _id: likedUser._id + '_real_like', userId: likedUser }] // Thêm like object với userId là user object
                        )
                        : prevPost.likes?.filter(like => like.userId?._id !== userId)
                }));
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('likeUpdate', handleLikeUpdate);

        return () => {
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
            socket.off('likeUpdate', handleLikeUpdate);
            socket.emit('leavePostRoom', post._id);
        };
    }, [post?._id, currentUser, setDetailedPosts, post]);

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
            // CHỈNH SỬA Ở ĐÂY: Lọc bỏ user object theo _id
            setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== currentUser._id));
        } else {
            // CHỈNH SỬA Ở ĐÂY: Thêm trực tiếp user object (hoặc cấu trúc khớp với expected)
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

    return {
        post,
        comments,
        currentCommentCount: post.commentCount || 0,
        currentLikeCount,
        currentLikedUsers, // Trả về mảng các user object
        isLikedByUser,
        handleDeletePost,
        handleLikeToggle,
        setImageContentKey: (key) => setPost(prevPost => ({ ...prevPost, imageContentKey: key }))
    };
};

export default usePostInteractions;