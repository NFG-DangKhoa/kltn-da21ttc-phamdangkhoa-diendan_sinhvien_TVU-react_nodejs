import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';

const GoogleOAuthDebug = () => {
    const [debugInfo, setDebugInfo] = useState(null);
    const [error, setError] = useState(null);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('🔍 Google OAuth Debug - Credential Response:', credentialResponse);
            
            // Decode JWT payload (without verification - just for debugging)
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            setDebugInfo({
                credential: credentialResponse.credential,
                payload: payload,
                clientId: payload.aud,
                expectedClientId: '990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com'
            });
            
            setError(null);
            
            // Test backend call
            console.log('🚀 Testing backend call...');
            
            const response = await fetch('http://localhost:5000/api/auth/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            
            const data = await response.json();
            console.log('📡 Backend response:', data);
            
            if (!data.success) {
                setError(data.message || 'Backend error');
            }
            
        } catch (err) {
            console.error('❌ Debug error:', err);
            setError(err.message);
        }
    };

    const handleGoogleError = () => {
        setError('Google OAuth failed');
        setDebugInfo(null);
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🔍 Google OAuth Debug Tool
            </Typography>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Test Google Login
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            shape="rectangular"
                        />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                        Click the button above to test Google OAuth and see debug information.
                    </Typography>
                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="h6">Error:</Typography>
                    {error}
                </Alert>
            )}

            {debugInfo && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🔍 Debug Information
                        </Typography>
                        
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Client ID Match"
                                    secondary={
                                        <Box>
                                            <Typography variant="body2">
                                                Expected: {debugInfo.expectedClientId}
                                            </Typography>
                                            <Typography variant="body2">
                                                Received: {debugInfo.clientId}
                                            </Typography>
                                            <Chip 
                                                label={debugInfo.clientId === debugInfo.expectedClientId ? "✅ MATCH" : "❌ MISMATCH"}
                                                color={debugInfo.clientId === debugInfo.expectedClientId ? "success" : "error"}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                    }
                                />
                            </ListItem>
                            
                            <Divider />
                            
                            <ListItem>
                                <ListItemText
                                    primary="User Information"
                                    secondary={
                                        <Box>
                                            <Typography variant="body2">Email: {debugInfo.payload.email}</Typography>
                                            <Typography variant="body2">Name: {debugInfo.payload.name}</Typography>
                                            <Typography variant="body2">Picture: {debugInfo.payload.picture}</Typography>
                                            <Typography variant="body2">Email Verified: {debugInfo.payload.email_verified ? '✅' : '❌'}</Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            
                            <Divider />
                            
                            <ListItem>
                                <ListItemText
                                    primary="Token Information"
                                    secondary={
                                        <Box>
                                            <Typography variant="body2">Issuer: {debugInfo.payload.iss}</Typography>
                                            <Typography variant="body2">Audience: {debugInfo.payload.aud}</Typography>
                                            <Typography variant="body2">Subject: {debugInfo.payload.sub}</Typography>
                                            <Typography variant="body2">
                                                Issued At: {new Date(debugInfo.payload.iat * 1000).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2">
                                                Expires At: {new Date(debugInfo.payload.exp * 1000).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        </List>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="h6" gutterBottom>
                            Raw JWT Token (First 100 chars):
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontFamily: 'monospace', 
                                bgcolor: 'grey.100', 
                                p: 1, 
                                borderRadius: 1,
                                wordBreak: 'break-all'
                            }}
                        >
                            {debugInfo.credential.substring(0, 100)}...
                        </Typography>
                        
                        <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mt: 1 }}
                            onClick={() => {
                                navigator.clipboard.writeText(debugInfo.credential);
                                alert('Token copied to clipboard!');
                            }}
                        >
                            Copy Full Token
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        📋 Configuration Check
                    </Typography>
                    
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Frontend Client ID"
                                secondary="990724811150-jdm9kngkj7lfmkjl1pqake1hbhfju9tt.apps.googleusercontent.com"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Current Domain"
                                secondary={window.location.origin}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Backend URL"
                                secondary="http://localhost:5000/api/auth/google-login"
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GoogleOAuthDebug;
