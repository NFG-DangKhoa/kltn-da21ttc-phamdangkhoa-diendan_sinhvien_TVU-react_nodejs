import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios'; // Bỏ comment nếu bạn muốn xác thực token với backend khi tải lại trang

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); // Trạng thái loading của AuthContext

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
    };

    const logout = () => {
        console.log('AuthContext (logout): User logging out.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
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

    return (
        // Thêm loadingAuth vào value của context để các component con có thể truy cập
        <AuthContext.Provider value={{ user, login, logout, googleLogin, getToken, loadingAuth }}>
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