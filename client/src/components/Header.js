import React from 'react';

const Header = ({ showLogo = true, title = "Token-Based Rental System", compact = false }) => {
    return (
        <header style={{
            padding: compact ? '12px 20px' : '16px 28px',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4F46E5 100%)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '12px' : '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
            {showLogo && (
                <img 
                    src="/logo.svg" 
                    alt="Vertex Technologies Logo"
                    style={{
                        height: compact ? '40px' : '56px',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            )}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {showLogo && (
                    <span style={{
                        fontSize: compact ? '11px' : '12px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        Vertex Technologies
                    </span>
                )}
                <h1 style={{
                    margin: showLogo ? '2px 0 0 0' : 0,
                    fontSize: compact ? '18px' : '24px',
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: '-0.5px'
                }}>
                    {title}
                </h1>
            </div>
        </header>
    );
};

export default Header;