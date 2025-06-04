import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material'; // Import Box để dùng sx prop
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomBreadcrumbs = ({ topicName, postTitle }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        // Sử dụng Box thay vì div để tận dụng các props của MUI
        <Box
            sx={{
                // mb: 3, // Margin bottom 24px
                fontFamily: 'Inter, sans-serif', // Font chữ
            }}
        >
            <Breadcrumbs
                aria-label="breadcrumb"
                separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled', mx: 0.5 }} />} // Icon phân cách
                sx={{
                    fontSize: '0.875rem', // Cỡ chữ nhỏ
                    color: 'text.secondary', // Màu chữ xám nhạt cho Breadcrumbs chung
                    display: 'flex',
                    flexWrap: 'wrap', // Cho phép xuống dòng nếu quá dài
                }}
            >
                {/* Luôn hiển thị liên kết "Trang chủ" */}
                <Link
                    color="inherit"
                    to="/"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        // Điều chỉnh màu chữ và độ đậm cho các liên kết
                        color: 'primary.main', // **Màu xanh dương từ theme của MUI**
                        fontWeight: 'bold', // **In đậm**
                        bgcolor: 'primary.50',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            bgcolor: 'primary.100',
                            textDecoration: 'underline',
                        },
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Trang chủ
                </Link>

                {pathnames.map((value, index) => {
                    // Bỏ qua segment 'topic' nếu nó là phần tử đầu tiên
                    if (value === 'topic' && index === 0) {
                        return null;
                    }

                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                    let displayName = value;

                    // Hiển thị topicName nếu có
                    if (pathnames[0] === 'topic' && index === 1) {
                        if (topicName) {
                            displayName = topicName;
                        } else {
                            // Fallback nếu topicName không được truyền
                            displayName = `Chủ đề ${value}`;
                        }
                    }
                    // Hiển thị postTitle nếu có và đây là bài viết cụ thể
                    else if (
                        pathnames[0] === 'topic' &&
                        pathnames.length === 3 &&
                        index === 2 &&
                        postTitle
                    ) {
                        displayName = postTitle;
                    } else {
                        // Xử lý các đường dẫn khác: viết hoa chữ cái đầu và thay thế dấu gạch ngang
                        displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                    }

                    return last ? (
                        // Mục cuối cùng (trang hiện tại)
                        <Typography
                            key={to}
                            sx={{
                                // Điều chỉnh màu chữ và độ đậm cho mục cuối cùng
                                color: 'primary.main', // **Màu xanh dương**
                                fontWeight: 'bold', // **In đậm**
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'grey.100', // Màu nền xám nhạt cho mục hiện tại
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {displayName}
                        </Typography>
                    ) : (
                        // Các mục trung gian là liên kết
                        <Link
                            key={to}
                            color="inherit"
                            to={to}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                // Điều chỉnh màu chữ và độ đậm cho các liên kết
                                color: 'primary.main', // **Màu xanh dương**
                                fontWeight: 'bold', // **In đậm**
                                bgcolor: 'primary.50',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    bgcolor: 'primary.100',
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {displayName}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};

export default CustomBreadcrumbs;