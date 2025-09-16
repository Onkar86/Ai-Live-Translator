
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const prompt = `You are an expert translator. Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translated text, without any additional explanations, introductions, or formatting.

    Text to translate: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text. Please check the console for details.");
  }
}
