import { GoogleGenAI, Type } from "@google/genai";
import { Character, Script, Language, Platform, VideoFormat, Tone, ScriptScene } from "../types";

// Helper to get client
const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing");
  }
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
  
  let characterContext = "No specific characters provided. Create original characters suitable for the plot.";
  if (characters.length > 0) {
    characterContext = characters.map(c => `- ${c.name} (${c.role}, ${c.gender}): ${c.personality}`).join('\n');
  }

  const langInstruction = language === 'ar' 
    ? "Write the script dialogue and descriptions in ARABIC." 
    : "Write the script in ENGLISH.";

  const formatInstruction = format === 'reel' || format === 'short'
    ? "Format: Vertical Short/Reel (Under 60s). Fast-paced, visual hooks."
    : "Format: Long Video (YouTube). Narrative structure.";

  const platformContexts = {
    youtube: "Optimize for YouTube (Retention, Intro, Outro).",
    tiktok: "Optimize for TikTok (Trends, Fast cuts).",
    instagram: "Optimize for Instagram Reels (Aesthetic, Engaging).",
    twitter: "Optimize for X/Twitter (Concise, Punchy).",
    linkedin: "Optimize for LinkedIn (Professional, Value-driven)."
  };

  const toneContexts = {
    funny: "Tone: Funny, Humorous, Comedic.",
    serious: "Tone: Serious, Formal, Grave.",
    educational: "Tone: Educational, Informative.",
    dramatic: "Tone: Dramatic, Emotional, Intense.",
    inspirational: "Tone: Inspirational, Motivational.",
    casual: "Tone: Casual, Conversational, Vlog-style."
  };

  const systemInstruction = `You are an expert screenwriter. 
  ${langInstruction}
  ${formatInstruction}
  ${platformContexts[platform]}
  ${toneContexts[tone]}
  
  Generate a video script JSON with a title, logline, and a list of scenes.
  For each scene, provide a 'visualPrompt' in ENGLISH.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Title: "${title}"
    Premise: ${premise}
    
    Characters:
    ${characterContext}
    `,
    config: {
      systemInstruction: systemInstruction,
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
              },
              required: ["sceneNumber", "location", "time", "description", "visualPrompt", "dialogue"]
            }
          }
        },
        required: ["title", "genre", "logline", "scenes"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response text from AI");

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("AI returned invalid JSON");
  }
  
  // Add IDs to scenes
  if (data.scenes && Array.isArray(data.scenes)) {
    data.scenes = data.scenes.map((s: any) => ({ ...s, id: crypto.randomUUID() }));
  } else {
    data.scenes = [];
  }

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
  const nextSceneNum = (lastScene?.sceneNumber || 0) + 1;

  const langInstruction = language === 'ar' 
    ? "Write in ARABIC." 
    : "Write in ENGLISH.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Continue this script with Scene ${nextSceneNum}.
    Title: ${script.title}
    Genre: ${script.genre}
    Tone: ${script.tone}
    Logline: ${script.logline}
    
    Previous Scene: ${lastScene?.description || 'Start of story'}
    
    Instruction: ${langInstruction}
    Maintain strict continuity. Provide valid JSON.`,
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
    sceneNumber: nextSceneNum
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
