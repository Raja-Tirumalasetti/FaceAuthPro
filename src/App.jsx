import React, { useState } from 'react';
import Navigation from './components/Navigation';
import AdvancedLogin from './components/AdvancedLogin';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import About from './components/About';
import AccuracyMonitor from './components/AccuracyMonitor';
import CameraNotWorking from './components/CameraNotWorking';
import GetHelp from './components/GetHelp';
import AdminPortal from './components/AdminPortal';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    if (page === 'login' && user) {
      setCurrentPage('dashboard');
    } else if (page === 'dashboard' && !user) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="app-wrapper">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      {/* Pages */}
      {currentPage === 'login' && !user && (
        <AdvancedLogin 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateToRegister={() => setCurrentPage('register')} 
        />
      )}
      
      {currentPage === 'register' && (
        <div style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '100px',
          paddingBottom: '2rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '100px 1rem 2rem',
        }}>
          <Register 
            onBackToLogin={() => setCurrentPage('login')} 
          />
        </div>
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      
      {currentPage === 'about' && <About />}
      
      {currentPage === 'accuracy' && <AccuracyMonitor />}
      
      {currentPage === 'camera' && <CameraNotWorking />}
      
      {currentPage === 'admin' && <AdminPortal />}
      
      {currentPage === 'login' && <GetHelp />}
    </div>
  );
}

export default App;
