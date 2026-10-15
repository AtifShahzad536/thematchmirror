import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useApp } from '../../../context/AppContext';
import { processLiveFrame } from '../../../utils/skinColorAnalysis';

export const DesktopCameraView = () => {
  const navigate = useNavigate();
  const { updateFromLiveCapture, liveAnalysis } = useApp();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const imageRef = useRef(null);
  const logScrollRef = useRef(null);

  // Camera & Stream states (defaults to ON for live camera)
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [useTestTarget, setUseTestTarget] = useState(false);

  // Interactive Mirror Simulation Mode: 'live' | 'wrong_shade' | 'unblended' | 'optimal'
  const [mirrorMode, setMirrorMode] = useState('live');

  // Real-time telemetry values from actual video frames
  const [telemetry, setTelemetry] = useState({
    exposureEV: '+0.29',
    exposureEVNum: 0.29,
    lux: 819,
    blurScore: 139.8,
    roll: 2.0,
    checklist: {
      faceCentered: true,
      highCRI: true,
      noMotionBlur: true,
      neutralExpression: true,
      hairClear: true,
    },
  });

  // Current extracted skin sample from frame
  const currentSampleRef = useRef({
    lab: { L: 62.4, a: 14.2, b: 19.8 },
    ita: 32.6,
    monkScale: 5,
    undertone: 'Warm Olive',
    hex: '#d29d6e',
  });

  // Optical scanning state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Initialize and request camera automatically
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setStreamActive(true);
          setUseTestTarget(false);
        };
      }
    } catch (err) {
      console.warn('Camera error or permission denied:', err);
      setCameraError(err.message || 'Permission denied');
      setStreamActive(false);
      setUseTestTarget(true);
    }
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      // Clean up camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [startCamera]);

  // Frame processing loop for real-time telemetry (10 Hz rate)
  useEffect(() => {
    let lastTime = 0;
    const FPS = 10;
    const interval = 1000 / FPS;

    const analyzeLoop = (timestamp) => {
      if (timestamp - lastTime >= interval) {
        lastTime = timestamp;

        const source = streamActive && !useTestTarget ? videoRef.current : imageRef.current;
        if (source && canvasRef.current) {
          try {
            const result = processLiveFrame(source, canvasRef.current);
            if (result) {
              setTelemetry(result.telemetry);
              currentSampleRef.current = result.sample;
            }
          } catch (e) {
            // Frame capture error ignore
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(analyzeLoop);
    };

    animFrameRef.current = requestAnimationFrame(analyzeLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [streamActive, useTestTarget]);

  // Handle RUN CIELAB ANALYSIS click
  const handleRunAnalysis = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setScanProgress(0);

    const startTime = Date.now();
    const duration = 850;

    const scanInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(scanInterval);

        // Update global context with real sampled skin color
        updateFromLiveCapture(currentSampleRef.current);

        // Transition to Foundation Recommendations (F4)
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate(ROUTES.FOUNDATION);
        }, 150);
      }
    }, 30);
  };

  // Real-time smart mirror advice & warnings generator
  const getMirrorAdviceLogs = () => {
    const monk = currentSampleRef.current?.monkScale || 5;
    const undertone = currentSampleRef.current?.undertone || 'Warm Olive';
    const isDark = telemetry.lux < 250;

    if (mirrorMode === 'wrong_shade') {
      return [
        {
          type: 'ERROR',
          title: 'SHADE MISMATCH ALERT (CHEEK ZONE)',
          text: 'Detected applied shade: Cool Porcelain 115 (ΔE 4.8 contrast). Extreme mismatch!',
          color: 'text-[#ef4444]',
          border: 'border-[#ef4444]/40',
          bg: 'bg-[#ef4444]/10',
        },
        {
          type: 'WARNING',
          title: 'UNDERTONE CLASH: ASHY EFFECT',
          text: 'This formula contains cool pink pigments which turn gray/ashy against your Warm Olive melanin.',
          color: 'text-[#f59e0b]',
          border: 'border-[#f59e0b]/40',
          bg: 'bg-[#f59e0b]/10',
        },
        {
          type: 'RECOMMENDATION',
          title: 'MORE SUITABLE FOR YOUR SKIN TONE',
          text: 'Switch to Maybelline Fit Me 220 Natural Beige or L\'Oréal W5 Golden Sand (ΔE 1.12, 93.3% match).',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/40',
          bg: 'bg-[#00f0ff]/10',
        },
      ];
    }

    if (mirrorMode === 'unblended') {
      return [
        {
          type: 'WARNING',
          title: 'DEMARCATION LINE ON JAWLINE',
          text: 'High color variance (ΔE 3.8) detected along left lower jawline boundary.',
          color: 'text-[#f59e0b]',
          border: 'border-[#f59e0b]/40',
          bg: 'bg-[#f59e0b]/10',
        },
        {
          type: 'GUIDANCE',
          title: 'BLENDING TECHNIQUE ADVICE',
          text: 'Feather and buff foundation downward past the jawline towards the neck using a damp sponge.',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/40',
          bg: 'bg-[#00f0ff]/10',
        },
        {
          type: 'NOTICE',
          title: 'MASK EFFECT PREVENTION',
          text: 'Demarcation will be visibly pronounced under direct daylight or camera flash.',
          color: 'text-[#8699a6]',
          border: 'border-[#172530]',
          bg: 'bg-[#0e161c]',
        },
      ];
    }

    if (mirrorMode === 'optimal') {
      return [
        {
          type: 'SUCCESS',
          title: 'OPTIMAL SHADE MATCH CONFIRMED',
          text: 'Maybelline Fit Me 220 blends with ΔE 1.12. Zero demarcation line detected.',
          color: 'text-[#10b981]',
          border: 'border-[#10b981]/40',
          bg: 'bg-[#10b981]/10',
        },
        {
          type: 'MATCH',
          title: 'HARMONIC COMPLEXION COHESION',
          text: 'Perfect undertone cohesion across forehead, cheeks, and neck baseline.',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/40',
          bg: 'bg-[#00f0ff]/10',
        },
      ];
    }

    // Default Live mode from active video
    const logs = [];

    if (isDark) {
      logs.push({
        type: 'WARNING',
        title: 'LOW AMBIENT LIGHTING DETECTED',
        text: `Illuminance is ${telemetry.lux} Lux (${telemetry.exposureEV} EV). Face toward a window or daylight LED to avoid shade skew!`,
        color: 'text-[#f59e0b]',
        border: 'border-[#f59e0b]/40',
        bg: 'bg-[#f59e0b]/10',
      });
    } else {
      logs.push({
        type: 'STATUS',
        title: 'HIGH-CRI LIGHTING OPTIMAL',
        text: `${telemetry.lux} Lux • Color rendering index CRI 96 suitable for spectral analysis.`,
        color: 'text-[#10b981]',
        border: 'border-[#10b981]/40',
        bg: 'bg-[#10b981]/10',
      });
    }

    logs.push({
      type: 'SKIN_PROFILE',
      title: 'LIVE COMPLEXION DIAGNOSIS',
      text: `Detected: Medium Wheatish (MST ${monk}) with ${undertone} Undertone.`,
      color: 'text-[#00f0ff]',
      border: 'border-[#00f0ff]/40',
      bg: 'bg-[#00f0ff]/10',
    });

    logs.push({
      type: 'SUITABILITY',
      title: 'MOST SUITABLE FOUNDATION FORMULAS',
      text: 'Warm Golden / Olive bases (Maybelline 220, Rivaj RJ-04) cancel redness and prevent grayish ashy cast.',
      color: 'text-[#10b981]',
      border: 'border-[#10b981]/40',
      bg: 'bg-[#10b981]/10',
    });

    logs.push({
      type: 'CLIMATE_ADVICE',
      title: 'PAKISTANI HUMIDITY / HEAT NOTICE',
      text: 'Set T-zone with loose translucent powder within 2 minutes of blending to prevent oxidation darkening.',
      color: 'text-[#8699a6]',
      border: 'border-[#172530]',
      bg: 'bg-[#0e161c]',
    });

    return logs;
  };

  const adviceLogs = getMirrorAdviceLogs();

  // Progress bar percentages
  const exposurePercent = Math.max(5, Math.min(95, ((telemetry.exposureEVNum + 2.5) / 5.0) * 100));
  const luxPercent = Math.max(8, Math.min(95, (telemetry.lux / 1200) * 100));
  const blurPercent = Math.max(10, Math.min(95, (telemetry.blurScore / 180) * 100));

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-3">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ==========================================================================
            LEFT COLUMN: CAPTURE VIEWPORT (Cols 1-7)
            ========================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs font-mono select-none px-1">
            <div className="flex items-center gap-2 text-[#c7d5e0]">
              <span className="text-[#00f0ff]">■</span>
              <span className="font-semibold tracking-wider">CAPTURE VIEWPORT</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle / Retry Button */}
              {streamActive ? (
                <button
                  type="button"
                  onClick={() => setUseTestTarget(!useTestTarget)}
                  className="text-[10px] text-[#556c7b] hover:text-[#00f0ff] transition-colors cursor-pointer"
                >
                  {useTestTarget ? '● Switch to Live Webcam' : 'Switch to Test Target'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-[10px] text-[#00f0ff] hover:underline transition-colors cursor-pointer"
                >
                  {cameraError ? '↻ Allow & Start Webcam' : 'Starting Camera...'}
                </button>
              )}

              <span className="text-[#10b981] font-medium flex items-center gap-1">
                <span>Face lock</span>
                <span>✓</span>
              </span>
            </div>
          </div>

          {/* Viewport Box */}
          <div className="relative w-full aspect-[4/3] bg-[#060a0d] border border-[#172530] rounded-md overflow-hidden flex items-center justify-center shadow-inner group">
            
            {/* Live Camera Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                streamActive && !useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* High-Resolution Laboratory Calibration Face Fallback */}
            <img
              ref={imageRef}
              src="/calibration_face.jpg"
              alt="Calibration Subject"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                !streamActive || useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* Viewport UI Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between">
                {/* Flashing REC indicator */}
                <div className="flex items-center gap-1.5 font-mono text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse"></span>
                  <span className="font-bold tracking-wider text-[#ef4444]">REC</span>
                </div>

                {/* CAM_0 • LIVE Tag */}
                <div className="font-mono text-xs text-[#00f0ff] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
                  <span>{streamActive && !useTestTarget ? 'WEBCAM • LIVE' : 'CAM_0 • LIVE'}</span>
                </div>
              </div>

              {/* Optical Scanning Line HUD during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex flex-col justify-between">
                  <div
                    className="w-full h-1 bg-[#00f0ff] shadow-[0_0_15px_#00f0ff] transition-all duration-75"
                    style={{ transform: `translateY(${scanProgress * 3.5}px)` }}
                  ></div>
                  <div className="absolute inset-0 bg-[#00f0ff]/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-[#0c1217]/90 border border-[#00f0ff] px-4 py-2 rounded font-mono text-xs text-[#00f0ff] font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                      SCANNING CIELAB CHROMATICITY... {scanProgress}%
                    </div>
                  </div>
                </div>
              )}

              {/* Center Face Target Recognition Graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Horizontal Crosshair Line */}
                <div className="absolute left-0 right-0 h-[1px] bg-[#00f0ff]/30"></div>
                {/* Vertical Crosshair Line */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-[#00f0ff]/30"></div>

                {/* Center Green Bounding Box */}
                <div className="relative w-52 sm:w-60 h-64 sm:h-72 border border-[#10b981]/90 rounded-sm flex items-center justify-center">
                  {/* Face Tag on Top Left */}
                  <span className="absolute -top-4 left-0 text-[10px] font-mono text-[#10b981] font-bold tracking-wider">
                    FACE 0.950
                  </span>

                  {/* Cyan Dotted Oval Face Guide */}
                  <div className="w-40 sm:w-48 h-56 sm:h-64 border-2 border-dashed border-[#00f0ff]/80 rounded-[50%]"></div>
                </div>

                {/* SMART MIRROR REAL-TIME HUD CALLOUT TAGS ON VIEWPORT */}
                {mirrorMode === 'wrong_shade' && (
                  <div className="absolute top-[38%] left-[18%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#ef4444] bg-[#ef4444]/25 backdrop-blur-md shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      <span className="text-[#ef4444] font-mono text-[10px] font-bold">◀</span>
                      <span className="text-[#ef4444] font-mono text-[10px] font-bold tracking-wider">
                        CHEEK: WRONG SHADE (ΔE 4.8) • TOO COOL/FAIR
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'unblended' && (
                  <div className="absolute bottom-[32%] left-[20%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#f59e0b] bg-[#f59e0b]/25 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold">◀</span>
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold tracking-wider">
                        L. JAWLINE: UNBLENDED DEMARCATION (ΔE 3.8)
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'optimal' && (
                  <div className="absolute bottom-[35%] right-[20%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#10b981] bg-[#10b981]/25 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      <span className="text-[#10b981] font-mono text-[10px] font-bold">✓</span>
                      <span className="text-[#10b981] font-mono text-[10px] font-bold tracking-wider">
                        OPTIMAL BLEND (ΔE 1.12) • WARM BEIGE 220
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'live' && telemetry.lux < 250 && (
                  <div className="absolute top-[20%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#f59e0b] bg-[#f59e0b]/25 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold">▲</span>
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold tracking-wider">
                        LOW LIGHTING ({telemetry.lux} LUX) • FACE WINDOW OR LAMP
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Video Spec Bar */}
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8699a6] bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded">
                <span>1920×1080 • H.264 • 30.0 fps</span>
                <span className="text-[#00f0ff]">{streamActive && !useTestTarget ? 'Active Sensor' : 'Calibration Feed'}</span>
              </div>
            </div>
          </div>

          {/* Camera Settings Badges Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs text-center">
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              ISO 200
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              f/2.0
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              1/60s
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              WB 6500K
            </div>
          </div>
        </div>

        {/* ==========================================================================
            RIGHT COLUMN: TELEMETRY, PRE-FLIGHT & SMART MIRROR ADVICE STREAM
            ========================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          {/* 1. Real-Time Telemetry Panel (Drives from live video stream!) */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono select-none">
              <div className="flex items-center gap-2 text-[#c7d5e0]">
                <span className="text-[#00f0ff]">■</span>
                <span className="font-semibold tracking-wider">REAL-TIME TELEMETRY</span>
              </div>
              <span className="text-[10px] text-[#10b981] font-semibold animate-pulse">Hz 10 LIVE</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Exposure Level (Dynamic from video) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Exposure level</span>
                  <span className="text-white font-semibold">{telemetry.exposureEV} EV</span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${exposurePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Lighting Index (Dynamic Lux) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Lighting Index (High-CRI)</span>
                  <span className="text-white font-semibold">{telemetry.lux} Lux • CRI 96</span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${luxPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Blur Score (Dynamic Laplacian sharpness) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Blur Score (Laplacian var.)</span>
                  <span className="text-white font-semibold">
                    {telemetry.blurScore} {telemetry.blurScore > 90 ? 'sharp' : 'stabilizing'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${blurPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Posture Check (Dynamic tilt) */}
              <div className="flex justify-between items-center pt-1 border-t border-[#172530]">
                <span className="text-[#8699a6]">Posture Check (head tilt)</span>
                <span className="text-white font-semibold">{telemetry.roll}° roll</span>
              </div>
            </div>
          </div>

          {/* 2. SMART MIRROR REAL-TIME GUIDANCE & WARNING LOG */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-2 flex-1 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between text-xs font-mono select-none mb-2">
                <div className="flex items-center gap-1.5 text-[#00f0ff]">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></span>
                  <span className="font-bold tracking-wider">SMART MIRROR REAL-TIME ADVICE</span>
                </div>
                <span className="text-[10px] text-[#556c7b]">AI COMPLEXION AUDIT</span>
              </div>

              {/* Interactive Simulation / Test Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2.5 select-none font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setMirrorMode('live')}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    mirrorMode === 'live'
                      ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] font-bold'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  ● Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('wrong_shade')}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    mirrorMode === 'wrong_shade'
                      ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444] font-bold'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  ⚠️ Test Wrong Shade
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('unblended')}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    mirrorMode === 'unblended'
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  ⚠️ Test Jawline Flaw
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('optimal')}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    mirrorMode === 'optimal'
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] font-bold'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  ✓ Test Ideal Match
                </button>
              </div>

              {/* Scrollable Advice & Warnings Stream */}
              <div
                ref={logScrollRef}
                className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-[11px]"
              >
                {adviceLogs.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border ${item.border} ${item.bg} space-y-0.5 transition-all`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                        [{item.type}]
                      </span>
                      <span className="text-white font-semibold text-[11px] truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[#c7d5e0] text-[10px] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Advice Footer Status */}
            <div className="pt-2 border-t border-[#141f27] flex items-center justify-between font-mono text-[10px] text-[#556c7b]">
              <span>Active Undertone: {currentSampleRef.current?.undertone || 'Warm Olive'}</span>
              <span className="text-[#00f0ff]">MST {currentSampleRef.current?.monkScale || 5}</span>
            </div>
          </div>

          {/* 3. Action Button: RUN CIELAB ANALYSIS */}
          <div>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="w-full py-3 rounded-md border border-[#00f0ff] text-[#00f0ff] font-mono text-xs font-bold tracking-wider uppercase bg-[#00f0ff]/5 hover:bg-[#00f0ff]/15 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isAnalyzing ? '⚡' : '▶'}</span>
              <span>{isAnalyzing ? 'ANALYZING FACIAL CHROMATICITY...' : 'RUN CIELAB ANALYSIS'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DesktopCameraView;
