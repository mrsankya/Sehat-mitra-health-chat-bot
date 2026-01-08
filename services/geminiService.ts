
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DiseaseInfo } from "../types";

// --- LOCAL DATA REPOSITORY (Offline Fallback) ---

export const OFFLINE_DISEASE_DB: Record<string, DiseaseInfo> = {
  "fever": {
    name: "Fever (Bukhaar)",
    description: "A temporary increase in your body temperature, often due to an illness.",
    symptoms: ["High body temperature", "Shivering", "Headache", "Muscle aches", "Loss of appetite"],
    prevention: ["Wash hands regularly", "Avoid touching face", "Stay away from sick people"],
    treatment: ["Drink plenty of fluids", "Rest", "Take paracetamol (consult doctor)", "Keep room cool"]
  },
  "malaria": {
    name: "Malaria",
    description: "A disease caused by a parasite, transmitted by the bite of infected mosquitoes.",
    symptoms: ["Chills", "High fever", "Sweating", "Headache", "Nausea/Vomiting"],
    prevention: ["Use mosquito nets", "Apply repellent", "Wear long sleeves", "Clear stagnant water"],
    treatment: ["Seek immediate medical attention", "Prescription antimalarial drugs", "Hydration"]
  },
  "dengue": {
    name: "Dengue",
    description: "A viral infection transmitted to humans through the bite of infected mosquitoes.",
    symptoms: ["Severe joint/muscle pain", "High fever", "Pain behind eyes", "Skin rash", "Nausea"],
    prevention: ["Prevent mosquito breeding", "Use nets/repellents", "Keep surroundings dry"],
    treatment: ["Supportive care", "Pain relievers (Avoid Aspirin/Ibuprofen)", "Intense hydration"]
  },
  "diabetes": {
    name: "Diabetes",
    description: "A chronic condition that affects how your body turns food into energy.",
    symptoms: ["Frequent urination", "Excessive thirst", "Blurred vision", "Slow-healing sores"],
    prevention: ["Maintain healthy weight", "Regular exercise", "Eat high-fiber foods", "Limit sugar"],
    treatment: ["Healthy diet", "Physical activity", "Insulin or medication", "Blood sugar monitoring"]
  },
  "dehydration": {
    name: "Dehydration",
    description: "Occurs when you use or lose more fluid than you take in.",
    symptoms: ["Extreme thirst", "Less frequent urination", "Dark-colored urine", "Dizziness"],
    prevention: ["Drink 8-10 glasses of water", "Eat water-rich fruits", "Drink more during heat/exercise"],
    treatment: ["ORS (Oral Rehydration Solution)", "Sip small amounts of water frequently", "Rest in shade"]
  }
};

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- API FUNCTIONS WITH FALLBACKS ---

export const checkSymptoms = async (symptoms: string) => {
  const ai = getAI();
  const prompt = `Provide a detailed medical analysis of: "${symptoms}". Format in Markdown. 
  Include a clear disclaimer. 
  ONLY if the user mentions needing deep analysis, photos, or medical reports, suggest: "Check the 'Smart Scan' feature in our Sehat Mitra app for a more accurate analysis of your reports or skin conditions."`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (error) {
    console.warn("Symptom check API failed, using local heuristic.");
    const normalized = symptoms.toLowerCase();
    for (const [key, data] of Object.entries(OFFLINE_DISEASE_DB)) {
      if (normalized.includes(key)) {
        return `**[OFFLINE MODE]** Based on your description of "${key}", here is some verified info:\n\n### ${data.name}\n${data.description}\n\n**Symptoms:** ${data.symptoms.join(', ')}\n\n**General Advice:** Please seek medical attention. If you have a physical report, check the 'Smart Scan' feature in our Sehat Mitra app for a detailed digital interpretation.`;
      }
    }
    return "I'm currently unable to reach the AI engine. Please check your internet connection. **In an emergency, visit a hospital immediately.**";
  }
};

