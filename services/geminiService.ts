
import { GoogleGenAI, Type } from "@google/genai";
import { EscapeRoomData, Puzzle } from "../types";

export const generateHistoryEscapeRoom = async (topic: string, requestedCount: number = 7): Promise<EscapeRoomData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';

  const prompt = `
    המשימה שלך: לייצר חדר בריחה היסטורי מותח ומסתורי עבור תלמידת בגרות בנושא: "${topic}".
    
    דגשים לתוכן:
    1. כל שאלה חייבת לתאר סצנה דרמטית (נרטיבית) שמעבירה חומר לבגרות.
    2. השתמש בנרטיב של סוכנת זמן שמחלצת מידע גנוז מהארכיונים האפלים ביותר.

    מבנה טכני:
    - ייצר בדיוק ${requestedCount} חידות.
    - סוגים: MULTIPLE_CHOICE, CODE_ENTRY, ORDERING, MATCHING.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            narrative: { type: Type.STRING },
            puzzles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  clue: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  correctCode: { type: Type.STRING },
                  itemsToOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctSequence: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      }
                    }
                  },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "description", "question", "explanation"]
              }
            }
          },
          required: ["topic", "narrative", "puzzles"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      topic: data.topic || topic,
      narrative: data.narrative || "ההיסטוריה בסכנה, עלייך לשחזר את הנתונים.",
      puzzles: data.puzzles,
      totalRooms: data.puzzles.length,
      sources: []
    };
  } catch (err: any) {
    throw err;
  }
};
