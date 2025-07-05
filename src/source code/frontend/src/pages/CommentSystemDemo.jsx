import React, { useState, useRef, useContext } from 'react';
import {
    Box, Typography, Paper, Container, Grid, Card, CardContent, Button,
    Divider, Avatar, Chip, Stack
} from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import RichCommentEditor from '../components/RichCommentEditor';
import CommentReactions from '../components/CommentReactions';
import CommentMentions, { useMentions } from '../components/CommentMentions';

const CommentSystemDemo = () => {
    const { mode } = useContext(ThemeContext);
    const darkMode = mode === 'dark';
    
    const textFieldRef = useRef(null);
    const { text, mentions, handleTextChange, handleMention } = useMentions();
    
    const [comments, setComments] = useState([
        {
            _id: '1',
            content: 'Đây là một bình luận demo với @admin và emoji 😀',
            authorId: {
                _id: 'user1',
                username: 'john_doe',
                fullName: 'John Doe',
                avatarUrl: null
            },
            createdAt: new Date().toISOString(),
            reactions: {
                like: 5,
                love: 2,
                laugh: 1,
                fire: 3
            },
            userReaction: 'like',
            level: 0,
            replyCount: 2,
            likeCount: 11
        },
        {
            _id: '2',
            content: 'Đây là một reply với **text đậm** và *text nghiêng*',
            authorId: {
                _id: 'user2',
                username: 'jane_smith',
                fullName: 'Jane Smith',
                avatarUrl: null
            },
            createdAt: new Date().toISOString(),
            reactions: {
                like: 3,
                love: 1
            },
            userReaction: null,
            level: 1,
            replyCount: 0,
            likeCount: 4
        }
    ]);
    
    const [replyingTo, setReplyingTo] = useState(null);

    const handleSubmitComment = () => {
        if (!text.trim()) return;
        
        const newComment = {
            _id: Date.now().toString(),
            content: text,
            authorId: {
                _id: 'current_user',
                username: 'current_user',
                fullName: 'Current User',
                avatarUrl: null
            },
            createdAt: new Date().toISOString(),
            reactions: {},
            userReaction: null,
            level: replyingTo ? 1 : 0,
            replyCount: 0,
            likeCount: 0,
            mentions: mentions
        };
        
        setComments(prev => [newComment, ...prev]);
        handleTextChange('');
        setReplyingTo(null);
    };

    const handleReaction = (commentId, reactionType) => {
        setComments(prev => prev.map(comment => {
            if (comment._id === commentId) {
                const newReactions = { ...comment.reactions };
                const currentUserReaction = comment.userReaction;
                
                // Remove previous reaction
                if (currentUserReaction && newReactions[currentUserReaction]) {
                    newReactions[currentUserReaction] = Math.max(0, newReactions[currentUserReaction] - 1);
                }
                
                // Add new reaction
                if (reactionType && reactionType !== currentUserReaction) {
                    newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
                }
                
                return {
                    ...comment,
                    reactions: newReactions,
                    userReaction: reactionType === currentUserReaction ? null : reactionType
                };
            }
            return comment;
        }));
    };

    const renderComment = (comment) => (
        <Card 
            key={comment._id} 
            sx={{ 
                mb: 2, 
                ml: comment.level * 3,
                backgroundColor: darkMode ? '#2d2d2d' : '#fff',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                        src={comment.authorId.avatarUrl}
                        sx={{ width: 32, height: 32, mr: 1 }}
                    >
                        {comment.authorId.fullName[0]}
                    </Avatar>
                    <Box flexGrow={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {comment.authorId.fullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            @{comment.authorId.username} • {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    {comment.level > 0 && (
                        <Chip label={`Cấp ${comment.level}`} size="small" variant="outlined" />
                    )}
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {comment.content}
                </Typography>
                
                {comment.mentions && comment.mentions.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Mentions:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {comment.mentions.map((mention, index) => (
                                <Chip
                                    key={index}
                                    label={`@${mention.username}`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
                
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <CommentReactions
                        commentId={comment._id}
                        reactions={comment.reactions}
                        userReaction={comment.userReaction}
                        onReact={handleReaction}
                        size="small"
                    />
                    
                    <Button
                        size="small"
                        onClick={() => setReplyingTo(comment)}
                        sx={{ textTransform: 'none' }}
                    >
                        Trả lời
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
                🚀 Comment System Demo
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                Demo các tính năng mới của hệ thống bình luận: Rich text editor, Emoji picker, 
                Mentions, Reactions, và nhiều tính năng khác.
            </Typography>

            {/* Features Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                ✨ Tính năng mới
                            </Typography>
                            <ul style={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                <li>Rich text editor với formatting</li>
                                <li>Emoji picker với categories</li>
                                <li>User mentions (@username)</li>
                                <li>Multiple reactions (👍❤️😂🔥👎)</li>
                                <li>Nested comments với visual hierarchy</li>
                                <li>Real-time updates</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🎯 Admin Features
                            </Typography>
                            <ul style={{ color: darkMode ? '#b0b3b8' : 'text.secondary' }}>
                                <li>Advanced comment management</li>
                                <li>Bulk operations (approve/delete)</li>
                                <li>Search & filter comments</li>
                                <li>Comment statistics dashboard</li>
                                <li>Real-time moderation</li>
                                <li>Export comment data</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Comment Editor */}
            <Paper sx={{ p: 3, mb: 4, backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                <Typography variant="h6" gutterBottom>
                    💬 Rich Comment Editor
                </Typography>
                
                <CommentMentions
                    text={text}
                    onTextChange={handleTextChange}
                    onMention={handleMention}
                    textFieldRef={textFieldRef}
                />
                
                <RichCommentEditor
                    ref={textFieldRef}
                    value={text}
                    onChange={handleTextChange}
                    onSubmit={handleSubmitComment}
                    placeholder="Thử viết bình luận với @mention, emoji 😀, và **formatting**..."
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    showFormatting={true}
                    showEmoji={true}
                    showMention={true}
                    maxLength={1000}
                />
                
                {mentions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            Mentioned users:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            {mentions.map((mention, index) => (
                                <Chip
                                    key={index}
                                    avatar={<Avatar sx={{ width: 20, height: 20 }}>{mention.fullName[0]}</Avatar>}
                                    label={mention.fullName}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Paper>

            {/* Comments List */}
            <Paper sx={{ p: 3, backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
                <Typography variant="h6" gutterBottom>
                    💭 Comments ({comments.length})
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                {comments.map(renderComment)}
                
                {comments.length === 0 && (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            textAlign: 'center', 
                            py: 4, 
                            color: darkMode ? '#b0b3b8' : 'text.secondary' 
                        }}
                    >
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default CommentSystemDemo;
