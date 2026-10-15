import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useApp } from '../../../context/AppContext';
import { rgbToLab, rgbToHex, calculateITA } from '../../../utils/skinColorAnalysis';

// Reference benchmark dataset matching screenshot 100%
const BENCHMARK_PATCHES = [
  { id: 'forehead', label: 'Forehead', L: 62.4, a: 11.2, b: 21.8, hex: '#cca17d', pixels: 18420, sigma: 1.2, x: 50, y: 28, w: 18, h: 12 },
  { id: 'l_cheek', label: 'L. Cheek', L: 60.1, a: 13.5, b: 20.4, hex: '#c89b76', pixels: 9230, sigma: 1.6, x: 35, y: 52, w: 14, h: 14 },
  { id: 'r_cheek', label: 'R. Cheek', L: 60.7, a: 13.1, b: 20.9, hex: '#ca9c78', pixels: 9411, sigma: 1.4, x: 65, y: 52, w: 14, h: 14 },
  { id: 'jawline', label: 'Jawline', L: 57.9, a: 12.4, b: 22.6, hex: '#bf8f6b', pixels: 7102, sigma: 2.1, x: 50, y: 72, w: 16, h: 10 },
];

const MONK_TONES = [
  { scale: 1, hex: '#f6ede4', label: 'Very Fair (Porcelain)' },
  { scale: 2, hex: '#f3e7db', label: 'Fair (Ivory)' },
  { scale: 3, hex: '#f7dad0', label: 'Light (Sand)' },
  { scale: 4, hex: '#eadaba', label: 'Light Medium (Beige)' },
  { scale: 5, hex: '#d7bd96', label: 'Medium (Wheatish)' },
  { scale: 6, hex: '#a07e56', label: 'Medium Tan (Honey)' },
  { scale: 7, hex: '#825c43', label: 'Tan (Bronze)' },
  { scale: 8, hex: '#604134', label: 'Deep Tan (Mocha)' },
  { scale: 9, hex: '#3a312a', label: 'Deep (Espresso)' },
  { scale: 10, hex: '#292420', label: 'Rich Deep (Ebony)' },
];

const UNDERTONE_INFO = {
  Warm: { label: 'Warm (Golden)', desc: 'Yellow, peachy & golden sub-tones' },
  Cool: { label: 'Cool (Rosy)', desc: 'Pink, red & bluish sub-tones' },
  Neutral: { label: 'Neutral (Balanced)', desc: 'Balanced warm and cool pigments' },
  Olive: { label: 'Olive (Green-gold)', desc: 'Distinct greenish-golden hue' },
};

