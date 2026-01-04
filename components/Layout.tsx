import React from 'react';
import { NavLink } from 'react-router-dom';
import { Film, Users, FileText, Image as ImageIcon, Clapperboard, Globe } from 'lucide-react';
import { useAppStore } from '../App';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-amber-500/10 text-amber-400 border-r-4 rtl:border-r-0 rtl:border-l-4 border-amber-400'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { language, setLanguage, t } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r rtl:border-r-0 rtl:border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-6 flex items-center space-x-2 rtl:space-x-reverse">
          <Clapperboard className="text-amber-500" size={28} />
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">DirectorAI</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-6">
          <NavItem to="/" icon={Film} label={t('dashboard')} />
          <NavItem to="/characters" icon={Users} label={t('characters')} />
          <NavItem to="/scripts" icon={FileText} label={t('scripts')} />
          <NavItem to="/storyboard" icon={ImageIcon} label={t('storyboard')} />
        </nav>

        <div className="p-4 mx-3 mb-2">
            <button 
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-sm"
            >
                <Globe size={16} />
                <span>{language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}</span>
            </button>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">{t('poweredBy')}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
