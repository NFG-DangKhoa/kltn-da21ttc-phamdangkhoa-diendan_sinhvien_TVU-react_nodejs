import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import PostDetail from './TopicDetail/PostDetail';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

// Mock theme context
const mockThemeContext = {
    mode: 'light',
    toggleTheme: () => {}
};

// Mock auth context
const mockAuthContext = {
    user: {
        _id: 'user123',
        username: 'testuser',
        fullName: 'Test User',
        avatar: null
    },
    login: () => {},
    logout: () => {}
};

// Create theme
const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

const PostDetailTest = () => {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ThemeContext.Provider value={mockThemeContext}>
                    <AuthContext.Provider value={mockAuthContext}>
                        <Box sx={{ minHeight: '100vh' }}>
                            <PostDetail />
                        </Box>
                    </AuthContext.Provider>
                </ThemeContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default PostDetailTest;
