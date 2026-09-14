import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu } from 'lucide-react';

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
    }, 25);

    return () => clearTimeout(typingInterval);
  }, [currentLineIndex, currentCharIndex]);

  return (
    <div className="flex flex-col items-center justify-center w-[460px] min-w-[460px] max-w-[460px] shrink-0">
      {/* Constant Fixed Size Monitor Display Frame */}
      <div className="w-[460px] min-w-[460px] max-w-[460px] h-[290px] min-h-[290px] max-h-[290px] bg-slate-950/80 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-indigo-950/60 overflow-hidden relative flex flex-col justify-between group">
        
        {/* Subtle Screen Bezel Glare */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none z-20" />

        {/* Translucent Window Topbar with "VaultedCode" Title (No Dots) */}
        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-wide text-white font-sans">
              VaultedCode
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm animate-pulse">
              <Cpu className="w-3 h-3 text-emerald-400" />
              LIVE SCAN
            </span>
          </div>
        </div>

        {/* Fixed Height IDE Code Area with Constant Screen Rectangle */}
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950/95 to-black/95 flex-1 font-mono text-[12px] leading-relaxed overflow-hidden relative select-none">
          
          {/* Blurred Live Code Container */}
          <div className="filter blur-[1.2px] hover:blur-none transition-all duration-300 space-y-1">
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
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-slate-600 text-[10px] select-none w-4 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className={`${lineStyle} whitespace-pre`}>{line}</span>
                  {idx === currentLineIndex && (
                    <span className="inline-block w-2 h-3.5 bg-indigo-400 animate-pulse ml-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Scanline Glow Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none animate-pulse z-10" />
          
          {/* Bottom Security Status Badge */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-300 font-mono shadow-lg">
            <ShieldAlert className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Analyzing checks-effects-interactions...</span>
          </div>
        </div>
      </div>

      {/* Sleek Monitor Neck & Base */}
      <div className="flex flex-col items-center">
        {/* Stem */}
        <div className="w-10 h-3 bg-gradient-to-b from-slate-700 to-slate-800 border-x border-slate-600 shadow-inner" />
        {/* Base */}
        <div className="w-28 h-1.5 bg-slate-700 rounded-full border border-slate-600 shadow-md" />
      </div>
    </div>
  );
};
