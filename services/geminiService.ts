import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Symptom Checker
export const checkSymptoms = async (symptoms: string) => {
  const prompt = `
    Analyze the following symptoms: "${symptoms}".
    Provide a list of potential conditions, a brief explanation for each, and general advice.
    
    CRITICAL: You MUST begin and end your response with a strong disclaimer that this is NOT a medical diagnosis and the user should consult a doctor.
    Format the output in clear Markdown.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temperature for more consistent/safe answers
      }
    });
    return response.text;
  } catch (error) {
    console.error("Symptom check error:", error);
    throw error;
  }
};

// Vaccination Schedule Generator
export const generateVaccinationSchedule = async (childName: string, dob: string) => {
  const prompt = `Generate a vaccination schedule for a child named ${childName} born on ${dob} based on standard immunization guidelines (like WHO or Indian IAP). Return ONLY a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ageGroup: { type: Type.STRING, description: "Age at which vaccine is given (e.g., 'Birth', '6 Weeks')" },
              vaccines: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of vaccines to be administered"
              },
              dueDate: { type: Type.STRING, description: "Approximate date based on DOB" },
              notes: { type: Type.STRING, description: "Any special instructions or remarks" }
            },
            required: ["ageGroup", "vaccines", "dueDate", "notes"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Vaccination schedule error:", error);
    throw error;
  }
};

// Health Resources (Maps Grounding)
export const findHealthResources = async (query: string, location?: { lat: number, lng: number }) => {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng
                }
            }
        };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find health resources: ${query}. List them with details.`,
      config: config
    });
    
    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return {
      text: response.text,
      groundingChunks
    };
  } catch (error) {
    console.error("Resources search error:", error);
    throw error;
  }
};

// Health News (Search Grounding)
export const getHealthNews = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Find the latest important health news and medical updates from reputable sources. Summarize 5 key stories in markdown format with clear headings. Focus on positive or critical updates relevant to general public health.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return {
      text: response.text,
      groundingChunks
    };
  } catch (error) {
    console.error("Health news error:", error);
    throw error;
  }
};

// Chat Session
export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are Sehat Mitra, a compassionate and friendly AI health assistant. 
      Your goal is to help users in rural and underserved communities.
      Start conversations with a warm greeting in Hindi or English (Namaste!).
      Use simple, easy-to-understand language. 
      Always be empathetic.
      NEVER provide a definitive medical diagnosis. Always advise seeing a doctor for serious issues.
      If asked about your identity, say you are Sehat Mitra.`,
    }
  });
};

// Knowledge Base
export const getDiseaseInfo = async (diseaseName: string) => {
    const prompt = `Explain the disease "${diseaseName}" for a student or general user. Include description, symptoms, prevention, and treatment. Return JSON.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
        console.error("Disease info error", error);
        throw error;
    }
}