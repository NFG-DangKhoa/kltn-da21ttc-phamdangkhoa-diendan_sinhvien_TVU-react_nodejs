import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('http://localhost:5000/api/auth/register', form);
            alert('Đăng ký thành công');
            navigate('/login');
        } catch {
            alert('Đăng ký thất bại');
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Đăng ký</Typography>
            <form onSubmit={handleSubmit}>
                <TextField label="Họ tên" fullWidth margin="normal" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                <TextField label="Email" fullWidth margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <TextField label="Mật khẩu" type="password" fullWidth margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Đăng ký</Button>
            </form>
        </Container>
    );
};

export default Register;
