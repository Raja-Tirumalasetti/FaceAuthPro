import React, { useState, useEffect } from 'react';
import { Users, Clock, Search, ShieldCheck, ShieldAlert, Database, FileText, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import '../styles/Pages.css';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'logs'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const usersRes = await fetch('/api/users');
      const logsRes = await fetch('/api/logs');
      if (usersRes.ok && logsRes.ok) {
        const usersData = await usersRes.json();
        const logsData = await logsRes.json();
        setUsers(usersData);
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalLogs = logs.length;
  const successLogins = logs.filter(l => l.status === 'success' && l.action.includes('Login')).length;
  const failedLogins = logs.filter(l => l.status === 'failed' && l.action.includes('Login')).length;

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(log => 
    log.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container admin-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 1rem 4rem', width: '100%' }}>
      
      {/* Centered Main Control Card */}
      <div className="glass-container" style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Centered Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 className="glass-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Admin Control Portal</h1>
          <p className="glass-subtitle" style={{ fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            Manage user credentials, check face recognition configurations, and review authentication logs
          </p>
          <button 
            className="btn-secondary" 
            onClick={fetchData} 
            disabled={refreshing} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: 'auto', 
              padding: '0.6rem 1.5rem',
              margin: '0 auto'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Centered Admin Stats Row */}
        <div className="stats-grid" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1.5rem', 
          width: '100%', 
          flexWrap: 'wrap',
          marginBottom: '0.5rem'
        }}>
          <div className="stat-card-large" style={{ flex: '1 1 280px', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="stat-header" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="stat-icon-large" style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </span>
              <span className="stat-trend positive" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff', alignSelf: 'center' }}>Active</span>
            </div>
            <div className="stat-label-large">Total Registered Users</div>
            <div className="stat-value-large" style={{ fontSize: '2rem' }}>{users.length}</div>
          </div>

          <div className="stat-card-large" style={{ flex: '1 1 280px', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="stat-header" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="stat-icon-large" style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </span>
              <span className="stat-trend positive" style={{ alignSelf: 'center' }}>Success</span>
            </div>
            <div className="stat-label-large">Successful Logins</div>
            <div className="stat-value-large" style={{ fontSize: '2rem' }}>{successLogins}</div>
          </div>

          <div className="stat-card-large" style={{ flex: '1 1 280px', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="stat-header" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="stat-icon-large" style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={24} />
              </span>
              <span className="stat-trend negative" style={{ color: '#b91c1c', backgroundColor: '#fee2e2', alignSelf: 'center' }}>Alerts</span>
            </div>
            <div className="stat-label-large">Failed Login Attempts</div>
            <div className="stat-value-large" style={{ fontSize: '2rem' }}>{failedLogins}</div>
          </div>
        </div>

        {/* Centered Switcher & Search Bar */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%', 
          gap: '1rem',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: '1.5rem'
        }}>
          <div className="time-range-selector" style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            <button 
              className={`range-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Database size={16} />
              User Database ({users.length})
            </button>
            <button 
              className={`range-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => { setActiveTab('logs'); setSearchQuery(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Clock size={16} />
              Authentication Logs ({logs.length})
            </button>
          </div>

          <div className="search-box" style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder={activeTab === 'users' ? 'Search by name or email...' : 'Search logs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            />
          </div>
        </div>

        {/* Centered Table Content */}
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          backgroundColor: 'rgba(255, 255, 255, 0.5)', 
          borderRadius: '16px', 
          border: '1px solid rgba(0,0,0,0.05)', 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
          padding: '1rem'
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading Admin Portal Data...</p>
          ) : activeTab === 'users' ? (
            // Users Table – full details
            filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No users found matching search criteria.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 0.75rem' }}>#</th>
                    <th style={{ padding: '0.85rem 0.75rem' }}>Full Name</th>
                    <th style={{ padding: '0.85rem 0.75rem' }}>Email Address</th>
                    <th style={{ padding: '0.85rem 0.75rem' }}>Password</th>
                    <th style={{ padding: '0.85rem 0.75rem' }}>Registered At</th>
                    <th style={{ padding: '0.85rem 0.75rem' }}>Face Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.9rem 0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                        {user.sno || idx + 1}
                      </td>
                      <td style={{ padding: '0.9rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                          }}>
                            {(user.firstName?.[0] || '?').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 0.75rem', color: '#4f46e5' }}>{user.email}</td>
                      <td style={{ padding: '0.9rem 0.75rem' }}>
                        {user.password ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            background: '#e0e7ff', color: '#4338ca',
                            padding: '0.2rem 0.65rem', borderRadius: '6px',
                            fontFamily: 'monospace', fontSize: '0.85rem'
                          }}>
                            <Key size={11} />{user.password}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Face Only</span>
                        )}
                      </td>
                      <td style={{ padding: '0.9rem 0.75rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {user.registeredAt || '—'}
                      </td>
                      <td style={{ padding: '0.9rem 0.75rem' }}>
                        <span style={{
                          background: '#dcfce7', color: '#15803d',
                          padding: '0.2rem 0.65rem', borderRadius: '20px',
                          fontSize: '0.78rem', fontWeight: 600
                        }}>
                          ✓ 128-D Face
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            // Logs Table
            filteredLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No activity logs found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>User / Subject</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action Type</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '0.95rem' }}>
                      <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap', textAlign: 'center' }}>{log.timestamp}</td>
                      <td style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}>{log.name || 'Guest User'}</td>
                      <td style={{ padding: '1rem', color: '#475569', textAlign: 'center' }}>{log.email}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{log.action}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span className={`face-icon-badge ${log.status === 'success' ? 'success' : 'failed'}`} style={{ margin: 0, padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'capitalize', display: 'inline-block' }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
      
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminPortal;
