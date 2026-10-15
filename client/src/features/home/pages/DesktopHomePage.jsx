import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useApp } from '../../../context/AppContext';

export const DesktopHomePage = () => {
  const navigate = useNavigate();
  const { liveAnalysis } = useApp();

  const monkVal = liveAnalysis?.monkScale || 5;
  const bestDelta = liveAnalysis?.bestDelta || '1.12';
  const bestMatchScore = liveAnalysis?.bestMatchScore || '93.3%';
  const undertone = liveAnalysis?.undertone || 'Warm Olive';
  const lab = liveAnalysis?.lab || { L: 62.4, a: 14.2, b: 19.8 };

  // Active climate preset for Pakistani skin adaptation
  const [selectedCity, setSelectedCity] = useState('Lahore');

  const cityClimates = {
    Lahore: { temp: '31°C', humidity: '64%', weather: 'Humid Sun', oxidationRisk: 'High', tip: 'Apply targeted oil-control primer on T-zone; use translucent powder to prevent shade darkening.' },
    Karachi: { temp: '32°C', humidity: '76%', weather: 'Coastal Humidity', oxidationRisk: 'Very High', tip: 'Use sweat-resistant demi-matte foundation with setting spray to maintain exact undertone tone.' },
    Islamabad: { temp: '26°C', humidity: '45%', weather: 'Mild Clear', oxidationRisk: 'Low', tip: 'Hydrating base prevents foundation settling into dry areas while maintaining 93% color harmony.' },
  };

  const currentClimate = cityClimates[selectedCity] || cityClimates.Lahore;

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-5 pb-6">
      
      {/* ==========================================================================
          1. TOP COMMAND DECK: HERO & CORE TELEMETRY STATS (Screenshot 1 Enhanced)
          ========================================================================== */}
      <div className="bg-[#0b1015] border border-[#172530] rounded-lg p-5 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.7)] relative overflow-hidden">
        {/* Subtle grid background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Session Metadata Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none">
          <div className="flex items-center gap-2 text-[#00f0ff] font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></span>
            <span>SESSION #0427</span>
            <span className="text-[#324b59]">•</span>
            <span>ACTIVE PROFILE: DESI COMPLEXION SPECTRAL ENGINE</span>
          </div>
          <div className="text-[10px] text-[#556c7b] bg-[#070b0e] px-2.5 py-1 rounded border border-[#172530]">
            Illuminant D65 • CIEDE2000 v2.4 • Observer 2°
          </div>
        </div>

        {/* Main Title & Pipeline Header */}
        <div className="mt-3.5 mb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            The Match Mirror: Personalized Shade Matching &amp; Blending Guidance
          </h1>
          <p className="text-xs sm:text-sm text-[#7e96a7] font-mono mt-1">
            Capture → Analyze → Match → Blend • Clinical Colorimetry for South Asian Melanin
          </p>
        </div>

        {/* 4 Core Stat Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-5 select-none">
          {/* Card 1: LAST MST */}
          <div className="bg-[#0e161c] border border-[#192833] rounded-md p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00f0ff]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#526877] font-semibold tracking-wider uppercase">
                LAST MST
              </span>
              <span className="w-2 h-2 rounded-full bg-[#d7bd96]"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] mt-2">
              {monkVal} / 10
            </div>
            <span className="text-[10px] font-mono text-[#688091] mt-1">
              Monk Skin Tone Scale
            </span>
          </div>

          {/* Card 2: BEST ΔE00 */}
          <div className="bg-[#0e161c] border border-[#192833] rounded-md p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00f0ff]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#526877] font-semibold tracking-wider uppercase">
                BEST ΔE₀₀
              </span>
              <span className="text-[10px] font-mono text-[#10b981]">Seamless</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] mt-2">
              {bestDelta}
            </div>
            <span className="text-[10px] font-mono text-[#688091] mt-1">
              CIEDE2000 Color Distance
            </span>
          </div>

          {/* Card 3: BLEND VARIANCE */}
          <div className="bg-[#0e161c] border border-[#192833] rounded-md p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00f0ff]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#526877] font-semibold tracking-wider uppercase">
                BLEND VARIANCE
              </span>
              <span className="text-[10px] font-mono text-[#10b981]">OK</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] mt-2">
              Low
            </div>
            <span className="text-[10px] font-mono text-[#688091] mt-1">
              Demarcation Index &lt; 1.5
            </span>
          </div>

          {/* Card 4: SENSORS */}
          <div className="bg-[#0e161c] border border-[#192833] rounded-md p-3.5 sm:p-4 flex flex-col justify-between hover:border-[#00f0ff]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#526877] font-semibold tracking-wider uppercase">
                SENSORS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff] mt-2">
              4 / 4 OK
            </div>
            <span className="text-[10px] font-mono text-[#688091] mt-1">
              UVC • Spectral • Mesh • D65
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CAMERA)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#00f0ff] text-[#00f0ff] font-mono text-xs font-bold tracking-wider uppercase bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 shadow-[0_0_18px_rgba(0,240,255,0.25)] hover:shadow-[0_0_26px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <span>▶</span>
            <span>START NEW CAPTURE [F2]</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.FOUNDATION)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#172530] text-[#c7d5e0] font-mono text-xs font-medium hover:text-white hover:bg-[#141f27] hover:border-[#00f0ff]/30 transition-all cursor-pointer"
          >
            <span>📦</span>
            <span>BROWSE SHADE CATALOG [F4]</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.DIAGNOSTICS)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#172530] text-[#556c7b] font-mono text-xs hover:text-[#00f0ff] hover:bg-[#141f27] transition-all cursor-pointer hidden sm:inline-flex"
          >
            <span>⚡</span>
            <span>SYSTEM LOGS [F6]</span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
          2. WORKSTATION HUB: 2-COLUMN GRID (Workflow Pipeline + Spotlight & Climate)
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (Cols 1-7): 4-Stage Diagnostic Pipeline Navigator */}
        <div className="lg:col-span-7 bg-[#0b1015] border border-[#172530] rounded-lg p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono select-none">
            <div className="flex items-center gap-2 text-[#c7d5e0]">
              <span className="text-[#00f0ff]">■</span>
              <span className="font-semibold tracking-wider">BEAUTY-TECH COLORIMETRIC PIPELINE</span>
            </div>
            <span className="text-[10px] text-[#10b981]">ALL SYSTEMS NOMINAL</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {/* Stage 1 */}
            <div
              onClick={() => navigate(ROUTES.CAMERA)}
              className="p-3 bg-[#0e161c] border border-[#192833] hover:border-[#00f0ff]/50 rounded-md transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-[#070b0e] border border-[#172530] text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-[#00f0ff]">
                  01
                </span>
                <div>
                  <h4 className="text-white font-semibold group-hover:text-[#00f0ff] transition-colors">
                    Optical Facial Detection &amp; Quality Telemetry
                  </h4>
                  <p className="text-[#688091] text-[11px] mt-0.5 font-sans">
                    478 landmark MediaPipe tracking, real-time exposure (+0.29 EV), and illuminant lux verification.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#00f0ff] shrink-0 font-bold">F2 ↗</span>
            </div>

            {/* Stage 2 */}
            <div
              onClick={() => navigate(ROUTES.ANALYSIS)}
              className="p-3 bg-[#0e161c] border border-[#192833] hover:border-[#00f0ff]/50 rounded-md transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-[#070b0e] border border-[#172530] text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-[#00f0ff]">
                  02
                </span>
                <div>
                  <h4 className="text-white font-semibold group-hover:text-[#00f0ff] transition-colors">
                    CIELAB Chromaticity &amp; Melanin Extraction
                  </h4>
                  <p className="text-[#688091] text-[11px] mt-0.5 font-sans">
                    Calculates L* {lab.L}, a* {lab.a}, b* {lab.b}, and ITA° 32.6° to map exact Pakistani undertone.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#00f0ff] shrink-0 font-bold">F3 ↗</span>
            </div>

            {/* Stage 3 */}
            <div
              onClick={() => navigate(ROUTES.FOUNDATION)}
              className="p-3 bg-[#0e161c] border border-[#192833] hover:border-[#00f0ff]/50 rounded-md transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-[#070b0e] border border-[#172530] text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-[#00f0ff]">
                  03
                </span>
                <div>
                  <h4 className="text-white font-semibold group-hover:text-[#00f0ff] transition-colors">
                    CIEDE2000 Algorithmic Foundation Matching
                  </h4>
                  <p className="text-[#688091] text-[11px] mt-0.5 font-sans">
                    Scans 1,284 local &amp; global formulas (Maybelline, Rivaj, Medora, MAC) for ΔE &lt; 1.5 match.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#00f0ff] shrink-0 font-bold">F4 ↗</span>
            </div>

            {/* Stage 4 */}
            <div
              onClick={() => navigate(ROUTES.BLENDING)}
              className="p-3 bg-[#0e161c] border border-[#192833] hover:border-[#00f0ff]/50 rounded-md transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-[#070b0e] border border-[#172530] text-[#00f0ff] flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-[#00f0ff]">
                  04
                </span>
                <div>
                  <h4 className="text-white font-semibold group-hover:text-[#00f0ff] transition-colors">
                    Thermal Variance Blending Heatmap
                  </h4>
                  <p className="text-[#688091] text-[11px] mt-0.5 font-sans">
                    Highlights jawline demarcation lines in real time to guide seamless feathering down the neck.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#00f0ff] shrink-0 font-bold">F5 ↗</span>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 8-12): Top Match Spotlight & Pakistani Climate Adapter */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* 1. Active Best Match Spotlight Card */}
          <div className="bg-[#0b1015] border border-[#00f0ff] rounded-lg p-4 shadow-[0_0_20px_rgba(0,240,255,0.18)] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono select-none">
              <span className="text-[#00f0ff] font-bold uppercase tracking-wider">
                ★ TOP RECOMMENDED MATCH
              </span>
              <span className="text-2xl font-mono font-bold text-[#00f0ff]">
                {bestMatchScore}
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-[#070b0e] p-3 rounded border border-[#172530]">
              <div
                className="w-14 h-16 rounded shrink-0 border border-black/40 shadow-inner"
                style={{ backgroundColor: liveAnalysis?.hex || '#d29d6e' }}
              ></div>
              <div className="min-w-0 flex-1 font-mono">
                <span className="text-[10px] text-[#10b981] font-semibold uppercase">
                  ΔE₀₀ {bestDelta} • {undertone}
                </span>
                <h3 className="text-sm font-bold text-white truncate font-sans">
                  {liveAnalysis?.bestMatchBrand || 'Maybelline Fit Me'}
                </h3>
                <p className="text-xs text-[#8699a6] truncate">
                  {liveAnalysis?.bestMatchShade || '220 Natural Beige'}
                </p>
                <div className="text-[10px] text-[#556c7b] mt-1">
                  PKR 2,450 • In stock (Lahore, Karachi)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => navigate(ROUTES.FOUNDATION)}
                className="w-full py-2 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 text-xs font-mono font-semibold transition-all cursor-pointer text-center"
              >
                Inspect All 9 Matching Formulas ➔
              </button>
            </div>
          </div>

          {/* 2. Pakistani Climate & Weather Adaptation Module */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-lg p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono select-none">
              <div className="flex items-center gap-2 text-[#c7d5e0]">
                <span className="text-[#00f0ff]">■</span>
                <span className="font-semibold tracking-wider">PAKISTANI CLIMATE ADAPTATION</span>
              </div>
              
              {/* City Selector */}
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {['Lahore', 'Karachi', 'Islamabad'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#00f0ff] text-[#070b0e] font-bold'
                        : 'bg-[#0e161c] text-[#8699a6] hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Climate Metrics */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
              <div className="bg-[#070b0e] p-2 rounded border border-[#172530]">
                <span className="text-[10px] text-[#526877] block">TEMPERATURE</span>
                <span className="text-white font-bold">{currentClimate.temp}</span>
              </div>
              <div className="bg-[#070b0e] p-2 rounded border border-[#172530]">
                <span className="text-[10px] text-[#526877] block">HUMIDITY</span>
                <span className="text-[#00f0ff] font-bold">{currentClimate.humidity}</span>
              </div>
              <div className="bg-[#070b0e] p-2 rounded border border-[#172530]">
                <span className="text-[10px] text-[#526877] block">OXIDATION RISK</span>
                <span className="text-[#f59e0b] font-bold">{currentClimate.oxidationRisk}</span>
              </div>
            </div>

            {/* Climate Guidance Tip */}
            <div className="p-2.5 bg-[#0e161c] rounded border border-[#172530] text-[11px] font-mono text-[#8699a6] leading-relaxed">
              <span className="text-[#00f0ff] font-bold block mb-0.5">Application Tip for {selectedCity}:</span>
              {currentClimate.tip}
            </div>
          </div>

        </div>

      </div>

      {/* ==========================================================================
          3. KEYBOARD SHORTCUTS & SYSTEM HEALTH CHEAT SHEET (Bottom Ribbon)
          ========================================================================== */}
      <div className="bg-[#0b1015] border border-[#172530] rounded-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#556c7b] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span className="text-[#c7d5e0]">IDE WORKSTATION ACTIVE</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F1</kbd> Home</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F2</kbd> Camera</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F3</kbd> Analysis</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F4</kbd> Shades</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F5</kbd> Blending</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#070b0e] border border-[#172530] rounded text-[#00f0ff]">F6</kbd> Diagnostics</span>
        </div>
      </div>

    </div>
  );
};

export default DesktopHomePage;
