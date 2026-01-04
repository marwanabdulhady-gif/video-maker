import React, { useState } from 'react';
import { generateScript, generateNextScene } from '../services/geminiService';
import { useAppStore } from '../App';
import { GenerationStatus, Platform, VideoFormat, Tone } from '../types';
import { Loader2, PenTool, BookOpen, CheckCircle2, PlusCircle } from 'lucide-react';

const Scripts = () => {
  const { characters, scripts, addScript, updateScript, language, t } = useAppStore();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [addingSceneStatus, setAddingSceneStatus] = useState<Record<string, GenerationStatus>>({});
  const [selectedCharIds, setSelectedCharIds] = useState<Set<string>>(new Set());
  
  // Form State
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [format, setFormat] = useState<VideoFormat>('long');
  const [tone, setTone] = useState<Tone>('casual');

  const toggleChar = (id: string) => {
    const next = new Set(selectedCharIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCharIds(next);
  };

  const handleGenerate = async () => {
    if (!title || !premise) return;
    setStatus('loading');
    
    // Get full character objects
    const selectedChars = characters.filter(c => selectedCharIds.has(c.id));
    
    try {
      const script = await generateScript(title, premise, selectedChars, platform, format, tone, language);
      addScript(script);
      setStatus('success');
      setTitle('');
      setPremise('');
      setSelectedCharIds(new Set());
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleAddScene = async (scriptId: string) => {
    setAddingSceneStatus(prev => ({ ...prev, [scriptId]: 'loading' }));
    
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    try {
      const newScene = await generateNextScene(script, language);
      const updatedScript = { ...script, scenes: [...script.scenes, newScene] };
      updateScript(scriptId, updatedScript);
      setAddingSceneStatus(prev => ({ ...prev, [scriptId]: 'success' }));
    } catch (e) {
      console.error(e);
      setAddingSceneStatus(prev => ({ ...prev, [scriptId]: 'error' }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Input Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center text-amber-500">
            <PenTool className="mx-2" size={20} /> {t('scriptWriter')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t('title')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">{t('platform')}</label>
                <select 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">{t('format')}</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value as VideoFormat)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="long">{t('videoLong')}</option>
                  <option value="short">{t('videoShort')}</option>
                  <option value="reel">{t('videoReel')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t('tone')}</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="casual">{t('toneCasual')}</option>
                <option value="funny">{t('toneFunny')}</option>
                <option value="serious">{t('toneSerious')}</option>
                <option value="educational">{t('toneEducational')}</option>
                <option value="dramatic">{t('toneDramatic')}</option>
                <option value="inspirational">{t('toneInspirational')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t('premise')}</label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                placeholder={t('premisePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">{t('cast')}</label>
              <div className="max-h-48 overflow-y-auto space-y-2 px-1 custom-scrollbar">
                {characters.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic">{t('noChars')}</p>
                ) : (
                  characters.map(char => (
                    <div 
                      key={char.id}
                      onClick={() => toggleChar(char.id)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer border transition-colors ${selectedCharIds.has(char.id) ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border mx-3 flex items-center justify-center ${selectedCharIds.has(char.id) ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`}>
                         {selectedCharIds.has(char.id) && <CheckCircle2 size={10} className="text-zinc-900" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${selectedCharIds.has(char.id) ? 'text-amber-400' : 'text-zinc-300'}`}>{char.name}</p>
                        <p className="text-[10px] text-zinc-500">{char.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === 'loading' || !title || !premise}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center"
            >
              {status === 'loading' ? (
                <><Loader2 className="animate-spin mx-2" size={18} /> {t('generating')}</>
              ) : (
                <><PenTool className="mx-2" size={18} /> {t('generateScript')}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-8 space-y-6">
        <h2 className="text-2xl font-bold text-zinc-100">{t('scriptLibrary')}</h2>
        
        {scripts.length === 0 ? (
           <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
             <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
             <p>{t('noScripts')}</p>
           </div>
        ) : (
          <div className="space-y-8">
            {scripts.map((script) => (
              <div key={script.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-amber-500">{script.title}</h3>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                         <span className="text-sm text-zinc-400">{script.genre}</span>
                         <span className="text-zinc-600">•</span>
                         <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-500 uppercase font-bold">{script.platform}</span>
                         <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">{script.format}</span>
                         <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase italic">{script.tone}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-zinc-300 italic text-sm">"{script.logline}"</p>
                </div>

                <div className="p-6 space-y-8">
                  {script.scenes.map((scene) => (
                    <div key={scene.id} className="relative ltr:pl-6 rtl:pr-6 ltr:border-l-2 rtl:border-r-2 border-zinc-800 hover:border-amber-500/50 transition-colors">
                      <div className="absolute ltr:-left-[9px] rtl:-right-[9px] top-0 w-4 h-4 rounded-full bg-zinc-800 border-2 border-zinc-900"></div>
                      
                      <div className="flex items-baseline space-x-3 rtl:space-x-reverse mb-2">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{t('generateConcept').split(' ')[1] || 'Scene'} {scene.sceneNumber}</span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">{scene.location} • {scene.time}</span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 mb-4 font-mono bg-zinc-950/50 p-3 rounded border border-zinc-800/50">
                        <span className="text-zinc-600 block text-[10px] mb-1 uppercase">Action</span>
                        {scene.description}
                      </p>

                      <div className="space-y-3 ltr:pl-4 rtl:pr-4">
                        {scene.dialogue.map((line, idx) => (
                          <div key={idx} className="text-sm">
                             <span className="block font-bold text-zinc-300 uppercase text-xs mb-0.5">{line.speaker} <span className="text-zinc-600 font-normal normal-case italic">{line.emotion && `(${line.emotion})`}</span></span>
                             <span className="text-zinc-100">{line.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Scene Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/30 flex justify-center">
                    <button 
                        onClick={() => handleAddScene(script.id)}
                        disabled={addingSceneStatus[script.id] === 'loading'}
                        className="flex items-center space-x-2 rtl:space-x-reverse text-amber-500 hover:text-amber-400 font-bold text-sm transition-colors"
                    >
                         {addingSceneStatus[script.id] === 'loading' ? (
                             <><Loader2 className="animate-spin" size={16} /> <span>{t('addingScene')}</span></>
                         ) : (
                             <><PlusCircle size={16} /> <span>{t('addScene')}</span></>
                         )}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scripts;
