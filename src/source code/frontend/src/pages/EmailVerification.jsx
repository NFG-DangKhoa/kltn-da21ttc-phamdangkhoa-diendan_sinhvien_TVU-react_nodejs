import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Alert,
    CircularProgress,
    useTheme,
    Button
} from '@mui/material';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const EmailVerification = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError('Token xác thực không hợp lệ');
                setLoading(false);
                return;
            }

            try {
                const response = await API.get(`/auth/verify-email?token=${token}`);
                setMessage(response.data.message);
                setVerified(true);

                // Redirect to login after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } catch (err) {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực email');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh'
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[8],
                    transition: 'all 0.3s ease',
                    width: '100%',
                    maxWidth: 450,
                    textAlign: 'center'
                }}
            >
                {loading ? (
                    <Box>
                        <CircularProgress
                            size={60}
                            sx={{
                                color: theme.palette.primary.main,
                                mb: 3
                            }}
                        />
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Đang xác thực email...
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Vui lòng đợi trong giây lát
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {/* Success State */}
                        {verified && (
                            <Box>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.success.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        boxShadow: theme.shadows[4]
                                    }}
                                >
                                    <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
                                </Box>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.success.main,
                                        mb: 2
                                    }}
                                >
                                    Xác thực thành công!
                                </Typography>

                                <Alert
                                    severity="success"
                                    sx={{ mb: 3, borderRadius: 2 }}
                                >
                                    {message}
                                </Alert>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3
                                    }}
                                >
                                    🎉 Tài khoản của bạn đã được kích hoạt thành công!
                                    Bạn có thể đăng nhập ngay bây giờ.
                                </Typography>

                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        backgroundColor: theme.palette.primary.main,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark,
                                            transform: 'translateY(-2px)',
                                            boxShadow: theme.shadows[8]
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Đăng nhập ngay
                                </Button>
                            </Box>
                        )}

                        {/* Error State */}
                        {error && !verified && (
                            <Box>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.error.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        boxShadow: theme.shadows[4]
                                    }}
                                >
                                    <ErrorIcon sx={{ fontSize: 60, color: 'white' }} />
                                </Box>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.error.main,
                                        mb: 2
                                    }}
                                >
                                    Xác thực thất bại
                                </Typography>

                                <Alert
                                    severity="error"
                                    sx={{ mb: 3, borderRadius: 2 }}
                                >
                                    {error}
                                </Alert>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3
                                    }}
                                >
                                    Token xác thực có thể đã hết hạn hoặc không hợp lệ.
                                    Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        component={Link}
                                        to="/register"
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderRadius: 2,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.main,
                                                color: 'white',
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.shadows[4]
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Đăng ký lại
                                    </Button>

                                    <Button
                                        variant="contained"
                                        component={Link}
                                        to="/login"
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            borderRadius: 2,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            backgroundColor: theme.palette.primary.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark,
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.shadows[8]
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Đăng nhập
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default EmailVerification;
