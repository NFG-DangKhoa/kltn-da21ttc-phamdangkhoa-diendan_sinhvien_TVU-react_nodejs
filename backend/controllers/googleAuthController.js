const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login handler
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify Google token
        console.log('Verifying Google token with Client ID:', process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        console.log('Google token verified successfully');

        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
            name: fullName,
            picture: avatarUrl,
            email_verified: emailVerified
        } = payload;

        if (!emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email not verified by Google'
            });
        }

        // Check if user exists
        let user = await User.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        });

        if (user) {
            // Update existing user with Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
            }
            if (!user.avatarUrl && avatarUrl) {
                user.avatarUrl = avatarUrl;
            }
            if (!user.fullName && fullName) {
                user.fullName = fullName;
            }
            await user.save();
        } else {
            // Create new user
            user = new User({
                googleId,
                email,
                fullName,
                avatarUrl,
                username: email.split('@')[0], // Use email prefix as username
                isEmailVerified: true,
                authProvider: 'google'
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                fullName: user.fullName
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Google login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                avatarUrl: user.avatarUrl,
                authProvider: user.authProvider || 'google'
            }
        });

    } catch (error) {
        console.error('Google login error:', error);

        if (error.message.includes('Token used too early')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token timing'
            });
        }

        if (error.message.includes('Invalid token')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token'
            });
        }

        if (error.message.includes('Wrong recipient') || error.message.includes('audience')) {
            return res.status(400).json({
                success: false,
                message: 'Google Client ID mismatch. Please check configuration.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during Google login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Google OAuth URL (optional - for server-side flow)
exports.getGoogleAuthUrl = (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline&` +
        `prompt=consent`;

    res.status(200).json({
        success: true,
        authUrl
    });
};

// Verify Google token (utility function)
exports.verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        return ticket.getPayload();
    } catch (error) {
        throw new Error('Invalid Google token');
    }
};
