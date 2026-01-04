import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../App';

const StatCard = ({ label, value, icon: Icon, to }: { label: string; value: string | number; icon: any; to: string }) => {
    const { language } = useAppStore();
    const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
    
    return (
    <Link to={to} className="block group">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-zinc-950 text-amber-500 border border-zinc-800 group-hover:bg-amber-500/10 transition-colors">
            <Icon size={24} />
            </div>
            <ArrowIcon className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
        </div>
        <h3 className="text-3xl font-bold text-zinc-100 mb-1">{value}</h3>
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        </div>
    </Link>
    );
};

const Dashboard = () => {
  const { characters, scripts, t, language } = useAppStore();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-100 mb-2">{t('welcome')}</h1>
        <p className="text-zinc-400">{t('ready')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t('charsCreated')} value={characters.length} icon={Users} to="/characters" />
        <StatCard label={t('scriptsWritten')} value={scripts.length} icon={FileText} to="/scripts" />
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="p-3 inline-block rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('newProject')}</h3>
              <p className="text-white/80 text-sm">{t('ready')}</p>
            </div>
            <Link to="/characters" className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wider hover:text-zinc-900 transition-colors">
              {t('startCreating')} <ArrowIcon size={16} className="mx-2" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center">
            <Users size={20} className="mx-2 text-amber-500" /> {t('recentChars')}
          </h2>
          {characters.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <p>{t('noChars')}</p>
              <Link to="/characters" className="text-amber-500 hover:underline text-sm mt-2 block">{t('createOne')}</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {characters.slice(0, 3).map((char) => (
                <div key={char.id} className="flex items-center p-3 rounded-lg hover:bg-zinc-800 transition-colors">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs border border-zinc-700">
                      IMG
                    </div>
                  )}
                  <div className="mx-4">
                    <h4 className="font-medium text-zinc-200">{char.name}</h4>
                    <p className="text-xs text-zinc-500">{char.role} • {char.age}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center">
            <FileText size={20} className="mx-2 text-amber-500" /> {t('recentScripts')}
          </h2>
          {scripts.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <p>{t('noScripts')}</p>
              <Link to="/scripts" className="text-amber-500 hover:underline text-sm mt-2 block">{t('writeOne')}</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {scripts.slice(0, 3).map((script) => (
                <div key={script.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                   <h4 className="font-bold text-zinc-200">{script.title}</h4>
                   <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{script.logline}</p>
                   <div className="mt-3 flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 uppercase">{script.platform}</span>
                      <span className="text-[10px] text-zinc-600 uppercase">{script.format}</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
