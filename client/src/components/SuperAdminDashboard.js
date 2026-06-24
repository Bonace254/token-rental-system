import React, { useState } from 'react';
import StudentDashboard from './StudentDashboard';
import LandlordDashboard from './LandlordDashboard';
import ParentDashboard from './ParentDashboard';
import Header from './Header';

const SuperAdminDashboard = ({ user }) => {
    const [activeView, setActiveView] = useState('overview');
    const [inputId, setInputId] = useState(''); // Tracks what the admin is typing
    const [confirmedId, setConfirmedId] = useState(''); // Only changes when admin confirms

    const roleProps = {
        student: { role: 'Student', displayName: 'Student' },
        landlord: { role: 'Landlord', displayName: 'Landlord' },
        parent: { role: 'Parent', displayName: 'Parent' }
    };

    const handleTabChange = (tab) => {
        setActiveView(tab);
        setInputId(''); 
        setConfirmedId(''); // Clear previous dashboard view data
    };

    const handleLoadDashboard = (e) => {
        e.preventDefault();
        if (!inputId.trim()) {
            alert("Please enter a User ID first.");
            return;
        }
        setConfirmedId(inputId.trim());
    };

    const selectedRole = roleProps[activeView];
    
    // Construct the impersonated user data package
    const effectiveUser = {
        ...user,
        role: selectedRole?.role || user.role,
        user_id: confirmedId || user.user_id,
        full_name: `${selectedRole?.displayName || user.role} View`,
        isImpersonating: true
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <Header title="Super Admin Console" showLogo={true} />
            <div style={{ padding: '20px 28px' }}>
                
                {/* Top Bar Control */}
                <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '800' }}>Super Admin Console</h1>
                        <p style={{ margin: '6px 0 0', color: '#6B7280' }}>Switch between student, landlord, and parent dashboards without logging out.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['overview', 'student', 'landlord', 'parent'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '999px',
                                    border: activeView === tab ? '1px solid #4F46E5' : '1px solid #E5E7EB',
                                    background: activeView === tab ? '#4F46E5' : 'white',
                                    color: activeView === tab ? 'white' : '#334155',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}
                            >
                                {tab === 'overview' ? 'Overview' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Dashboard`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview View */}
                {activeView === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
                        {[
                            { title: 'Student Dashboard', description: 'Quick access to student insights, payments and facility bookings.' },
                            { title: 'Landlord Dashboard', description: 'Manage relocations, maintenance and student lists.' },
                            { title: 'Parent Dashboard', description: 'Monitor student accounts and support payments from one place.' }
                        ].map((card) => (
                            <div key={card.title} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#111827' }}>{card.title}</h3>
                                <p style={{ margin: 0, color: '#475569', lineHeight: '1.75' }}>{card.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Role Specific View Panels */}
                {(activeView === 'student' || activeView === 'landlord' || activeView === 'parent') && (
                    <div style={{ marginTop: '24px' }}>
                        <form onSubmit={handleLoadDashboard} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
                            <div style={{ minWidth: '280px' }}>
                                <label style={{ display: 'block', color: '#475569', marginBottom: '8px', fontWeight: '600' }}>
                                    Enter Target {selectedRole.displayName} User ID
                                </label>
                                <input 
                                    type="text"
                                    value={inputId}
                                    onChange={(e) => setInputId(e.target.value)}
                                    placeholder="Enter user database ID..."
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button 
                                type="submit"
                                style={{
                                    padding: '12px 24px',
                                    background: '#4F46E5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Load Dashboard View
                            </button>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#E2E8F0', color: '#334155', fontSize: '14px' }}>
                                    Role: <strong>{selectedRole.displayName}</strong>
                                </div>
                                <div style={{ padding: '12px 16px', borderRadius: '10px', background: confirmedId ? '#DCFCE7' : '#F1F5F9', color: confirmedId ? '#15803D' : '#475569', fontSize: '14px' }}>
                                    Active View ID: <strong>{confirmedId || 'None Selected'}</strong>
                                </div>
                            </div>
                        </form>

                        {/* Rendering Section */}
                        <div style={{ borderRadius: '24px', background: 'white', padding: '26px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)' }}>
                            {!confirmedId ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                                     No data loaded. Enter a valid user ID above and click <strong>"Load Dashboard View"</strong>.
                                </div>
                            ) : (
                                <>
                                    {activeView === 'student' && <StudentDashboard user={effectiveUser} />}
                                    {activeView === 'landlord' && <LandlordDashboard user={effectiveUser} />}
                                    {activeView === 'parent' && <ParentDashboard user={effectiveUser} />}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;