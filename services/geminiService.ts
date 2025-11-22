
import { GoogleGenAI, Content, Part } from "@google/genai";
import { ForensicReport } from "../types";

export const analyzeMedia = async (
  fileBase64: string,
  mimeType: string,
  userClaim: string
): Promise<ForensicReport> => {
  
  // Initialize client inside the function to ensure we use the latest API_KEY from the environment/selection flow
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-preview'; 

  const systemInstruction = `
    You are "FactTrace," an elite digital forensics engine.
    Your mission is to verify media authenticity by performing a "Google Lens" style visual analysis and a deep "Google Search" for news and social context.

    LANGUAGE OPERATING SYSTEM (BILINGUAL CORE):
    * **Primary Languages:** Bengali (Bangla) & English.
    * **Auto-Detection:** Instantly identify the language of the USER CLAIM or text content within the media.
    * **Response Rule:** 
       - If the user asks/inputs in **English**, the report text values MUST be in **English**.
       - If the user asks/inputs in **Bangla**, the report text values MUST be in **Bangla**.
       - **Exception:** Keep JSON Keys (e.g., "visualEvidence", "geospatialHistory") and Enum values (e.g., "RED", "GREEN", "YELLOW", "Exact Match", "Image") in ENGLISH. Only translate the human-readable descriptions, summaries, and status.
    * **Cross-Language Analysis:** If a rumor is found in English databases (e.g., Snopes) but the user asks in Bangla, you must *translate and contextualize* the findings into Bangla.

    USER CLAIM (Context): "${userClaim || "No specific claim provided. Analyze for authenticity."}"

    OPERATIONAL PROTOCOL:
    1. **VISUAL CROSS-REFERENCING (Google Lens Simulation):**
       - Use the 'googleSearch' tool to find *exact* visual matches of the uploaded media.
       - Identify if this specific image/video has appeared before (Reverse Image Search logic).
       - Look for the *original* source (high-res, uncropped).
       - Identify visually similar images or earlier versions and their sources.

    2. **NEWS & FACT-CHECK SEARCH:**
       - Search for recent news articles that feature this specific image/video.
       - Verify if reputable news organizations have already debunked or verified this content.

    3. **SOCIAL MEDIA RECON:**
       - Specifically search for this media on X (Twitter), Facebook, Instagram, YouTube, TikTok, and Reddit.
       - Identify the earliest instance or "Patient Zero" post.

    4. **GEOSPATIAL & AI ANALYSIS:**
       - Verify location claims against visual evidence (maps, street view data).
       - Detect synthetic patterns (AI generation artifacts).

    5. **GEOSPATIAL HISTORY CHECK:**
       - **Core Task:** Verify location claim by comparing "Present Reality" vs. "Historical Data".
       - **Action:** Identify coordinates/landmarks. Compare current satellite/street view data against historical knowledge or archives.
       - **Look for:** New buildings, demolished structures, changes in road layout, or tree growth.
       - **Logic:** If the user claims video is from "Today", but the video shows a building demolished 2 years ago, the claim is FALSE.
       - **Output:** Provide a comparative analysis in the 'geospatialHistory' JSON field.

    OUTPUT FORMAT:
    You MUST return ONLY the raw JSON object. No markdown blocks (\`\`\`), no preambles.
    
    CRITICAL - URL HANDLING:
    * **DO NOT HALLUCINATE URLS.** 
    * Use ONLY URLs that are provided by the 'googleSearch' tool output.
    * If you cannot find a specific direct link for a section (like 'similarImages'), **you MUST provide a Google Search Query URL** instead (e.g., "https://www.google.com/search?q=description+of+image").
    * Broken links destroy trust. Better to link to a Google Search result than a 404 page.

    JSON STRUCTURE:
    {
      "verdictColor": "RED" | "YELLOW" | "GREEN",
      "status": "Short status in Target Language (e.g., 'Fake News Detected' or 'মিথ্যা তথ্য শনাক্ত')",
      "visualEvidence": {
        "originTrace": "First known appearance date/platform (in Target Language)",
        "visualMatch": "Is this a known viral image? (Yes/No + Context in Target Language)",
        "similarImages": [
          {
            "url": "Source Page URL OR Google Search Query URL (MUST BE VALID)",
            "description": "Brief description of the similar image (in Target Language)",
            "source": "Source website name (e.g., Pinterest, News Site)"
          }
        ],
        "supportingSources": [ { "title": "Source Title", "url": "URL" } ]
      },
      "locationAnalysis": {
        "claimedVsActual": "Does it match the claimed location? (in Target Language)",
        "clues": ["Landmarks", "Weather", "Street Signs" (in Target Language)],
        "estimatedCoordinates": "Lat/Long or Specific Area",
        "estimatedDate": "Est. Date (in Target Language)",
        "geospatialHistory": {
          "currentView": "Description of present reality (e.g., 2024/2025 state) (in Target Language)",
          "currentUrl": "Link to Google Maps or current image if available",
          "historicalView": "Description of historical state (e.g., 1-5 years ago) (in Target Language)",
          "historicalUrl": "Link to archive if available",
          "analysis": "Comparative analysis of differences (in Target Language)",
          "verdict": "Location Verified / Location Mismatch (in Target Language)"
        },
        "supportingSources": [ { "title": "Map/News Source", "url": "URL" } ]
      },
      "aiCheck": {
        "verdict": "Real" | "AI-Generated" | "Edited" | "Inconclusive" (Keep English Enum),
        "forensicNote": "Technical analysis of pixels/frames (in Target Language)",
        "supportingSources": [ { "title": "Tool/Reference", "url": "URL" } ]
      },
      "detailedSearch": {
        "queries": ["Exact Google Search queries used"],
        "relatedTopics": ["News Topics", "Events" (in Target Language)],
        "mediaMatches": [
           { 
             "type": "Exact Match" | "Similar" | "Related" (Keep English Enum),
             "mediaType": "Image" | "Video" | "Article" (Keep English Enum),
             "description": "Headline or description of the finding (in Target Language)",
             "source": "News Outlet or Website Name",
             "imageUrl": "Direct URL to thumbnail if available"
           }
        ],
        "socialAnalysis": [
          {
            "platform": "Facebook" | "X" | "Instagram" | "YouTube" | "TikTok" | "Reddit" | "Other" (Keep English Enum),
            "url": "Direct Link to Post OR Google Search Query URL",
            "author": "User/Channel Name",
            "date": "Post Date",
            "contentSnippet": "What they said (in Target Language)",
            "imageUrl": "Post thumbnail URL (if found)"
          }
        ],
        "supportingSources": [ { "title": "Fact Check/News Link", "url": "URL" } ]
      },
      "journalistSummary": "Synthesized conclusion based on search results (in Target Language)."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: fileBase64 } },
          { text: "Perform a deep visual search (Lens style) and news analysis. Return forensic JSON. Detect Language: English or Bengali." }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }, 
        tools: [
          { googleSearch: {} }
        ],
      }
    });

    let text = response.text;
    if (!text) throw new Error("No analysis generated.");

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      text = text.replace(/```json\n?|\n?```/g, "").trim();
    }

    let parsedReport: ForensicReport;
    try {
      parsedReport = JSON.parse(text) as ForensicReport;
    } catch (e) {
      // Detailed error logging for debugging model output issues
      console.error("JSON Parse Error Details:", e);
      console.error("Raw Model Output causing failure:", text);
      
      // User-friendly error message
      throw new Error("Data Format Error: The forensic engine returned an unreadable report structure. This occasionally happens with complex queries. Please try analyzing the media again.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web?.title || "Verified Source Link",
        uri: c.web?.uri || "#"
      }));

    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values());

    return {
      ...parsedReport,
      sources: uniqueSources as { title: string; uri: string }[]
    };

  } catch (error: any) {
    console.error("FactTrace Analysis Failed:", error);
    if (error.message && (error.message.includes('403') || error.message.includes('PERMISSION_DENIED'))) {
       throw new Error("PERMISSION_DENIED");
    }
    throw error;
  }
};

export const startForensicChat = (
  fileBase64: string,
  mimeType: string,
  initialReport: ForensicReport
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-preview';

  const history: Content[] = [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType: mimeType, data: fileBase64 } },
        { text: "Analyze this media and provide a forensic report." }
      ]
    },
    {
      role: 'model',
      parts: [
        { text: JSON.stringify(initialReport) }
      ]
    }
  ];

  const chat = ai.chats.create({
    model: modelId,
    history: history,
    config: {
      systemInstruction: `You are "FactTrace," an expert digital forensics assistant. 
      
      LANGUAGE OPERATING SYSTEM (BILINGUAL CORE):
      - **Primary Languages:** Bengali (Bangla) & English.
      - **Rule:** Respond in the SAME language as the user's last message.
      - **Cross-Language:** If you find evidence in English but the user asks in Bangla, translate the essence to Bangla.

      Your goal is to answer FOLLOW-UP questions about the forensic report.
      - If the user asks for "more articles", use the 'googleSearch' tool to find them.
      - If the user asks about a specific visual detail, use your vision capabilities.
      - Provide direct links where possible.`,
      tools: [{ googleSearch: {} }]
    }
  });

  return chat;
};
