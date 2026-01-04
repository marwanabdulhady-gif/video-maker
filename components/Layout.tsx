import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Film, Users, FileText, Image as ImageIcon, Clapperboard, Globe, Download, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../App';
import { ProjectData } from '../types';

const NavItem = ({ to, icon: Icon, label, step }: { to: string; icon: any; label: string; step: number }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center group px-4 py-2 rounded-full transition-all duration-300 border ${
        isActive
          ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
      }`
    }
  >
    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 rtl:mr-0 rtl:ml-3 ${
        (window.location.hash.includes(to) || (to === '/' && window.location.hash === '#/')) // simplistic active check for styling
         ? 'bg-amber-500 text-zinc-950' 
         : 'bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700'
    }`}>
      {step}
    </div>
    <span className="font-bold tracking-wide text-sm">{label}</span>
  </NavLink>
);

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { language, setLanguage, t, characters, scripts, loadProject } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ArrowIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleExport = () => {
    const data: ProjectData = {
      characters,
      scripts,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `director-ai-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && (json.characters || json.scripts)) {
            loadProject(json);
            alert(t('projectLoaded'));
        } else {
            throw new Error("Invalid project file");
        }
      } catch (err) {
        console.error(err);
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      {/* Top Timeline Navigation */}
      <header className="h-20 flex-shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-[200px]">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
               <Clapperboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight hidden md:block">DirectorAI</h1>
          </div>

          {/* Timeline Steps */}
          <nav className="flex-1 flex items-center justify-center space-x-4 rtl:space-x-reverse overflow-x-auto no-scrollbar py-2">
            <NavItem to="/" icon={Film} label={t('dashboard')} step={0} />
            <ArrowIcon className="text-zinc-800 hidden md:block" size={16} />
            <NavItem to="/characters" icon={Users} label={t('characters')} step={1} />
            <ArrowIcon className="text-zinc-800 hidden md:block" size={16} />
            <NavItem to="/scripts" icon={FileText} label={t('scripts')} step={2} />
            <ArrowIcon className="text-zinc-800 hidden md:block" size={16} />
            <NavItem to="/storyboard" icon={ImageIcon} label={t('storyboard')} step={3} />
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-[200px] justify-end">
            <button
                onClick={handleExport}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors border border-zinc-800"
                title={t('exportProject')}
            >
                <Download size={18} />
            </button>
            <button
                onClick={handleImportClick}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors border border-zinc-800"
                title={t('importProject')}
            >
                <Upload size={18} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
            />
            
            <div className="h-6 w-px bg-zinc-800 mx-2"></div>

            <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors text-xs font-bold border border-zinc-800"
            >
                <Globe size={14} />
                <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
        <div className="max-w-7xl mx-auto p-6 md:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
