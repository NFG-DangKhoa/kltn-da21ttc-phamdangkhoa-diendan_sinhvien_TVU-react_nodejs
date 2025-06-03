import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import socket from '../../socket'; // Adjust path if needed, ensure this is a connected socket instance

const usePostDetail = (topicId, postId, currentUser) => {
    const [postDetail, setPostDetail] = useState(null);
    const [comments, setComments] = useState([]); // State for comments
    const [currentCommentCount, setCurrentCommentCount] = useState(0);
    const [currentLikeCount, setCurrentLikeCount] = useState(0);
    const [currentLikedUsers, setCurrentLikedUsers] = useState([]); // Stores user objects
    const [isLikedByUser, setIsLikedByUser] = useState(false);

    // Fetch post detail on initial load or topicId/postId change
    useEffect(() => {
        if (!topicId || !postId) {
            setPostDetail(null); // Clear postDetail if IDs are missing
            return;
        }

        const fetchPostDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/posts/topic/${topicId}/post/${postId}`);
                const fetchedPost = response.data;
                setPostDetail(fetchedPost);

                // Initialize comments, sort by creation date (newest first)
                const sortedComments = [...(fetchedPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(sortedComments);
                setCurrentCommentCount(fetchedPost.commentCount || fetchedPost.comments?.length || 0);

                // Initialize likes
                setCurrentLikeCount(fetchedPost.likeCount || 0);
                // Ensure currentLikedUsers stores full user objects from the 'likes' array
                // Assuming 'likes' array contains objects like { _id: 'likeId', userId: { _id: 'userId', ... } }
                const initialLikedUsers = fetchedPost.likes?.map(like => like.userId).filter(Boolean) || [];
                setCurrentLikedUsers(initialLikedUsers);

                if (currentUser) {
                    setIsLikedByUser(initialLikedUsers.some(user => user._id === currentUser._id));
                } else {
                    setIsLikedByUser(false);
                }

            } catch (err) {
                console.error('Lỗi khi tải chi tiết bài viết:', err);
                // Handle error (e.g., show a toast notification, set postDetail to null)
                setPostDetail(null);
            }
        };
        fetchPostDetail();
    }, [topicId, postId, currentUser]); // Added currentUser to dependency array for re-evaluation if user changes

    // Socket.IO Logic for Real-time Updates
    useEffect(() => {
        if (!postDetail?._id) return;

        socket.emit('joinPostRoom', postDetail._id);

        const handleNewComment = (newComment) => {
            if (newComment.postId === postDetail._id) {
                // Update comments array
                setComments(prevComments => {
                    if (newComment.parentCommentId) {
                        return prevComments.map(c => c._id === newComment.parentCommentId
                            ? { ...c, replies: Array.isArray(c.replies) ? [...c.replies, newComment] : [newComment], replyCount: (c.replyCount || 0) + 1 }
                            : c
                        );
                    }
                    return [newComment, ...prevComments]; // Add new top-level comment to the beginning
                });

                // Update comment count
                setCurrentCommentCount(prevCount => prevCount + 1);

                // Also update postDetail.comments for consistency if needed by other parts of postDetail
                setPostDetail(prevPost => {
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
                    setPostDetail(prevPost => ({
                        ...prevPost,
                        commentCount: Math.max(0, (prevPost.commentCount || 0) - 1),
                        // Potentially update postDetail.comments here too if you rely on that
                        comments: prevPost.comments ? (parentCommentId
                            ? prevPost.comments.map(c => c._id === parentCommentId ? { ...c, replies: c.replies.filter(r => r._id !== deletedCommentId), replyCount: Math.max(0, (c.replyCount || 0) - 1) } : c)
                            : prevPost.comments.filter(c => c._id !== deletedCommentId)
                        ) : []
                    }));
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
                // Also update postDetail.comments for consistency
                setPostDetail(prevPost => ({
                    ...prevPost,
                    comments: prevPost.comments.map(comment => {
                        if (comment._id === updatedComment._id) return updatedComment;
                        if (comment.replies) {
                            return { ...comment, replies: comment.replies.map(reply => reply._id === updatedComment._id ? updatedComment : reply) };
                        }
                        return comment;
                    })
                }));
            }
        };


        const handleLikeUpdate = ({ targetId, targetType, likeCount, userId, action, likedUser }) => {
            if (targetType === 'post' && targetId === postDetail._id) {
                setCurrentLikeCount(likeCount);

                if (action === 'liked' && likedUser) {
                    setCurrentLikedUsers(prevUsers => {
                        // Ensure no duplicates and add the new likedUser (full user object)
                        if (!prevUsers.some(u => u._id === likedUser._id)) {
                            return [...prevUsers, likedUser];
                        }
                        return prevUsers;
                    });
                    if (currentUser && likedUser._id === currentUser._id) {
                        setIsLikedByUser(true);
                    }
                } else if (action === 'unliked') {
                    setCurrentLikedUsers(prevUsers => prevUsers.filter(u => u._id !== userId)); // Filter by userId
                    if (currentUser && userId === currentUser._id) {
                        setIsLikedByUser(false);
                    }
                }

                // Update postDetail's likes array if it exists to keep it in sync
                setPostDetail(prevPost => {
                    let updatedLikes = [...(prevPost.likes || [])];
                    if (action === 'liked' && likedUser) {
                        // Add a like object with userId being the full likedUser object
                        if (!updatedLikes.some(like => like.userId?._id === likedUser._id)) {
                            updatedLikes = [...updatedLikes, { _id: `temp_like_${likedUser._id}`, userId: likedUser }];
                        }
                    } else if (action === 'unliked') {
                        updatedLikes = updatedLikes.filter(like => like.userId?._id !== userId);
                    }
                    return { ...prevPost, likeCount: likeCount, likes: updatedLikes };
                });
            }
        };

        const handleUpdatedPost = (updatedPost) => {
            if (updatedPost._id === postDetail._id) {
                setPostDetail(updatedPost);
                setCurrentCommentCount(updatedPost.commentCount || updatedPost.comments?.length || 0);
                setCurrentLikeCount(updatedPost.likeCount || updatedPost.likedUsers?.length || 0); // Assuming updatedPost might send likedUsers directly
                // Ensure currentLikedUsers is derived from 'likes' array if it exists in updatedPost
                const updatedLikedUsers = updatedPost.likes?.map(like => like.userId).filter(Boolean) || [];
                setCurrentLikedUsers(updatedLikedUsers);
                if (currentUser) {
                    setIsLikedByUser(updatedLikedUsers.some(user => user._id === currentUser._id));
                } else {
                    setIsLikedByUser(false);
                }
                // Also update the comments state if updatedPost contains comments
                const sortedUpdatedComments = [...(updatedPost.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(sortedUpdatedComments);
            }
        };

        const handleDeletedPost = (deletedPostId) => {
            if (deletedPostId === postDetail._id) {
                setPostDetail(null); // Clear the post detail if the current post is deleted
                setComments([]);
                setCurrentCommentCount(0);
                setCurrentLikeCount(0);
                setCurrentLikedUsers([]);
                setIsLikedByUser(false);
                alert('Bài viết này đã bị xóa.');
                // You might want to redirect the user or show a message here
            }
        };


        socket.on('newComment', handleNewComment);
        socket.on('deletedComment', handleDeletedComment);
        socket.on('updatedComment', handleUpdatedComment);
        socket.on('likeUpdate', handleLikeUpdate);
        socket.on('updatedPost', handleUpdatedPost);
        socket.on('deletedPost', handleDeletedPost); // Listen for post deletion

        return () => {
            socket.emit('leavePostRoom', postDetail._id);
            socket.off('newComment', handleNewComment);
            socket.off('deletedComment', handleDeletedComment);
            socket.off('updatedComment', handleUpdatedComment);
            socket.off('likeUpdate', handleLikeUpdate);
            socket.off('updatedPost', handleUpdatedPost);
            socket.off('deletedPost', handleDeletedPost);
        };
    }, [postDetail, currentUser]); // Depend on postDetail to ensure effects re-run if postDetail itself changes (e.g., from updatedPost event)

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
            // Add current user's essential info to the liked users list
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
            setPostDetail(null); // Clear postDetail immediately
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
    }, [currentUser, postDetail]); // Dependency on postDetail to ensure postId is available

    return {
        postDetail,
        comments, // Expose comments state
        currentCommentCount,
        currentLikeCount,
        currentLikedUsers,
        isLikedByUser,
        handleLikeToggle,
        handleDeletePost, // Expose delete function
        setPostDetail, // Expose setPostDetail to allow external updates if needed
        setComments, // Expose setComments to allow external manipulation if needed (e.g., for adding a new comment optimistically before socket confirms)
    };
};

export default usePostDetail;