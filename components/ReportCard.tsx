import React from 'react';
import { ForensicReport, SourceLink } from '../types';
import { AlertTriangle, CheckCircle, XCircle, MapPin, Search, Cpu, ExternalLink, Calendar, Crosshair, Globe, Image as ImageIcon, FileText, Video as VideoIcon, Tag, Scale, Link as LinkIcon, Facebook, Twitter, Instagram, Youtube, Share2, Eye, History, ArrowRightLeft, CheckCheck } from 'lucide-react';
import { ForensicChat } from './ForensicChat';

interface ReportCardProps {
  report: ForensicReport;
  onReset: () => void;
  fileData?: string;
  mimeType?: string;
  filePreview?: string | null;
}

const SourceLinks: React.FC<{ sources?: SourceLink[], colorClass?: string }> = ({ sources, colorClass = "text-blue-400" }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-slate-800/50">
      <div className="flex flex-col gap-1.5">
        {sources.slice(0, 3).map((source, idx) => (
          <a 
            key={idx} 
            href={source.url} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors group"
          >
            <LinkIcon className={`w-3 h-3 ${colorClass}`} />
            <span className="truncate max-w-[200px] sm:max-w-xs">{source.title || source.url}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
};

const SocialIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p.includes('facebook')) return <Facebook className="w-4 h-4 text-blue-500" />;
  if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4 text-sky-400" />;
  if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-pink-500" />;
  if (p.includes('youtube')) return <Youtube className="w-4 h-4 text-red-500" />;
  if (p.includes('tiktok')) return <VideoIcon className="w-4 h-4 text-teal-400" />;
  return <Share2 className="w-4 h-4 text-slate-400" />;
};

export const ReportCard: React.FC<ReportCardProps> = ({ report, onReset, fileData, mimeType, filePreview }) => {
  
  const getColors = (verdict: string) => {
    switch (verdict) {
      case 'RED': return { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', icon: XCircle, badge: 'bg-red-500' };
      case 'YELLOW': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, badge: 'bg-yellow-500' };
      case 'GREEN': return { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', icon: CheckCircle, badge: 'bg-green-500' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400', icon: AlertTriangle, badge: 'bg-slate-500' };
    }
  };

  const theme = getColors(report.verdictColor);
  const Icon = theme.icon;

  // Combine and Dedupe Sources: Prioritize System Grounding (report.sources) over Model Generated (supportingSources)
  const combinedSources = [
    ...report.sources.map(s => ({ title: s.title, url: s.uri, isVerified: true })),
    ...(report.detailedSearch?.supportingSources || []).map(s => ({ title: s.title, url: s.url, isVerified: false }))
  ].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Top Section: Verdict & Evidence Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verdict Status */}
        <div className={`md:col-span-2 w-full p-6 rounded-xl border ${theme.bg} ${theme.border} flex items-start md:items-center gap-4 flex-col md:flex-row shadow-lg`}>
          <div className={`p-3 rounded-full ${theme.badge} text-slate-900`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs bg-slate-900 ${theme.text} border border-current`}>
                {report.verdictColor} VERDICT
              </span>
            </div>
            <h2 className={`text-2xl font-bold text-white`}>{report.status}</h2>
          </div>
        </div>

        {/* Evidence Subject Preview */}
        {filePreview && (
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-slate-400 px-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Evidence Subject</span>
            </div>
            <div className="flex-1 bg-slate-950 rounded overflow-hidden flex items-center justify-center border border-slate-800 relative">
               {mimeType?.startsWith('video') ? (
                 <div className="w-full h-full flex items-center justify-center bg-black">
                   <VideoIcon className="w-8 h-8 text-slate-600" />
                   <span className="absolute bottom-2 right-2 text-[10px] text-slate-500 bg-slate-900 px-1 rounded">VIDEO</span>
                 </div>
               ) : (
                 <img src={filePreview} alt="Evidence" className="w-full h-32 md:h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
               )}
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Visual Evidence */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Search className="w-5 h-5" />
            <h3 className="font-semibold tracking-wide">1. VISUAL FORENSICS</h3>
          </div>
          <div className="space-y-3 text-sm flex-1">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Origin Trace</span>
              <span className="text-slate-200 font-medium text-right">{report.visualEvidence.originTrace}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visual Match</span>
              <span className="text-slate-200 font-medium text-right">{report.visualEvidence.visualMatch}</span>
            </div>
            {report.visualEvidence.similarImages && report.visualEvidence.similarImages.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-500 text-xs uppercase tracking-wider block mb-2">Visually Similar Matches</span>
                <div className="grid grid-cols-2 gap-2">
                  {report.visualEvidence.similarImages.slice(0, 4).map((img, idx) => (
                    <a 
                      key={idx}
                      href={img.url || `https://www.google.com/search?q=${encodeURIComponent(img.description)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`block p-2 rounded border bg-slate-950/50 hover:bg-slate-800 transition-colors ${img.url ? 'cursor-pointer border-slate-700 hover:border-blue-500/50' : 'cursor-default border-slate-800'}`}
                    >
                       <div className="flex items-start gap-2">
                         <div className="mt-0.5 min-w-[16px]">
                           <ImageIcon className="w-4 h-4 text-slate-600" />
                         </div>
                         <div>
                           <p className="text-[10px] text-slate-300 leading-tight line-clamp-2 mb-1">{img.description}</p>
                           {img.source && <p className="text-[9px] text-blue-500 truncate">{img.source}</p>}
                         </div>
                       </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <SourceLinks sources={report.visualEvidence.supportingSources} colorClass="text-blue-400" />
        </div>

        {/* Location Analysis */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <MapPin className="w-5 h-5" />
            <h3 className="font-semibold tracking-wide">2. GEOSPATIAL VERIFICATION</h3>
          </div>
          <div className="space-y-3 text-sm flex-1">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-slate-400 block mb-1">Claimed vs. Actual</span>
              <span className="text-slate-200 font-medium">{report.locationAnalysis.claimedVsActual}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 border-b border-slate-800 pb-2">
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                   <Crosshair className="w-3 h-3" />
                   <span className="text-xs uppercase">Est. Location</span>
                </div>
                <span className="text-slate-200 font-mono text-xs">{report.locationAnalysis.estimatedCoordinates || "Unknown"}</span>
              </div>
              <div>
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                   <Calendar className="w-3 h-3" />
                   <span className="text-xs uppercase">Est. Date</span>
                </div>
                <span className="text-slate-200 font-mono text-xs">{report.locationAnalysis.estimatedDate || "Unknown"}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Forensic Clues</span>
              <div className="flex flex-wrap gap-2">
                {report.locationAnalysis.clues.map((clue, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">
                    {clue}
                  </span>
                ))}
              </div>
            </div>

            {/* Geospatial History Check UI */}
            {report.locationAnalysis.geospatialHistory && (
              <div className="mt-4 bg-slate-950/50 rounded-lg p-3 border border-slate-700/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                    <History className="w-16 h-16 text-emerald-500" />
                 </div>
                 <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2 relative z-10">
                    <History className="w-3 h-3" />
                    {report.locationAnalysis.geospatialHistory.verdict || "Map & Time Comparison"}
                 </h4>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 relative z-10">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col">
                       <span className="text-[10px] text-slate-500 uppercase block mb-1">Present Reality</span>
                       <p className="text-xs text-slate-300 leading-snug flex-1">{report.locationAnalysis.geospatialHistory.currentView}</p>
                       {report.locationAnalysis.geospatialHistory.currentUrl && (
                         <a href={report.locationAnalysis.geospatialHistory.currentUrl} target="_blank" rel="noreferrer" className="mt-2 text-[9px] text-emerald-400 hover:underline flex items-center gap-1">
                            View Map <ExternalLink className="w-2 h-2" />
                         </a>
                       )}
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col">
                       <span className="text-[10px] text-slate-500 uppercase block mb-1">Historical Context</span>
                       <p className="text-xs text-slate-300 leading-snug flex-1">{report.locationAnalysis.geospatialHistory.historicalView}</p>
                       {report.locationAnalysis.geospatialHistory.historicalUrl && (
                         <a href={report.locationAnalysis.geospatialHistory.historicalUrl} target="_blank" rel="noreferrer" className="mt-2 text-[9px] text-emerald-400 hover:underline flex items-center gap-1">
                            View Archive <ExternalLink className="w-2 h-2" />
                         </a>
                       )}
                    </div>
                 </div>
                 
                 <div className="relative z-10 bg-slate-900/80 p-2 rounded border-l-2 border-emerald-500">
                    <div className="flex items-start gap-2">
                      <ArrowRightLeft className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                         {report.locationAnalysis.geospatialHistory.analysis}
                      </p>
                    </div>
                 </div>
              </div>
            )}

          </div>
          <SourceLinks sources={report.locationAnalysis.supportingSources} colorClass="text-emerald-400" />
        </div>

        {/* AI/Deepfake Check */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-semibold tracking-wide">3. SYNTHETIC DETECTION</h3>
          </div>
          <div className="space-y-3 text-sm flex-1">
             <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Detection Verdict</span>
              <span className={`font-bold ${report.aiCheck.verdict === 'AI-Generated' ? 'text-red-400' : 'text-slate-200'}`}>
                {report.aiCheck.verdict}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Forensic Note</span>
              <p className="text-slate-300 italic leading-relaxed">"{report.aiCheck.forensicNote}"</p>
            </div>
          </div>
          <SourceLinks sources={report.aiCheck.supportingSources} colorClass="text-purple-400" />
        </div>

         {/* Journalist Summary */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <Scale className="w-5 h-5" />
            <h3 className="font-semibold tracking-wide">4. JOURNALIST'S SUMMARY</h3>
          </div>
          <div className="flex-1">
            <p className="text-slate-200 leading-relaxed text-sm">
              {report.journalistSummary}
            </p>
          </div>
        </div>

      </div>

      {/* New Deep Search & Context Section */}
      <div className="bg-black/30 rounded-xl p-6 border border-slate-800 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
          <Globe className="w-5 h-5 text-blue-500" />
          GOOGLE SEARCH & LENS RESULTS
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Queries & Topics */}
          <div className="space-y-6">
            {report.detailedSearch?.queries && report.detailedSearch.queries.length > 0 && (
               <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Search Context</h5>
                  <div className="space-y-2">
                    {report.detailedSearch.queries.map((q, i) => (
                      <div key={i} className="text-sm text-slate-300 font-mono bg-slate-900/50 px-3 py-2 rounded border border-slate-800/50 flex items-center gap-2">
                        <Search className="w-3 h-3 text-slate-500" />
                        {q}
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {report.detailedSearch?.relatedTopics && report.detailedSearch.relatedTopics.length > 0 && (
               <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">News Topics</h5>
                  <div className="flex flex-wrap gap-2">
                    {report.detailedSearch.relatedTopics.map((topic, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-900/20 text-blue-300 border border-blue-800/30 rounded-full text-xs">
                        <Tag className="w-3 h-3" />
                        {topic}
                      </span>
                    ))}
                  </div>
               </div>
            )}
          </div>

          {/* Middle Column: Media Matches & Social */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Social Media Trace Section */}
            {report.detailedSearch?.socialAnalysis && report.detailedSearch.socialAnalysis.length > 0 && (
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/50">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Share2 className="w-3 h-3" />
                  Social Media Matches
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.detailedSearch.socialAnalysis.map((hit, idx) => (
                    <a 
                      key={idx} 
                      href={hit.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-600 transition-all group overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <SocialIcon platform={hit.platform} />
                          <span className="text-xs font-bold text-slate-300">{hit.platform}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{hit.date}</span>
                      </div>
                      
                      {/* Optional Image Thumbnail if model found one */}
                      {hit.imageUrl && (
                        <div className="w-full h-24 mb-2 bg-slate-900 rounded overflow-hidden">
                           <img src={hit.imageUrl} alt="Social content" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{hit.contentSnippet}</p>
                      <div className="flex items-center gap-1 text-[10px] text-blue-500 group-hover:underline">
                        <span>@{hit.author}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Found Media Content */}
            {report.detailedSearch?.mediaMatches && report.detailedSearch.mediaMatches.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">News Articles & Visual Matches</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.detailedSearch.mediaMatches.map((item, i) => {
                    let TypeIcon = FileText;
                    if (item.mediaType === 'Image') TypeIcon = ImageIcon;
                    if (item.mediaType === 'Video') TypeIcon = VideoIcon;
                    
                    const isExact = item.type === 'Exact Match';

                    return (
                      <div key={i} className={`p-3 rounded border ${isExact ? 'bg-green-900/10 border-green-800/50' : 'bg-slate-900/50 border-slate-800'}`}>
                        <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <TypeIcon className={`w-4 h-4 ${isExact ? 'text-green-400' : 'text-blue-400'}`} />
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isExact ? 'bg-green-500/20 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                                {item.mediaType}
                              </span>
                           </div>
                           <span className="text-[10px] text-slate-500">{item.source}</span>
                        </div>
                        
                        {/* Optional Image Thumbnail if model found one */}
                        {item.imageUrl && (
                          <div className="w-full h-24 mb-2 bg-slate-900 rounded overflow-hidden">
                             <img src={item.imageUrl} alt="Match content" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}

                        <p className="text-sm text-slate-300 leading-snug mb-1">{item.description}</p>
                        <span className="text-xs text-slate-500 italic">{item.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actual Linked Sources (Merged & Verified) */}
            <div className="pt-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Verified Search Sources
                </h5>
                
                <div className="flex flex-col gap-2">
                  {combinedSources.map((source, idx) => (
                     <a 
                      key={`vs-${idx}`} 
                      href={source.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`group flex items-start gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border transition-all ${source.isVerified ? 'border-green-900/30 hover:border-green-700/50' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className={`mt-1 p-1.5 rounded-full transition-colors ${source.isVerified ? 'bg-green-900/30 group-hover:bg-green-800/50' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                         {source.isVerified ? (
                           <CheckCheck className="w-3 h-3 text-green-400" />
                         ) : (
                           <ExternalLink className="w-3 h-3 text-blue-400" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className={`text-sm font-medium truncate ${source.isVerified ? 'text-green-400 group-hover:text-green-300' : 'text-blue-400 group-hover:text-blue-300'}`}>{source.title}</h6>
                        <p className="text-xs text-slate-500 truncate font-mono mt-0.5">{source.url}</p>
                      </div>
                    </a>
                  ))}
                  
                  {combinedSources.length === 0 && (
                    <div className="text-xs text-slate-500 italic p-2">No specific verified links found.</div>
                  )}
                </div>
              </div>

          </div>
        </div>
      </div>

      {/* Forensic Chat Integration */}
      {fileData && mimeType && (
        <ForensicChat fileData={fileData} mimeType={mimeType} report={report} />
      )}

      <div className="flex justify-center pt-6">
        <button 
          onClick={onReset}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg border border-slate-600"
        >
          Analyze Another File
        </button>
      </div>
    </div>
  );
};
