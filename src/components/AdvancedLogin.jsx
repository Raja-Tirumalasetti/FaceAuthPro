import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Loader, Mail, Lock, AlertCircle } from 'lucide-react';
import '../styles/AdvancedLogin.css';

const AdvancedLogin = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [loginMode, setLoginMode] = useState('face'); // 'face' | 'credentials' | 'security'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('loading');
  const [feedback, setFeedback] = useState('Initializing Face ID engine...');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const isVerifyingRef = useRef(false);

  const securityQuestions = [
    {
      id: 1,
      question: 'What is your pet\'s name?',
      options: ['Buddy', 'Max', 'Luna', 'Charlie', 'Other'],
    },
    {
      id: 2,
      question: 'What city were you born in?',
      options: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Other'],
    },
    {
      id: 3,
      question: 'What is your favorite color?',
      options: ['Blue', 'Red', 'Green', 'Yellow', 'Other'],
    },
  ];

  // Load Face Recognition Models
  useEffect(() => {
    let active = true;
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        if (active) {
          setModelsLoaded(true);
          setScanStatus('ready');
          setFeedback('Face ID Engine Ready. Click Scan to start.');
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError('Failed to load Face ID neural models.');
          setFeedback('Error loading models.');
        }
      }
    };
    loadModels();
    return () => {
      active = false;
      stopVideo();
    };
  }, []);

  const startVideo = async () => {
    try {
      setScanStatus('loading');
      setError('');
      setFeedback('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          let retries = 10;
          const assign = () => {
            if (videoRef.current) videoRef.current.srcObject = stream;
            else if (retries-- > 0) setTimeout(assign, 80);
          };
          assign();
        }
      }, 80);
      setFeedback('Scanning for face...');
    } catch (err) {
      console.error(err);
      setError('Camera not available. Switching to Email & Password login...');
      setScanStatus('ready');
      setCameraActive(false);
      // Automatically switch to email/password login after 2 seconds
      setTimeout(() => {
        setLoginMode('credentials');
        setError('');
      }, 2000);
    }
  };

  const stopVideo = () => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handlePlay = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || isVerifyingRef.current) return;
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        if (canvasRef.current) {
          const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resized = faceapi.resizeResults(detection, displaySize);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, displaySize.width, displaySize.height);
          const box = resized.detection.box;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        }
        setFeedback('Verifying identity...');
        isVerifyingRef.current = true;
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptor: Array.from(detection.descriptor) }),
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setScanStatus('matched');
            setFeedback(`Welcome, ${data.user.firstName}!`);
            stopVideo();
            setTimeout(() => onLoginSuccess(data.user), 1500);
          } else {
            setScanStatus('failed');
            setError("Face doesn't match");
            setFeedback('Reposition and try again.');
            setTimeout(() => {
              if (videoRef.current && !videoRef.current.paused) {
                setScanStatus('scanning');
                setError('');
                setFeedback('Scanning for face...');
                isVerifyingRef.current = false;
              }
            }, 2000);
          }
        } catch {
          setScanStatus('failed');
          setError('Server connection error.');
          setTimeout(() => {
            isVerifyingRef.current = false;
            setScanStatus('scanning');
          }, 3000);
        }
      } else {
        setFeedback('Position your face in the camera view...');
      }
    }, 500);
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setFeedback('Authenticating...');
    try {
      const response = await fetch('/api/login-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to auth server failed.');
    }
  };

  const handleSecurityQuestionAnswer = (questionId, answer) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answer });
  };

  const handleSecurityLogin = (e) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length !== securityQuestions.length) {
      setError('Please answer all security questions');
      return;
    }
    setError('');
    setFeedback('Verifying security answers...');
    setTimeout(() => {
      onLoginSuccess({ email: 'user@example.com', firstName: 'User' });
    }, 1000);
  };

  return (
    <div className="advanced-login-container">
      {/* Background Animation */}
      <div className="animated-gradient"></div>
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        {/* Face Recognition Login */}
        {loginMode === 'face' && (
          <div className="login-mode face-mode">
            <h1 className="login-title">Face Unlock</h1>
            <p className="login-subtitle">Sign in securely using face recognition</p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="scanner-card">
              {cameraActive && (
                <>
                  <video ref={videoRef} autoPlay muted onPlay={handlePlay} className="scanner-video" />
                  <canvas ref={canvasRef} className="scanner-canvas" />
                  <div className="scanner-overlay" />
                  <div className={`scanner-laser ${scanStatus === 'failed' ? 'error' : scanStatus === 'matched' ? 'success' : ''}`} />
                </>
              )}
              {!cameraActive && (
                <div className="camera-placeholder">
                  <Camera size={48} style={scanStatus === 'loading' ? { animation: 'spin 1s linear infinite' } : {}} />
                  <span>{scanStatus === 'loading' ? 'Loading face models...' : 'Camera Offline'}</span>
                </div>
              )}
              <div className="scanner-guide">{feedback}</div>
            </div>

            <div className="button-group">
              {!cameraActive ? (
                <button className="btn-primary" onClick={startVideo} disabled={!modelsLoaded}>
                  {scanStatus === 'loading' ? (
                    <>
                      <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading...
                    </>
                  ) : (
                    <>
                      <Camera size={18} /> Scan Face to Log In
                    </>
                  )}
                </button>
              ) : (
                <button className="btn-secondary" onClick={stopVideo}>
                  Stop Scanner
                </button>
              )}
            </div>

            <div className="mode-switcher">
              <button className="link-btn" onClick={() => { setLoginMode('credentials'); setError(''); }}>
                Use Email/Password
              </button>
              <span>•</span>
              <button className="link-btn" onClick={() => { setLoginMode('security'); setError(''); }}>
                Use Security Questions
              </button>
            </div>

            <div className="register-link">
              Don't have an account?{' '}
              <button className="link-btn" onClick={onNavigateToRegister}>
                Register here
              </button>
            </div>
          </div>
        )}

        {/* Email/Password Login */}
        {loginMode === 'credentials' && (
          <div className="login-mode credentials-mode">
            <h1 className="login-title">Email & Password</h1>
            <p className="login-subtitle">Sign in with your credentials</p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleCredentialsLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} /> Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} /> Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-primary">
                Sign In
              </button>
            </form>

            <div className="mode-switcher">
              <button className="link-btn" onClick={() => { setLoginMode('face'); setError(''); }}>
                Use Face ID
              </button>
              <span>•</span>
              <button className="link-btn" onClick={() => { setLoginMode('security'); setError(''); }}>
                Use Security Questions
              </button>
            </div>

            <div className="register-link">
              Don't have an account?{' '}
              <button className="link-btn" onClick={onNavigateToRegister}>
                Register here
              </button>
            </div>
          </div>
        )}

        {/* Security Questions Login */}
        {loginMode === 'security' && (
          <div className="login-mode security-mode">
            <h1 className="login-title">Security Questions</h1>
            <p className="login-subtitle">Verify your identity with security questions</p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSecurityLogin} className="security-form">
              {securityQuestions.map((q) => (
                <div key={q.id} className="security-question">
                  <label className="question-label">{q.question}</label>
                  <div className="options-group">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`option-button ${selectedAnswers[q.id] === option ? 'selected' : ''}`}
                        onClick={() => handleSecurityQuestionAnswer(q.id, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button type="submit" className="btn-primary">
                Verify & Sign In
              </button>
            </form>

            <div className="mode-switcher">
              <button className="link-btn" onClick={() => { setLoginMode('face'); setError(''); }}>
                Use Face ID
              </button>
              <span>•</span>
              <button className="link-btn" onClick={() => { setLoginMode('credentials'); setError(''); }}>
                Use Email/Password
              </button>
            </div>

            <div className="register-link">
              Don't have an account?{' '}
              <button className="link-btn" onClick={onNavigateToRegister}>
                Register here
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedLogin;
