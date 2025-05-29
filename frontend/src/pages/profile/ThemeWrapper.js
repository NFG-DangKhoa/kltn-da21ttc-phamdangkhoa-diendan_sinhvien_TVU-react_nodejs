// src/components/ThemeWrapper.js
// src/pages/profile/ThemeWrapper.js
import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'; // <-- Thêm useTheme vào đây
import { CssBaseline, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// ... phần còn lại của code ThemeWrapper.js

// Tạo Context để chia sẻ chế độ theme và hàm toggleTheme
const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const ThemeWrapper = ({ children }) => {
    const [mode, setMode] = useState('light'); // Trạng thái mặc định là sáng

    // Memoize hàm toggle để tránh re-render không cần thiết
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    // Tạo theme dựa trên chế độ sáng/tối
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode, // 'light' hoặc 'dark'
                    primary: {
                        main: '#1976D2', // Xanh dương làm màu chủ đạo
                    },
                    secondary: {
                        main: '#DC004E', // Đỏ làm màu phụ trợ
                    },
                    background: {
                        default: mode === 'dark' ? '#18191A' : '#F0F2F5', // Nền chính
                        paper: mode === 'dark' ? '#242526' : '#FFFFFF', // Nền của Card/Paper
                    },
                    text: {
                        primary: mode === 'dark' ? '#E4E6EB' : '#1C1E21', // Màu chữ chính
                        secondary: mode === 'dark' ? '#B0B3B8' : '#65676B', // Màu chữ phụ
                    },
                    divider: mode === 'dark' ? '#3A3B3C' : '#E0E0E0', // Màu đường phân cách
                },
                typography: {
                    fontFamily: 'Roboto, sans-serif', // Font chữ
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none', // Không viết hoa chữ cái đầu tiên của nút
                            },
                        },
                    },
                    MuiTabs: {
                        styleOverrides: {
                            indicator: {
                                backgroundColor: mode === 'dark' ? '#90CAF9' : '#1976D2', // Màu highlight tab
                            },
                        },
                    },
                    MuiTab: {
                        styleOverrides: {
                            root: {
                                color: mode === 'dark' ? '#B0B3B8' : '#65676B', // Màu chữ tab mặc định
                                '&.Mui-selected': {
                                    color: mode === 'dark' ? '#E4E6EB' : '#1C1E21', // Màu chữ tab khi chọn
                                },
                            },
                        },
                    },
                },
            }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {/* CssBaseline để thiết lập CSS cơ bản và màu nền */}
                <CssBaseline enableColorScheme />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

// Hook để dễ dàng truy cập và thay đổi chế độ màu
export const useColorMode = () => useContext(ColorModeContext);

// Component nút chuyển đổi chế độ sáng/tối
export const ThemeToggleButton = () => {
    const theme = useTheme();
    const colorMode = useColorMode();
    return (
        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    );
};