import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    Divider,
    IconButton,
    Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const ForumRulesDialog = ({ 
    open, 
    onClose, 
    onAgree, 
    rules = null,
    showCloseButton = false,
    title = "Quy định diễn đàn"
}) => {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rulesData, setRulesData] = useState(rules);

    // Load rules if not provided
    useEffect(() => {
        if (open && !rulesData) {
            loadRules();
        }
    }, [open, rulesData]);

    const loadRules = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/forum-rules');
            if (response.data.success) {
                setRulesData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading rules:', error);
            setError('Không thể tải quy định diễn đàn');
        } finally {
            setLoading(false);
        }
    };

    const handleAgree = async () => {
        if (!agreed) {
            setError('Bạn cần đồng ý với quy định để tiếp tục');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('http://localhost:5000/api/forum-rules/agree', {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            if (onAgree) {
                onAgree();
            }
            
            handleClose();
        } catch (error) {
            console.error('Error agreeing to rules:', error);
            setError('Có lỗi xảy ra khi đồng ý quy định');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAgreed(false);
        setError('');
        if (onClose) {
            onClose();
        }
    };

    if (!rulesData && !loading) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={showCloseButton ? handleClose : undefined}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h5" component="div" fontWeight="bold">
                    {rulesData?.title || title}
                </Typography>
                {showCloseButton && (
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Đang tải quy định...</Typography>
                    </Box>
                ) : rulesData ? (
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Phiên bản: {rulesData.version} | 
                            Cập nhật: {new Date(rulesData.updatedAt).toLocaleDateString('vi-VN')}
                        </Typography>
                        
                        <Divider sx={{ mb: 3 }} />
                        
                        <Box
                            sx={{
                                '& h1': { fontSize: '1.5rem', fontWeight: 'bold', mb: 2, mt: 3 },
                                '& h2': { fontSize: '1.3rem', fontWeight: 'bold', mb: 1.5, mt: 2.5 },
                                '& h3': { fontSize: '1.1rem', fontWeight: 'bold', mb: 1, mt: 2 },
                                '& p': { mb: 1.5, lineHeight: 1.6 },
                                '& ul': { pl: 3, mb: 2 },
                                '& li': { mb: 0.5 },
                                '& strong': { fontWeight: 'bold' },
                                '& em': { fontStyle: 'italic' }
                            }}
                        >
                            <ReactMarkdown>{rulesData.content}</ReactMarkdown>
                        </Box>
                    </Box>
                ) : (
                    <Typography color="error">
                        Không thể tải quy định diễn đàn
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                <Box sx={{ width: '100%' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Tôi đã đọc và đồng ý với tất cả các quy định trên
                            </Typography>
                        }
                        sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {showCloseButton && (
                            <Button
                                onClick={handleClose}
                                variant="outlined"
                                disabled={loading}
                            >
                                Đóng
                            </Button>
                        )}
                        <Button
                            onClick={handleAgree}
                            variant="contained"
                            disabled={!agreed || loading}
                            sx={{
                                minWidth: 120,
                                borderRadius: 2
                            }}
                        >
                            {loading ? 'Đang xử lý...' : 'Đồng ý'}
                        </Button>
                    </Box>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ForumRulesDialog;
