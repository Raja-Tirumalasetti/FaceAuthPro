import React, { useState } from 'react';
import { Menu, X, LogIn, UserPlus, Info, BarChart3, AlertCircle, Settings } from 'lucide-react';
import '../styles/Navigation.css';

const Navigation = ({ currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'accuracy', label: 'Accuracy Monitor', icon: BarChart3 },
    { id: 'camera', label: 'Camera Not Working?', icon: AlertCircle },
    { id: 'admin', label: 'Admin Portal', icon: Settings },
  ];

  const quickLinks = [
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'about', label: 'About', icon: Info },
    { id: 'accuracy', label: 'Accuracy', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="navigation">
      {/* Logo/Project Name */}
      <div className="nav-brand">
        <div className="logo-icon">FA</div>
        <span className="brand-name">FaceAuth Pro</span>
      </div>

      {/* Desktop Menu (Center) */}
      <ul className="nav-menu-desktop">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Quick Links (Right Side) */}
      <div className="quick-links">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              className={`quick-link-btn ${currentPage === link.id ? 'active' : ''}`}
              onClick={() => onNavigate(link.id)}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Hamburger Menu */}
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="nav-menu-mobile">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-link-mobile ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
