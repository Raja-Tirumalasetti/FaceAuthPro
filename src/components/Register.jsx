import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Check, ShieldCheck, X, ArrowLeft, Loader } from 'lucide-react';

// ─── Orientation detection using 68-point landmarks ───────────────────────────
// nose tip: 30, left-eye-outer: 36, right-eye-outer: 45
// offset > +0.15  → user turned RIGHT  (in webcam pixel space)
// offset < -0.15  → user turned LEFT
// else            → CENTER
const detectOrientation = (landmarks) => {
  const pts = landmarks.positions;
  const noseTip      = pts[30];
  const leftEyeOut   = pts[36];
  const rightEyeOut  = pts[45];
  const eyeCenterX   = (leftEyeOut.x + rightEyeOut.x) / 2;
  const faceWidth    = Math.abs(rightEyeOut.x - leftEyeOut.x);
  if (faceWidth === 0) return 'center';
  const offset = (noseTip.x - eyeCenterX) / faceWidth;
  if (offset >  0.15) return 'right';
  if (offset < -0.15) return 'left';
  return 'center';
};

// Phases in order
const PHASES = ['center', 'left', 'right'];

const PHASE_CONFIG = {
  center: {
    instruction: '😐  Look straight at the camera',
    color: '#06b6d4',
    label: 'Center ✓',
    arrow: null,
  },
  left: {
    instruction: '⬅️  Now slowly turn your head LEFT',
    color: '#f59e0b',
    label: 'Left ✓',
    arrow: '←',
  },
  right: {
    instruction: '➡️  Now slowly turn your head RIGHT',
    color: '#a855f7',
    label: 'Right ✓',
    arrow: '→',
  },
};

