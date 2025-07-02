import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
    Pagination, useTheme, Avatar, Chip, CircularProgress, Alert,
    Container, Breadcrumbs, Link, Fade, IconButton, Tooltip,
    FormControl, InputLabel, Select, MenuItem, Paper, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
    Search as SearchIcon,
    Home as HomeIcon,
    People as PeopleIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon,
    Chat as ChatIcon,
    Science, Rocket, Language, AccountBalance, Apps, Star // Added from LeftColumn
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { OnlineBadge } from '../../components/Chat/OnlineIndicator';

const MembersList = () => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest', 'posts_desc', 'posts_asc', 'name_asc', 'name_desc'
    const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'moderator', 'member'
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const membersPerPage = 12;

    // Fetch members from API
    const fetchMembers = async (page = 1, search = '', sort = 'latest', role = 'all') => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/users/members`, {
                params: {
                    page,
                    limit: membersPerPage,
                    search,
                    sortBy: sort,
                    role: role === 'all' ? undefined : role, // Don't send 'role' if it's 'all'
                }
            });

            if (response.data.success) {
                setMembers(response.data.data.members);
                setPagination(response.data.data.pagination);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Không thể tải danh sách thành viên. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers(currentPage, searchTerm, sortBy, filterRole);
    }, [currentPage, sortBy, filterRole]);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchMembers(1, searchTerm, sortBy, filterRole);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, sortBy, filterRole]);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        setCurrentPage(1); // Reset to first page on sort change
    };

    const handleFilterRoleChange = (role) => {
        setFilterRole(role);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStartChat = (member) => {
        navigate('/chat', { state: { startChatWith: member } });
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'error';
            case 'moderator':
            case 'mod':
                return 'warning';
            default:
                return 'primary';
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return <AdminIcon />;
            case 'moderator':
            case 'mod':
                return <PeopleIcon />;
            default:
                return <PersonIcon />;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 12, pb: 4 }}>
            {/* Breadcrumb Navigation */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    mb: 3,
                    '& .MuiBreadcrumbs-separator': {
                        color: theme.palette.text.secondary
                    }
                }}
            >
                <Link
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.text.secondary,
                        textDecoration: 'none',
                        '&:hover': {
                            color: theme.palette.primary.main,
                            textDecoration: 'underline'
                        }
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    Trang chủ
                </Link>
                <Typography
                    color="text.primary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600
                    }}
                >
                    <PeopleIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    Thành viên
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Fade in={true} timeout={800}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }}
                    >
                        👥 Thành viên
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
                    >
                        Khám phá và kết nối với cộng đồng thành viên tại diễn đàn của chúng tôi
                    </Typography>
                </Box>
            </Fade>

            {/* Controls Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { md: 'center' },
                    gap: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(248, 250, 252, 0.8)',
                }}
            >
                <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 300 } }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Tìm kiếm thành viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: theme.palette.background.paper,
                            },
                        }}
                    />
                </Box>

                <ToggleButtonGroup
                    value={filterRole}
                    exclusive
                    onChange={(e, newRole) => {
                        if (newRole !== null) {
                            handleFilterRoleChange(newRole);
                        }
                    }}
                    aria-label="Filter by role"
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 2,
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            fontWeight: 600,
                            '&.Mui-selected': {
                                color: theme.palette.primary.contrastText,
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                }
                            }
                        }
                    }}
                >
                    <ToggleButton value="all" aria-label="all members">Tất cả</ToggleButton>
                    <ToggleButton value="admin" aria-label="administrators">Quản trị</ToggleButton>
                    <ToggleButton value="moderator" aria-label="moderators">Điều hành</ToggleButton>
                    <ToggleButton value="member" aria-label="members">Thành viên</ToggleButton>
                </ToggleButtonGroup>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Sắp xếp theo</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sắp xếp theo"
                        onChange={handleSortChange}
                        sx={{ borderRadius: 2, backgroundColor: theme.palette.background.paper }}
                    >
                        <MenuItem value="latest">Mới nhất</MenuItem>
                        <MenuItem value="oldest">Cũ nhất</MenuItem>
                        <MenuItem value="posts_desc">Nhiều bài viết</MenuItem>
                        <MenuItem value="posts_asc">Ít bài viết</MenuItem>
                        <MenuItem value="name_asc">Tên (A-Z)</MenuItem>
                        <MenuItem value="name_desc">Tên (Z-A)</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <Grid container spacing={3}>
                {/* Members List */}
                <Grid item xs={12}>

                    {/* Loading State */}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress size={60} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 4,
                                borderRadius: 2,
                                '& .MuiAlert-message': {
                                    fontSize: '1rem'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Statistics */}
                    {!loading && !error && (
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Tìm thấy <strong>{pagination.totalMembers || 0}</strong> thành viên
                                {searchTerm && ` với từ khóa "${searchTerm}"`}
                            </Typography>
                        </Box>
                    )}

                    {/* Members Grid */}
                    {!loading && !error && (
                        <>
                            {members.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h5" color="text.secondary" gutterBottom>
                                        Không tìm thấy thành viên nào
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {searchTerm ?
                                            `Không có thành viên nào phù hợp với từ khóa "${searchTerm}"` :
                                            'Hiện tại chưa có thành viên nào trong diễn đàn'
                                        }
                                    </Typography>
                                </Box>
                            ) : (
                                <Fade in={true} timeout={1000}>
                                    <Grid container spacing={3} justifyContent="center">
                                        {members.map((member, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                                                <Fade in={true} timeout={600} style={{ transitionDelay: `${index * 80}ms` }}>
                                                    <Card
                                                        sx={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            p: 3,
                                                            borderRadius: 4, // Smoother corners
                                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                                                            cursor: 'pointer',
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            boxShadow: 'none', // Start with no shadow
                                                            '&:hover': {
                                                                transform: 'translateY(-8px)',
                                                                boxShadow: `0 12px 24px rgba(0,0,0,${mode === 'dark' ? 0.2 : 0.1})`,
                                                                borderColor: theme.palette.primary.main,
                                                            },
                                                            backgroundColor: theme.palette.background.paper,
                                                        }}
                                                        onClick={() => navigate(`/profile/${member._id}`)}
                                                    >
                                                        {/* Avatar with online status */}
                                                        <Box sx={{ position: 'relative', mb: 2 }}>
                                                            <OnlineBadge
                                                                userId={member._id}
                                                                size="medium"
                                                                showTooltip={true}
                                                            >
                                                                <Avatar
                                                                    alt={member.fullName}
                                                                    src={member.avatarUrl}
                                                                    sx={{
                                                                        width: 80,
                                                                        height: 80,
                                                                        border: `3px solid ${theme.palette.primary.main}`,
                                                                        background: member.role === 'admin'
                                                                            ? 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)'
                                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        fontSize: '2rem',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    {!member.avatarUrl && member.fullName?.charAt(0)?.toUpperCase()}
                                                                </Avatar>
                                                            </OnlineBadge>
                                                        </Box>

                                                        <CardContent
                                                            sx={{
                                                                textAlign: 'center',
                                                                p: 0,
                                                                width: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'space-between', // Distribute space vertically
                                                                flexGrow: 1, // Allow content to grow
                                                                minHeight: 180, // Set a minimum height for consistency
                                                            }}
                                                        >
                                                            <Box>
                                                                {/* Name */}
                                                                <Typography
                                                                    variant="h6"
                                                                    component="div"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        mb: 0.5,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {member.fullName}
                                                                </Typography>

                                                                {/* Username */}
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ mb: 1.5 }}
                                                                >
                                                                    @{member.username || member.email?.split('@')[0]}
                                                                </Typography>

                                                                {/* Role Chip */}
                                                                <Chip
                                                                    icon={getRoleIcon(member.role)}
                                                                    label={member.role === 'admin' ? 'Quản trị viên' :
                                                                        member.role === 'moderator' ? 'Điều hành viên' : 'Thành viên'}
                                                                    color={getRoleColor(member.role)}
                                                                    size="small"
                                                                    sx={{
                                                                        mb: 1.5,
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                />

                                                                {/* Stats */}
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{ display: 'block', mb: 1 }}
                                                                >
                                                                    📝 {member.postsCount || 0} bài viết
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{ display: 'block', mb: 2 }}
                                                                >
                                                                    📅 Tham gia: {new Date(member.createdAt).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>

                                                            {/* Action Buttons */}
                                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto' }}>
                                                                <Tooltip title="Xem hồ sơ">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/profile/${member._id}`);
                                                                        }}
                                                                        sx={{
                                                                            backgroundColor: theme.palette.primary.main,
                                                                            color: 'white',
                                                                            '&:hover': {
                                                                                backgroundColor: theme.palette.primary.dark,
                                                                            }
                                                                        }}
                                                                    >
                                                                        <PersonIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                {user && user._id !== member._id && (
                                                                    <Tooltip title="Nhắn tin">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleStartChat(member);
                                                                            }}
                                                                            sx={{
                                                                                backgroundColor: theme.palette.success.main,
                                                                                color: 'white',
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.success.dark,
                                                                                }
                                                                            }}
                                                                        >
                                                                            <ChatIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Fade>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Fade>
                            )}
                        </>
                    )}

                    {/* Pagination */}
                    {!loading && !error && pagination.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                            <Pagination
                                count={pagination.totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        '&.Mui-selected': {
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark,
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        }
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default MembersList;
