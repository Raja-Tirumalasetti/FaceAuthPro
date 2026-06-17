import React from 'react';
import { LogOut, User, Mail, ShieldCheck } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="page-container dashboard-page">
      <div className="glass-container dashboard-card">
        <div className="profile-avatar">
          {initials || <User size={40} />}
        </div>
        
        <h2 className="glass-title" style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
          Welcome back!
        </h2>
        <p className="glass-subtitle" style={{ marginBottom: '1.5rem' }}>
          Successfully authenticated with Face ID
        </p>

        <div className="status-toast success" style={{ justifyContent: 'center' }}>
          <ShieldCheck size={20} />
          <span>Secure Session Active</span>
        </div>

        <div className="details-grid">
          <div className="detail-row">
            <span className="detail-label">First Name</span>
            <span className="detail-value">{user.firstName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Name</span>
            <span className="detail-value">{user.lastName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email}</span>
          </div>
        </div>

        <button className="btn-secondary" onClick={onLogout} style={{ width: '100%' }}>
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
