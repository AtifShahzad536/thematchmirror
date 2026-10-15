import React, { useState, useEffect, useRef } from 'react';

const INITIAL_LOGS = [
  { time: '2026-10-15 15:30:10', level: 'INFO ', tag: 'camera', message: 'Opened /dev/video0 (UVC) 1920x1080 MJPG' },
  { time: '2026-10-15 15:30:13', level: 'INFO ', tag: 'light ', message: 'Spectral sensor TCS3448 ready • CRI 96.2 • CCT 6480K' },
  { time: '2026-10-15 15:30:16', level: 'INFO ', tag: 'mesh  ', message: 'MediaPipe FaceMesh loaded (refine_landmarks=True, 478 pts)' },
  { time: '2026-10-15 15:30:19', level: 'INFO ', tag: 'color ', message: 'sRGB→CIELAB pipeline • illuminant D65 • observer 2°' },
  { time: '2026-10-15 15:30:22', level: 'WARN ', tag: 'pose  ', message: 'Head roll 3.2° exceeds 3.0° threshold - prompting user' },
  { time: '2026-10-15 15:30:25', level: 'INFO ', tag: 'match ', message: 'Loaded 1,284 shades from shades_pk.sqlite' },
  { time: '2026-10-15 15:30:28', level: 'INFO ', tag: 'match ', message: 'CIEDE2000 ranking complete in 4.1 ms' },
  { time: '2026-10-15 15:30:31', level: 'ERROR', tag: 'net   ', message: 'Retailer availability API timeout (retry 1/3)' },
  { time: '2026-10-15 15:30:34', level: 'INFO ', tag: 'net   ', message: 'Retailer availability API OK' },
  { time: '2026-10-15 15:30:37', level: 'INFO ', tag: 'heat  ', message: 'Variance engine running @ 15 fps' },
];

export const DesktopDiagnosticsView = () => {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const terminalBottomRef = useRef(null);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLiveLog = (level, tag, message) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toTimeString().split(' ')[0]}`;
    setLogs((prev) => [...prev, { time: timeStr, level, tag, message }]);
  };

  const handlePing = () => {
    addLiveLog('INFO ', 'sensor', 'TCS3448 & UVC status check OK • Latency: 1.2ms');
  };

  const handleSimulateWarning = () => {
    addLiveLog('WARN ', 'light ', 'Ambient light delta shift > 15 Lux detected (recalibrating)');
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-4">
      
      {/* ==========================================================================
          HEADER & COMMAND BAR
          ========================================================================== */}
      <div className="flex items-center justify-between text-xs font-mono select-none px-1">
        <div className="flex items-center gap-2 text-[#c7d5e0]">
          <span className="text-[#00f0ff]">■</span>
          <span className="font-semibold tracking-wider">SYSTEM DIAGNOSTICS / LOGS</span>
        </div>
        <span className="text-[11px] text-[#556c7b]">tail -f matchmirror.log</span>
      </div>

      {/* ==========================================================================
          CONSOLE / TERMINAL BOX (Matching Screenshot 5)
          ========================================================================== */}
      <div className="bg-[#05080b] border border-[#172530] rounded-md p-4 sm:p-6 flex-1 flex flex-col font-mono text-xs overflow-hidden shadow-2xl relative">
        
        {/* Terminal Header Action Ribbon */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141f27] text-[11px] text-[#556c7b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span className="text-[#8699a6]">daemon active (pid: 4182)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePing}
              className="px-2.5 py-1 rounded bg-[#0e161c] hover:bg-[#172530] text-[#00f0ff] border border-[#172530] transition-colors cursor-pointer"
            >
              Ping Sensors
            </button>
            <button
              type="button"
              onClick={handleSimulateWarning}
              className="px-2.5 py-1 rounded bg-[#0e161c] hover:bg-[#172530] text-[#f59e0b] border border-[#172530] transition-colors cursor-pointer"
            >
              Simulate Warning
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 rounded bg-[#0e161c] hover:bg-[#172530] text-[#8699a6] hover:text-white border border-[#172530] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Terminal Output Stream */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
          {logs.map((log, idx) => {
            let levelColor = 'text-[#10b981]'; // Green for INFO
            if (log.level.includes('WARN')) {
              levelColor = 'text-[#f59e0b]'; // Amber for WARN
            } else if (log.level.includes('ERROR')) {
              levelColor = 'text-[#ef4444]'; // Red for ERROR
            }

            return (
              <div key={idx} className="flex flex-wrap items-baseline gap-x-2 leading-relaxed">
                {/* Timestamp */}
                <span className="text-[#556c7b]">{log.time}</span>

                {/* Level Badge [INFO ] / [WARN ] / [ERROR] */}
                <span className={`font-semibold ${levelColor}`}>
                  [{log.level}]
                </span>

                {/* Tag name */}
                <span className="text-[#00f0ff]/90">{log.tag}</span>

                {/* Message Body */}
                <span className="text-[#c7d5e0]">{log.message}</span>
              </div>
            );
          })}

          {/* Blinking Cyan Terminal Cursor */}
          <div className="flex items-center gap-1 pt-2">
            <span className="w-2.5 h-4 bg-[#00f0ff] animate-pulse"></span>
          </div>

          <div ref={terminalBottomRef} />
        </div>

      </div>

    </div>
  );
};

export default DesktopDiagnosticsView;
