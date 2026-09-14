import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';

const CODE_LINES = [
  '// VaultedCode AI Auditor v2.4',
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
    }, 28);

    return () => clearTimeout(typingInterval);
  }, [currentLineIndex, currentCharIndex]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md lg:max-w-lg shrink-0">
      {/* Monitor Display Frame */}
      <div className="w-full bg-slate-900 border-2 border-slate-700/80 rounded-xl shadow-2xl shadow-indigo-950/50 overflow-hidden relative group">
        
        {/* Subtle Screen Bezel Glare / Glass Reflection */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none z-20" />

        {/* Monitor Header / Window Topbar */}
        <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-slate-400 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-indigo-400" />
              SecurityVault.sol &bull; AI Live Scan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              <Cpu className="w-3 h-3 text-emerald-400" />
              LIVE
            </span>
          </div>
        </div>

        {/* IDE Code Area with Blurred Code Effect */}
        <div className="p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black h-56 lg:h-64 font-mono text-[12px] leading-relaxed overflow-hidden relative select-none">
          
          {/* Blurred Code Lines Container */}
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

          {/* Glowing Scanline Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none animate-pulse z-10" />
          
          {/* Bottom Security Status Strip */}
          <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-indigo-500/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-300 font-mono">
            <ShieldAlert className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Analyzing checks-effects-interactions...</span>
          </div>
        </div>
      </div>

      {/* Computer Monitor Stand & Base */}
      <div className="flex flex-col items-center">
        {/* Monitor Neck / Stem */}
        <div className="w-12 h-3 bg-gradient-to-b from-slate-700 to-slate-800 border-x border-slate-600 shadow-inner" />
        {/* Monitor Stand Base */}
        <div className="w-32 h-1.5 bg-slate-700 rounded-full border border-slate-600 shadow-md" />
      </div>
    </div>
  );
};
