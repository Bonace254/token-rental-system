import React, { useState } from 'react';

const LandingPage = ({ onLogin, onRegister }) => {
    const [hoveredButton, setHoveredButton] = useState(null);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            {/* Professional Gradient Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #4F46E5 50%, #7C3AED 75%, #2a5298 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite'
            }} />
            
            {/* Animated Grid Pattern Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px',
                opacity: 0.3
            }} />

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Header Navigation */}
                <header style={{
                    padding: '16px 32px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img 
                                src="/logo.svg" 
                                alt="Vertex Technologies Logo"
                                style={{
                                    height: '100px',
                                    width: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                            <div>
                                <p style={{ margin: '0 0 2px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Vertex Technologies</p>
                                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                                    Token-Based Rental System
                                </h1>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <button
                                onClick={onLogin}
                                onMouseEnter={() => setHoveredButton('login')}
                                onMouseLeave={() => setHoveredButton(null)}
                                style={{
                                    background: hoveredButton === 'login' ? 'white' : 'rgba(255,255,255,0.95)',
                                    color: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '11px 26px',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: hoveredButton === 'login' ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                Login
                            </button>
                            <button
                                onClick={onRegister}
                                onMouseEnter={() => setHoveredButton('register')}
                                onMouseLeave={() => setHoveredButton(null)}
                                style={{
                                    background: hoveredButton === 'register' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                                    color: 'white',
                                    border: '1.5px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px',
                                    padding: '11px 26px',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '60px 28px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto 60px' }}>

                        <p style={{
                            margin: '0 0 40px 0',
                            fontSize: '20px',
                            lineHeight: '1.8',
                            color: 'rgba(255,255,255,0.88)',
                            maxWidth: '750px',
                            margin: '0 auto 40px'
                        }}>
                            A comprehensive platform combining token-based rent payments, hostel assignments, and parental oversight in one secure, intuitive system.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={onRegister}
                                style={{
                                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                                    color: '#1F2937',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px 40px',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredButton === 'register-cta' ? 'translateY(-3px)' : 'translateY(0)'
                                }}
                                onMouseEnter={() => setHoveredButton('register-cta')}
                                onMouseLeave={() => setHoveredButton(null)}
                            >
                                Get Started Now →
                            </button>
                            <button
                                onClick={onLogin}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    color: 'white',
                                    border: '1.5px solid rgba(255,255,255,0.3)',
                                    borderRadius: '10px',
                                    padding: '15px 40px',
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(5px)',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredButton === 'login-cta' ? 'translateY(-3px)' : 'translateY(0)'
                                }}
                                onMouseEnter={() => setHoveredButton('login-cta')}
                                onMouseLeave={() => setHoveredButton(null)}
                            >
                                Sign In to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Role-Based Features */}
                    <section style={{ marginBottom: '80px' }}>
                        <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: '900', color: 'white', marginBottom: '48px', letterSpacing: '-0.5px' }}>
                            Designed for All Users
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                            {[
                                { title: 'For Students', description: 'Manage rent payments with tokens, view hostel assignments, track payments, request relocations, and get instant support.' },
                                { title: 'For Landlords', description: 'Monitor tenant payments, manage room allocations, track maintenance requests, approve relocations, and generate reports.' },
                                {  title: 'For Parents', description: 'Link multiple student accounts, monitor housing status, track payment history, manage funds, and stay informed.' }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '16px',
                                        padding: '32px 28px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        transform: hoveredButton === `role-${index}` ? 'translateY(-8px)' : 'translateY(0)',
                                        boxShadow: hoveredButton === `role-${index}` ? '0 20px 50px rgba(79, 70, 229, 0.2)' : '0 8px 16px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={() => setHoveredButton(`role-${index}`)}
                                    onMouseLeave={() => setHoveredButton(null)}
                                >
                                    <div style={{ fontSize: '44px', marginBottom: '16px' }}>{item.icon}</div>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '800', color: 'white' }}>{item.title}</h4>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: '1.7' }}>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Key Features */}
                    <section>
                        <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: '900', color: 'white', marginBottom: '48px', letterSpacing: '-0.5px' }}>
                            Key Features
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {[
                                { title: 'Token System', description: 'Earn tokens with every payment and redeem them for facility expenses.' },
                                { title: 'Secure Access', description: 'Role-based authentication ensures users see only their relevant dashboard.' },
                                { title: 'Easy Payments', description: 'Simple payment interface with instant token credit and balance updates.' },
                                { title: 'Reports & Analytics', description: 'Generate detailed payment, occupancy and usage reports anytime.' },
                                {  title: 'Hostel Management', description: 'Browse facilities, book rooms and manage your accommodation easily.' },
                                {  title: 'Maintenance Support', description: 'Submit maintenance requests and track resolution status in real-time.' }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '14px',
                                        padding: '24px',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        transform: hoveredButton === `feature-${index}` ? 'scale(1.05)' : 'scale(1)'
                                    }}
                                    onMouseEnter={() => setHoveredButton(`feature-${index}`)}
                                    onMouseLeave={() => setHoveredButton(null)}
                                >
                                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
                                    <h5 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: 'white' }}>{item.title}</h5>
                                    <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#E5E7EB',
                    padding: '32px 28px',
                    textAlign: 'center',
                    fontSize: '14px'
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <p style={{ margin: '0 0 12px 0', fontWeight: '700', color: '#FBBF24', fontSize: '14px' }}>
                            Vertex Technologies
                        </p>
                        <p style={{ margin: '0 0 16px 0', color: 'rgba(255,255,255,0.7)' }}>
                            © 2026 Vertex Technologies. Secure accommodation management for students, landlords and parents.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                            <span>Privacy Policy</span>
                            <span>•</span>
                            <span>Terms of Service</span>
                            <span>•</span>
                            <span>Contact Support</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;

