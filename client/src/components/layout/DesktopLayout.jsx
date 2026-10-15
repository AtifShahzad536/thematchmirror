import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { ROUTES, NAV_ITEMS } from '../../constants/routes';

export const DesktopLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Real-time clock for top titlebar
  const [currentTime, setCurrentTime] = useState('');
  // Active dropdown menu
  const [activeMenu, setActiveMenu] = useState(null);
  // Fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Mobile navigation drawer toggle (closed by default on mobile)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Shortcuts (F1 - F6)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        navigate(ROUTES.HOME);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'F2') {
        e.preventDefault();
        navigate(ROUTES.CAMERA);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'F3') {
        e.preventDefault();
        navigate(ROUTES.ANALYSIS);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'F4') {
        e.preventDefault();
        navigate(ROUTES.FOUNDATION);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'F5') {
        e.preventDefault();
        navigate(ROUTES.BLENDING);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'F6') {
        e.preventDefault();
        navigate(ROUTES.DIAGNOSTICS);
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Determine active nav index from route
  const getActiveNavId = () => {
    const path = location.pathname;
    if (path === ROUTES.HOME) return '01';
    if (path === ROUTES.CAMERA) return '02';
    if (path === ROUTES.ANALYSIS) return '03';
    if (path === ROUTES.FOUNDATION) return '04';
    if (path === ROUTES.BLENDING) return '05';
    if (path === ROUTES.DIAGNOSTICS) return '06';
    return '01';
  };

  const activeId = getActiveNavId();

  // Close menus on outside click
  useEffect(() => {
    const closeMenus = () => setActiveMenu(null);
    if (activeMenu) {
      window.addEventListener('click', closeMenus);
    }
    return () => window.removeEventListener('click', closeMenus);
  }, [activeMenu]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05080b] flex items-center justify-center p-0 md:p-3 selection:bg-[#00f0ff] selection:text-[#05080b]">
      {/* Outer Desktop Application Window */}
      <div className="w-full max-w-[1540px] h-screen md:h-[95vh] flex flex-col bg-[#070b0f] border-0 md:border md:border-[#17242f] rounded-none md:rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden relative">
        
        {/* ==========================================================================
            1. TOP WINDOW TITLEBAR
            ========================================================================== */}
        <div className="h-9 shrink-0 bg-[#090e13] border-b border-[#141f27] px-2.5 sm:px-3 flex items-center justify-between select-none z-30">
          {/* Left: Mobile Drawer Hamburger Icon + Window Icon + Title */}
          <div className="flex items-center gap-2">
            {/* Mobile Drawer Toggle Icon Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="md:hidden flex items-center justify-center w-7 h-7 rounded border border-[#172530] bg-[#0c1217] text-[#00f0ff] hover:bg-[#141f27] transition-colors cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <span className="text-sm font-bold">☰</span>
            </button>

            {/* App Icon Glyph */}
            <div className="w-4 h-4 rounded-[3px] border border-[#00f0ff] flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 bg-[#00f0ff]/80 rounded-[1px]"></div>
            </div>

            {/* Title Text */}
            <span className="text-xs font-semibold text-white tracking-wide truncate">
              The Match Mirror <span className="hidden sm:inline text-[#5e7789] font-normal">(v1.0 Desktop)</span>
            </span>
          </div>

          {/* Right: Telemetry Status + Live Clock + Window Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Camera Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>CAMERA ACTIVE</span>
            </div>

            {/* Sensors Status */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#10b981]">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span>SENSORS READY</span>
            </div>

            {/* Live Clock */}
            <div className="text-[10px] sm:text-[11px] font-mono text-[#8699a6] tracking-wider px-1">
              {currentTime || '4:01:07 PM'}
            </div>

            {/* Window Controls */}
            <div className="flex items-center -mr-1">
              <button
                type="button"
                onClick={() => alert('Minimized to tray')}
                className="w-7 sm:w-8 h-7 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1a2632] transition-colors"
                title="Minimize"
              >
                —
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-7 sm:w-8 h-7 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1a2632] transition-colors"
                title="Maximize / Toggle Fullscreen"
              >
                ▢
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOME)}
                className="w-7 sm:w-8 h-7 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#ef4444] transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            2. TOP MENU BAR (File, Edit, View, Capture, Tools, Help)
            ========================================================================== */}
        <div className="h-7 shrink-0 bg-[#070b0e] border-b border-[#141f27] px-2.5 sm:px-3 flex items-center gap-1 text-xs text-[#8a9fae] select-none relative z-20 overflow-x-auto no-scrollbar">
          {[
            {
              name: 'File',
              items: [
                { label: 'New Capture Session', shortcut: 'Ctrl+N', action: () => navigate(ROUTES.CAMERA) },
                { label: 'Open Stored Profile...', shortcut: 'Ctrl+O', action: () => navigate(ROUTES.FOUNDATION) },
                { divider: true },
                { label: 'Export Diagnostic Telemetry...', shortcut: 'Ctrl+S', action: () => navigate(ROUTES.DIAGNOSTICS) },
                { label: 'Exit Application', shortcut: 'Alt+F4', action: () => navigate(ROUTES.HOME) },
              ],
            },
            {
              name: 'Edit',
              items: [
                { label: 'Copy CIELAB Coordinates', shortcut: 'Ctrl+C', action: () => alert('CIELAB: L* 62.4, a* 14.2, b* 19.8 copied!') },
                { label: 'Reset Pre-flight Calibration', shortcut: 'Ctrl+R', action: () => navigate(ROUTES.CAMERA) },
              ],
            },
            {
              name: 'View',
              items: [
                { label: '01 Dashboard / Home', shortcut: 'F1', action: () => navigate(ROUTES.HOME) },
                { label: '02 Camera & Quality Check', shortcut: 'F2', action: () => navigate(ROUTES.CAMERA) },
                { label: '03 Skin Color Analysis', shortcut: 'F3', action: () => navigate(ROUTES.ANALYSIS) },
                { label: '04 Foundation Recommendations', shortcut: 'F4', action: () => navigate(ROUTES.FOUNDATION) },
                { label: '05 Blending Heatmap', shortcut: 'F5', action: () => navigate(ROUTES.BLENDING) },
                { label: '06 System Diagnostics', shortcut: 'F6', action: () => navigate(ROUTES.DIAGNOSTICS) },
              ],
            },
            {
              name: 'Capture',
              items: [
                { label: 'Start Camera Viewport', shortcut: 'F2', action: () => navigate(ROUTES.CAMERA) },
                { label: 'Trigger Spectral Reading', action: () => navigate(ROUTES.ANALYSIS) },
                { label: 'Run Heatmap Analysis', shortcut: 'F5', action: () => navigate(ROUTES.BLENDING) },
              ],
            },
            {
              name: 'Tools',
              items: [
                { label: 'Calibrate TCS3448 Sensor', action: () => navigate(ROUTES.DIAGNOSTICS) },
                { label: 'CIEDE2000 Distance Calculator', action: () => navigate(ROUTES.FOUNDATION) },
                { label: 'View Match Logs (tail -f)', action: () => navigate(ROUTES.DIAGNOSTICS) },
              ],
            },
            {
              name: 'Help',
              items: [
                { label: 'Keyboard Shortcuts Guide (F1-F6)', action: () => alert('F1: Home | F2: Camera | F3: Analysis | F4: Recommendations | F5: Blending | F6: Diagnostics') },
                { label: 'About The Match Mirror v1.0 Desktop', action: () => alert('The Match Mirror (v1.0 Desktop)\nPersonalized Shade Matching & Blending Guidance for Pakistani Skin Tones.') },
              ],
            },
          ].map((menu) => (
            <div key={menu.name} className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === menu.name ? null : menu.name);
                }}
                className={`px-2 py-0.5 rounded text-[11px] hover:text-white hover:bg-[#141f27] transition-colors ${
                  activeMenu === menu.name ? 'bg-[#141f27] text-white' : ''
                }`}
              >
                {menu.name}
              </button>

              {/* Dropdown Menu */}
              {activeMenu === menu.name && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-0.5 w-60 bg-[#0c1217] border border-[#1a2936] rounded-md shadow-2xl py-1 z-50 text-[11px]"
                >
                  {menu.items.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="my-1 border-t border-[#1a2936]"></div>
                    ) : (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          item.action();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 flex items-center justify-between text-[#c7d5e0] hover:bg-[#00f0ff]/10 hover:text-[#00f0ff] transition-colors"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono text-[#526877]">{item.shortcut}</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ==========================================================================
            3. MAIN BODY (Sidebar Drawer + Unconstrained Workspace)
            ========================================================================== */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile Dark Backdrop Overlay (when drawer is open) */}
          {isMobileDrawerOpen && (
            <div
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
            />
          )}

          {/* Left Sidebar / Activity Navigation Drawer */}
          {/* On Mobile: fixed, z-50, sliding drawer. On Desktop: docked relative static sidebar */}
          <aside
            className={`
              fixed md:relative inset-y-0 left-0 z-50 md:z-10
              w-64 shrink-0 bg-[#080d11] border-r border-[#141f27]
              flex flex-col justify-between select-none shadow-2xl md:shadow-none
              transform transition-transform duration-300 ease-in-out
              ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            {/* Top: Header with Close Icon on Mobile + Navigation Items */}
            <div className="py-3">
              <div className="px-4 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-[#4f6775] uppercase">
                  NAVIGATION
                </span>
                {/* Mobile Drawer Close Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="md:hidden text-[#8699a6] hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 md:py-2 text-xs transition-all relative group ${
                        isActive
                          ? 'bg-[#00f0ff]/10 text-[#00f0ff] font-medium'
                          : 'text-[#7e94a5] hover:text-[#c7d5e0] hover:bg-[#0d141b]'
                      }`}
                    >
                      {/* Left glowing border accent for active item */}
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"></span>
                      )}

                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`font-mono text-[11px] ${
                            isActive ? 'text-[#00f0ff]' : 'text-[#475b68] group-hover:text-[#7e94a5]'
                          }`}
                        >
                          {item.num}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <span
                        className={`text-[10px] font-mono shrink-0 pl-1 ${
                          isActive ? 'text-[#00f0ff]/80' : 'text-[#475b68]'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Hardware & ML Telemetry (pinned at bottom of sidebar) */}
            <div className="p-3.5 border-t border-[#141f27] bg-[#070b0e] space-y-1.5 font-mono text-[10px] text-[#556c7b]">
              <div className="flex items-center justify-between">
                <span>GPU • CUDA 12.4</span>
                <span className="text-[#00f0ff]">38%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CPU • 21%</span>
                <span>RAM 2.1 GB</span>
              </div>
              <div className="text-[#3c5261] pt-0.5 truncate">
                Model • MediaPipe FaceMesh
              </div>
            </div>
          </aside>

          {/* Right Workspace / Active Viewport (Never squished on mobile: full 100% width) */}
          <main className="flex-1 w-full bg-[#060a0d] overflow-y-auto relative p-3 sm:p-5">
            <Outlet />
          </main>
        </div>

        {/* ==========================================================================
            4. BOTTOM STATUS BAR (Footer)
            ========================================================================== */}
        <div className="h-6 shrink-0 bg-[#080d11] border-t border-[#141f27] px-2.5 sm:px-3 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#556c7b] select-none z-20">
          {/* Left Status Indicators */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 text-[#00f0ff] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]"></span>
              <span>READY</span>
            </div>
            <div className="hidden sm:inline">/dev/video0 • 1920×1080 @ 30fps</div>
            <div className="hidden lg:inline text-[#475b68]">Illuminant D65 • CRI 96</div>
          </div>

          {/* Right: Active Page & Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden sm:inline text-[#475b68]">
              {NAV_ITEMS.find((n) => n.id === activeId)?.label || 'Workstation'}
            </span>
            <div className="flex items-center gap-2 text-[#688091]">
              <span className="hidden md:inline">UTF-8</span>
              <span className="text-[#00f0ff] font-medium">The Match Mirror v1.0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DesktopLayout;
