import { GoogleGenAI } from '@google/genai';

// API Key मिळवणे
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// AI Instance तयार करणे
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function askGeminiCropDoctor(promptText: string): Promise<string> {
  if (!apiKey) {
    return '⚠️ एरर: Gemini API Key सापडली नाही. कृपया .env फाईल तपासा.';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    return response.text || 'काहीतरी अडचण आली, पुन्हा प्रयत्न करा.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return `⚠️ API एरर: ${error?.message || 'Gemini सर्व्हर कनेक्ट होत नाही.'}`;
  }
}