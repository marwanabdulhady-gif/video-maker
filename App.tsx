import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Character, Script, Language, ProjectData } from './types';
import Dashboard from './components/Dashboard';
import Characters from './components/Characters';
import Scripts from './components/Scripts';
import Storyboard from './components/Storyboard';

// Translation Dictionary
const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    characters: "الشخصيات",
    scripts: "السيناريوهات",
    storyboard: "القصة المصورة",
    welcome: "مرحباً بك، أيها المخرج",
    ready: "جاهز لإبداع تحفتك الفنية القادمة؟",
    charsCreated: "الشخصيات المنشأة",
    scriptsWritten: "السيناريوهات المكتوبة",
    newProject: "مشروع جديد",
    startCreating: "ابدأ الإبداع",
    recentChars: "أحدث الشخصيات",
    recentScripts: "أحدث السيناريوهات",
    noChars: "لا توجد شخصيات بعد.",
    noScripts: "لا توجد سيناريوهات بعد.",
    createOne: "أنشئ واحدة الآن",
    writeOne: "اكتب واحداً الآن",
    createCharTitle: "إنشاء شخصية",
    genre: "النوع / البيئة",
    genrePlaceholder: "مثال: دراما تاريخية، خيال علمي...",
    archetype: "النمط الأصلي (اختياري)",
    archetypePlaceholder: "مثال: محقق، بطل خارق...",
    generateProfile: "توليد الملف التعريفي",
    generating: "جاري التوليد...",
    charRoster: "قائمة الشخصيات",
    visualize: "تخيل بصري",
    scriptWriter: "كاتب السيناريو",
    title: "العنوان",
    premise: "الفكرة / الحبكة",
    premisePlaceholder: "مثال: محقق يكتشف مدينة سرية...",
    cast: "طاقم التمثيل (اختياري)",
    generateScript: "توليد السيناريو",
    scriptLibrary: "مكتبة السيناريوهات",
    platform: "المنصة",
    format: "التنسيق",
    videoReel: "ريلز / فيديو قصير",
    videoShort: "شورت",
    videoLong: "فيديو طويل",
    storyboardGallery: "معرض القصة المصورة",
    storyboardDesc: "حول سيناريوهاتك إلى فن بصري",
    generateConcept: "توليد المشهد",
    download: "تحميل",
    poweredBy: "مدعوم بواسطة Gemini 3.0",
    tone: "نبرة الصوت",
    toneFunny: "مضحك / كوميدي",
    toneSerious: "جدي / رسمي",
    toneEducational: "تعليمي / معلوماتي",
    toneDramatic: "درامي / عاطفي",
    toneInspirational: "ملهم / تحفيزي",
    toneCasual: "عفوي / فلوق",
    gender: "الجنس",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    genderNonBinary: "غير ثنائي",
    genderRobot: "روبوت / آلي",
    genderMonster: "وحش / مخلوق",
    style: "النمط البصري",
    styleRealistic: "واقعي / سينمائي",
    styleAnime: "أنمي",
    style3D: "ثلاثي الأبعاد (Pixar)",
    styleCyberpunk: "سايبربانك",
    styleOil: "رسم زيتي",
    stylePixel: "بيكسل آرت",
    addScene: "إضافة مشهد جديد",
    addingScene: "جاري إضافة المشهد...",
    exportProject: "تصدير المشروع (JSON)",
    importProject: "استيراد مشروع",
    projectLoaded: "تم تحميل المشروع بنجاح!",
    importError: "خطأ في قراءة ملف المشروع. تأكد من صحة الملف.",
  },
  en: {
    dashboard: "Dashboard",
    characters: "Characters",
    scripts: "Scripts",
    storyboard: "Storyboard",
    welcome: "Welcome Back, Director",
    ready: "Ready to create your next masterpiece?",
    charsCreated: "Characters Created",
    scriptsWritten: "Scripts Written",
    newProject: "New Project",
    startCreating: "Start Creating",
    recentChars: "Recent Characters",
    recentScripts: "Recent Scripts",
    noChars: "No characters yet.",
    noScripts: "No scripts yet.",
    createOne: "Create one now",
    writeOne: "Write one now",
    createCharTitle: "Create Character",
    genre: "Genre / Setting",
    genrePlaceholder: "e.g. Cyberpunk Noir, High Fantasy...",
    archetype: "Archetype (Optional)",
    archetypePlaceholder: "e.g. Grumpy Detective, Elven Rogue...",
    generateProfile: "Generate Profile",
    generating: "Generating...",
    charRoster: "Character Roster",
    visualize: "Visualize",
    scriptWriter: "Script Writer",
    title: "Title",
    premise: "Premise / Plot",
    premisePlaceholder: "A detective discovers a hidden city...",
    cast: "Cast Characters (Optional)",
    generateScript: "Generate Script",
    scriptLibrary: "Scripts Library",
    platform: "Platform",
    format: "Format",
    videoReel: "Reel / Short",
    videoShort: "Short",
    videoLong: "Long Video",
    storyboardGallery: "Storyboard Gallery",
    storyboardDesc: "Visualize your scenes with AI-generated concept art.",
    generateConcept: "Generate Concept",
    download: "Download",
    poweredBy: "Powered by Gemini 3.0",
    tone: "Tone",
    toneFunny: "Funny / Comedic",
    toneSerious: "Serious / Formal",
    toneEducational: "Educational / Informative",
    toneDramatic: "Dramatic / Emotional",
    toneInspirational: "Inspirational / Motivational",
    toneCasual: "Casual / Vlog Style",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderNonBinary: "Non-Binary",
    genderRobot: "Robot / Android",
    genderMonster: "Monster / Creature",
    style: "Visual Style",
    styleRealistic: "Realistic / Cinematic",
    styleAnime: "Anime",
    style3D: "3D Render (Pixar)",
    styleCyberpunk: "Cyberpunk",
    styleOil: "Oil Painting",
    stylePixel: "Pixel Art",
    addScene: "Add New Scene",
    addingScene: "Adding Scene...",
    exportProject: "Export Project (JSON)",
    importProject: "Import Project",
    projectLoaded: "Project loaded successfully!",
    importError: "Error reading project file. Please check the file.",
  }
};

interface AppContextType {
  characters: Character[];
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  scripts: Script[];
  addScript: (script: Script) => void;
  updateScript: (id: string, updates: Partial<Script>) => void;
  loadProject: (data: ProjectData) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppContext");
  return context;
};

const App = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [language, setLanguage] = useState<Language>('ar'); // Default to Arabic

  const addCharacter = (char: Character) => setCharacters(prev => [char, ...prev]);
  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addScript = (script: Script) => setScripts(prev => [script, ...prev]);
  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const loadProject = (data: ProjectData) => {
    if (data.characters) setCharacters(data.characters);
    if (data.scripts) setScripts(data.scripts);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Toggle font class
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-arabic');
    }
  }, [language]);

  return (
    <AppContext.Provider value={{ characters, addCharacter, updateCharacter, scripts, addScript, updateScript, loadProject, language, setLanguage, t }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/storyboard" element={<Storyboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;