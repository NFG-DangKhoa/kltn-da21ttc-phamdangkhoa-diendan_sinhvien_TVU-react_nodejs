import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    useTheme,
    Slide,
    Zoom,
    Fade,
    IconButton
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    PlayArrow as PlayArrowIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon
} from '@mui/icons-material';

const HeroSection = ({ visible = true }) => {
    const theme = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);

    // TVU Campus Images - Replace with actual TVU images
    const tvuImages = [
        {
            url: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'Cổng chính Trường Đại học Trà Vinh',
            description: 'Nơi khởi đầu hành trình tri thức'
        },
        {
            url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'Thư viện hiện đại',
            description: 'Kho tàng tri thức phong phú'
        },
        {
            url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'Khuôn viên xanh mát',
            description: 'Môi trường học tập lý tưởng'
        },
        {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'Phòng học hiện đại',
            description: 'Trang thiết bị tiên tiến'
        },
        {
            url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'Hoạt động sinh viên',
            description: 'Đời sống sinh viên sôi động'
        }
    ];

    // Auto slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % tvuImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [tvuImages.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % tvuImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + tvuImages.length) % tvuImages.length);
    };

    return (
        <Fade in={visible} timeout={1000}>
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: '70vh', md: '80vh' },
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Slideshow Background */}
                {tvuImages.map((image, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            opacity: currentSlide === index ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)',
                            filter: 'brightness(0.7)',
                            zIndex: 1
                        }}
                    />
                ))}

                {/* Dark Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(
                            135deg,
                            rgba(25, 118, 210, 0.8) 0%,
                            rgba(156, 39, 176, 0.6) 50%,
                            rgba(0, 0, 0, 0.4) 100%
                        )`,
                        zIndex: 2
                    }}
                />

                {/* Gradient Fade Effect at Bottom */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '150px',
                        background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
                        zIndex: 3
                    }}
                />
                {/* Navigation Arrows */}
                <IconButton
                    onClick={prevSlide}
                    sx={{
                        position: 'absolute',
                        left: { xs: 16, md: 32 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translateY(-50%) scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <PrevIcon />
                </IconButton>

                <IconButton
                    onClick={nextSlide}
                    sx={{
                        position: 'absolute',
                        right: { xs: 16, md: 32 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translateY(-50%) scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <NextIcon />
                </IconButton>

                {/* Slide Indicators */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 80, md: 100 },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        zIndex: 4
                    }}
                >
                    {tvuImages.map((_, index) => (
                        <Box
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'white',
                                    transform: 'scale(1.2)'
                                }
                            }}
                        />
                    ))}
                </Box>

                {/* Main Content */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 4, textAlign: 'center' }}>
                    <Slide direction="down" in={visible} timeout={1200}>
                        <Box>
                            <Typography
                                variant="h1"
                                component="h1"
                                sx={{
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                                    mb: 2,
                                    textShadow: '0 6px 30px rgba(0,0,0,0.5)',
                                    letterSpacing: '-0.02em',
                                    background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                DIỄN ĐÀN SINH VIÊN
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        background: 'linear-gradient(45deg, #ffeb3b, #ff9800)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 900,
                                        textShadow: '0 4px 20px rgba(255, 193, 7, 0.3)'
                                    }}
                                >
                                    TVU
                                </Box>
                            </Typography>
                        </Box>
                    </Slide>

                    <Slide direction="up" in={visible} timeout={1400}>
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'rgba(255,255,255,0.95)',
                                        fontSize: { xs: '1rem', md: '1.2rem' },
                                        fontWeight: 500,
                                        mb: 1,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {tvuImages[currentSlide].title}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                        fontWeight: 300,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {tvuImages[currentSlide].description}
                                </Typography>
                            </Box>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255,255,255,0.95)',
                                    mb: 4,
                                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                                    fontWeight: 400,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '15px',
                                    padding: '20px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                Nơi kết nối, chia sẻ kiến thức và kinh nghiệm học tập, đời sống
                                giữa sinh viên Trường Đại học Trà Vinh
                            </Typography>
                        </Box>
                    </Slide>

                    <Zoom in={visible} timeout={1600}>
                        <Box>
                            <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        background: 'linear-gradient(45deg, #ffffff, #f5f5f5)',
                                        color: theme.palette.primary.main,
                                        px: 5,
                                        py: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        borderRadius: '50px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        border: '2px solid rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #f5f5f5, #ffffff)',
                                            transform: 'translateY(-3px) scale(1.05)',
                                            boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Khám phá ngay
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<PlayArrowIcon />}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.8)',
                                        borderWidth: '2px',
                                        px: 5,
                                        py: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 600,
                                        borderRadius: '50px',
                                        backdropFilter: 'blur(10px)',
                                        background: 'rgba(255,255,255,0.1)',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            transform: 'translateY(-3px) scale(1.05)',
                                            boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Xem video giới thiệu
                                </Button>
                            </Box>
                        </Box>
                    </Zoom>

                    {/* Scroll Indicator */}
                    <Fade in={visible} timeout={2000}>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 30,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                color: 'rgba(255,255,255,0.7)',
                                animation: 'bounce 2s infinite',
                                '@keyframes bounce': {
                                    '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
                                    '40%': { transform: 'translateX(-50%) translateY(-10px)' },
                                    '60%': { transform: 'translateX(-50%) translateY(-5px)' }
                                }
                            }}
                        >
                            <Typography variant="caption" sx={{ mb: 1 }}>
                                Cuộn xuống
                            </Typography>
                            <Box
                                sx={{
                                    width: 2,
                                    height: 30,
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    borderRadius: 1
                                }}
                            />
                        </Box>
                    </Fade>
                </Container>
            </Box>
        </Fade>
    );
};

export default HeroSection;
