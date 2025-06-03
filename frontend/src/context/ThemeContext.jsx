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

    // Màu xanh dương đậm từ gradient để sử dụng cho hover
    const gradientHoverColorLight = 'rgba(0, 86, 179, 0.15)'; // #0056b3 với alpha 0.15
    const gradientHoverColorDark = 'rgba(0, 123, 255, 0.25)'; // #007bff với alpha 0.25, hoặc một màu đậm hơn chút

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
                        default: mode === 'light' ? '#F5F5F5' : '#1A1A1A',
                        paper: mode === 'light' ? '#FFFFFF' : '#212121',
                    },
                    text: {
                        primary: mode === 'light' ? '#212121' : '#E0E0E0',
                        secondary: mode === 'light' ? '#757575' : '#B0B0B0',
                    },
                },
                typography: {
                    fontFamily: 'Roboto, sans-serif',
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                // Background của AppBar vẫn giữ nguyên gradient
                                // Các nút trong AppBar sẽ dùng màu hover từ theme
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': {
                                    // Sử dụng màu xanh đậm của gradient cho hiệu ứng hover
                                    backgroundColor: mode === 'light' ? gradientHoverColorLight : gradientHoverColorDark,
                                },
                            },
                        },
                    },
                    MuiIconButton: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    // Sử dụng màu xanh đậm của gradient cho hiệu ứng hover
                                    backgroundColor: mode === 'light' ? gradientHoverColorLight : gradientHoverColorDark,
                                },
                            },
                        },
                    },
                    MuiMenu: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#212121',
                            },
                        },
                    },
                    MuiMenuItem: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    // Sử dụng màu xanh đậm của gradient cho hiệu ứng hover
                                    backgroundColor: mode === 'light' ? gradientHoverColorLight : gradientHoverColorDark,
                                },
                                color: mode === 'light' ? '#212121' : '#E0E0E0',
                            },
                        },
                    },
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    // Sử dụng màu xanh đậm của gradient cho hiệu ứng hover
                                    backgroundColor: mode === 'light' ? gradientHoverColorLight : gradientHoverColorDark,
                                },
                            },
                        },
                    },
                    MuiLink: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    // Màu hover nhẹ hơn cho Link
                                    backgroundColor: mode === 'light' ? 'rgba(0, 86, 179, 0.08)' : 'rgba(0, 123, 255, 0.15)',
                                    borderRadius: '4px',
                                },
                            },
                        },
                    },
                    MuiInputLabel: {
                        styleOverrides: {
                            root: {
                                color: mode === 'light' ? '#757575' : '#B0B0B0',
                            },
                        },
                    },
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#ccc' : '#606060',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#999' : '#808080',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: mode === 'light' ? '#3498DB' : '#7AB9F6',
                                },
                                color: mode === 'light' ? '#212121' : '#E0E0E0',
                            },
                        },
                    },
                    MuiSelect: {
                        styleOverrides: {
                            icon: {
                                color: mode === 'light' ? '#757575' : '#B0B0B0',
                            },
                        },
                    },
                    MuiTooltip: {
                        styleOverrides: {
                            tooltip: {
                                backgroundColor: mode === 'light' ? '#555' : '#4F4F4F',
                                color: mode === 'light' ? '#fff' : '#E0E0E0',
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#bbb' : '#555555',
                            },
                        },
                    },
                    MuiCardActionArea: {
                        styleOverrides: {
                            root: {
                                '&:hover': {
                                    // Màu hover nhẹ hơn cho CardActionArea
                                    backgroundColor: mode === 'light' ? 'rgba(0, 86, 179, 0.08)' : 'rgba(0, 123, 255, 0.15)',
                                },
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
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};