export type Language = 'ar' | 'en';
export type VideoFormat = 'long' | 'short' | 'reel';
export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';
export type Tone = 'funny' | 'serious' | 'educational' | 'dramatic' | 'inspirational' | 'casual';

export interface Character {
  id: string;
  name: string;
  role: string;
  age: number;
  gender: string;
  visualStyle: string;
  personality: string;
  backstory: string;
  appearance: string; // The text prompt for image generation
  avatarUrl?: string; // The generated image URL
}

export interface ScriptDialogue {
  speaker: string;
  text: string;
  emotion?: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  location: string;
  time: string; // INT/EXT - DAY/NIGHT
  description: string;
  visualPrompt: string; // Prompt for generating the storyboard image
  dialogue: ScriptDialogue[];
  storyboardUrl?: string; // Generated image for the scene
}

export interface Script {
  id: string;
  title: string;
  genre: string;
  logline: string;
  platform: Platform;
  format: VideoFormat;
  tone: Tone;
  language: Language;
  scenes: ScriptScene[];
  characters: string[]; // Names or IDs of characters used
}

export interface ProjectData {
  characters: Character[];
  scripts: Script[];
  timestamp: number;
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';