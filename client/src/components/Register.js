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

const Register = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'Student',
        hostel: '', // Added to capture hostel selection
        room: ''    // Added to capture room selection
    });
    
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic Options (Can be hardcoded here for simplicity or fetched from an API)
    const hostelOptions = ["Kilimanjaro Hall", "Ruwenzori Hall", "Mara Complex", "Elgon View"];
    const roomOptions = ["101", "102", "201", "202", "301", "302"];

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation rule: Make sure student picked an accommodation option
        if (formData.role === 'Student' && (!formData.hostel || !formData.room)) {
            return alert("Please select both a Hostel and a Room number.");
        }

        try {
            await axios.post('http://localhost:5000/auth/register', {
                full_name: formData.full_name, 
                email: formData.email,
                password: formData.password,
                role: formData.role,
                // Include the selected options in the request body sent to the backend
                hostel: formData.role === 'Student' ? formData.hostel : null,
                room: formData.role === 'Student' ? formData.room : null
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
            backgroundColor: theme.background, 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{ 
                backgroundColor: theme.card, 
                padding: '40px', 
                borderRadius: theme.radius, 
                boxShadow: theme.shadow, 
                width: '100%', 
                maxWidth: '450px' 
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                                <option value="Landlord">Landlord</option>
                                <option value="Parent">Parent</option>
                            </select>
                            <div style={dropdownIconStyle}>
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC ACCOMMODATION DROP DOWNS (Shows up only when Role is Student) */}
                    {formData.role === 'Student' && (
                        <div style={{ 
                            marginBottom: '24px', 
                            borderTop: '1px dashed #E5E7EB', 
                            paddingTop: '16px' 
                        }}>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: theme.primary, marginBottom: '12px', textAlign: 'left' }}>
                                Room Assignment
                            </p>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ ...labelStyle, fontSize: '12px' }}>Hostel Block</label>
                                    <div style={selectContainerStyle}>
                                        <select 
                                            value={formData.hostel} 
                                            onChange={e => setFormData({...formData, hostel: e.target.value})}
                                            required
                                            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', backgroundColor: '#fff' }}
                                        >
                                            <option value="">-- Select --</option>
                                            {hostelOptions.map((h, idx) => (
                                                <option key={idx} value={h}>{h}</option>
                                            ))}
                                        </select>
                                        <div style={dropdownIconStyle}>
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label style={{ ...labelStyle, fontSize: '12px' }}>Room No.</label>
                                    <div style={selectContainerStyle}>
                                        <select 
                                            value={formData.room} 
                                            onChange={e => setFormData({...formData, room: e.target.value})}
                                            required
                                            disabled={!formData.hostel}
                                            style={{ 
                                                ...inputStyle, 
                                                appearance: 'none', 
                                                cursor: 'pointer', 
                                                backgroundColor: !formData.hostel ? '#F3F4F6' : '#fff' 
                                            }}
                                        >
                                            <option value="">-- Select --</option>
                                            {roomOptions.map((r, idx) => (
                                                <option key={idx} value={r}>Room {r}</option>
                                            ))}
                                        </select>
                                        <div style={dropdownIconStyle}>
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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