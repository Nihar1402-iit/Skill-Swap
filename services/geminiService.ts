
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

export const getFairTradeSuggestion = async (userA: UserProfile, userB: UserProfile): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Find intersection of skills
  const overlapA = userA.teachSkills.filter(s => userB.wantSkills.includes(s));
  const overlapB = userB.teachSkills.filter(s => userA.wantSkills.includes(s));

  const prompt = `
    You are a "Fair Trade Expert" for SkillSwap, a local neighborhood exchange app.
    
    Context:
    Neighbor A (${userA.name}) teaches: ${userA.teachSkills.join(', ')} and wants to learn: ${userA.wantSkills.join(', ')}.
    Neighbor B (${userB.name}) teaches: ${userB.teachSkills.join(', ')} and wants to learn: ${userB.wantSkills.join(', ')}.
    
    The most logical trade is: 
    Neighbor A teaches ${overlapA.join(' or ')} to Neighbor B.
    Neighbor B teaches ${overlapB.join(' or ')} to Neighbor A.
    
    Task:
    Provide a concise, friendly, and practical "Fair Trade Suggestion" for these two. 
    Include session duration (e.g., "1 hour of Yoga for 45 mins of Spanish practice"), 
    frequency, and one fun local meeting idea. 
    Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Could not generate a suggestion at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating suggestion. Try proposing a simple 1-for-1 hour trade!";
  }
};
