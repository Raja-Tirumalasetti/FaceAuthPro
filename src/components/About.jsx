import React from 'react';
import { CheckCircle, Globe, Lightbulb, Award, Code, GitBranch, Package, Zap } from 'lucide-react';
import '../styles/Pages.css';

const About = () => {
  const projectDetails = [
    {
      title: 'Project Name',
      value: 'FaceAuth Pro',
      description: 'Advanced Facial Recognition & Secure Authentication System'
    },
    {
      title: 'Version',
      value: '1.0.0',
      description: 'Production Ready'
    },
    {
      title: 'Status',
      value: 'Active',
      description: 'Fully Operational'
    },
    {
      title: 'Last Updated',
      value: 'June 2026',
      description: 'Latest features implemented'
    }
  ];

  const techStack = [
    {
      category: 'Frontend',
      icon: <Globe size={24} />,
      technologies: [
        'React 19.2.6 - UI Framework',
        'Vite 8.0.12 - Build Tool',
        'Lucide React - Icon Library',
        'Modern CSS3 - Styling',
      ],
    },
    {
      category: 'AI/ML',
      icon: <Lightbulb size={24} />,
      technologies: [
        'Face-API - Facial Recognition',
        'TensorFlow.js - ML Models',
        'DNN - Deep Neural Networks',
        'Tiny Face Detector - Real-time Detection',
      ],
    },
    {
      category: 'Backend',
      icon: <Code size={24} />,
      technologies: [
        'FastAPI 0.110.0 - Web Framework',
        'Python 3.x - Backend Language',
        'Uvicorn - ASGI Server',
        'Pydantic - Data Validation',
      ],
    },
    {
      category: 'Database & Tools',
      icon: <Package size={24} />,
      technologies: [
        'JSON - Data Storage',
        'Email Validator - Email Verification',
        'ESLint - Code Quality',
        'Vite Config - Build Configuration',
      ],
    },
  ];

  const features = [
    {
      title: 'Multi-Modal Authentication',
      description: 'Face ID, Email/Password, and Security Questions for flexible access',
      icon: '🔐',
    },
    {
      title: 'Real-Time Facial Recognition',
      description: 'Sub-1 second recognition time with 99.8% accuracy',
      icon: '⚡',
    },
    {
      title: 'Secure Data Storage',
      description: 'Encrypted face descriptors and secure user information management',
      icon: '🛡️',
    },
    {
      title: 'Camera Troubleshooting',
      description: 'Built-in diagnostic tools and step-by-step camera setup guide',
      icon: '📷',
    },
    {
      title: 'Performance Monitoring',
      description: 'Real-time analytics and accuracy tracking dashboard',
      icon: '📊',
    },
    {
      title: 'Responsive Design',
      description: 'Fully responsive UI that works on desktop, tablet, and mobile',
      icon: '📱',
    },
  ];

  const codeStructure = [
    {
      path: 'src/',
      description: 'Frontend React application',
      items: [
        'components/ - React Components (Login, Register, Dashboard, etc.)',
        'styles/ - CSS files (Navigation, Pages, AdvancedLogin, GetHelp)',
        'App.jsx - Main application component',
        'main.jsx - Application entry point',
      ]
    },
    {
      path: 'backend/',
      description: 'FastAPI backend server',
      items: [
        'main.py - FastAPI application',
        'requirements.txt - Python dependencies',
        'users.json - User database',
      ]
    },
    {
      path: 'public/',
      description: 'Static assets',
      items: [
        'models/ - Pre-trained face recognition models',
        '  - face_landmark_68_model',
        '  - face_recognition_model',
        '  - tiny_face_detector_model',
      ]
    },
  ];

  const dependencies = [
    { name: 'React', version: '19.2.6', type: 'Frontend Framework' },
    { name: 'Vite', version: '8.0.12', type: 'Build Tool' },
    { name: 'Face-API', version: '1.7.15', type: 'AI/ML' },
    { name: 'Lucide React', version: '1.18.0', type: 'UI Components' },
    { name: 'FastAPI', version: '0.110.0', type: 'Backend Framework' },
    { name: 'Uvicorn', version: '0.28.0', type: 'ASGI Server' },
    { name: 'Pydantic', version: '2.6.0', type: 'Data Validation' },
  ];

  return (
    <div className="page-container about-page">
      <div className="about-header">
        <h1>About FaceAuth Pro</h1>
        <p>Advanced Facial Recognition Authentication System</p>
      </div>

      {/* Project Details */}
      <div className="about-content">
        <section className="about-section">
          <h2>Project Overview</h2>
          <div className="project-details-grid">
            {projectDetails.map((detail, idx) => (
              <div key={idx} className="detail-card">
                <div className="detail-title">{detail.title}</div>
                <div className="detail-value">{detail.value}</div>
                <div className="detail-desc">{detail.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-showcase">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-showcase-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack-grid">
            {techStack.map((stack, idx) => (
              <div key={idx} className="tech-stack-card">
                <div className="tech-header">
                  <div className="tech-icon">{stack.icon}</div>
                  <h3>{stack.category}</h3>
                </div>
                <ul className="tech-list">
                  {stack.technologies.map((tech, i) => (
                    <li key={i}>
                      <CheckCircle size={16} />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Project Structure</h2>
          <div className="code-structure">
            {codeStructure.map((section, idx) => (
              <div key={idx} className="structure-card">
                <div className="structure-header">
                  <GitBranch size={20} />
                  <div>
                    <h3>{section.path}</h3>
                    <p>{section.description}</p>
                  </div>
                </div>
                <ul className="file-list">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Dependencies & Packages</h2>
          <div className="dependencies-table">
            <div className="table-header">
              <div className="col-name">Package Name</div>
              <div className="col-version">Version</div>
              <div className="col-type">Type</div>
            </div>
            {dependencies.map((dep, idx) => (
              <div key={idx} className="table-row">
                <div className="col-name">
                  <Package size={16} />
                  {dep.name}
                </div>
                <div className="col-version">{dep.version}</div>
                <div className="col-type">{dep.type}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Getting Started</h2>
          <div className="getting-started">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Install Dependencies</h3>
              <code>npm install</code>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Start Frontend</h3>
              <code>npm run dev</code>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Backend</h3>
              <code>python -m uvicorn backend.main:app --reload</code>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Access Application</h3>
              <code>http://localhost:5173</code>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Vision</h2>
          <p>
            FaceAuth Pro represents the future of authentication technology. By combining cutting-edge facial recognition
            AI, secure authentication methods, and user-friendly design, we're creating a world where biometric security
            is the standard. Our mission is to make advanced security accessible, affordable, and easy to use for everyone.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