export const getDiseaseInfo = async (diseaseName: string): Promise<DiseaseInfo> => {
    const ai = getAI();
    const prompt = `Explain "${diseaseName}" in great detail. Return JSON.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: {type: Type.STRING},
                    description: {type: Type.STRING},
                    symptoms: {type: Type.ARRAY, items: {type: Type.STRING}},
                    prevention: {type: Type.ARRAY, items: {type: Type.STRING}},
                    treatment: {type: Type.ARRAY, items: {type: Type.STRING}}
                }
            }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
        console.warn("Disease info API failed, checking local database.");
        const key = diseaseName.toLowerCase().trim();
        if (OFFLINE_DISEASE_DB[key]) return OFFLINE_DISEASE_DB[key];
        const match = Object.values(OFFLINE_DISEASE_DB).find(d => d.name.toLowerCase().includes(key));
        if (match) return match;
        throw new Error("Disease not found in local or remote database.");
    }
};

export const speakText = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { throw error; }
};

export async function decodePcmAudio(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeMedia = async (base64Data: string, mimeType: string, promptText: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: promptText }] }
    });
    return response.text;
  } catch (error) { throw error; }
};

export const generateVaccinationSchedule = async (childName: string, dob: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Vaccination schedule for ${childName} born ${dob}. Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ageGroup: { type: Type.STRING },
              vaccines: { type: Type.ARRAY, items: { type: Type.STRING } },
              dueDate: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["ageGroup", "vaccines", "dueDate", "notes"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) { return []; }
};

export const findHealthResources = async (query: string, location?: { lat: number, lng: number }) => {
  const ai = getAI();
  try {
    const config: any = { tools: [{ googleMaps: {} }] };
    if (location) config.toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find health resources: ${query}.`,
      config: config
    });
    return { text: response.text, groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  } catch (error) { return { text: "Location services currently unavailable offline.", groundingChunks: [] }; }
};

export const getHealthNews = async () => {
  const ai = getAI();
  try {
    const prompt = `Find 5 latest health news. Return raw JSON array of objects with title, summary, source, date, imageUrl.`;
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: prompt, 
      config: { tools: [{ googleSearch: {} }] } 
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let jsonString = response.text || '[]';
    // Fix typo in regex: change /```json/json/g to /```json/g to remove the invalid slash and variable references.
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return { items: JSON.parse(jsonString), groundingChunks };
  } catch (error) { return { items: [], groundingChunks: [] }; }
};

export const createChatSession = (systemInstruction?: string) => {
  const ai = getAI();
  const defaultInstruction = `You are Sehat Mitra, a compassionate health partner. 
  1. DETAILED EXPLANATIONS: When asked a health question, provide a detailed, clear, and informative answer first.
  2. SELECTIVE PROMOTION: Only promote a feature IF it is directly related to the user's problem.
  3. PROMOTION TRIGGERS:
     - IF question is about babies/kids/immunization: Add "Check the 'Vaccination Schedule' feature in our Sehat Mitra app for the recommended timings and a comprehensive prevention plan."
     - IF question is about severe pain or identifying symptoms: Add "Check the 'Symptom Checker' feature in our Sehat Mitra app for a more accurate analysis and personalized next steps."
     - IF question is about a specific report, skin issue, or photo analysis: Add "Check the 'Smart Scan' feature in our Sehat Mitra app for more accurate information based on your uploaded images or videos."
     - IF question is about finding a doctor or pharmacy: Add "Check the 'Find Resources' feature in our Sehat Mitra app for discovering verified medical facilities and pharmacies near you."
     - IF user asks for general medical facts or disease definitions: Add "Check the 'Knowledge Base' feature in our Sehat Mitra app for more accurate and detailed medical facts from our encyclopedia."
  4. NO PROMOTION: Do not promote features for greetings (Hi, Hello), general conversation, or unrelated questions.
  Always be detailed, accurate, and empathetic.`;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction || defaultInstruction,
    }
  });
};

export const getRawAI = getAI;
