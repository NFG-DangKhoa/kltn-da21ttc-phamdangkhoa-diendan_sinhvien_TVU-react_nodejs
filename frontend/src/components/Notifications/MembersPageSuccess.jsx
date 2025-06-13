import React, { useState } from 'react';
import {
    Alert,
    AlertTitle,
    Button,
    Box,
    Collapse,
    IconButton,
    Typography,
    Chip,
    Stack
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    Launch as LaunchIcon,
    People as PeopleIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MembersPageSuccess = () => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    if (!open) return null;

    return (
        <Collapse in={open}>
            <Alert
                severity="success"
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'success.main',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.05) 100%)',
                    '& .MuiAlert-icon': {
                        fontSize: '2rem'
                    }
                }}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setOpen(false)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                <AlertTitle sx={{ fontWeight: 700, fontSize: '1.2rem', mb: 2 }}>
                    🎉 Trang Thành viên Diễn đàn đã hoàn thành!
                </AlertTitle>
                
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Trang hiển thị danh sách thành viên diễn đàn đã được tạo thành công với đầy đủ tính năng:
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                        icon={<PeopleIcon />} 
                        label="Danh sách thành viên" 
                        color="success" 
                        size="small" 
                        variant="outlined" 
                    />
                    <Chip 
                        icon={<CheckIcon />} 
                        label="Tìm kiếm & phân trang" 
                        color="success" 
                        size="small" 
                        variant="outlined" 
                    />
                    <Chip 
                        icon={<VisibilityIcon />} 
                        label="UI/UX đẹp" 
                        color="success" 
                        size="small" 
                        variant="outlined" 
                    />
                </Stack>

                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    💡 <strong>Cách truy cập:</strong> Nhấn nút "Xem chi tiết" trong phần "Thành viên đang hoạt động" 
                    ở cột bên phải của bất kỳ trang nào (TopicDetail, PostDetail, v.v.)
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<LaunchIcon />}
                        onClick={() => navigate('/MembersList')}
                        sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: 4
                            },
                            transition: 'all 0.3s ease',
                            fontWeight: 600
                        }}
                    >
                        Xem Trang Thành viên
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate('/members-demo')}
                        sx={{
                            borderColor: 'success.main',
                            color: 'success.main',
                            '&:hover': {
                                borderColor: 'success.dark',
                                backgroundColor: 'success.main',
                                color: 'white',
                                transform: 'translateY(-1px)',
                                boxShadow: 2
                            },
                            transition: 'all 0.3s ease',
                            fontWeight: 600
                        }}
                    >
                        Xem Demo & Hướng dẫn
                    </Button>
                </Box>
            </Alert>
        </Collapse>
    );
};

export default MembersPageSuccess;
