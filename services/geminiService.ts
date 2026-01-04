import { GoogleGenAI, Type } from "@google/genai";
import { Character, Script, Language, Platform, VideoFormat, Tone, ScriptScene } from "../types";

// Helper to get client
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCharacterProfile = async (
  genre: string,
  archetype: string,
  gender: string,
  style: string,
  language: Language
): Promise<Character> => {
  const ai = getClient();
  
  const langInstruction = language === 'ar' 
    ? "OUTPUT MUST BE IN ARABIC LANGUAGE." 
    : "OUTPUT MUST BE IN ENGLISH LANGUAGE.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a detailed character profile for a ${genre} story. 
    Archetype/Role: ${archetype || "Main Protagonist"}.
    Gender: ${gender}.
    Visual Style: ${style}.
    ${langInstruction}
    Include a highly descriptive 'appearance' field IN ENGLISH that describes the character in the style of ${style}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          age: { type: Type.INTEGER },
          personality: { type: Type.STRING },
          backstory: { type: Type.STRING },
          appearance: { type: Type.STRING, description: `A detailed visual description suitable for image generation in ${style} style (ALWAYS IN ENGLISH)` },
        },
        required: ["name", "role", "age", "personality", "backstory", "appearance"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response text");
  
  const data = JSON.parse(text);
  return {
    id: crypto.randomUUID(),
    gender,
    visualStyle: style,
    ...data,
  };
};

export const generateScript = async (
  title: string,
  premise: string,
  characters: Character[],
  platform: Platform,
  format: VideoFormat,
  tone: Tone,
  language: Language
): Promise<Script> => {
  const ai = getClient();
  const characterContext = characters.map(c => `${c.name} (${c.role}): ${c.personality}`).join('\n');

  const langInstruction = language === 'ar' 
    ? "Write the script dialogue and descriptions in ARABIC." 
    : "Write the script in ENGLISH.";

  const formatInstruction = format === 'reel' || format === 'short'
    ? "This is a Short/Reel format. Keep it fast-paced, highly engaging within first 3 seconds, vertical video optimized. Total duration under 60 seconds. Focus on visual hooks."
    : "This is a Long form video. Focus on depth, storytelling structure, and pacing suitable for longer viewing (Youtube/LinkedIn).";

  const platformContexts = {
    youtube: "Optimize for viewer retention, clear intro, and call to action (subscribe).",
    tiktok: "Fast-paced, use trending styles if applicable, very casual and high energy.",
    instagram: "Aesthetic, engaging, suitable for Reels audience.",
    twitter: "Concise, punchy, thought-provoking.",
    linkedin: "Professional, value-driven, insightful, industry-focused."
  };

  const toneContexts = {
    funny: "Use humor, jokes, and comedic timing. Keep it lighthearted.",
    serious: "Maintain a serious, formal, or grave tone. No jokes.",
    educational: "Informative, clear, explanatory, and teaching-oriented.",
    dramatic: "High stakes, emotional, intense, focus on conflict.",
    inspirational: "Uplifting, motivating, powerful and moving.",
    casual: "Conversational, vlog-style, relatable and authentic."
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a script for a video titled "${title}".
    Premise: ${premise}
    
    CONFIGURATION:
    Language: ${langInstruction}
    Format: ${formatInstruction}
    Platform: ${platformContexts[platform]}
    Tone: ${toneContexts[tone]}
    
    Characters available:
    ${characterContext}
    
    Generate scenes. For each scene, include a 'visualPrompt' (IN ENGLISH) that describes the visual composition.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          genre: { type: Type.STRING },
          logline: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                location: { type: Type.STRING },
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                visualPrompt: { type: Type.STRING, description: "Visual prompt for image generator (ALWAYS ENGLISH)" },
                dialogue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      speaker: { type: Type.STRING },
                      text: { type: Type.STRING },
                      emotion: { type: Type.STRING },
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response text");

  const data = JSON.parse(text);
  
  // Add IDs to scenes
  data.scenes = data.scenes.map((s: any) => ({ ...s, id: crypto.randomUUID() }));

  return {
    id: crypto.randomUUID(),
    characters: characters.map(c => c.name),
    platform,
    format,
    tone,
    language,
    ...data,
  };
};

export const generateNextScene = async (
  script: Script,
  language: Language
): Promise<ScriptScene> => {
  const ai = getClient();
  const lastScene = script.scenes[script.scenes.length - 1];
  const nextSceneNum = script.scenes.length + 1;

  const langInstruction = language === 'ar' 
    ? "Write the script dialogue and descriptions in ARABIC." 
    : "Write the script in ENGLISH.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Continue the following script by generating the next scene (Scene ${nextSceneNum}).
    
    Context:
    Title: ${script.title}
    Genre: ${script.genre}
    Tone: ${script.tone}
    Logline: ${script.logline}
    
    Previous Scene Summary:
    ${lastScene.location} - ${lastScene.description}
    
    Instructions:
    ${langInstruction}
    Maintain the continuity of the story.
    Include a visual prompt in English.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.INTEGER },
          location: { type: Type.STRING },
          time: { type: Type.STRING },
          description: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          dialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                emotion: { type: Type.STRING },
              }
            }
          }
        },
        required: ["sceneNumber", "location", "time", "description", "visualPrompt", "dialogue"],
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response text");
  
  const data = JSON.parse(text);
  return {
    ...data,
    id: crypto.randomUUID(),
    sceneNumber: nextSceneNum // Ensure correct number
  };
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {}
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};
