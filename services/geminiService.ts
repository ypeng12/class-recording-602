
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

/**
 * Formats the transcript into a direct knowledge flow.
 * Focuses on immediate conclusions and continuous writing rather than heavy grouping.
 */
export const formatNotes = async (transcript: string): Promise<{ formattedNotes: string; summary: string; title: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are a high-speed Data Science knowledge scribe. 
    Transform this transcript into a direct, continuous stream of knowledge.
    
    CRITICAL INSTRUCTIONS:
    1. DIRECT WRITING: Do not over-summarize or categorize into heavy hierarchies. Write the concepts directly as they are explained.
    2. CONCLUSIONS: If a point leads to a result or conclusion, state it clearly and immediately.
    3. LANGUAGE: Use a mix of English (technical terms) and Chinese (explanations) as in the lecture.
    4. FORMATTING: Use # for the main title and ## for new sections. Use standard paragraphs and simple bullet points for clarity.
    5. NO SYMBOLS: Still use **Bold** for key terms and *Italics* for nuance, but the UI will handle rendering.
    
    Transcript: ${transcript}
    
    Return as JSON: {"title": "...", "formattedNotes": "...", "summary": "..."}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          formattedNotes: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: ["title", "formattedNotes", "summary"],
      },
    },
  });

  return JSON.parse(response.text);
};

/**
 * Live incremental formatter that writes out content as it comes.
 */
export const incrementalFormat = async (transcript: string): Promise<string> => {
  if (!transcript || transcript.trim().length < 5) return "";
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Task: DIRECT KNOWLEDGE STREAM.
    Write out the knowledge points from this transcript directly. 
    Avoid heavy grouping. Focus on clear, direct sentences and conclusions.
    Use English for Data Science terms, Chinese for context.
    
    Transcript: ${transcript}
    
    Response format: Raw Markdown only.`,
    config: {
      temperature: 0.1,
    },
  });

  return response.text || "";
};

export const createLiveSession = async (
  onTranscription: (text: string) => void,
  onInterrupted: () => void
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => console.log("Direct Stream Open"),
      onmessage: async (message) => {
        if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          if (text) onTranscription(text);
        }
        if (message.serverContent?.interrupted) {
          onInterrupted();
        }
      },
      onerror: (e) => console.error("Mic Error:", e),
      onclose: () => console.log("Stream Closed"),
    },
    config: {
      responseModalities: ['AUDIO'],
      inputAudioTranscription: {},
      systemInstruction: "You are a verbatim Data Science recorder. Transcribe exactly what is said. Capture every detail in English and Chinese.",
    },
  });

  return sessionPromise;
};
