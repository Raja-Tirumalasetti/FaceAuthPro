import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, ShieldCheck, X, ArrowLeft, Loader } from 'lucide-react';

const CENTER_COLOR = '#06b6d4';

const Register = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const formDataRef = useRef({ firstName: '', lastName: '', email: '', password: '' }); // always up-to-date for interval closures
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStep, setScanStep]         = useState('none'); // 'none'|'scanning'|'complete'
  const [scanFeedback, setScanFeedback] = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);

  const descriptorRef = useRef(null); // single captured descriptor

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const loopRef  = useRef(null);

  // Load face-api models
  useEffect(() => {
    let active = true;
    const loadModels = async () => {
      try {
        setError('');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        if (active) setModelsLoaded(true);
      } catch (err) {
        console.error('Models loading failed', err);
        if (active) setError('Failed to load Face Recognition models.');
      }
    };
    loadModels();
    return () => { active = false; stopVideo(); };
  }, []);

  const handleInputChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    formDataRef.current = updated; // keep ref in sync
  };

  const startVideo = async () => {
    setError('');
    setCameraActive(true);
    setScanFeedback('Accessing webcam…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
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
    } catch (err) {
      console.error(err);
      setError('Webcam access denied or unavailable.');
      setCameraActive(false);
      setScanStep('none');
    }
  };

  const stopVideo = () => {
    if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // ─── Start scan ──────────────────────────────────────────────────────────────
  const startFaceScan = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields first.');
      return;
    }
    setError('');
    descriptorRef.current = null;
    setScanStep('scanning');
    startVideo();
  };

  const cancelScan = () => {
    stopVideo();
    setScanStep('none');
    descriptorRef.current = null;
    setScanFeedback('');
    setError('');
  };

  // ─── Drawing helpers ────────────────────────────────────────────────────────
  const drawBrackets = (ctx, box, color) => {
    const corner = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    // top-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + corner); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + corner, box.y); ctx.stroke();
    // top-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - corner, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + corner); ctx.stroke();
    // bottom-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - corner); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + corner, box.y + box.height); ctx.stroke();
    // bottom-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - corner, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - corner); ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // ─── Main detection loop ────────────────────────────────────────────────────
  const handlePlay = () => {
    if (loopRef.current) clearInterval(loopRef.current);

    loopRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setScanFeedback('No face detected — position your face in the frame…');
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return;
      }

      // Draw brackets
      if (canvasRef.current) {
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resized = faceapi.resizeResults(detection, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);
        drawBrackets(ctx, resized.detection.box, CENTER_COLOR);
      }

      // ✅ Face detected — capture descriptor and register
      setScanFeedback('✅ Face captured! Registering…');
      clearInterval(loopRef.current);
      loopRef.current = null;
      descriptorRef.current = Array.from(detection.descriptor);
      setScanStep('complete');
      stopVideo();
      submitRegistration(descriptorRef.current);
    }, 500);
  };

  // ─── Submit registration with single descriptor ─────────────────────────────
  const extractError = (data) => {
    if (!data) return 'Unknown error';
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      // FastAPI Pydantic validation error — array of {msg, loc, type}
      return data.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
    }
    if (typeof data.detail === 'object') return JSON.stringify(data.detail);
    if (data.message) return data.message;
    return 'Registration failed. Please try again.';
  };

  const submitRegistration = async (desc) => {
    setLoading(true);
    setError('');
    const fd = { ...formData }; // use latest state instead of ref
    if (!desc) {
      setError('Could not capture face data. Please try again.');
      setScanStep('scanning');
      startVideo();
      setLoading(false);
      return;
    }
    try {
      console.log('Submitting registration payload:', {
        firstName:  fd.firstName,
        lastName:   fd.lastName,
        email:      fd.email,
        password:   fd.password,
        descriptor: desc,
      });
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:  fd.firstName,
          lastName:   fd.lastName,
          email:      fd.email,
          password:   fd.password,
          descriptor: desc,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(extractError(data));
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => onBackToLogin(), 2500);
    } catch (err) {
      setError(err.message || 'Server error during registration.');
      setScanStep('none');
      descriptorRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="glass-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
        <button onClick={onBackToLogin} className="link-btn" style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="glass-title" style={{ margin: 0, fontSize: '1.75rem' }}>Create Account</h2>
      </div>
      <p className="glass-subtitle">Fill your details &amp; look straight at the camera to register</p>

      {error   && <div className="status-toast error">{error}</div>}
      {success && <div className="status-toast success">{success}</div>}

      {/* ── Form ── */}
      {scanStep === 'none' && (
        <div>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter password" className="form-input" />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={startFaceScan} disabled={!modelsLoaded} className="btn-primary">
              {!modelsLoaded ? (
                <><Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading Face Engine…</>
              ) : (
                <><Camera size={20} /> Scan Face
                </>
              )}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <span className="face-icon-badge" style={{ margin: 0 }}>😐 Look straight at the camera</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Scanner ── */}
      {(scanStep === 'scanning' || scanStep === 'complete') && (
        <div>
          {/* Center indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.3rem 0.75rem', borderRadius: '20px',
              fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.03em',
              border: `2px solid ${scanStep === 'complete' ? CENTER_COLOR : CENTER_COLOR}`,
              background: scanStep === 'complete' ? CENTER_COLOR : `${CENTER_COLOR}22`,
              color: scanStep === 'complete' ? '#fff' : CENTER_COLOR,
              transition: 'all 0.3s ease',
            }}>
              {scanStep === 'complete' ? '✓' : '●'} Center
            </div>
          </div>

          <div className="scanner-card">
            {cameraActive && (
              <>
                <video ref={videoRef} autoPlay muted onPlay={handlePlay} className="scanner-video" />
                <canvas ref={canvasRef} className="scanner-canvas" />
                <div className="scanner-overlay" />
                <div className={`scanner-laser ${scanStep === 'complete' ? 'success' : ''}`} />
              </>
            )}

            {scanStep === 'complete' && !cameraActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
                <ShieldCheck size={56} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Face Captured!</span>
              </div>
            )}

            <div className="scanner-guide-text">{scanFeedback}</div>
          </div>

          {/* Instruction banner */}
          {scanStep === 'scanning' && (
            <div style={{
              marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'center',
              background: `${CENTER_COLOR}18`, border: `1px solid ${CENTER_COLOR}44`,
              color: CENTER_COLOR, fontWeight: 600, fontSize: '0.9rem'
            }}>
              😐 Look straight at the camera
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {scanStep === 'complete' && (
              <button className="btn-primary" disabled style={{ flex: 1 }}>
                <Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                {loading ? 'Registering…' : 'Processing…'}
              </button>
            )}
            <button className="btn-secondary" onClick={cancelScan} style={{ flexBasis: scanStep === 'complete' ? '40%' : '100%' }}>
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
