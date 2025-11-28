import { GoogleGenAI, Type } from "@google/genai";
import { ActionCard, ChallengeType, MoodAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateDailyActions = async (
  mood: string,
  timeOfDay: string
): Promise<ActionCard[]> => {
  if (!apiKey) {
    console.warn("No API Key found, returning mock data");
    return [];
  }

  try {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are VitalCue, an AI health assistant. Generate 3 short, immediate health micro-actions for a user.
    The user's current context: Mood is ${mood}, Time is ${timeOfDay}.
    Actions must be feasible to do RIGHT NOW in under 5 minutes.
    Types must be one of: MATH, BREATHING, SIMPLE_CONFIRM.`;

    const response = await ai.models.generateContent({
      model,
      contents: "Generate 3 health actions.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              type: { type: Type.STRING, enum: [ChallengeType.MATH, ChallengeType.BREATHING, ChallengeType.SIMPLE_CONFIRM] },
              scoreImpact: { type: Type.INTEGER }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map response to ActionCard interface
    return data.map((item: any) => ({
      id: generateId(),
      title: item.title,
      description: item.description,
      duration: item.duration,
      type: item.type as ChallengeType,
      completed: false,
      scoreImpact: item.scoreImpact
    }));

  } catch (error) {
    console.error("Gemini Action Generation Error:", error);
    return [];
  }
};

export const analyzeMoodFromText = async (text: string): Promise<MoodAnalysis> => {
  if (!apiKey) return { label: "Neutral", score: 50, advice: "API Key missing." };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this user statement for mood and stress: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "One word mood: Happy, Stressed, Tired, Energetic, Sad" },
            score: { type: Type.INTEGER, description: "Health score impact 0-100" },
            advice: { type: Type.STRING, description: "One short sentence of advice." }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}") as MoodAnalysis;
  } catch (error) {
    console.error("Gemini Mood Analysis Error:", error);
    return { label: "Unknown", score: 50, advice: "Could not analyze mood." };
  }
};

export const getCrisisGrounding = async (): Promise<string> => {
    if (!apiKey) return "Breathe in deeply. Hold. Exhale slowly. Look for 5 blue objects.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Provide a short, 2-sentence grounding technique for someone having a panic attack.",
        });
        return response.text || "Focus on your breathing.";
    } catch (e) {
        return "Focus on your breathing.";
    }
}
