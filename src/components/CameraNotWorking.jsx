import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/Pages.css';

const CameraNotWorking = () => {
  const troubleshootingSteps = [
    {
      title: 'Check Browser Permissions',
      description: 'Look for camera icon in your address bar and click Allow',
      steps: [
        'Look for the camera icon in the address bar (top-left)',
        'Click on it and select "Allow" for camera access',
        'Refresh the page after enabling access',
      ],
    },
    {
      title: 'Browser Settings',
      description: 'Configure camera permissions in browser settings',
      steps: [
        'Go to browser Settings → Privacy & Security',
        'Find "Camera" permissions section',
        'Ensure this website is set to "Allow"',
        'Clear site data and reload',
      ],
    },
    {
      title: 'Restart Browser',
      description: 'Sometimes a fresh browser restart helps',
      steps: [
        'Close ALL tabs and windows',
        'Close the entire browser',
        'Wait 5 seconds',
        'Reopen the browser and reload this page',
      ],
    },
    {
      title: 'Check Webcam Hardware',
      description: 'Verify your webcam is working',
      steps: [
        'Test camera in another app (e.g., Skype, Zoom)',
        'If not working there either, restart your computer',
        'Check if camera lens is covered or dirty',
        'Try a different USB port if using external webcam',
      ],
    },
    {
      title: 'Update Browser',
      description: 'Ensure you have the latest browser version',
      steps: [
        'Check for browser updates',
        'Install any available updates',
        'Restart browser completely',
        'Try camera access again',
      ],
    },
    {
      title: 'Clear Cache & Cookies',
      description: 'Remove cached data that might cause issues',
      steps: [
        'Open browser Settings',
        'Go to "Clear browsing data"',
        'Select "All time" and check "Cookies and cached images"',
        'Click "Clear data" and reload this page',
      ],
    },
  ];

  const alternativeLogins = [
    {
      title: 'Email & Password',
      description: 'Use traditional email and password to log in',
      icon: '📧',
    },
    {
      title: 'Security Questions',
      description: 'Answer security questions to verify your identity',
      icon: '❓',
    },
  ];

  return (
    <div className="page-container camera-working-page">
      <div className="camera-header">
        <AlertCircle size={48} />
        <h1>Camera Not Working?</h1>
        <p>Follow these steps to troubleshoot and get your camera working</p>
      </div>

      <div className="quick-tips">
        <div className="tip">
          <CheckCircle size={20} />
          <p>Make sure you're using a compatible browser (Chrome, Firefox, Safari, Edge)</p>
        </div>
        <div className="tip">
          <CheckCircle size={20} />
          <p>Ensure your device has a webcam connected and working</p>
        </div>
        <div className="tip">
          <CheckCircle size={20} />
          <p>Check that no other app is using your camera</p>
        </div>
      </div>

      <div className="troubleshooting-container">
        <h2>Troubleshooting Steps</h2>
        <div className="steps-grid">
          {troubleshootingSteps.map((step, idx) => (
            <div key={idx} className="troubleshooting-card">
              <div className="step-header">
                <span className="step-badge">{idx + 1}</span>
                <h3>{step.title}</h3>
              </div>
              <p className="step-description">{step.description}</p>
              <ol className="step-list">
                {step.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="alternatives-section">
        <h2>Can't Fix Camera? Use Alternative Login Methods</h2>
        <div className="alternatives-grid">
          {alternativeLogins.map((alt, idx) => (
            <div key={idx} className="alternative-card">
              <div className="alt-icon">{alt.icon}</div>
              <h3>{alt.title}</h3>
              <p>{alt.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="help-section">
        <h2>Still Having Issues?</h2>
        <p>If you've tried all the steps above and your camera still isn't working:</p>
        <ul>
          <li>Check your device's physical camera (laptop built-in or USB webcam)</li>
          <li>Test camera in other applications like Skype or Zoom</li>
          <li>Restart your computer completely</li>
          <li>Update your device drivers</li>
          <li>Try a different browser</li>
          <li>Contact support for additional help</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraNotWorking;
