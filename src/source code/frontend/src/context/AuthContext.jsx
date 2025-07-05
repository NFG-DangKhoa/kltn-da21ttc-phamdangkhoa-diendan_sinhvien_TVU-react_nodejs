import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import forumRulesService from '../services/forumRulesService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); // Trạng thái loading của AuthContext
    const [showWelcomeRules, setShowWelcomeRules] = useState(false);

    useEffect(() => {
        const loadUserAndToken = async () => {
            console.log('AuthContext (useEffect): Attempting to load user from localStorage.');
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);

                    // --- Bắt đầu: Logic xác thực token với backend (nếu cần) ---
                    // Đây là phần quan trọng để đảm bảo token vẫn hợp lệ.
                    // Nếu bạn có một API để kiểm tra token (ví dụ: /api/auth/validate-token), hãy sử dụng nó ở đây.
                    // Điều này giúp ngăn chặn việc người dùng ở lại trạng thái đăng nhập với một token đã hết hạn.
                    /*
                    try {
                        const response = await axios.get('http://localhost:5000/api/auth/validate-token', {
                            headers: { Authorization: `Bearer ${storedToken}` }
                        });
                        // Nếu token hợp lệ, bạn có thể cập nhật user từ dữ liệu trả về từ backend nếu cần
                        setUser(response.data.user || parsedUser);
                        setToken(storedToken);
                        console.log('AuthContext (useEffect): Token validated successfully with backend.');
                    } catch (validationError) {
                        console.error("AuthContext (useEffect): Token validation failed with backend:", validationError);
                        // Nếu token không hợp lệ (hết hạn, giả mạo, v.v.), xóa token và user
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setUser(null);
                        setToken(null);
                    }
                    */
                    // --- Kết thúc: Logic xác thực token với backend ---

                    // Nếu bạn không có API xác thực token, chỉ cần set user và token đã lưu.
                    // Tuy nhiên, lưu ý rằng cách này kém an toàn hơn vì token có thể đã hết hạn.
                    setUser(parsedUser);
                    setToken(storedToken);
                    console.log('AuthContext (useEffect): User and token loaded from localStorage.');

                    // Kiểm tra quy định diễn đàn cho user hiện tại
                    checkForumRulesAgreement(parsedUser, storedToken);

                } catch (error) {
                    console.error("AuthContext (useEffect): Error parsing user data from localStorage:", error);
                    // Xóa dữ liệu lỗi để tránh các vấn đề sau này
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                }
            } else {
                console.log('AuthContext (useEffect): No user or token found in localStorage.');
                setUser(null);
                setToken(null);
            }
            setLoadingAuth(false); // Kết thúc quá trình tải xác thực
        };

        loadUserAndToken();
    }, []); // Chỉ chạy một lần khi component mount

    // Function to check forum rules agreement
    const checkForumRulesAgreement = async (userData, userToken) => {
        try {
            // Chỉ kiểm tra cho user thường, không kiểm tra admin
            if (userData.role === 'admin' || userData.role === 'editor') {
                return;
            }

            const response = await forumRulesService.checkRulesAgreement();
            if (response.success && response.data.needsAgreement) {
                console.log('User needs to agree to forum rules');
                setShowWelcomeRules(true);
            }
        } catch (error) {
            console.error('Error checking forum rules agreement:', error);
        }
    };

    const login = (userData) => {
        // Luôn kiểm tra userData trước khi lưu trữ
        if (!userData || typeof userData !== 'object' || !userData.token) {
            console.error("AuthContext (login): Invalid userData or missing token provided.", userData);
            return;
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);

        // Cập nhật state
        setToken(userData.token);
        setUser(userData);

        console.log("AuthContext (login): User data being set:", userData);
        console.log("AuthContext (login): Token being set:", userData.token);

        // Kiểm tra quy định diễn đàn cho user mới đăng nhập
        checkForumRulesAgreement(userData, userData.token);
    };

    const logout = () => {
        console.log('AuthContext (logout): User logging out.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    // New function to update user data in context and localStorage
    const updateUser = (newUserData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newUserData
        }));
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedLocalUser = { ...storedUser, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updatedLocalUser));
        console.log('AuthContext (updateUser): User data updated in context and localStorage.', newUserData);
    };

    // Google login function
    const googleLogin = async (credential) => {
        try {
            console.log('AuthContext (googleLogin): Starting Google login...');

            const response = await fetch('http://localhost:5000/api/auth/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('AuthContext (googleLogin): Success:', data);

                // Store user data and token
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                // Update state
                setUser(data.user);
                setToken(data.token);

                // Kiểm tra quy định diễn đàn cho user Google login
                checkForumRulesAgreement(data.user, data.token);

                return { success: true, user: data.user };
            } else {
                console.error('AuthContext (googleLogin): Failed:', data.message);
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('AuthContext (googleLogin): Error:', error);

            // Handle different types of errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Không thể kết nối đến server' };
            }

            return { success: false, error: 'Lỗi mạng hoặc server' };
        }
    };

    // Hàm mới để cung cấp token
    const getToken = () => token;

    // Functions to manage welcome rules dialog
    const hideWelcomeRules = () => setShowWelcomeRules(false);
    const agreeToWelcomeRules = async () => {
        try {
            await forumRulesService.agreeToRules();
            setShowWelcomeRules(false);
            return true;
        } catch (error) {
            console.error('Error agreeing to welcome rules:', error);
            return false;
        }
    };

    return (
        // Thêm loadingAuth vào value của context để các component con có thể truy cập
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            updateUser, // Expose updateUser function
            googleLogin,
            getToken,
            loadingAuth,
            showWelcomeRules,
            hideWelcomeRules,
            agreeToWelcomeRules
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook để dễ dàng sử dụng context trong các component
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};