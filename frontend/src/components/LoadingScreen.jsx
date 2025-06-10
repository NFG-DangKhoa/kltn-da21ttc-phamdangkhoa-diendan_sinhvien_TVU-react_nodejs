import React from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
    Fade
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

const LoadingScreen = ({ message = "Đang tải..." }) => {
    const theme = useTheme();

    return (
        <Fade in timeout={300}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    zIndex: 9999,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("/pattern-bg.svg")',
                        opacity: 0.1,
                        zIndex: 1
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white'
                    }}
                >
                    {/* Logo Animation */}
                    <Box
                        sx={{
                            mb: 4,
                            position: 'relative'
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        
                        {/* Rotating border */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 100,
                                height: 100,
                                border: '3px solid transparent',
                                borderTop: '3px solid rgba(255,255,255,0.6)',
                                borderRadius: '50%',
                                animation: 'rotate 1s linear infinite'
                            }}
                        />
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: { xs: '1.8rem', md: '2.5rem' }
                        }}
                    >
                        TVU Forum
                    </Typography>

                    {/* Loading message */}
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            opacity: 0.9,
                            fontSize: '1.1rem'
                        }}
                    >
                        {message}
                    </Typography>

                    {/* Progress indicator */}
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                            size={60}
                            thickness={4}
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round'
                                }
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                variant="caption"
                                component="div"
                                color="white"
                                sx={{ fontWeight: 600 }}
                            >
                                TVU
                            </Typography>
                        </Box>
                    </Box>

                    {/* Animated dots */}
                    <Box sx={{ mt: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                opacity: 0.7,
                                '&::after': {
                                    content: '""',
                                    animation: 'dots 1.5s steps(4, end) infinite'
                                }
                            }}
                            className="loading-dots"
                        >
                            Đang khởi tạo
                        </Typography>
                    </Box>
                </Box>

                {/* Floating particles */}
                {[...Array(6)].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            width: { xs: 4, md: 6 },
                            height: { xs: 4, md: 6 },
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.3)',
                            top: `${20 + Math.random() * 60}%`,
                            left: `${10 + Math.random() * 80}%`,
                            animation: `float ${3 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
                            zIndex: 1
                        }}
                    />
                ))}
            </Box>
        </Fade>
    );
};

export default LoadingScreen;
