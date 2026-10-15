import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { rankFoundationsForLab } from '../../../utils/skinColorAnalysis';

export const DesktopFoundationView = () => {
  const { liveAnalysis } = useApp();

  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedUndertone, setSelectedUndertone] = useState('All');
  const [selectedRowId, setSelectedRowId] = useState(1);

  // Compute dynamically ranked foundation recommendations from live skin capture
  const rankedCatalog = useMemo(() => {
    const rawRanked = rankFoundationsForLab(liveAnalysis?.lab || { L: 62.4, a: 14.2, b: 19.8 });
    return rawRanked.map((item, idx) => ({
      ...item,
      rank: idx === 0 ? '#1 BEST MATCH' : idx === 1 ? '#2 BEST MATCH' : idx === 2 ? '#3 BEST MATCH' : `#${idx + 1} MATCH`,
    }));
  }, [liveAnalysis]);

  // Filter foundations based on criteria
  const filteredFoundations = useMemo(() => {
    return rankedCatalog.filter((item) => {
      const matchBrand = selectedBrand === 'All' || item.brand.toLowerCase().includes(selectedBrand.toLowerCase());
      const matchPrice = item.price <= maxPrice;
      const matchUndertone = selectedUndertone === 'All' || item.undertone.toLowerCase() === selectedUndertone.toLowerCase();
      return matchBrand && matchPrice && matchUndertone;
    });
  }, [rankedCatalog, selectedBrand, maxPrice, selectedUndertone]);

  const topThree = rankedCatalog.slice(0, 3);

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-4">
      
      {/* Session / Live match banner if live scan happened */}
      {liveAnalysis?.lastUpdated && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#0b1015] border border-[#00f0ff]/40 rounded text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-[#00f0ff]">LIVE SCAN APPLIED:</span>
            <span className="text-white">L* {liveAnalysis.lab.L}, a* {liveAnalysis.lab.a}, b* {liveAnalysis.lab.b} ({liveAnalysis.undertone})</span>
          </div>
          <span className="text-[#556c7b] text-[10px]">Updated {liveAnalysis.lastUpdated}</span>
        </div>
      )}

      {/* ==========================================================================
          TOP: 3 BEST MATCH CARDS
          ========================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {topThree.map((item, idx) => {
          const isBest = idx === 0;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedRowId(item.id)}
              className={`bg-[#0b1015] border rounded-md p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isBest
                  ? 'border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'border-[#172530] hover:border-[#2b4152]'
              }`}
            >
              {/* Left Swatch Block */}
              <div
                className="w-16 h-20 rounded shrink-0 border border-black/30 shadow-inner"
                style={{ backgroundColor: item.swatch }}
              ></div>

              {/* Middle Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-[#00f0ff] font-bold tracking-wider uppercase">
                  {item.rank}
                </span>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">
                  {item.brand}
                </h3>
                <p className="text-xs text-[#8699a6] truncate font-medium">
                  {item.shade}
                </p>
                <div className="text-[11px] font-mono text-[#526877] mt-1.5 truncate">
                  ΔE₀₀ {item.delta} • PKR {item.price.toLocaleString()}
                </div>
              </div>

              {/* Right Big Match Percentage */}
              <div className="text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00f0ff]">
                  {item.matchScore}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================================================================
          BOTTOM: FOUNDATION DATABASE TABLE & FILTERS
          ========================================================================== */}
      <div className="bg-[#0b1015] border border-[#172530] rounded-md p-4 flex flex-col gap-3 flex-1">
        
        {/* Header & Row Counter */}
        <div className="flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-2 text-[#c7d5e0]">
            <span className="text-[#00f0ff]">■</span>
            <span className="font-semibold tracking-wider">FOUNDATION DATABASE</span>
          </div>
          <span className="text-[#556c7b]">{filteredFoundations.length} / {rankedCatalog.length} rows</span>
        </div>

        {/* Filter Bar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-[#141f27] text-xs font-mono">
          <div className="flex flex-wrap items-center gap-5">
            {/* BRAND FILTER */}
            <div className="flex items-center gap-2">
              <span className="text-[#526877] uppercase text-[11px]">BRAND</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-[#070b0e] border border-[#172530] text-[#c7d5e0] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="All">All</option>
                <option value="Maybelline">Maybelline</option>
                <option value="L'Oréal">L'Oréal</option>
                <option value="Rivaj">Rivaj UK</option>
                <option value="Medora">Medora</option>
                <option value="MAC">MAC</option>
                <option value="Masarrat">Masarrat Misbah</option>
                <option value="Christine">Christine</option>
                <option value="Huda">Huda Beauty</option>
                <option value="Flormar">Flormar</option>
              </select>
            </div>

            {/* MAX PRICE SLIDER */}
            <div className="flex items-center gap-2">
              <span className="text-[#526877] uppercase text-[11px]">
                MAX PRICE: PKR {maxPrice.toLocaleString()}
              </span>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 sm:w-36 accent-[#00f0ff] cursor-pointer"
              />
            </div>

            {/* UNDERTONE FILTER */}
            <div className="flex items-center gap-2">
              <span className="text-[#526877] uppercase text-[11px]">UNDERTONE</span>
              <select
                value={selectedUndertone}
                onChange={(e) => setSelectedUndertone(e.target.value)}
                className="bg-[#070b0e] border border-[#172530] text-[#c7d5e0] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="All">All</option>
                <option value="Warm">Warm</option>
                <option value="Neutral">Neutral</option>
                <option value="Olive">Olive</option>
              </select>
            </div>
          </div>

          {/* Sorted indicator */}
          <div className="text-[11px] text-[#556c7b] hidden sm:block">
            Sorted by CIEDE2000 ΔE ↑
          </div>
        </div>

        {/* Foundations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-[#526877] uppercase text-[10px] tracking-wider border-b border-[#141f27]">
                <th className="py-2.5 px-3">BRAND NAME</th>
                <th className="py-2.5 px-3">SHADE CODE</th>
                <th className="py-2.5 px-3">CIEDE2000 ΔE</th>
                <th className="py-2.5 px-3">PRICE (PKR)</th>
                <th className="py-2.5 px-3">LOCAL AVAILABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141f27]/70">
              {filteredFoundations.map((row) => {
                const isSelected = selectedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#00f0ff]/10 text-white'
                        : 'text-[#8699a6] hover:bg-[#0e161c] hover:text-[#c7d5e0]'
                    }`}
                  >
                    {/* Brand Name with Color Swatch */}
                    <td className="py-2.5 px-3 flex items-center gap-2.5 font-sans font-medium text-white">
                      <span
                        className="w-3.5 h-3.5 rounded-sm shrink-0 border border-black/40"
                        style={{ backgroundColor: row.swatch }}
                      ></span>
                      <span className="truncate">{row.brand}</span>
                    </td>

                    {/* Shade Code */}
                    <td className="py-2.5 px-3 text-[#c7d5e0]">{row.shade}</td>

                    {/* CIEDE2000 ΔE */}
                    <td className="py-2.5 px-3 font-semibold text-[#10b981]">
                      {row.delta}
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 text-[#c7d5e0]">
                      {row.price.toLocaleString()}
                    </td>

                    {/* Local Availability */}
                    <td className="py-2.5 px-3 text-[#526877]">
                      {row.availability}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default DesktopFoundationView;
