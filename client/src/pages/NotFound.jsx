import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none font-mono">
      <div className="w-16 h-16 bg-[#0c1217] border border-[#00f0ff]/40 rounded-lg flex items-center justify-center text-[#00f0ff] mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] text-2xl font-bold">
        404
      </div>
      <span className="text-xs uppercase tracking-widest font-bold text-[#f59e0b] mb-1">
        ERROR_STATUS_CODE: MODULE_NOT_FOUND
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-sans">
        Requested Telemetry View Not Found
      </h1>
      <p className="text-xs text-[#688091] max-w-md mb-6 leading-relaxed">
        The route or workstation module you requested does not exist in the Match Mirror system directory. Return to the main command deck.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to={ROUTES.HOME}
          className="px-5 py-2.5 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          ▶ Return to Dashboard [F1]
        </Link>
        <Link
          to={ROUTES.CAMERA}
          className="px-5 py-2.5 rounded bg-[#0e161c] hover:bg-[#172530] text-[#c7d5e0] border border-[#172530] text-xs transition-colors"
        >
          Camera Viewport [F2]
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
