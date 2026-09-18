import React, { useState, useEffect, useRef } from 'react';
import { Shield, Cpu, MousePointer2 } from 'lucide-react';

const CODE_LINES = [
  '// VaultedCode AI Security Scan Engine',
  'contract SecureVault {',
  '    mapping(address => uint256) private balances;',
  '    bool private locked;',
  '',
  '    modifier noReentrancy() {',
  '        require(!locked, "Reentrant call");',
  '        locked = true;',
  '        _;',
  '        locked = false;',
  '    }',
  '',
  '    function withdraw(uint256 amount) external noReentrancy {',
  '        require(balances[msg.sender] >= amount);',
  '        balances[msg.sender] -= amount;',
  '        (bool s, ) = msg.sender.call{value: amount}("");',
  '        require(s, "ETH transfer failed");',
  '    }',
  '}'
];

export const LiveCodeMonitor: React.FC = () => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  // Direct DOM ref for zero-latency, real-time 60fps mouse tracking
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (cursorRef.current) {
          const x = Math.min(Math.max((e.clientX / window.innerWidth) * 100, 3), 93);
          const y = Math.min(Math.max((e.clientY / window.innerHeight) * 100, 5), 90);
          cursorRef.current.style.left = `${x}%`;
          cursorRef.current.style.top = `${y}%`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (currentLineIndex >= CODE_LINES.length) {
      const resetTimeout = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 3500);
      return () => clearTimeout(resetTimeout);
    }

    const currentFullLine = CODE_LINES[currentLineIndex];

    const typingInterval = setTimeout(() => {
      if (currentCharIndex < currentFullLine.length) {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          if (updated.length <= currentLineIndex) {
            updated.push(currentFullLine.slice(0, currentCharIndex + 1));
          } else {
            updated[currentLineIndex] = currentFullLine.slice(0, currentCharIndex + 1);
          }
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      } else {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 22);

    return () => clearTimeout(typingInterval);
  }, [currentLineIndex, currentCharIndex]);

  return (
    <div className="flex flex-col items-center justify-center w-95 min-w-95 max-w-95 shrink-0">
      {/* Shrunk Fixed Size Monitor Display Frame */}
      <div className="w-[380px] min-w-95 max-w-95 h-57.5 min-h-57.5 max-h-57.5 bg-slate-950/80 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-indigo-950/60 overflow-hidden relative flex flex-col justify-between group">

        {/* Zero-latency Hardware-Accelerated Virtual Cursor */}
        <div
          ref={cursorRef}
          className="absolute pointer-events-none z-30 will-change-[left,top]"
          style={{ left: '50%', top: '50%' }}
        >
          <MousePointer2 className="w-3.5 h-3.5 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.95)] fill-indigo-500/40" />
        </div>

        {/* Subtle Screen Bezel Glare */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none z-20" />

        {/* Translucent Window Topbar with "VaultedCode" Title */}
        <div className="bg-slate-900/40 backdrop-blur-md px-3.5 py-2 flex items-center justify-between border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold tracking-wide text-white font-sans">
              VaultedCode
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm animate-pulse">
              <Cpu className="w-2.5 h-2.5 text-emerald-400" />
              LIVE SCAN
            </span>
          </div>
        </div>

        {/* Fixed Compact IDE Code Area - More Code Visible */}
        <div className="p-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950/95 to-black/95 flex-1 font-mono text-[10px] leading-snug overflow-hidden relative select-none">

          {/* Blurred Live Code Container */}
          <div className="filter blur-[1px] hover:blur-none transition-all duration-300 space-y-[2px]">
            {displayedLines.map((line, idx) => {
              let lineStyle = 'text-slate-300';
              if (line.startsWith('//')) lineStyle = 'text-emerald-400 font-semibold';
              else if (line.includes('contract') || line.includes('function') || line.includes('modifier'))
                lineStyle = 'text-indigo-400 font-bold';
              else if (line.includes('require') || line.includes('returns'))
                lineStyle = 'text-amber-300 font-medium';
              else if (line.includes('mapping') || line.includes('bool') || line.includes('uint256'))
                lineStyle = 'text-cyan-400';

              return (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="text-slate-600 text-[9px] select-none w-3.5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className={`${lineStyle} whitespace-pre`}>{line}</span>
                  {idx === currentLineIndex && (
                    <span className="inline-block w-1.5 h-3 bg-indigo-400 animate-pulse ml-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Scanline Glow Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none animate-pulse z-10" />
        </div>
      </div>

      {/* Compact Monitor Neck & Base */}
      <div className="flex flex-col items-center">
        {/* Stem */}
        <div className="w-8 h-2.5 bg-gradient-to-b from-slate-700 to-slate-800 border-x border-slate-600 shadow-inner" />
        {/* Base */}
        <div className="w-24 h-1.5 bg-slate-700 rounded-full border border-slate-600 shadow-md" />
      </div>
    </div>
  );
};
