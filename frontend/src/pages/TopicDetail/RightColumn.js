import React, { useContext } from 'react'; // Import useContext
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Tooltip } from '@mui/material';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext

// Dummy data for active members
const activeMembers = [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', status: 'online' },
    { id: 3, name: 'Peter Jones', avatar: 'https://i.pravatar.cc/150?img=3', status: 'away' },
    { id: 4, name: 'Alice Brown', avatar: 'https://i.pravatar.cc/150?img=4', status: 'offline' },
    { id: 5, name: 'Michael Green', avatar: 'https://i.pravatar.cc/150?img=5', status: 'online' },
];

const RightColumn = () => { // Remove darkMode from props
    const { mode } = useContext(ThemeContext); // Use useContext to get the current theme mode
    const darkMode = mode === 'dark'; // Determine darkMode based on the context mode

    return (
        <Box
            sx={{
                p: 2,
                backgroundColor: darkMode ? '#242526' : '#f0f2f5', // Adjusted for consistent dark mode background
                color: darkMode ? '#e4e6eb' : '#1c1e21',
                borderRadius: 2,
                width: '15vw', // Consider making this responsive, e.g., '280px' or percentages
                ml: 10,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                boxShadow: darkMode ? '0px 0px 5px rgba(255,255,255,0.1)' : '0px 0px 5px rgba(0,0,0,0.1)', // Add consistent shadow
                transition: 'background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease',
                border: 'none',
            }}
        >
            {/* Active Members Section */}
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21', display: 'flex', alignItems: 'center' }}
            >
                🧑‍🤝‍🧑 Thành viên đang hoạt động
            </Typography>
            <List dense sx={{ paddingLeft: 0 }}>
                {activeMembers.map((member) => (
                    <ListItem
                        key={member.id}
                        sx={{
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                cursor: 'pointer',
                            },
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        <ListItemAvatar>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    alt={member.name}
                                    src={member.avatar}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        flexShrink: 0,
                                    }}
                                />
                                <Tooltip title={member.status === 'online' ? 'Online' : member.status === 'away' ? 'Away' : 'Offline'}>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor:
                                                member.status === 'online'
                                                    ? '#4CAF50' // Green
                                                    : member.status === 'away'
                                                        ? '#FFC107' // Amber
                                                        : '#757575', // Grey
                                            border: `2px solid ${darkMode ? '#242526' : '#f0f2f5'}`, // Border color matches new background
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        </ListItemAvatar>
                        <ListItemText
                            primary={member.name}
                            primaryTypographyProps={{
                                color: darkMode ? '#b0b3b8' : '#65676b',
                                fontWeight: 'medium',
                                '&:hover': {
                                    color: darkMode ? '#90caf9' : 'primary.main',
                                },
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2, borderColor: darkMode ? '#3a3b3c' : '#eee' }} /> {/* Adjusted divider color */}

            {/* Favorite Posts Section */}
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
            >
                📈 Bài viết được yêu thích
            </Typography>
            <List dense sx={{ paddingLeft: 0 }}>
                {['Làm chủ React Hooks', 'Responsive với MUI', 'Deploy React lên Vercel', 'Xây dựng API với Node.js'].map((item, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: darkMode ? '#3a3b3c' : '#f5f5f5',
                                cursor: 'pointer',
                            },
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                                color: darkMode ? '#b0b3b8' : '#65676b',
                                '&:hover': {
                                    color: darkMode ? '#90caf9' : 'primary.main',
                                    textDecoration: 'underline',
                                },
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2, borderColor: darkMode ? '#3a3b3c' : '#eee' }} /> {/* Adjusted divider color */}

            {/* Advertisement Section */}
            <Typography
                variant="h6"
                gutterBottom
                sx={{ color: darkMode ? '#e4e6eb' : '#1c1e21' }}
            >
                📢 Quảng cáo
            </Typography>
            <Box
                sx={{
                    p: 2,
                    backgroundColor: darkMode ? '#3a3b3c' : '#f0f0f0',
                    borderRadius: 1,
                    textAlign: 'center',
                    color: darkMode ? '#b0b3b8' : '#65676b',
                    transition: 'background-color 0.4s ease, color 0.4s ease',
                }}
            >
                <Typography variant="body2">
                    Bạn muốn phát triển kỹ năng Front-end? Khám phá các khóa học của chúng tôi!
                </Typography>
            </Box>
        </Box>
    );
};

export default RightColumn;