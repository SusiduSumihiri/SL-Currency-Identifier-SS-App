import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is available in the environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Identifies Sri Lankan currency from a base64 encoded image.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @returns A string with the identified currency or a special keyword.
 */
export const identifyCurrency = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert currency identifier for visually impaired users, specializing in Sri Lankan Rupees. Your response must be concise and clear for text-to-speech conversion. Analyze the image and follow these rules strictly:
1. If the image shows a Sri Lankan currency note or the value side of a coin, respond with ONLY the denomination and type (e.g., '500 Rupee note', '10 Rupee coin').
2. If the image shows the side of a Sri Lankan coin with the national emblem, you must respond with the exact keyword: FLIP_COIN.
3. If the image is not Sri Lankan currency or is unrecognizable, respond with the exact keyword: UNRECOGNIZABLE.`;
    const prompt = "Identify the Sri Lankan currency in this image.";

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: prompt,
    };
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
        config: {
            systemInstruction: systemInstruction,
        }
    });

    const resultText = response.text.trim();

    if (!resultText) {
        // Return UNRECOGNIZABLE if the response is empty, to be handled by the frontend.
        return 'UNRECOGNIZABLE';
    }
    
    return resultText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to identify currency due to an API error.");
  }
};
