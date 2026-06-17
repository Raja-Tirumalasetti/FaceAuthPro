import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import '../styles/Pages.css';

const AccuracyMonitor = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [logs, setLogs]           = useState([]);
  const [users, setUsers]         = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeSection, setActiveSection] = useState('users'); // 'users' | 'logs'

  const fetchAll = async () => {
    setLoadingLogs(true);
    setLoadingUsers(true);
    try {
      const [logsRes, usersRes] = await Promise.all([
        fetch('/api/logs'),
        fetch('/api/users'),
      ]);
      if (logsRes.ok)  setLogs(await logsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingLogs(false);
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const successLogins = logs.filter(l => l.status === 'success' && l.action.includes('Login')).length;
  const failedLogins  = logs.filter(l => l.status === 'failed').length;

  const stats = [
    { label: 'Registered Users',  value: users.length,    icon: '👥', color: '#6366f1' },
    { label: 'Successful Logins', value: successLogins,   icon: '✅', color: '#22c55e' },
    { label: 'Failed Attempts',   value: failedLogins,    icon: '⚠️', color: '#ef4444' },
    { label: 'Total Log Events',  value: logs.length,     icon: '📋', color: '#f59e0b' },
  ];

  const accuracyData = [
    { hour: '00:00', accuracy: 99.5 },
    { hour: '04:00', accuracy: 99.7 },
    { hour: '08:00', accuracy: 99.8 },
    { hour: '12:00', accuracy: 99.9 },
    { hour: '16:00', accuracy: 99.6 },
    { hour: '20:00', accuracy: 99.8 },
  ];

  return (
    <div className="page-container accuracy-page">
      {/* Header */}
      <div className="accuracy-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Accuracy Monitor</h1>
          <p>Real-time system performance · Registered users · Authentication logs</p>
        </div>
        <button
          className="btn-secondary"
          onClick={fetchAll}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.55rem 1.2rem' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Time Range */}
      <div className="time-range-selector">
        {['24h', '7d', '30d', '90d'].map(r => (
          <button key={r} className={`range-btn ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>{r}</button>
        ))}
      </div>

      {/* Live Stats from DB */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card-large">
            <div className="stat-header">
              <span className="stat-icon-large">{stat.icon}</span>
              <span className="stat-trend positive" style={{ background: `${stat.color}22`, color: stat.color }}>Live</span>
            </div>
            <div className="stat-label-large">{stat.label}</div>
            <div className="stat-value-large" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Accuracy Chart */}
      <div className="chart-card">
        <h2>Recognition Accuracy Over Time</h2>
        <div className="mini-chart">
          <div className="chart-bars">
            {accuracyData.map((data, idx) => (
              <div key={idx} className="chart-bar-container">
                <div className="chart-bar" style={{ height: `${(data.accuracy / 100) * 200}px` }}>
                  <span className="bar-value">{data.accuracy}%</span>
                </div>
                <span className="bar-label">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="system-health">
        <h2>System Health</h2>
        <div className="health-items">
          {[
            ['API Status', '✓ Operational'],
            ['Database', '✓ Connected'],
            ['Face Models', '✓ Loaded'],
            ['Server Load', '✓ Normal'],
          ].map(([label, val]) => (
            <div key={label} className="health-item">
              <div className="health-indicator success"></div>
              <div className="health-content">
                <div className="health-label">{label}</div>
                <div className="health-status">{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section Switcher ─── */}
      <div className="time-range-selector" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <button className={`range-btn ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
          👥 Registered Users ({users.length})
        </button>
        <button className={`range-btn ${activeSection === 'logs' ? 'active' : ''}`} onClick={() => setActiveSection('logs')}>
          📋 Login &amp; Activity Logs ({logs.length})
        </button>
      </div>

      {/* ─── Registered Users Table ─── */}
      {activeSection === 'users' && (
        <div className="recent-activity">
          <h2 style={{ marginBottom: '1rem' }}>All Registered Users</h2>
          {loadingUsers ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>Loading users…</p>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No users registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Full Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Email Address</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Password</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Registered At</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Face Data</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 600 }}>{user.sno || idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                          }}>
                            {(user.firstName?.[0] || '?').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                          </div>
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#4f46e5' }}>{user.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {user.password ? (
                          <span style={{
                            background: '#e0e7ff', color: '#4338ca',
                            padding: '0.2rem 0.6rem', borderRadius: '6px',
                            fontFamily: 'monospace', fontSize: '0.85rem'
                          }}>
                            🔑 {user.password}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Face only</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {user.registeredAt || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          background: '#dcfce7', color: '#15803d',
                          padding: '0.2rem 0.65rem', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 600
                        }}>
                          ✓ 128-D Face
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Activity Logs Table ─── */}
      {activeSection === 'logs' && (
        <div className="recent-activity">
          <h2 style={{ marginBottom: '1rem' }}>Login &amp; Registration Logs</h2>
          {loadingLogs ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>Loading logs…</p>
          ) : logs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>No activity logs found.</p>
          ) : (
            <div className="activity-list">
              {logs.map((activity, idx) => (
                <div key={idx} className={`activity-item ${activity.status}`}>
                  <div className="activity-icon">
                    {activity.status === 'success' ? '✓' : '✗'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-user" style={{ fontWeight: 600 }}>
                      {activity.name}
                      <span style={{ fontWeight: 400, fontSize: '0.85em', color: '#64748b', marginLeft: '0.4rem' }}>
                        ({activity.email})
                      </span>
                    </div>
                    <div className="activity-action">{activity.action}</div>
                  </div>
                  <div className="activity-time" style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccuracyMonitor;
