import React from 'react';
import {
    Paper,
    Typography,
    Box,
    alpha,
    Zoom
} from '@mui/material';

const StatsCard = ({ 
    stat, 
    index = 0, 
    visible = true, 
    delay = 0,
    variant = 'default' 
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                    color: 'white',
                    border: 'none',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(stat.color, 0.9)}, ${alpha(stat.color, 0.8)})`,
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 60px ${alpha(stat.color, 0.4)}`
                    }
                };
            case 'minimal':
                return {
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    '&:hover': {
                        borderColor: stat.color,
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(stat.color, 0.2)}`
                    }
                };
            default:
                return {
                    bgcolor: alpha(stat.color, 0.1),
                    border: `2px solid ${alpha(stat.color, 0.2)}`,
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(stat.color, 0.3)}`,
                        bgcolor: alpha(stat.color, 0.15)
                    }
                };
        }
    };

    const getIconStyles = () => {
        if (variant === 'gradient') {
            return {
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white'
            };
        }
        return {
            bgcolor: stat.color,
            color: 'white'
        };
    };

    const getValueColor = () => {
        if (variant === 'gradient') return 'white';
        return stat.color;
    };

    return (
        <Zoom in={visible} timeout={800 + (index * 200) + delay}>
            <Paper
                elevation={variant === 'minimal' ? 0 : 2}
                sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    ...getVariantStyles(),
                    '&::before': variant === 'gradient' ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("/pattern-bg.svg")',
                        opacity: 0.1,
                        zIndex: 0
                    } : {}
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <Box
                        sx={{
                            width: { xs: 50, md: 60 },
                            height: { xs: 50, md: 60 },
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.1) rotate(5deg)'
                            },
                            ...getIconStyles()
                        }}
                    >
                        {stat.icon}
                    </Box>

                    {/* Value */}
                    <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        color={getValueColor()}
                        mb={1}
                        sx={{
                            fontSize: { xs: '1.8rem', md: '2.5rem' },
                            lineHeight: 1
                        }}
                    >
                        {stat.value}
                    </Typography>

                    {/* Label */}
                    <Typography 
                        variant="body1" 
                        color={variant === 'gradient' ? 'rgba(255,255,255,0.9)' : 'text.secondary'}
                        fontWeight={500}
                        sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                    >
                        {stat.label}
                    </Typography>

                    {/* Growth indicator (if available) */}
                    {stat.growth && (
                        <Box
                            sx={{
                                mt: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '12px',
                                bgcolor: variant === 'gradient' 
                                    ? 'rgba(255,255,255,0.2)' 
                                    : alpha('#4CAF50', 0.1),
                                color: variant === 'gradient' 
                                    ? 'white' 
                                    : '#4CAF50'
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold">
                                {stat.growth}
                            </Typography>
                        </Box>
                    )}

                    {/* Trend line (decorative) */}
                    {variant === 'gradient' && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                            }}
                        />
                    )}
                </Box>
            </Paper>
        </Zoom>
    );
};

export default StatsCard;
