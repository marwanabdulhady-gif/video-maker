import React, { useState } from 'react';
import { generateScript, generateNextScene } from '../services/geminiService';
import { useAppStore } from '../App';
import { GenerationStatus, Platform, VideoFormat, Tone } from '../types';
import { Loader2, PenTool, BookOpen, CheckCircle2, PlusCircle, AlertCircle, Film, Clock, MapPin } from 'lucide-react';

const Scripts = () => {
  const { characters, scripts, addScript, updateScript, language, t } = useAppStore();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
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
    if (!title || !premise) {
        setErrorMessage(language === 'ar' ? 'يرجى إدخال العنوان والفكرة' : 'Please enter a title and premise');
        return;
    }
    setErrorMessage('');
    setStatus('loading');
    
    const selectedChars = characters.filter(c => selectedCharIds.has(c.id));
    
    try {
      const script = await generateScript(title, premise, selectedChars, platform, format, tone, language);
      addScript(script);
      setStatus('success');
      setTitle('');
      setPremise('');
      setSelectedCharIds(new Set());
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorMessage(e.message || 'Generation failed');
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
      {/* Input Column - Floating Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-4">
          <h2 className="text-xl font-bold mb-6 flex items-center text-amber-500">
            <PenTool className="mx-2" size={20} /> {t('scriptWriter')}
          </h2>
          
          <div className="space-y-4">
            {errorMessage && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center text-red-400 text-sm">
                    <AlertCircle size={16} className="mx-2 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">{t('title')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                placeholder="..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">{t('platform')}</label>
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
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">{t('format')}</label>
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
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">{t('tone')}</label>
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
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">{t('premise')}</label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none transition-all"
                placeholder={t('premisePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">{t('cast')}</label>
              <div className="max-h-48 overflow-y-auto space-y-2 px-1 custom-scrollbar">
                {characters.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic p-2 border border-dashed border-zinc-800 rounded">{t('noChars')}</p>
                ) : (
                  characters.map(char => (
                    <div 
                      key={char.id}
                      onClick={() => toggleChar(char.id)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer border transition-all ${selectedCharIds.has(char.id) ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border mx-3 flex items-center justify-center transition-colors ${selectedCharIds.has(char.id) ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`}>
                         {selectedCharIds.has(char.id) && <CheckCircle2 size={10} className="text-zinc-900" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${selectedCharIds.has(char.id) ? 'text-amber-400' : 'text-zinc-300'}`}>{char.name}</p>
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
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg transition-all transform active:scale-95 flex items-center justify-center shadow-lg hover:shadow-amber-500/20"
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

      {/* Output Column - Timeline View */}
      <div className="lg:col-span-8 space-y-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center">
            <BookOpen className="mx-2 text-amber-500" /> {t('scriptLibrary')}
        </h2>
        
        {scripts.length === 0 ? (
           <div className="border-2 border-dashed border-zinc-800/50 rounded-2xl p-16 text-center text-zinc-600 bg-zinc-900/20">
             <Film size={64} className="mx-auto mb-4 opacity-30" />
             <p className="text-lg font-medium">{t('noScripts')}</p>
             <p className="text-sm mt-2">Use the writer to create your first script.</p>
           </div>
        ) : (
          <div className="space-y-12">
            {scripts.map((script) => (
              <div key={script.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Script Header */}
                <div className="p-8 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 to-zinc-900">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-amber-500 tracking-tight">{script.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">{script.genre}</span>
                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">{script.platform}</span>
                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 uppercase">{script.format}</span>
                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-500 uppercase italic">{script.tone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <p className="text-zinc-300 italic text-sm leading-relaxed">"{script.logline}"</p>
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="p-8 bg-zinc-950/30 relative">
                   {/* Vertical Timeline Line */}
                   <div className="absolute ltr:left-[43px] rtl:right-[43px] top-8 bottom-8 w-0.5 bg-zinc-800"></div>

                  <div className="space-y-8 relative">
                    {script.scenes.map((scene, idx) => (
                      <div key={scene.id} className="relative ltr:pl-16 rtl:pr-16">
                        {/* Timeline Node */}
                        <div className="absolute ltr:left-0 rtl:right-0 top-0 w-24 flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                <span className="text-xs font-bold text-amber-500">{scene.sceneNumber}</span>
                            </div>
                        </div>

                        {/* Scene Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
                            {/* Scene Header */}
                            <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
                                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                                    <div className="flex items-center text-zinc-300 font-bold">
                                        <MapPin size={14} className="mx-1 text-zinc-500" />
                                        {scene.location}
                                    </div>
                                    <div className="flex items-center text-zinc-500">
                                        <Clock size={14} className="mx-1" />
                                        {scene.time}
                                    </div>
                                </div>
                            </div>

                            {/* Scene Description */}
                            <div className="mb-5 text-sm text-zinc-400 bg-black/20 p-3 rounded-lg border border-zinc-800/50 font-medium">
                                {scene.description}
                            </div>
                            
                            {/* Dialogue */}
                            <div className="space-y-3">
                                {scene.dialogue.map((line, dIdx) => (
                                <div key={dIdx} className="flex gap-3 text-sm group/line">
                                    <div className="font-bold text-amber-500/80 min-w-[80px] text-right rtl:text-left text-xs uppercase pt-0.5">
                                        {line.speaker}
                                    </div>
                                    <div className="flex-1 text-zinc-300">
                                        {line.text}
                                        {line.emotion && <span className="text-zinc-600 text-xs italic ml-2">({line.emotion})</span>}
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Scene Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-center z-20 relative">
                    <button 
                        onClick={() => handleAddScene(script.id)}
                        disabled={addingSceneStatus[script.id] === 'loading'}
                        className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-500 font-bold text-sm transition-all border border-zinc-700 hover:border-amber-500/50"
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
