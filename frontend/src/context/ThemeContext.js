// src/context/ThemeContext.js
import React, { createContext, useState, useMemo, useCallback } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

// Tạo Context cho theme
export const ThemeContext = createContext({
    toggleColorMode: () => { },
    mode: 'light', // Giá trị mặc định
});

// Component Provider để bao bọc ứng dụng của bạn
export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState('light'); // 'light' hoặc 'dark'

    // Hàm để chuyển đổi chế độ sáng/tối
    const toggleColorMode = useCallback(() => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    }, []);

    // Tạo theme dựa trên chế độ hiện tại
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode, // 'light' hoặc 'dark'
                    // Bạn có thể tùy chỉnh thêm màu sắc cho các chế độ ở đây
                    primary: {
                        main: '#3498DB', // Ví dụ màu chính
                    },
                    secondary: {
                        main: '#2ECC71', // Ví dụ màu phụ
                    },
                    background: {
                        default: mode === 'light' ? '#ECF0F1' : '#2C3E50', // Màu nền
                        paper: mode === 'light' ? '#FFFFFF' : '#34495E',   // Màu nền cho các thẻ, box
                    },
                    text: {
                        primary: mode === 'light' ? '#212121' : '#ECF0F1',  // Màu chữ chính
                        secondary: mode === 'light' ? '#757575' : '#BDC3C7', // Màu chữ phụ
                    },
                },
                typography: {
                    fontFamily: 'Roboto, sans-serif',
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#2C3E50' : '#1A242E', // Màu header tùy theo mode
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                borderRadius: '8px',
                            },
                        },
                    },
                    MuiMenu: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#34495E',
                            },
                        },
                    },
                    MuiMenuItem: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    backgroundColor: mode === 'light' ? '#F0F0F0' : '#4A6178',
                                },
                            },
                        },
                    },
                    // Bạn có thể thêm các tùy chỉnh khác cho các component MUI ở đây
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={{ toggleColorMode, mode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* Giúp chuẩn hóa CSS và áp dụng màu nền */}
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};