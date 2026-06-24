import React, { useState } from 'react';
import axios from 'axios';

// Consistent Professional Theme
const theme = {
    primary: '#4F46E5', // Indigo
    primaryHover: '#4338CA', 
    background: '#F3F4F6', // Soft Light Grey
    card: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#6B7280',
    radius: '12px',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
};

const Register = ({ onBackToLogin, compact = false, onBackToHome }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '', // Added field tracking
        role: 'Student'
    });
    
    const [isHovered, setIsHovered] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        // Check if passwords match before hitting the backend endpoint
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match. Please verify your credentials.");
            return;
        }

        try {
            await axios.post('http://localhost:5000/auth/register', {
                full_name: formData.full_name, 
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            alert("Account created successfully!");
            onBackToLogin();
        } catch (err) {
            alert(err.response ? err.response.data : "Registration failed");
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
        color: theme.textMain
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: theme.textMain,
        textAlign: 'left'
    };

    const selectContainerStyle = {
        position: 'relative'
    };

    const dropdownIconStyle = {
        position: 'absolute',
        right: '14px',
        top: '56%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        color: theme.textMuted
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: compact ? '520px' : '520px',
            margin: '0 auto',
            backgroundColor: compact ? 'transparent' : theme.background,
            minHeight: compact ? undefined : 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            padding: '24px',
            boxSizing: 'border-box'
        }}>
            <div style={{ 
                backgroundColor: theme.card, 
                padding: compact ? '32px' : '42px', 
                borderRadius: '24px', 
                boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)', 
                width: '100%', 
                maxWidth: '520px' 
            }}>
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: '800', color: theme.textMain, margin: '0 0 8px 0' }}>
                        Create Account
                    </h2>
                    <p style={{ color: theme.textMuted, fontSize: '15px' }}>
                        Join the portal to manage your residency
                    </p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Ombati Bonace" 
                            required 
                            style={inputStyle}
                            value={formData.full_name} 
                            onChange={e => setFormData({...formData, full_name: e.target.value})} 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@university.com" 
                            required 
                            style={inputStyle}
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            style={inputStyle}
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                    </div>

                    {/* --- CONFIRM PASSWORD INPUT FIELD BLOCK --- */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            style={inputStyle}
                            value={formData.confirmPassword} 
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Select Role</label>
                        <div style={selectContainerStyle}>
                            <select 
                                value={formData.role} 
                                onChange={e => setFormData({...formData, role: e.target.value, hostel: '', room: ''})}
                                style={{ 
                                    ...inputStyle, 
                                    appearance: 'none', 
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    cursor: 'pointer', 
                                    backgroundColor: '#ffffff',
                                    paddingRight: '40px'
                                }}
                            >
                                <option value="Student">Student</option>
                                <option value="Parent">Parent</option>
                            </select>
                            <div style={dropdownIconStyle}>
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ 
                            width: '100%', 
                            backgroundColor: isHovered ? theme.primaryHover : theme.primary, 
                            color: 'white', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: '600', 
                            fontSize: '16px', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                            transition: 'background-color 0.2s ease-in-out'
                        }}
                    >
                        Register Now
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: theme.textMuted }}>
                    Already have an account?{' '}
                    <button 
                        onClick={onBackToLogin} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: theme.primary, 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0 4px'
                        }}
                        onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;