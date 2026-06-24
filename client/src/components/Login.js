import React, { useState } from 'react';
import axios from 'axios';

// Professional Theme Constants (Matching Register.js)
const theme = {
    primary: '#4F46E5', // Indigo
    background: '#F3F4F6', // Soft Light Grey
    card: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#6B7280',
    radius: '12px',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
};

const Login = ({ onLoginSuccess, onGoToRegister, compact = false, onBackToHome }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { email, password });
            onLoginSuccess(res.data); 
            // Removed alert() for a smoother professional flow, 
            // but you can add a toast notification here later!
        } catch (err) {
            alert("Login Failed: Check your email or password");
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        fontSize: '14px',
        marginTop: '6px',
        outlineColor: theme.primary,
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: theme.textMain,
        textAlign: 'left'
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: compact ? '520px' : '460px',
            margin: '0 auto',
            backgroundColor: compact ? 'transparent' : theme.background,
            minHeight: compact ? undefined : 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '24px',
            boxSizing: 'border-box'
        }}>
            <div style={{ 
                backgroundColor: theme.card, 
                padding: compact ? '30px' : '42px', 
                borderRadius: '24px', 
                boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)', 
                width: '100%', 
                maxWidth: '480px' 
            }}>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.textMain, margin: '0 0 8px 0' }}>
                        Hi, Welcome Back
                    </h2>
                    <p style={{ color: theme.textMuted, fontSize: '16px' }}>
                        Please enter your details to sign in
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@university.com" 
                            value={email}
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                        <button type="button" style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: theme.primary, 
                            fontSize: '13px', 
                            fontWeight: '600',
                            cursor: 'pointer' 
                        }}>
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" style={{ 
                        width: '100%', 
                        backgroundColor: theme.primary, 
                        color: 'white', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        fontWeight: '600', 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                        transition: 'opacity 0.2s'
                    }}>
                        Sign In
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
                    <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
                        Don't have an account? 
                        <button 
                            onClick={onGoToRegister}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: theme.primary, 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                marginLeft: '5px'
                            }}
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;