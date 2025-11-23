
import { GoogleGenAI, Modality } from "@google/genai";
import { sanitizeInput } from "./securityUtils";

// Initialize Gemini Client
// Expects process.env.API_KEY to be available
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AnnouncerStyle = 'epic' | 'professional' | 'real';
export type AnnouncerGender = 'male' | 'female';

/**
 * Step 1: Rewrite the user input based on the selected style.
 */
export const rewriteTextForEvent = async (userInput: string, style: AnnouncerStyle): Promise<string> => {
  const ai = getAiClient();
  
  // SECURITY: Sanitize input before processing
  const cleanInput = sanitizeInput(userInput);

  // REAL MODE: Return text exactly as is, skipping AI rewrite
  if (style === 'real') {
    return cleanInput;
  }
  
  let systemInstruction = "";

  if (style === 'epic') {
    systemInstruction = `
      Actúa como el locutor principal ("Voice of God") de un evento masivo de categoría mundial (como una final de boxeo en Las Vegas, los Oscars, o un concierto de estadio).
      
      Tu tarea:
      1. Reescribe el texto para que suene ÉPICO, DRAMÁTICO y EXAGERADO.
      2. Usa un lenguaje que genere expectativa (Hype).
      3. El texto debe ser corto pero impactante (máximo 2-3 frases potentes).
      4. El resultado debe estar en ESPAÑOL.
      5. NO incluyas guiones de diálogo tipo "Locutor:", solo dame el texto listo para leer.
    `;
  } else {
    // Professional
    systemInstruction = `
      Actúa como un presentador profesional, sobrio y elegante (estilo noticias serias, evento corporativo de alto nivel o documental).
      
      Tu tarea:
      1. Toma el texto del usuario y púlelo LIGERAMENTE para que fluya bien al hablarse (oralidad).
      2. MANTÉN EL SIGNIFICADO EXACTO. No agregues exageraciones ni drama.
      3. Sé claro, conciso y respetuoso.
      4. El resultado debe estar en ESPAÑOL.
      5. Solo dame el texto listo para leer.
    `;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: cleanInput,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return response.text || cleanInput;
};

/**
 * Step 2: Convert the rewritten text to speech using the appropriate voice.
 */
export const generateAnnouncerAudio = async (text: string, style: AnnouncerStyle, gender: AnnouncerGender): Promise<string | null> => {
  const ai = getAiClient();
  // Validating text again here is good practice, though rewriting usually handles it.
  const cleanText = sanitizeInput(text);

  // Voice Selection Logic
  let voiceName = 'Puck'; // Default

  if (gender === 'male') {
    // Fenrir: Deep, intense, movie trailer style.
    // Puck: Clear, mid-range, standard male announcer.
    voiceName = style === 'epic' ? 'Fenrir' : 'Puck';
  } else {
    // Kore: Sharp, energetic (Good for Epic/Impact)
    // Zephyr: Calm, smooth, professional (Good for Pro)
    voiceName = style === 'epic' ? 'Kore' : 'Zephyr';
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};