
export interface SourceLink {
  title: string;
  url: string;
}

export interface SocialMediaHit {
  platform: 'Facebook' | 'X' | 'Instagram' | 'YouTube' | 'TikTok' | 'Reddit' | 'Other';
  url: string;
  author: string;
  date: string;
  contentSnippet: string;
  imageUrl?: string;
}

export interface SimilarImage {
  url?: string;
  description: string;
  source?: string;
}

export interface GeoComparison {
  currentView: string;
  currentUrl?: string;
  historicalView: string;
  historicalUrl?: string;
  analysis: string;
  verdict: string;
}

export interface ForensicReport {
  verdictColor: 'RED' | 'YELLOW' | 'GREEN';
  status: string;
  visualEvidence: {
    originTrace: string;
    visualMatch: string;
    similarImages: SimilarImage[];
    supportingSources: SourceLink[];
  };
  locationAnalysis: {
    claimedVsActual: string;
    clues: string[];
    estimatedCoordinates?: string;
    estimatedDate?: string;
    geospatialHistory?: GeoComparison;
    supportingSources: SourceLink[];
  };
  aiCheck: {
    verdict: 'Real' | 'AI-Generated' | 'Edited' | 'Inconclusive';
    forensicNote: string;
    supportingSources: SourceLink[];
  };
  detailedSearch: {
    queries: string[];
    relatedTopics: string[];
    mediaMatches: {
      type: 'Exact Match' | 'Similar' | 'Related';
      mediaType: 'Image' | 'Video' | 'Article';
      description: string;
      source: string;
      imageUrl?: string;
    }[];
    socialAnalysis: SocialMediaHit[];
    supportingSources: SourceLink[];
  };
  journalistSummary: string;
  sources: {
    title: string;
    uri: string;
  }[];
}

export interface AnalysisState {
  isLoading: boolean;
  step: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const MOCK_REPORT: ForensicReport = {
  verdictColor: 'YELLOW',
  status: 'Analysis Pending',
  visualEvidence: { 
    originTrace: 'N/A', 
    visualMatch: 'N/A',
    similarImages: [],
    supportingSources: []
  },
  locationAnalysis: { 
    claimedVsActual: 'N/A', 
    clues: [],
    estimatedCoordinates: 'N/A',
    estimatedDate: 'N/A',
    supportingSources: []
  },
  aiCheck: { 
    verdict: 'Inconclusive', 
    forensicNote: 'Waiting for media input.',
    supportingSources: []
  },
  detailedSearch: {
    queries: [],
    relatedTopics: [],
    mediaMatches: [],
    socialAnalysis: [],
    supportingSources: []
  },
  journalistSummary: 'Upload an image or video to begin the forensic analysis.',
  sources: []
};
