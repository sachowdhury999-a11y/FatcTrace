import React, { useEffect, useState } from 'react';
import { Loader2, BrainCircuit, Globe, Map as MapIcon, ScanLine } from 'lucide-react';

interface AnalysisLoaderProps {
  step: string;
}

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ step }) => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      "Initializing gemini-3-pro-preview...",
      "Allocating thinking budget (32k tokens)...",
      "Extracting keyframes...",
      "Scanning for AI artifacts...",
      "Cross-referencing Google Search index...",
      "Verifying geospatial metadata...",
      "Synthesizing forensic report..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setLog(prev => [logs[i], ...prev].slice(0, 5));
        i++;
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl text-white font-bold animate-pulse">{step}</h2>
        <p className="text-slate-400 text-sm">FactTrace is analyzing media integrity</p>
      </div>

      <div className="grid grid-cols-4 gap-4 w-full max-w-md mt-4 opacity-50">
        <div className="flex flex-col items-center gap-2">
          <ScanLine className="w-5 h-5 text-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="text-[10px] text-slate-500">Visual</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Globe className="w-5 h-5 text-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="text-[10px] text-slate-500">Web</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <MapIcon className="w-5 h-5 text-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
          <span className="text-[10px] text-slate-500">Geo</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-slate-300 animate-bounce" style={{ animationDelay: '0.6s' }} />
          <span className="text-[10px] text-slate-500">AI</span>
        </div>
      </div>

      <div className="w-full bg-slate-950 rounded p-3 font-mono text-xs text-green-500 h-24 overflow-hidden border border-slate-800 shadow-inner">
        {log.map((l, idx) => (
          <div key={idx} className="opacity-80">> {l}</div>
        ))}
        <div className="animate-pulse">> _</div>
      </div>
    </div>
  );
};