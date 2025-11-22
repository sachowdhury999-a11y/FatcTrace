import React from 'react';
import { ShieldCheck, Search, MapPin, ScanEye } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <ScanEye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider font-mono">FactTrace<span className="text-blue-500">.ai</span></h1>
            <p className="text-xs text-slate-400 hidden sm:block">DIGITAL FORENSICS & VERIFICATION ENGINE</p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1 hidden md:flex">
            <Search className="w-4 h-4" />
            <span>Web Grounding</span>
          </div>
          <div className="flex items-center gap-1 hidden md:flex">
            <MapPin className="w-4 h-4" />
            <span>Geo-Verification</span>
          </div>
          <div className="flex items-center gap-1 hidden md:flex">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Detection</span>
          </div>
        </div>
      </div>
    </header>
  );
};