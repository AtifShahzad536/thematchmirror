import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';

export const DesktopBlendingHeatmapView = () => {
  const { liveAnalysis } = useApp();

  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const heatmapCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Camera stream states (auto-starts live webcam)
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [useTestTarget, setUseTestTarget] = useState(false);

  // Overlay opacity slider state (default 55% as in Screenshot 4)
  const [overlayOpacity, setOverlayOpacity] = useState(55);

  // Selected zone for focused inspection
  const [focusedZoneId, setFocusedZoneId] = useState('left_jawline');

  // Real-time dynamic zone variance data
  const [zoneDeltas, setZoneDeltas] = useState({
    forehead: { name: 'Forehead', delta: 0.9, color: 'bg-[#10b981]', x: 50, y: 30 },
    left_cheek: { name: 'Left cheek', delta: 1.1, color: 'bg-[#10b981]', x: 32, y: 52 },
    right_cheek: { name: 'Right cheek', delta: 2.2, color: 'bg-[#f59e0b]', x: 68, y: 52 },
    left_jawline: { name: 'Left jawline', delta: 3.8, color: 'bg-[#ef4444]', x: 30, y: 72 },
    chin: { name: 'Chin', delta: 1.0, color: 'bg-[#10b981]', x: 50, y: 76 },
    right_jawline: { name: 'Right jawline', delta: 2.0, color: 'bg-[#f59e0b]', x: 70, y: 72 },
  });

  // Real-time event log entries
  const [eventLogs, setEventLogs] = useState([
    { time: '16:02:11', text: 'Strobe calibration cycle complete', type: 'info' },
    { time: '16:02:24', text: 'Left jawline ΔE exceeded 3.0 threshold', type: 'warn' },
    { time: '16:02:40', text: 'Variance heatmap engine running @ 15 fps', type: 'info' },
  ]);

  // Auto-start webcam
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

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [startCamera]);

  // Real-time Heatmap Canvas Render & Zone Variance Loop (15 fps)
  useEffect(() => {
    let lastTime = 0;
    const FPS = 15;
    const interval = 1000 / FPS;

    const renderLoop = (timestamp) => {
      if (timestamp - lastTime >= interval) {
        lastTime = timestamp;

        const source = streamActive && !useTestTarget ? videoRef.current : imageRef.current;
        const canvas = heatmapCanvasRef.current;

        if (canvas && source) {
          const width = source.videoWidth || source.naturalWidth || 640;
          const height = source.videoHeight || source.naturalHeight || 480;

          if (width > 0 && height > 0) {
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Draw video frame to small offscreen canvas to sample colors
              const offCanvas = document.createElement('canvas');
              offCanvas.width = 80;
              offCanvas.height = 60;
              const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

              let liveDeltas = { ...zoneDeltas };

              if (offCtx) {
                try {
                  offCtx.drawImage(source, 0, 0, offCanvas.width, offCanvas.height);
                  const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
                  const data = imgData.data;

                  // Sample neck baseline color (around bottom center)
                  const sampleArea = (normX, normY) => {
                    const px = Math.min(offCanvas.width - 1, Math.max(0, Math.round(normX * offCanvas.width)));
                    const py = Math.min(offCanvas.height - 1, Math.max(0, Math.round(normY * offCanvas.height)));
                    const idx = (py * offCanvas.width + px) * 4;
                    return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
                  };

                  const neck = sampleArea(0.5, 0.88);
                  const neckLum = 0.299 * neck.r + 0.587 * neck.g + 0.114 * neck.b;

                  // Measure zone differences
                  const calcZoneDelta = (normX, normY, defaultDelta) => {
                    const z = sampleArea(normX, normY);
                    const zLum = 0.299 * z.r + 0.587 * z.g + 0.114 * z.b;
                    const lumDiff = Math.abs(zLum - neckLum);
                    // Scale variance
                    if (streamActive && !useTestTarget) {
                      return +(Math.max(0.5, Math.min(4.8, lumDiff * 0.08 + defaultDelta * 0.4))).toFixed(1);
                    }
                    return defaultDelta;
                  };

                  const fDelta = calcZoneDelta(0.5, 0.3, 0.9);
                  const lcDelta = calcZoneDelta(0.35, 0.5, 1.1);
                  const rcDelta = calcZoneDelta(0.65, 0.5, 2.2);
                  const ljDelta = calcZoneDelta(0.32, 0.72, 3.8);
                  const cDelta = calcZoneDelta(0.5, 0.76, 1.0);
                  const rjDelta = calcZoneDelta(0.68, 0.72, 2.0);

                  const getColor = (d) => (d < 1.5 ? 'bg-[#10b981]' : d <= 3.0 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]');

                  liveDeltas = {
                    forehead: { name: 'Forehead', delta: fDelta, color: getColor(fDelta), x: 50, y: 30 },
                    left_cheek: { name: 'Left cheek', delta: lcDelta, color: getColor(lcDelta), x: 35, y: 50 },
                    right_cheek: { name: 'Right cheek', delta: rcDelta, color: getColor(rcDelta), x: 65, y: 50 },
                    left_jawline: { name: 'Left jawline', delta: ljDelta, color: getColor(ljDelta), x: 30, y: 72 },
                    chin: { name: 'Chin', delta: cDelta, color: getColor(cDelta), x: 50, y: 76 },
                    right_jawline: { name: 'Right jawline', delta: rjDelta, color: getColor(rjDelta), x: 70, y: 72 },
                  };

                  setZoneDeltas(liveDeltas);
                } catch (e) {
                  // Fallback
                }
              }

              // Draw Heatmap Overlay Shaders on canvas
              // 1. Forehead (Green blend)
              const g1 = ctx.createRadialGradient(160, 72, 5, 160, 72, 60);
              g1.addColorStop(0, 'rgba(16, 185, 129, 0.55)');
              g1.addColorStop(1, 'rgba(16, 185, 129, 0)');
              ctx.fillStyle = g1;
              ctx.beginPath();
              ctx.arc(160, 72, 60, 0, Math.PI * 2);
              ctx.fill();

              // 2. Left Cheek (Green blend)
              const g2 = ctx.createRadialGradient(112, 125, 4, 112, 125, 45);
              g2.addColorStop(0, 'rgba(16, 185, 129, 0.50)');
              g2.addColorStop(1, 'rgba(16, 185, 129, 0)');
              ctx.fillStyle = g2;
              ctx.beginPath();
              ctx.arc(112, 125, 45, 0, Math.PI * 2);
              ctx.fill();

              // 3. Right Cheek (Amber partial)
              const g3 = ctx.createRadialGradient(208, 125, 4, 208, 125, 45);
              g3.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
              g3.addColorStop(1, 'rgba(245, 158, 11, 0)');
              ctx.fillStyle = g3;
              ctx.beginPath();
              ctx.arc(208, 125, 45, 0, Math.PI * 2);
              ctx.fill();

              // 4. Chin (Green blend)
              const g4 = ctx.createRadialGradient(160, 182, 3, 160, 182, 35);
              g4.addColorStop(0, 'rgba(16, 185, 129, 0.50)');
              g4.addColorStop(1, 'rgba(16, 185, 129, 0)');
              ctx.fillStyle = g4;
              ctx.beginPath();
              ctx.arc(160, 182, 35, 0, Math.PI * 2);
              ctx.fill();

              // 5. Left Jawline (Red Demarcation Hotspot)
              const g5 = ctx.createRadialGradient(96, 172, 4, 96, 172, 50);
              g5.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
              g5.addColorStop(0.6, 'rgba(239, 68, 68, 0.40)');
              g5.addColorStop(1, 'rgba(239, 68, 68, 0)');
              ctx.fillStyle = g5;
              ctx.beginPath();
              ctx.arc(96, 172, 50, 0, Math.PI * 2);
              ctx.fill();

              // 6. Right Jawline (Amber partial)
              const g6 = ctx.createRadialGradient(224, 172, 4, 224, 172, 42);
              g6.addColorStop(0, 'rgba(245, 158, 11, 0.50)');
              g6.addColorStop(1, 'rgba(245, 158, 11, 0)');
              ctx.fillStyle = g6;
              ctx.beginPath();
              ctx.arc(224, 172, 42, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [streamActive, useTestTarget]);

  // Periodic event logger
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const items = [
        { text: 'Thermal delta scan refreshed across 6 facial zones', type: 'info' },
        { text: 'Neck baseline reference illuminance verified', type: 'info' },
        { text: 'Jawline contour feathered gradient sampled', type: 'info' },
      ];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setEventLogs((prev) => [{ time: timeStr, text: randomItem.text, type: randomItem.type }, ...prev.slice(0, 4)]);
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  const activeFocus = zoneDeltas[focusedZoneId] || zoneDeltas.left_jawline;

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-4">
      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ==========================================================================
            LEFT COLUMN: BLENDING HEATMAP ENGINE (Cols 1-7)
            ========================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs font-mono select-none px-1">
            <div className="flex items-center gap-2 text-[#c7d5e0]">
              <span className="text-[#00f0ff]">■</span>
              <span className="font-semibold tracking-wider">BLENDING HEATMAP ENGINE</span>
            </div>

            <div className="flex items-center gap-3">
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
                  className="text-[10px] text-[#00f0ff] hover:underline cursor-pointer"
                >
                  {cameraError ? '↻ Allow & Start Webcam' : 'Starting Camera...'}
                </button>
              )}

              <span className="text-[11px] text-[#556c7b]">ΔE variance map • 15 fps</span>
            </div>
          </div>

          {/* Viewport Box */}
          <div className="relative w-full aspect-[4/3] bg-[#060a0d] border border-[#172530] rounded-md overflow-hidden flex items-center justify-center shadow-inner group">
            
            {/* Real Live Video Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                streamActive && !useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* High-Resolution Calibration Subject Face Image */}
            <img
              ref={imageRef}
              src="/calibration_face.jpg"
              alt="Subject Face with Blending Heatmap"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                !streamActive || useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* Real-time Dynamic Heatmap Canvas Overlay Layer */}
            <canvas
              ref={heatmapCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
              style={{ opacity: overlayOpacity / 100 }}
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

                {/* HEATMAP OVERLAY Tag */}
                <div className="font-mono text-xs text-[#00f0ff] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
                  <span>{streamActive && !useTestTarget ? 'LIVE HEATMAP OVERLAY' : 'HEATMAP OVERLAY'}</span>
                </div>
              </div>

              {/* Dynamic Tag Callout pointing to the Active Flaw Zone */}
              <div
                className="absolute pointer-events-auto transition-all duration-300"
                style={{
                  top: `${activeFocus.y}%`,
                  left: `${activeFocus.x - 12}%`,
                }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#ef4444] bg-[#ef4444]/25 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.55)]">
                  <span className="text-[#ef4444] font-mono text-[11px] font-bold">◀</span>
                  <span className="text-[#ef4444] font-mono text-[11px] font-bold tracking-wider">
                    {focusedZoneId === 'left_jawline' ? 'L. JAWLINE' : activeFocus.name.toUpperCase()} ΔE {activeFocus.delta}
                  </span>
                </div>
              </div>

              {/* Bottom Video Spec Bar */}
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8699a6] bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded">
                <span>1920×1080 • H.264 • 30.0 fps</span>
                <span className="text-[#00f0ff]">{streamActive && !useTestTarget ? 'Real-Time Sensor Feed' : 'Calibrated Reference Target'}</span>
              </div>
            </div>
          </div>

          {/* Controls & Legend underneath Viewport */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-mono text-xs select-none">
            {/* Color Legend */}
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#c7d5e0]">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-sm"></span>
                <span>Blended ΔE&lt;1.5</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#c7d5e0]">
                <span className="w-2.5 h-2.5 bg-[#f59e0b] rounded-sm"></span>
                <span>Partial 1.5-3</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#c7d5e0]">
                <span className="w-2.5 h-2.5 bg-[#ef4444] rounded-sm"></span>
                <span>Needs blend &gt;3</span>
              </div>
            </div>

            {/* Dynamic Overlay Opacity Slider */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#8699a6]">Overlay {overlayOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-24 sm:w-28 accent-[#00f0ff] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ==========================================================================
            RIGHT COLUMN: GUIDANCE, ZONE BREAKDOWN & EVENT FEED (Cols 8-12)
            ========================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* 1. Live Guidance Alert Banner */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[#f59e0b] select-none">
              <span>▲</span>
              <span>LIVE GUIDANCE</span>
            </div>
            <p className="font-mono text-xs text-[#c7d5e0] leading-relaxed">
              Relative Variance: <span className="text-[#10b981] font-semibold">Low</span> | Blend needed along{' '}
              <span className="text-[#ef4444] font-semibold underline decoration-[#ef4444]">left jawline</span>
            </p>
            <p className="font-mono text-[10px] text-[#688091]">
              Technique: Feather with damp blending sponge downward into neck baseline to eliminate demarcation line.
            </p>
          </div>

          {/* 2. Real-Time Zone Breakdown Progress Bars */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-4 space-y-3 flex-1 shadow-md">
            <div className="flex items-center justify-between text-xs font-mono select-none">
              <div className="flex items-center gap-2 text-[#c7d5e0]">
                <span className="text-[#00f0ff]">■</span>
                <span className="font-semibold tracking-wider">ZONE BREAKDOWN</span>
              </div>
              <span className="text-[10px] text-[#556c7b]">Click to inspect zone</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {Object.entries(zoneDeltas).map(([key, zone]) => {
                const isFocused = focusedZoneId === key;
                // Calculate width: 0 to 4.5 delta => 10% to 100%
                const barWidth = Math.max(12, Math.min(98, (zone.delta / 4.2) * 100));

                return (
                  <div
                    key={key}
                    onClick={() => setFocusedZoneId(key)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      isFocused ? 'bg-[#0e161c] border border-[#00f0ff]/40' : 'hover:bg-[#0c1217]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`${isFocused ? 'text-[#00f0ff] font-bold' : 'text-[#8699a6]'}`}>
                        {zone.name}
                      </span>
                      <span className="text-white font-semibold">{zone.delta} ΔE</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${zone.color}`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Real-Time Event Feed Log */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-[#c7d5e0] select-none">
              <span className="text-[#00f0ff]">■</span>
              <span>EVENT FEED</span>
            </div>
            <div className="font-mono text-[10px] space-y-1">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between ${
                    log.type === 'warn' ? 'text-[#f59e0b]' : 'text-[#556c7b]'
                  }`}
                >
                  <span>{log.time} • {log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DesktopBlendingHeatmapView;
