
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, QuizQuestion, StudySegment, MaterialData } from "../types";

// Always use process.env.API_KEY directly as per requirements.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUPPORTED_BINARY_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
];

const getModelParts = (material: MaterialData, prompt: string) => {
  const parts: any[] = [];
  if (SUPPORTED_BINARY_MIMES.includes(material.mimeType)) {
    parts.push({
      inlineData: {
        data: material.data.includes(',') ? material.data.split(',')[1] : material.data,
        mimeType: material.mimeType
      }
    });
    parts.push({ text: prompt });
  } else if (material.mimeType.startsWith('text/') || material.mimeType === 'application/json') {
    parts.push({ text: `STUDY MATERIAL CONTENT:\n${material.data}\n\nINSTRUCTION: ${prompt}` });
  } else {
    throw new Error(`The file type "${material.mimeType}" is not directly supported. Please convert to PDF.`);
  }
  return parts;
};

export const analyzeMaterial = async (material: MaterialData): Promise<StudyPlan> => {
  const ai = getAIClient();
  const prompt = `You are an expert academic planner. Analyze the material and create a personalized study plan for ONE UNIT.
    
    STRICT CONSTRAINTS:
    1. A single "Unit" must NOT exceed 270 minutes (4.5 hours) in total across all its segments. This is a HARD LIMIT.
    2. ALLOCATION: Assign time based on 'importance' (1-10). Topics with importance 9-10 should get significantly more time (40-50 mins) than low importance topics (15-20 mins).
    3. If the total material content requires more than 270 minutes, you MUST only plan the most important parts for this Unit.
    4. Each segment must have an estimatedDuration (15-50 mins).
    5. Ensure the response is strictly valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: getModelParts(material, prompt) }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topic: { type: Type.STRING },
                unit: { type: Type.STRING },
                importance: { type: Type.NUMBER },
                estimatedDuration: { type: Type.NUMBER },
                description: { type: Type.STRING },
              },
              required: ["id", "topic", "unit", "importance", "estimatedDuration", "description"]
            }
          }
        },
        required: ["segments"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as StudyPlan;
  } catch (e) {
    throw new Error("Failed to generate plan. AI response was malformed.");
  }
};

export const generateQuiz = async (topic: string, material: MaterialData, count: number = 6): Promise<QuizQuestion[]> => {
  const ai = getAIClient();
  const prompt = `Generate ${count} active recall questions for: "${topic}". 
    Questions 1-2: Easy, 3-4: Medium, 5-6: Hard.
    Format: JSON Array of QuizQuestion objects with 3 options and correctIndex.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: getModelParts(material, prompt) }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 3, maxItems: 3 },
            correctIndex: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
          },
          required: ["id", "question", "options", "correctIndex", "difficulty"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text) as QuizQuestion[];
  } catch (e) {
    return [];
  }
};

export const adjustPlan = async (plan: StudyPlan, currentIdx: number, score: number): Promise<StudyPlan> => {
  if (score < 50) {
    const current = plan.segments[currentIdx];
    const newSegments = [...plan.segments];
    const reviewSegment: StudySegment = {
      ...current,
      id: `${current.id}-review-${Date.now()}`,
      topic: `RE-MASTER: ${current.topic}`,
      estimatedDuration: Math.min(25, current.estimatedDuration),
      description: "Low sync score detected. Focus on core concepts missed in previous recall session.",
      status: 'pending'
    };
    newSegments.splice(currentIdx + 1, 0, reviewSegment);
    return { segments: newSegments };
  }
  return plan;
};
