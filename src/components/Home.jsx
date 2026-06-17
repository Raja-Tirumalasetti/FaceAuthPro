import React from 'react';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import '../styles/Pages.css';

const Home = ({ onNavigate }) => {
  return (
    <div className="page-container home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">FaceAuth Pro</span>
          </h1>
          <p className="hero-subtitle">
            Advanced Facial Recognition & Secure Authentication System
          </p>
          <p className="hero-description">
            Experience the future of biometric security with cutting-edge face recognition technology.
            Fast, secure, and completely contactless authentication.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => onNavigate('login')}>
              Get Started <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('about')}>
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">&lt;1s</div>
            <div className="stat-label">Recognition</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">50K+</div>
            <div className="stat-label">Users</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose FaceAuth Pro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Shield size={32} />
            <h3>Highly Secure</h3>
            <p>Military-grade encryption and advanced facial recognition algorithms</p>
          </div>
          <div className="feature-card">
            <Zap size={32} />
            <h3>Lightning Fast</h3>
            <p>Recognition in under a second with optimized AI models</p>
          </div>
          <div className="feature-card">
            <Users size={32} />
            <h3>Multi-Modal Auth</h3>
            <p>Face ID, Email/Password, and Security Questions for flexibility</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