const Register = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [modelsLoaded, setModelsLoaded]   = useState(false);
  const [cameraActive, setCameraActive]   = useState(false);
  const [scanStep, setScanStep]           = useState('none'); // 'none'|'scanning'|'complete'
  const [scanFeedback, setScanFeedback]   = useState('');
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [loading, setLoading]             = useState(false);

  // Multi-phase tracking
  const [phaseIndex, setPhaseIndex]       = useState(0);   // 0=center 1=left 2=right
  const [phaseDone, setPhaseDone]         = useState([]);   // completed phase names
  const descriptorsRef                    = useRef([]);     // collected descriptors per phase
  const phaseIndexRef                     = useRef(0);
  const phaseDoneRef                      = useRef([]);

  // Keep refs in sync so the interval closure sees current values
  const syncPhase = (idx, done) => {
    phaseIndexRef.current = idx;
    phaseDoneRef.current  = done;
    setPhaseIndex(idx);
    setPhaseDone(done);
  };

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

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  // ─── Start scan: reset all phases ──────────────────────────────────────────
  const startFaceScan = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields first.');
      return;
    }
    setError('');
    descriptorsRef.current = [];
    syncPhase(0, []);
    setScanStep('scanning');
    startVideo();
  };

  const cancelScan = () => {
    stopVideo();
    setScanStep('none');
    descriptorsRef.current = [];
    syncPhase(0, []);
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

      const currentPhaseIdx = phaseIndexRef.current;
      const currentDone     = phaseDoneRef.current;
      const currentPhase    = PHASES[currentPhaseIdx];
      const cfg             = PHASE_CONFIG[currentPhase];

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
        drawBrackets(ctx, resized.detection.box, cfg.color);
      }

      // Detect orientation
      const orientation = detectOrientation(detection.landmarks);

      if (orientation === currentPhase) {
        // ✅ Correct orientation — capture descriptor
        const desc     = Array.from(detection.descriptor);
        descriptorsRef.current = [...descriptorsRef.current, desc];
        const newDone  = [...currentDone, currentPhase];
        const nextIdx  = currentPhaseIdx + 1;

        if (nextIdx >= PHASES.length) {
          // All 3 phases complete
          clearInterval(loopRef.current);
          loopRef.current = null;
          syncPhase(nextIdx, newDone);
          setScanFeedback('✅ All angles captured! Registering…');
          setScanStep('complete');
          stopVideo();
          submitRegistration(descriptorsRef.current);
        } else {
          syncPhase(nextIdx, newDone);
          setScanFeedback(`✓ ${currentPhase.toUpperCase()} captured! Now: ${PHASE_CONFIG[PHASES[nextIdx]].instruction}`);
        }
      } else {
        // Guide user
        setScanFeedback(cfg.instruction);
      }
    }, 500);
  };

  // ─── Average multiple descriptors for robustness ────────────────────────────
  const averageDescriptors = (descs) => {
    if (descs.length === 0) return null;
    const len = descs[0].length;
    const avg = new Array(len).fill(0);
    for (const d of descs) {
      for (let i = 0; i < len; i++) avg[i] += d[i];
    }
    return avg.map(v => v / descs.length);
  };

  // ─── Submit registration using averaged descriptor ──────────────────────────
  const submitRegistration = async (collectedDescs) => {
    setLoading(true);
    setError('');
    const avgDesc = averageDescriptors(collectedDescs);
    if (!avgDesc) {
      setError('Could not capture face data. Please try again.');
      setScanStep('scanning');
      startVideo();
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:  formData.firstName,
          lastName:   formData.lastName,
          email:      formData.email,
          password:   formData.password,
          descriptor: avgDesc,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed.');
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => onBackToLogin(), 2500);
    } catch (err) {
      setError(err.message || 'Server error during registration.');
      setScanStep('none');
      descriptorsRef.current = [];
      syncPhase(0, []);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const currentPhaseLabel = PHASES[phaseIndex] ? PHASE_CONFIG[PHASES[phaseIndex]] : null;

  return (
    <div className="glass-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
        <button onClick={onBackToLogin} className="link-btn" style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="glass-title" style={{ margin: 0, fontSize: '1.75rem' }}>Create Account</h2>
      </div>
      <p className="glass-subtitle">Fill your details &amp; scan your face in 3 angles to register</p>

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
                <><Camera size={20} /> Scan Face (3 Angles)</>
              )}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <span className="face-icon-badge" style={{ margin: 0 }}>Center · Left · Right</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Scanner ── */}
      {(scanStep === 'scanning' || scanStep === 'complete') && (
        <div>
          {/* Phase progress indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            {PHASES.map((phase) => {
              const done   = phaseDone.includes(phase);
              const active = PHASES[phaseIndex] === phase && scanStep === 'scanning';
              const cfg    = PHASE_CONFIG[phase];
              return (
                <div key={phase} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.75rem', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.03em',
                  border: `2px solid ${done ? cfg.color : active ? cfg.color : '#cbd5e1'}`,
                  background: done ? cfg.color : active ? `${cfg.color}22` : '#f8fafc',
                  color: done ? '#fff' : active ? cfg.color : '#94a3b8',
                  transition: 'all 0.3s ease',
                }}>
                  {done ? '✓' : cfg.arrow || '●'} {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </div>
              );
            })}
          </div>

          <div className="scanner-card">
            {cameraActive && (
              <>
                <video ref={videoRef} autoPlay muted onPlay={handlePlay} className="scanner-video" />
                <canvas ref={canvasRef} className="scanner-canvas" />
                <div className="scanner-overlay" />
                <div className={`scanner-laser ${phaseDone.length > 0 ? 'success' : ''}`} />
              </>
            )}

            {scanStep === 'complete' && !cameraActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
                <ShieldCheck size={56} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>All Angles Captured!</span>
              </div>
            )}

            <div className="scanner-guide-text">{scanFeedback}</div>
          </div>

          {/* Current phase instruction banner */}
          {scanStep === 'scanning' && currentPhaseLabel && (
            <div style={{
              marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '12px', textAlign: 'center',
              background: `${currentPhaseLabel.color}18`, border: `1px solid ${currentPhaseLabel.color}44`,
              color: currentPhaseLabel.color, fontWeight: 600, fontSize: '0.9rem'
            }}>
              {currentPhaseLabel.instruction}
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
