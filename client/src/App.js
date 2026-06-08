import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ParentDashboard from './components/ParentDashboard';
import StudentDashboard from './components/StudentDashboard'; 
import LandlordDashboard from './components/LandlordDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // 1. AUTHENTICATION FLOW (Show login/register if no user is logged in)
  if (!user) {
    return showRegister ? (
      <Register onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <Login 
        onLoginSuccess={(userData) => setUser(userData)} 
        onGoToRegister={() => setShowRegister(true)} 
      />
    );
  }

  // 2. LOGGED IN FLOW (Dashboards)
  return (
    <div className="App" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <header style={{ 
        padding: '15px 30px', 
        background: '#111827', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#818CF8' }}>TokenRent</span>
            <span style={{ color: '#374151' }}>|</span>
            <span style={{ fontSize: '14px' }}>
                Welcome, <strong>{user.full_name}</strong> 
                <span style={{ 
                  marginLeft: '10px', 
                  background: '#374151', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '10px', 
                  textTransform: 'uppercase' 
                }}>
                  {user.role}
                </span>
            </span>
        </div>
        
        <button 
          onClick={() => setUser(null)} 
          style={{ 
            background: '#EF4444', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* --- Role-Based Routing --- */}
        
        {/* Pass the user object to each dashboard for context */}
        {user.role === 'Student' && <StudentDashboard user={user} />}
        
        {user.role === 'Landlord' && <LandlordDashboard user={user} />}
        
        {/* We pass the whole 'user' object to ParentDashboard 
            so it can check 'user.monitoring_student_id' 
        */}
        {user.role === 'Parent' && <ParentDashboard user={user} />}
      </main>
    </div>
  );
}

export default App;