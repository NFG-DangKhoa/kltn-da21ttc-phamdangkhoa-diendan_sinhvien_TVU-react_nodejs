import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Grid,
    IconButton,
    Chip,
    Paper,
    Divider
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Language as WebsiteIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: 'white',
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
    }
}));

const ContactItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: 10,
    transition: 'background-color 0.3s ease',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease',
}));

const AdminContactInfo = () => {
    const [adminInfo, setAdminInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load admin contact info
    useEffect(() => {
        const loadAdminInfo = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/contact-info');
                if (response.data.success) {
                    setAdminInfo(response.data.data);
                }
            } catch (error) {
                console.error('Error loading admin info:', error);
                // Use default admin info if API fails
                setAdminInfo({
                    name: 'Admin TVU Forum',
                    title: 'Quản trị viên diễn đàn',
                    email: 'admin@tvu.edu.vn',
                    phone: '0123-456-789',
                    address: 'Trường Đại học Trà Vinh, Trà Vinh',
                    description: 'Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với chúng tôi khi cần thiết!',
                    avatar: '/api/placeholder/150/150',
                    socialLinks: {
                        facebook: 'https://facebook.com/tvu.edu.vn',
                        website: 'https://tvu.edu.vn',
                        email: 'admin@tvu.edu.vn'
                    },
                    workingHours: 'Thứ 2 - Thứ 6: 7:00 - 17:00',
                    department: 'Phòng Công nghệ Thông tin'
                });
            } finally {
                setLoading(false);
            }
        };

        loadAdminInfo();
    }, []);

    if (loading || !adminInfo) {
        return null;
    }

    return (
        <Box sx={{ 
            py: 8, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(118, 75, 162, 0.1)',
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                        variant="h3" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }}
                    >
                        Liên hệ với chúng tôi
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        {adminInfo.description}
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8} lg={6}>
                        <StyledCard>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                    <Avatar
                                        src={adminInfo.avatar}
                                        sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            mb: 2,
                                            border: '4px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                                        }}
                                    />
                                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {adminInfo.name}
                                    </Typography>
                                    <Chip 
                                        label={adminInfo.title}
                                        sx={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    {adminInfo.department && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2">
                                                {adminInfo.department}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }} />

                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <ContactItem>
                                            <EmailIcon />
                                            <Box>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Email
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {adminInfo.email}
                                                </Typography>
                                            </Box>
                                        </ContactItem>
                                    </Grid>

                                    {adminInfo.phone && (
                                        <Grid item xs={12}>
                                            <ContactItem>
                                                <PhoneIcon />
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                        Điện thoại
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                        {adminInfo.phone}
                                                    </Typography>
                                                </Box>
                                            </ContactItem>
                                        </Grid>
                                    )}

                                    {adminInfo.address && (
                                        <Grid item xs={12}>
                                            <ContactItem>
                                                <LocationIcon />
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                        Địa chỉ
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                        {adminInfo.address}
                                                    </Typography>
                                                </Box>
                                            </ContactItem>
                                        </Grid>
                                    )}

                                    {adminInfo.workingHours && (
                                        <Grid item xs={12}>
                                            <ContactItem>
                                                <SchoolIcon />
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                        Giờ làm việc
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                        {adminInfo.workingHours}
                                                    </Typography>
                                                </Box>
                                            </ContactItem>
                                        </Grid>
                                    )}
                                </Grid>

                                {adminInfo.socialLinks && (
                                    <>
                                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', my: 3 }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" gutterBottom>
                                                Kết nối với chúng tôi
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                                {adminInfo.socialLinks.facebook && (
                                                    <SocialButton 
                                                        href={adminInfo.socialLinks.facebook}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FacebookIcon />
                                                    </SocialButton>
                                                )}
                                                {adminInfo.socialLinks.website && (
                                                    <SocialButton 
                                                        href={adminInfo.socialLinks.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <WebsiteIcon />
                                                    </SocialButton>
                                                )}
                                                {adminInfo.socialLinks.email && (
                                                    <SocialButton 
                                                        href={`mailto:${adminInfo.socialLinks.email}`}
                                                    >
                                                        <EmailIcon />
                                                    </SocialButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </>
                                )}
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AdminContactInfo;
