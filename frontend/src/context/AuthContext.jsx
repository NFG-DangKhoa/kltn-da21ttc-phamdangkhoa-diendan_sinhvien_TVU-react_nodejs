import React, { createContext, useState, useEffect, useContext } from 'react'; // <-- Đã thêm useContext vào đây!

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Chạy 1 lần khi component mount
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        console.log('AuthContext (useEffect): Attempting to load user from localStorage.');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // THÊM DÒNG NÀY ĐỂ KIỂM TRA AVATAR URL SAU KHI TẢI TỪ LOCALSTORAGE
                console.log('AuthContext (useEffect): User loaded from localStorage:', parsedUser);
                console.log('AuthContext (useEffect): Avatar URL from localStorage:', parsedUser.avatarUrl);

            } catch (error) {
                console.error("AuthContext (useEffect): Error parsing user data from localStorage:", error);
                // Xóa dữ liệu lỗi để tránh vấn đề sau này
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            console.log('AuthContext (useEffect): No user or token found in localStorage.');
            setUser(null);
        }
    }, []); // Chỉ chạy một lần khi component mount

    const login = (userData) => {
        // Luôn kiểm tra userData trước khi lưu trữ
        if (!userData || typeof userData !== 'object') {
            console.error("AuthContext (login): Invalid userData provided.", userData);
            return;
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token); // Assuming userData has a 'token' field

        console.log("AuthContext (login): User data being set:", userData);
        // THÊM DÒNG NÀY ĐỂ KIỂM TRA AVATAR URL NGAY KHI ĐĂNG NHẬP
        console.log("AuthContext (login): Avatar URL in userData:", userData.avatarUrl);

        setUser(userData);
    };

    const logout = () => {
        console.log('AuthContext (logout): User logging out.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Thêm custom hook này vào cuối file AuthContext.js
export const useAuth = () => {
    // Bây giờ useContext đã được import, lỗi sẽ không còn
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};