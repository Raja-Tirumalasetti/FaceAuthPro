import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Loader, X } from 'lucide-react';


// ─── Main Login Component ───────────────────────────────────────────────────
const Login = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('loading');
  const [feedback, setFeedback] = useState('Initializing Face ID engine...');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const isVerifyingRef = useRef(false);

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
    return () => { active = false; stopVideo(); };
  }, []);

  const startVideo = async () => {
    setError('');
    setScanStatus('scanning');
    setFeedback('Accessing webcam...');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          let retries = 10;
          const assign = () => {
            if (videoRef.current) { videoRef.current.srcObject = stream; }
            else if (retries-- > 0) setTimeout(assign, 80);
          };
          assign();
        }
      }, 80);
      setFeedback('Scanning for face...');
    } catch (err) {
      console.error(err);
      setError('Webcam access was denied or is unavailable.');
      setScanStatus('ready');
      setFeedback('Camera access failed.');
      setCameraActive(false);
    }
  };

  const stopVideo = () => {
    if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
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
        .withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        if (canvasRef.current) {
          const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resized = faceapi.resizeResults(detection, displaySize);
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, displaySize.width, displaySize.height);
          const box = resized.detection.box;
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        }
        setFeedback('Verifying identity...');
        isVerifyingRef.current = true;
        try {
          const response = await fetch('/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptor: Array.from(detection.descriptor) })
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
                setScanStatus('scanning'); setError(''); setFeedback('Scanning for face...'); isVerifyingRef.current = false;
              }
            }, 2000);
          }
        } catch {
          setScanStatus('failed');
          setError('Server connection error. Make sure backend is running.');
          setTimeout(() => { isVerifyingRef.current = false; setScanStatus('scanning'); }, 3000);
        }
      } else {
        setFeedback('Position your face in the camera view...');
      }
    }, 500);
  };

  return (
    <div className="glass-container" style={{ position: 'relative' }}>
      <h2 className="glass-title">Face Unlock</h2>
      <p className="glass-subtitle">Sign in securely using face recognition</p>

      {error && <div className="status-toast error">{error}</div>}

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
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', color:'var(--text-muted)' }}>
            <Camera size={48} style={scanStatus === 'loading' ? { animation:'spin 1s linear infinite' } : {}} />
            <span style={{ fontSize:'0.9rem' }}>
              {scanStatus === 'loading' ? 'Loading face models...' : 'Camera Offline'}
            </span>
          </div>
        )}
        <div className="scanner-guide-text">{feedback}</div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {!cameraActive ? (
          <button className="btn-primary" onClick={startVideo} disabled={!modelsLoaded}>
            {scanStatus === 'loading'
              ? <><Loader size={18} style={{ animation:'spin 0.8s linear infinite' }} /> Loading...</>
              : <><Camera size={18} /> Scan Face to Log In</>}
          </button>
        ) : (
          <button className="btn-secondary" onClick={stopVideo}>Stop Scanner</button>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign:'center', fontSize:'0.9rem', color:'var(--text-muted)' }}>
        Don't have an account?{' '}
        <button className="link-btn" onClick={onNavigateToRegister}>Register here</button>
      </div>
    </div>
  );
};

export default Login;
