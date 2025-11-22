import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalysisLoader } from './components/AnalysisLoader';
import { ReportCard } from './components/ReportCard';
import { analyzeMedia } from './services/geminiService';
import { ForensicReport } from './types';
import { Upload, FileVideo, FileImage, AlertOctagon, Shield, Key } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey);
      } else {
        // Fallback for non-IDX environments (assume env var is set)
        setApiKeyReady(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        // Assume success per guidance to avoid race condition
        setApiKeyReady(true);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Failed to select API Key.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic size validation
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File too large. Please upload a file smaller than 20MB.");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) return;
    
    setLoading(true);
    setError(null);

    try {
      // Strip base64 prefix for API
      const base64Data = preview.split(',')[1];
      const mimeType = file.type;

      const result = await analyzeMedia(base64Data, mimeType, claim);
      setReport(result);
    } catch (err: any) {
      console.error(err);
      
      if (err.message === "PERMISSION_DENIED" || (err.message && err.message.includes("403"))) {
        setError("Authentication Error. Please re-connect your API Key.");
        setApiKeyReady(false); // Force re-auth
      } else {
        setError("Forensic analysis failed. The system might be overloaded or the media format is unsupported.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setReport(null);
    setClaim('');
    setPreview(null);
    setError(null);
  };

  // Render: API Key Auth Screen
  if (!apiKeyReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Security Clearance Required</h2>
            <p className="text-slate-400 text-sm">
              FactTrace uses advanced forensic models (Gemini 3 Pro + Search). 
              You must connect a valid API Key to proceed.
            </p>
          </div>
          
          <button 
            onClick={handleSelectKey}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Key className="w-4 h-4" />
            Connect API Key
          </button>

          <p className="text-xs text-slate-500">
            Ensure you select a project with billing enabled for Search Grounding.
            <br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-1 block">
              View Billing Documentation
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Header />

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertOctagon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            {error.includes("Authentication") && (
               <button onClick={handleSelectKey} className="ml-auto text-xs bg-red-900/50 px-3 py-1 rounded border border-red-500/50 hover:bg-red-800">
                 Re-Connect
               </button>
            )}
          </div>
        )}

        {!loading && !report && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
            
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white">FactTrace Digital Forensics</h2>
              <p className="text-slate-400 text-lg">
                Combat misinformation with AI-powered visual analysis and cross-referencing. Upload media to verify authenticity instantly.
              </p>
            </div>

            <div className="w-full max-w-2xl bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-2xl">
              <div className="space-y-6">
                
                {/* Drop Area */}
                <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 transition-colors hover:border-blue-500/50 group bg-slate-950/50">
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                     {preview ? (
                        file?.type.startsWith('video') ? (
                          <div className="relative w-full h-48 bg-black rounded flex items-center justify-center">
                            <FileVideo className="w-16 h-16 text-slate-500" />
                            <span className="absolute bottom-2 text-xs text-slate-400">{file.name}</span>
                          </div>
                        ) : (
                          <img src={preview} alt="Preview" className="max-h-64 rounded shadow-lg object-contain" />
                        )
                     ) : (
                       <>
                        <Upload className="w-12 h-12 mb-4" />
                        <p className="font-medium text-lg">Drop image or video here</p>
                        <p className="text-sm mt-2 opacity-70">Supports JPG, PNG, MP4, WEBM</p>
                       </>
                     )}
                  </div>
                </div>

                {/* Claim Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Context / Claim (Optional)
                  </label>
                  <input
                    type="text"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., 'This claims to be a protest in Paris yesterday'"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!file}
                  className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all
                    ${file 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  START FORENSIC ANALYSIS
                </button>

              </div>
            </div>

            <div className="flex gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">Deep Pixel Analysis</span>
               </div>
               <div className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">Frame-by-Frame Check</span>
               </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <AnalysisLoader step="Initiating Deep Scan..." />
          </div>
        )}

        {report && (
          <ReportCard 
            report={report} 
            onReset={handleReset} 
            fileData={preview?.split(',')[1]} 
            mimeType={file?.type} 
            filePreview={preview}
          />
        )}

      </main>
    </div>
  );
};

export default App;