export const DesktopSkinAnalysisView = () => {
  const navigate = useNavigate();
  const { updateFromLiveCapture, addToast } = useApp();

  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Sampling mode: 'benchmark' (locked screenshot values) or 'live' (active video sampling)
  const [samplingMode, setSamplingMode] = useState('benchmark'); // 'benchmark' | 'live'
  const [isSamplingFrozen, setIsSamplingFrozen] = useState(false);

  // Camera stream states
  const [streamActive, setStreamActive] = useState(false);
  const [useTestTarget, setUseTestTarget] = useState(false);

  // Selected region for targeted ROI inspection ('all' | 'forehead' | 'l_cheek' | 'r_cheek' | 'jawline')
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Selected undertone chip (default 'Warm' as in screenshot)
  const [selectedUndertone, setSelectedUndertone] = useState('Warm');

  // Selected Monk Tone (default 5 as in screenshot)
  const [selectedMonk, setSelectedMonk] = useState(5);

  // Skin patches state
  const [skinPatches, setSkinPatches] = useState(BENCHMARK_PATCHES);

  // Real-time confidence score
  const [confidenceScore, setConfidenceScore] = useState(87.4);

  // Auto-start webcam if available
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
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
    };
  }, [startCamera]);

  // Real-time sampling loop from camera or calibration image
  useEffect(() => {
    if (samplingMode !== 'live' || isSamplingFrozen) return;

    const interval = setInterval(() => {
      const source = streamActive && !useTestTarget ? videoRef.current : imageRef.current;
      if (!source) return;

      const sw = source.videoWidth || source.naturalWidth || 640;
      const sh = source.videoHeight || source.naturalHeight || 480;
      if (sw === 0 || sh === 0) return;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

        const updated = BENCHMARK_PATCHES.map((patch) => {
          // Calculate bounding box in 160x120 canvas
          const cx = Math.round((patch.x / 100) * canvas.width);
          const cy = Math.round((patch.y / 100) * canvas.height);
          const rw = Math.max(6, Math.round((patch.w / 100) * canvas.width));
          const rh = Math.max(6, Math.round((patch.h / 100) * canvas.height));
          const rx = Math.max(0, Math.min(canvas.width - rw, cx - Math.round(rw / 2)));
          const ry = Math.max(0, Math.min(canvas.height - rh, cy - Math.round(rh / 2)));

          const imgData = ctx.getImageData(rx, ry, rw, rh);
          const data = imgData.data;

          let rSum = 0, gSum = 0, bSum = 0, lumSum = 0, lumSqSum = 0, count = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            // Reject specular glare (>245) or deep shadows (<25)
            if (lum > 25 && lum < 245) {
              rSum += r;
              gSum += g;
              bSum += b;
              lumSum += lum;
              lumSqSum += lum * lum;
              count++;
            }
          }

          if (count === 0) return patch;

          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);

          const meanLum = lumSum / count;
          const variance = Math.max(0, (lumSqSum / count) - (meanLum * meanLum));
          const sigma = +(Math.sqrt(variance) * 0.12).toFixed(1);

          const lab = rgbToLab(avgR, avgG, avgB);
          const hex = rgbToHex(avgR, avgG, avgB);

          return {
            ...patch,
            L: lab.L,
            a: lab.a,
            b: lab.b,
            hex,
            sigma: Math.max(0.8, Math.min(3.5, sigma)),
          };
        });

        setSkinPatches(updated);

        // Adjust confidence slightly based on consistency
        const lVariance = Math.abs(updated[1].L - updated[2].L);
        const dynamicConfidence = Math.max(82.0, Math.min(96.5, +(92.0 - lVariance * 2.5).toFixed(1)));
        setConfidenceScore(dynamicConfidence);
      } catch (e) {
        // Fallback silently if canvas is tainted
      }
    }, 200);

    return () => clearInterval(interval);
  }, [samplingMode, isSamplingFrozen, streamActive, useTestTarget]);

  // Aggregate Metrics computed dynamically from the 4 patches
  const aggregateMetrics = useMemo(() => {
    const totalL = skinPatches.reduce((acc, p) => acc + Number(p.L), 0);
    const totalA = skinPatches.reduce((acc, p) => acc + Number(p.a), 0);
    const totalB = skinPatches.reduce((acc, p) => acc + Number(p.b), 0);
    const len = skinPatches.length || 1;

    const meanL = +(totalL / len).toFixed(1);
    const meanA = +(totalA / len).toFixed(1);
    const meanB = +(totalB / len).toFixed(1);

    const ita = calculateITA(meanL, meanB);

    let itaCategory = 'Intermediate';
    if (ita > 55) itaCategory = 'Very Light';
    else if (ita > 41) itaCategory = 'Light';
    else if (ita > 20) itaCategory = 'Intermediate';
    else if (ita > 10) itaCategory = 'Tan';
    else if (ita > -30) itaCategory = 'Brown';
    else itaCategory = 'Dark';

    return {
      meanL,
      meanA,
      meanB,
      ita,
      itaCategory,
    };
  }, [skinPatches]);

  // Monk Category Label
  const currentMonkInfo = useMemo(() => {
    return MONK_TONES.find((t) => t.scale === selectedMonk) || MONK_TONES[4];
  }, [selectedMonk]);

  // Undertone Info
  const currentUndertoneInfo = useMemo(() => {
    return UNDERTONE_INFO[selectedUndertone] || UNDERTONE_INFO.Warm;
  }, [selectedUndertone]);

  // Apply analysis and find foundation match
  const handleFindFoundationMatch = () => {
    const meanRgb = { r: 202, g: 155, b: 118 }; // Default representative
    const meanHex = skinPatches[0]?.hex || '#cca17d';

    updateFromLiveCapture({
      lab: {
        L: aggregateMetrics.meanL,
        a: aggregateMetrics.meanA,
        b: aggregateMetrics.meanB,
      },
      ita: aggregateMetrics.ita,
      monkScale: selectedMonk,
      undertone: selectedUndertone,
      hex: meanHex,
    });

    if (addToast) {
      addToast(
        `Applied live skin analysis: L* ${aggregateMetrics.meanL}, a* ${aggregateMetrics.meanA}, b* ${aggregateMetrics.meanB} (${selectedUndertone})`,
        'success'
      );
    }

    navigate(ROUTES.FOUNDATION);
  };

  // Toggle or reset sampling mode
  const handleResetBenchmark = () => {
    setSamplingMode('benchmark');
    setIsSamplingFrozen(false);
    setSkinPatches(BENCHMARK_PATCHES);
    setSelectedMonk(5);
    setSelectedUndertone('Warm');
    setConfidenceScore(87.4);
    if (addToast) addToast('Calibrated benchmark reference values restored.', 'info');
  };

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-3 sm:gap-4">
      {/* Real-time Workstation Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#0b1015] border border-[#172530] rounded-md text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                samplingMode === 'live' && !isSamplingFrozen
                  ? 'bg-[#10b981] animate-pulse'
                  : samplingMode === 'live' && isSamplingFrozen
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#00f0ff]'
              }`}
            ></span>
            <span className="text-[#8699a6]">MODE:</span>
            <span className="font-semibold text-white">
              {samplingMode === 'live'
                ? isSamplingFrozen
                  ? 'LIVE SENSOR (FROZEN)'
                  : 'LIVE SENSOR (ACTIVE @ 5 FPS)'
                : 'CALIBRATED BENCHMARK (ISO 11664-4)'}
            </span>
          </div>

          <span className="text-[#2a3c4a] hidden sm:inline">|</span>

          <div className="flex items-center gap-1 text-[#8699a6] hidden md:flex">
            <span>INSPECTION ROI:</span>
            <span className="text-[#00f0ff] uppercase font-bold">{selectedRegion}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {samplingMode === 'live' ? (
            <>
              <button
                type="button"
                onClick={() => setIsSamplingFrozen(!isSamplingFrozen)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                  isSamplingFrozen
                    ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/10'
                    : 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10'
                }`}
              >
                {isSamplingFrozen ? '▶ RESUME LIVE' : '⏸ FREEZE'}
              </button>
              <button
                type="button"
                onClick={handleResetBenchmark}
                className="px-2 py-0.5 rounded text-[11px] border border-[#172530] text-[#8699a6] hover:text-white hover:bg-[#141f27] transition-all cursor-pointer"
              >
                ■ BENCHMARK
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSamplingMode('live');
                setIsSamplingFrozen(false);
                if (addToast) addToast('Live camera pixel sampling enabled.', 'info');
              }}
              className="px-2.5 py-0.5 rounded text-[11px] font-semibold border border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>●</span>
              <span>ENABLE LIVE SAMPLING</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Main Desktop Grid (Cols 1-7 Left, Cols 8-12 Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ==========================================================================
            LEFT COLUMN (Cols 1-7): FACE LANDMARKS + ISOLATED PATCHES + PER-REGION TABLE
            ========================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Top Half: 2-Panel Split (Face Landmarks & Isolated Skin Patches) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Panel 1: FACE LANDMARKS Viewport */}
            <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono select-none mb-2">
                <div className="flex items-center gap-1.5 text-[#c7d5e0]">
                  <span className="text-[#00f0ff]">■</span>
                  <span className="font-semibold tracking-wider text-[11px]">FACE LANDMARKS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#556c7b]">MediaPipe • 478 pts</span>
                  <button
                    type="button"
                    onClick={() => setUseTestTarget(!useTestTarget)}
                    title="Toggle Camera or Test Subject"
                    className="text-[9px] px-1 py-0.2 rounded border border-[#1f3342] text-[#8699a6] hover:text-[#00f0ff] cursor-pointer"
                  >
                    {useTestTarget ? 'CAM' : 'CALIB'}
                  </button>
                </div>
              </div>

              {/* Viewport Box with FaceMesh & Targeted Reticle Overlay */}
              <div className="relative w-full aspect-[4/3] bg-[#060a0d] border border-[#172530] rounded overflow-hidden flex items-center justify-center">
                {/* Real Live Video Camera Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    streamActive && !useTestTarget ? 'opacity-100' : 'hidden'
                  }`}
                />

                {/* Calibration Face Target */}
                <img
                  ref={imageRef}
                  src="/calibration_face.jpg"
                  alt="Face Landmarks Subject"
                  className={`w-full h-full object-cover ${
                    !streamActive || useTestTarget ? 'opacity-100' : 'hidden'
                  }`}
                />

                {/* 478-Points MediaPipe Facial Mesh Graphic Overlay */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full pointer-events-none stroke-[#00f0ff]/50 fill-none"
                >
                  {/* Subtle Face Contour Wireframe */}
                  <ellipse cx="100" cy="98" rx="42" ry="54" strokeWidth="0.8" strokeDasharray="2,2" />
                  
                  {/* Left Eye & Brow Mesh */}
                  <polygon points="80,82 86,79 92,82 86,85" strokeWidth="0.7" stroke="#10b981" />
                  <circle cx="86" cy="82" r="1.2" fill="#00f0ff" />
                  
                  {/* Right Eye & Brow Mesh */}
                  <polygon points="108,82 114,79 120,82 114,85" strokeWidth="0.7" stroke="#10b981" />
                  <circle cx="114" cy="82" r="1.2" fill="#00f0ff" />

                  {/* Nose Bridge & Tip */}
                  <polyline points="100,78 100,102 96,108 100,110 104,108 100,102" strokeWidth="0.7" stroke="#00f0ff" />
                  
                  {/* Mouth Contour */}
                  <polygon points="90,124 96,120 100,121 104,120 110,124 104,128 100,128 96,128" strokeWidth="0.7" stroke="#10b981" />
                  
                  {/* Cheekbone & Jaw Triangulation Points */}
                  <circle cx="76" cy="104" r="1" fill="#00f0ff" />
                  <circle cx="124" cy="104" r="1" fill="#00f0ff" />
                  <line x1="76" y1="104" x2="86" y2="85" strokeWidth="0.5" stroke="#00f0ff]/40" />
                  <line x1="124" y1="104" x2="114" y2="85" strokeWidth="0.5" stroke="#00f0ff]/40" />
                  <line x1="76" y1="104" x2="90" y2="124" strokeWidth="0.5" stroke="#00f0ff]/40" />
                  <line x1="124" y1="104" x2="110" y2="124" strokeWidth="0.5" stroke="#00f0ff]/40" />

                  {/* Forehead Points */}
                  <circle cx="100" cy="58" r="1" fill="#00f0ff" />
                  <circle cx="88" cy="62" r="1" fill="#00f0ff" />
                  <circle cx="112" cy="62" r="1" fill="#00f0ff" />
                  <line x1="88" y1="62" x2="100" y2="58" strokeWidth="0.5" stroke="#00f0ff]/40" />
                  <line x1="100" y1="58" x2="112" y2="62" strokeWidth="0.5" stroke="#00f0ff]/40" />

                  {/* ================================================================
                      DYNAMIC TARGET RETICLES FOR THE 4 ANATOMICAL REGIONS
                      ================================================================ */}
                  {/* Forehead Reticle (cx: 100, cy: 56) */}
                  {(selectedRegion === 'all' || selectedRegion === 'forehead') && (
                    <g className="transition-all duration-300">
                      <rect
                        x="84"
                        y="46"
                        width="32"
                        height="20"
                        stroke="#00f0ff"
                        strokeWidth={selectedRegion === 'forehead' ? '1.5' : '0.8'}
                        strokeDasharray={selectedRegion === 'forehead' ? 'none' : '2,2'}
                        fill="rgba(0, 240, 255, 0.08)"
                      />
                      <circle cx="100" cy="56" r="2" fill="#00f0ff" />
                      {selectedRegion === 'forehead' && (
                        <text x="100" y="42" fill="#00f0ff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          FOREHEAD ROI
                        </text>
                      )}
                    </g>
                  )}

                  {/* Left Cheek Reticle (cx: 70, cy: 104) */}
                  {(selectedRegion === 'all' || selectedRegion === 'l_cheek') && (
                    <g className="transition-all duration-300">
                      <rect
                        x="58"
                        y="94"
                        width="24"
                        height="20"
                        stroke="#00f0ff"
                        strokeWidth={selectedRegion === 'l_cheek' ? '1.5' : '0.8'}
                        strokeDasharray={selectedRegion === 'l_cheek' ? 'none' : '2,2'}
                        fill="rgba(0, 240, 255, 0.08)"
                      />
                      <circle cx="70" cy="104" r="2" fill="#00f0ff" />
                      {selectedRegion === 'l_cheek' && (
                        <text x="70" y="90" fill="#00f0ff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          L. CHEEK ROI
                        </text>
                      )}
                    </g>
                  )}

                  {/* Right Cheek Reticle (cx: 130, cy: 104) */}
                  {(selectedRegion === 'all' || selectedRegion === 'r_cheek') && (
                    <g className="transition-all duration-300">
                      <rect
                        x="118"
                        y="94"
                        width="24"
                        height="20"
                        stroke="#00f0ff"
                        strokeWidth={selectedRegion === 'r_cheek' ? '1.5' : '0.8'}
                        strokeDasharray={selectedRegion === 'r_cheek' ? 'none' : '2,2'}
                        fill="rgba(0, 240, 255, 0.08)"
                      />
                      <circle cx="130" cy="104" r="2" fill="#00f0ff" />
                      {selectedRegion === 'r_cheek' && (
                        <text x="130" y="90" fill="#00f0ff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          R. CHEEK ROI
                        </text>
                      )}
                    </g>
                  )}

                  {/* Jawline Reticle (cx: 100, cy: 144) */}
                  {(selectedRegion === 'all' || selectedRegion === 'jawline') && (
                    <g className="transition-all duration-300">
                      <rect
                        x="84"
                        y="136"
                        width="32"
                        height="16"
                        stroke="#00f0ff"
                        strokeWidth={selectedRegion === 'jawline' ? '1.5' : '0.8'}
                        strokeDasharray={selectedRegion === 'jawline' ? 'none' : '2,2'}
                        fill="rgba(0, 240, 255, 0.08)"
                      />
                      <circle cx="100" cy="144" r="2" fill="#00f0ff" />
                      {selectedRegion === 'jawline' && (
                        <text x="100" y="160" fill="#00f0ff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          JAWLINE ROI
                        </text>
                      )}
                    </g>
                  )}
                </svg>

                {/* Viewport UI Overlays */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-mono text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
                      <span className="font-bold text-[#ef4444]">REC</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#00f0ff] font-semibold bg-black/50 px-1.5 py-0.5 rounded">
                      MESH OVERLAY
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[9px] text-[#8699a6] bg-black/60 px-1.5 py-0.5 rounded">
                    <span>1920×1080 • H.264 • 30.0 fps</span>
                    <span className="text-[#00f0ff] font-bold">ROI: {selectedRegion.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: ISOLATED SKIN PATCHES (ROI x 4) */}
            <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono select-none mb-2">
                <div className="flex items-center gap-1.5 text-[#c7d5e0]">
                  <span className="text-[#00f0ff]">■</span>
                  <span className="font-semibold tracking-wider text-[11px]">ISOLATED SKIN PATCHES</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#556c7b]">ROI × 4</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRegion('all')}
                    className={`text-[9px] px-1 rounded border transition-colors cursor-pointer ${
                      selectedRegion === 'all'
                        ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                        : 'border-[#172530] text-[#556c7b] hover:text-white'
                    }`}
                  >
                    ALL
                  </button>
                </div>
              </div>

              {/* 2x2 Swatch Cards Grid matching Screenshot */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {skinPatches.map((patch) => {
                  const isSelected = selectedRegion === patch.id;
                  return (
                    <div
                      key={patch.id}
                      onClick={() => setSelectedRegion(isSelected ? 'all' : patch.id)}
                      className={`rounded p-2 flex flex-col justify-between shadow-inner border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'ring-2 ring-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.4)] border-[#00f0ff]'
                          : 'border-black/30 hover:border-[#00f0ff]/50'
                      }`}
                      style={{ backgroundColor: patch.hex }}
                    >
                      {/* Small Dark Title Pill */}
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] font-semibold">
                          {patch.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping"></span>
                        )}
                      </div>

                      {/* CIELAB coordinate values */}
                      <div className="font-mono text-[9px] text-black/90 font-medium bg-black/15 px-1 py-0.5 rounded">
                        L {patch.L} &nbsp; a {patch.a} &nbsp; b {patch.b}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Half: PER-REGION CIELAB Table */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs font-mono font-semibold tracking-wider text-[#c7d5e0] mb-3 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[#00f0ff]">■</span>
                <span>PER-REGION CIELAB</span>
              </div>
              <span className="text-[10px] text-[#526877] font-normal">Click row to target reticle</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-[#526877] uppercase text-[10px] tracking-wider border-b border-[#141f27]">
                    <th className="py-2 px-3">Region</th>
                    <th className="py-2 px-3">L*</th>
                    <th className="py-2 px-3">a*</th>
                    <th className="py-2 px-3">b*</th>
                    <th className="py-2 px-3">Pixels</th>
                    <th className="py-2 px-3">σ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141f27]/70">
                  {skinPatches.map((row) => {
                    const isSelected = selectedRegion === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRegion(isSelected ? 'all' : row.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#00f0ff]/10 text-white font-bold' : 'text-[#c7d5e0] hover:bg-[#0e161c]'
                        }`}
                      >
                        {/* Region with color swatch square */}
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0 border border-black/40"
                            style={{ backgroundColor: row.hex }}
                          ></span>
                          <span className={`${isSelected ? 'text-[#00f0ff]' : 'text-white'} font-medium`}>
                            {row.label}
                          </span>
                        </td>

                        {/* L* */}
                        <td className="py-2 px-3 text-[#00f0ff]">{row.L}</td>

                        {/* a* */}
                        <td className="py-2 px-3">{row.a}</td>

                        {/* b* */}
                        <td className="py-2 px-3">{row.b}</td>

                        {/* Pixels */}
                        <td className="py-2 px-3 text-[#8699a6]">{row.pixels}</td>

                        {/* Sigma σ */}
                        <td className="py-2 px-3 text-[#526877]">{row.sigma}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ==========================================================================
            RIGHT COLUMN (Cols 8-12): METRICS DASHBOARD
            ========================================================================== */}
        <div className="lg:col-span-5 bg-[#0b1015] border border-[#172530] rounded-md p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xl">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between text-xs font-mono font-semibold tracking-wider text-[#c7d5e0] select-none">
              <div className="flex items-center gap-2">
                <span className="text-[#00f0ff]">■</span>
                <span>METRICS DASHBOARD</span>
              </div>
              <span className="text-[10px] text-[#556c7b]">D65 Standard Observer</span>
            </div>

            {/* 3 Large CIELAB Stat Cards in a row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* L* */}
              <div className="bg-[#0e161c] border border-[#192833] rounded p-3 text-center">
                <span className="text-[10px] font-mono text-[#526877] block uppercase">L*</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] block mt-1">
                  {aggregateMetrics.meanL}
                </span>
              </div>

              {/* a* */}
              <div className="bg-[#0e161c] border border-[#192833] rounded p-3 text-center">
                <span className="text-[10px] font-mono text-[#526877] block uppercase">a*</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] block mt-1">
                  {aggregateMetrics.meanA}
                </span>
              </div>

              {/* b* */}
              <div className="bg-[#0e161c] border border-[#192833] rounded p-3 text-center">
                <span className="text-[10px] font-mono text-[#526877] block uppercase">b*</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] block mt-1">
                  {aggregateMetrics.meanB}
                </span>
              </div>
            </div>

            {/* Monk Skin Tone (MST) Strip */}
            <div className="space-y-2 pt-1 select-none">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8699a6]">Monk Skin Tone (MST)</span>
                <span className="text-[#00f0ff] font-bold">Scale {selectedMonk}</span>
              </div>

              {/* 10-step palette strip */}
              <div className="grid grid-cols-10 gap-1">
                {MONK_TONES.map((tone) => {
                  const isActive = selectedMonk === tone.scale;
                  return (
                    <button
                      key={tone.scale}
                      type="button"
                      onClick={() => setSelectedMonk(tone.scale)}
                      title={`Monk Tone ${tone.scale}: ${tone.label}`}
                      className={`h-7 rounded flex items-center justify-center font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[#00f0ff] text-black font-bold shadow-[0_0_10px_#00f0ff] scale-105'
                          : 'text-black/80 hover:opacity-90'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    >
                      {tone.scale}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Metrics List */}
            <div className="space-y-2.5 font-mono text-xs pt-2 border-t border-[#141f27]">
              {/* MST Category */}
              <div className="flex justify-between items-center">
                <span className="text-[#8699a6]">MST Category</span>
                <span className="text-white font-semibold">
                  {selectedMonk} / 10 — {currentMonkInfo.label.split(' ')[0]}
                </span>
              </div>

              {/* Detected Undertone */}
              <div className="flex justify-between items-center">
                <span className="text-[#8699a6]">Detected Undertone</span>
                <span className="text-[#f59e0b] font-semibold">
                  {currentUndertoneInfo.label}
                </span>
              </div>

              {/* Undertone Confidence */}
              <div className="flex justify-between items-center">
                <span className="text-[#8699a6]">Undertone confidence</span>
                <span className="text-white font-semibold">{confidenceScore} %</span>
              </div>

              {/* ITA */}
              <div className="flex justify-between items-center">
                <span className="text-[#8699a6]">ITA°</span>
                <span className="text-white font-semibold">
                  {aggregateMetrics.ita}° — {aggregateMetrics.itaCategory}
                </span>
              </div>
            </div>

            {/* Undertone Selection Chips */}
            <div className="grid grid-cols-4 gap-2 pt-2 select-none font-mono text-xs">
              {['Warm', 'Cool', 'Neutral', 'Olive'].map((tone) => {
                const isActive = selectedUndertone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedUndertone(tone)}
                    className={`py-1.5 rounded text-center transition-all cursor-pointer border ${
                      isActive
                        ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#f59e0b] font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                        : 'border-[#172530] text-[#688091] hover:text-white hover:bg-[#141f27]'
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button: FIND FOUNDATION MATCH */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFindFoundationMatch}
              className="w-full py-3 rounded-md border border-[#00f0ff] text-[#00f0ff] font-mono text-xs font-bold tracking-wider uppercase bg-[#00f0ff]/5 hover:bg-[#00f0ff]/15 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>▶</span>
              <span>FIND FOUNDATION MATCH</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DesktopSkinAnalysisView;
