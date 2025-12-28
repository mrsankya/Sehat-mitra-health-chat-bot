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
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// --- API FUNCTIONS WITH FALLBACKS ---

export const checkSymptoms = async (symptoms: string) => {
  const ai = getAI();
  const prompt = `Analyze: "${symptoms}". Format in Markdown. Include disclaimer.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  } catch (error) {
    console.warn("Symptom check API failed, using local heuristic.");
    // Heuristic: Check if user input matches any local disease
    const normalized = symptoms.toLowerCase();
    for (const [key, data] of Object.entries(OFFLINE_DISEASE_DB)) {
      if (normalized.includes(key)) {
        return `**[OFFLINE MODE]** Based on your description of "${key}", here is some verified info:\n\n### ${data.name}\n${data.description}\n\n**Symptoms:** ${data.symptoms.join(', ')}\n\n**General Advice:** Please seek medical attention. This is a pre-saved information guide.`;
      }
    }
    return "I'm currently unable to reach the AI engine, and couldn't find a direct match in my local health guides. Please check your internet connection or describe your symptoms differently (e.g., 'fever', 'chills'). **In an emergency, visit a hospital immediately.**";
  }
};

export const getDiseaseInfo = async (diseaseName: string): Promise<DiseaseInfo> => {
    const ai = getAI();
    const prompt = `Explain "${diseaseName}". Return JSON.`;
    
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
        
        // Search for partial match
        const match = Object.values(OFFLINE_DISEASE_DB).find(d => d.name.toLowerCase().includes(key));
        if (match) return match;

        throw new Error("Disease not found in local or remote database.");
    }
};

// ... keep other services as they were ...
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
      model: 'gemini-2.5-flash',
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
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let jsonString = response.text || '[]';
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return { items: JSON.parse(jsonString), groundingChunks };
  } catch (error) { return { items: [], groundingChunks: [] }; }
};

export const createChatSession = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are Sehat Mitra health assistant. Friendly, simple, empathetic. No diagnoses.`,
    }
  });
};

export const getRawAI = getAI;