// src/context/ThemeContext.js
import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

// Tạo Context cho theme
export const ThemeContext = createContext({
    toggleColorMode: () => { },
    mode: 'light', // Giá trị mặc định
});

// Component Provider để bao bọc ứng dụng của bạn
export const ThemeContextProvider = ({ children }) => {
    // Khởi tạo trạng thái mode từ localStorage hoặc mặc định là 'light'
    const [mode, setMode] = useState(() => {
        try {
            const savedMode = localStorage.getItem('themeMode');
            return savedMode === 'dark' ? 'dark' : 'light';
        } catch (error) {
            console.error("Failed to read themeMode from localStorage:", error);
            return 'light'; // Fallback to light mode if localStorage is inaccessible
        }
    });

    // Cập nhật localStorage mỗi khi mode thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('themeMode', mode);
        } catch (error) {
            console.error("Failed to write themeMode to localStorage:", error);
        }
    }, [mode]);

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
                    primary: {
                        main: '#3498DB', // Ví dụ màu chính
                        light: '#64B5F6',
                        dark: '#1A67A3',
                    },
                    secondary: {
                        main: '#2ECC71', // Ví dụ màu phụ
                    },
                    background: {
                        // Nền tổng thể: trắng cho sáng, đen cho tối
                        default: mode === 'light' ? '#FFFFFF' : '#121212', // Đã chỉnh sửa: #FFFFFF cho light, #121212 cho dark
                        // Nền cho các thẻ/box: trắng cho sáng, xám đậm cho tối
                        paper: mode === 'light' ? '#FFFFFF' : '#1D1D1D',   // Đã chỉnh sửa: #FFFFFF cho light, #1D1D1D cho dark
                    },
                    text: {
                        // Màu chữ chính: đen cho sáng, trắng cho tối
                        primary: mode === 'light' ? '#212121' : '#FFFFFF', // Đã chỉnh sửa: #212121 cho light, #FFFFFF cho dark
                        // Màu chữ phụ: xám đậm cho sáng, xám nhạt cho tối
                        secondary: mode === 'light' ? '#757575' : '#CCCCCC', // Đã chỉnh sửa: #757575 cho light, #CCCCCC cho dark
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
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#1D1D1D', // Sử dụng background.paper
                            },
                        },
                    },
                    MuiMenuItem: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    backgroundColor: mode === 'light' ? '#F0F0F0' : '#333333', // Màu hover cho item menu
                                },
                                color: mode === 'light' ? '#212121' : '#FFFFFF', // Sử dụng text.primary
                            },
                        },
                    },
                    MuiInputLabel: {
                        styleOverrides: {
                            root: {
                                color: mode === 'light' ? '#757575' : '#CCCCCC', // Sử dụng text.secondary
                            },
                        },
                    },
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#ccc' : '#555555', // Màu border của input
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#999' : '#888888', // Màu border khi hover
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#3498DB' : '#64B5F6', // Màu border khi focus
                                },
                                color: mode === 'light' ? '#212121' : '#FFFFFF', // Màu chữ trong input
                            },
                        },
                    },
                    MuiSelect: {
                        styleOverrides: {
                            icon: {
                                color: mode === 'light' ? '#757575' : '#CCCCCC', // Màu icon mũi tên dropdown
                            },
                        },
                    },
                    MuiTooltip: {
                        styleOverrides: {
                            tooltip: {
                                backgroundColor: mode === 'light' ? '#555' : '#444444', // Nền tooltip
                                color: mode === 'light' ? '#fff' : '#FFFFFF', // Chữ tooltip
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#bbb' : '#444444', // Màu divider
                            },
                        },
                    },
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={{ toggleColorMode, mode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* Giúp chuẩn hóa CSS và áp dụng màu nền cho body */}
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};