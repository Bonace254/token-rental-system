import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import ParentDashboard from './components/ParentDashboard';
import StudentDashboard from './components/StudentDashboard'; 
import LandlordDashboard from './components/LandlordDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const isSuperAdmin = user && ['superadmin', 'developer', 'admin'].includes(user.role?.toLowerCase());

  if (!user) {
    if (page === 'landing') {
      return <LandingPage onLogin={() => setPage('login')} onRegister={() => setPage('register')} />;
    }

    return (
      <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          padding: '18px 30px', 
          background: 'white', 
          borderBottom: '1px solid #E5E7EB', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Token-Rental System</span>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '13px' }}>Landing page navigation first.</p>
          </div>
          <button 
            onClick={() => setPage('landing')} 
            style={{ 
              background: 'transparent', 
              color: '#4F46E5', 
              border: '1px solid #C7D2FE', 
              padding: '10px 18px', 
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Back to home
          </button>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          {page === 'register' ? (
            <Register compact={true} onBackToLogin={() => setPage('login')} onBackToHome={() => setPage('landing')} />
          ) : (
            <Login compact={true} onLoginSuccess={(userData) => setUser(userData)} onGoToRegister={() => setPage('register')} onBackToHome={() => setPage('landing')} />
          )}
        </main>

        <footer style={{
          backgroundColor: '#111827',
          color: '#E5E7EB',
          padding: '20px 30px',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0' }}>© 2026 Token-Rental System. Landing page first, then access the dashboard.</p>
        </footer>
      </div>
    );
  }

  // 2. LOGGED IN FLOW (Dashboards)
  if (isSuperAdmin) {
    return (
      <div className="App" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          padding: '18px 30px', 
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '22px', fontWeight: '800' }}>Vertex Technologies Console</span>
            <span style={{ fontSize: '14px', opacity: 0.85 }}>Developer Super Admin</span>
          </div>
          <button 
            onClick={() => {
              setUser(null);
              setPage('landing');
            }} 
            style={{ 
              background: '#EF4444', 
              color: 'white', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: '999px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </header>

        <main style={{ flex: 1, padding: '30px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <SuperAdminDashboard user={user} />
        </main>

        <footer style={{
          backgroundColor: '#111827',
          color: '#D1D5DB',
          padding: '22px 30px',
          textAlign: 'center',
          fontSize: '12px',
          borderTop: '1px solid #374151'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#A78BFA' }}>Vertex Technologies</p>
          <p style={{ margin: '0 0 8px 0' }}>&copy; 2026 Vertex Technologies. Secure accommodation management for campus living.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '11px' }}>
            <span>Contact: support@vertextech.com</span>
            <span>|</span>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Service</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="App" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '15px 30px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FBBF24' }}>Token-Rental System</span>
            <span style={{ color: '#A78BFA' }}>|</span>
            <span style={{ fontSize: '14px' }}>
                Welcome, <strong>{user.full_name}</strong> 
                <span style={{ 
                  marginLeft: '10px', 
                  background: '#A78BFA', 
                  color: '#1F2937',
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '10px', 
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {user.role}
                </span>
            </span>
        </div>
        
        <button 
          onClick={() => {
            setUser(null);
            setPage('landing');
          }} 
          style={{ 
            background: '#EF4444', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#DC2626'}
          onMouseOut={(e) => e.target.style.background = '#EF4444'}
        >
          Logout
        </button>
      </header>

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* --- Role-Based Routing --- */}
        
        {/* Pass the user object to each dashboard for context */}
        {user.role === 'Student' && <StudentDashboard user={user} />}
        
        {user.role === 'Landlord' && <LandlordDashboard user={user} />}
        
        {/* We pass the whole 'user' object to ParentDashboard 
            so it can check 'user.monitoring_student_id' 
        */}
        {user.role === 'Parent' && <ParentDashboard user={user} />}
      </main>

      <footer style={{
        backgroundColor: '#1F2937',
        color: '#D1D5DB',
        padding: '25px 30px',
        textAlign: 'center',
        fontSize: '12px',
        borderTop: '1px solid #374151',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#FBBF24' }}>Token-Rental System</p>
          <p style={{ margin: '0 0 8px 0' }}>&copy; 2026 Vertex Technologies. Secure accommodation management platform</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '11px' }}>
            <span>Contact: support@vertextech.com</span>
            <span>|</span>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;