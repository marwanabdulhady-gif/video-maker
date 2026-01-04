import React, { useState } from 'react';
import { generateCharacterProfile, generateImage } from '../services/geminiService';
import { useAppStore } from '../App';
import { GenerationStatus } from '../types';
import { Loader2, Plus, Wand2, User } from 'lucide-react';

const Characters = () => {
  const { characters, addCharacter, updateCharacter, language, t } = useAppStore();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [imgStatus, setImgStatus] = useState<Record<string, GenerationStatus>>({});
  
  // Form State
  const [genre, setGenre] = useState('');
  const [archetype, setArchetype] = useState('');
  const [gender, setGender] = useState('Male');
  const [style, setStyle] = useState('Realistic');

  const handleGenerate = async () => {
    if (!genre) return;
    setStatus('loading');
    try {
      const char = await generateCharacterProfile(genre, archetype, gender, style, language);
      addCharacter(char);
      setStatus('success');
      // Reset form
      setGenre('');
      setArchetype('');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleGenerateImage = async (charId: string, appearance: string) => {
    setImgStatus(prev => ({ ...prev, [charId]: 'loading' }));
    try {
      const imageUrl = await generateImage(`Hyper-realistic cinematic portrait, ${appearance}, 8k resolution, detailed lighting`);
      updateCharacter(charId, { avatarUrl: imageUrl });
      setImgStatus(prev => ({ ...prev, [charId]: 'success' }));
    } catch (e) {
      console.error(e);
      setImgStatus(prev => ({ ...prev, [charId]: 'error' }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Creation Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-8">
          <h2 className="text-xl font-bold mb-4 flex items-center text-amber-500">
            <Wand2 className="mx-2" size={20} /> {t('createCharTitle')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t('genre')}</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder={t('genrePlaceholder')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t('archetype')}</label>
              <input
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder={t('archetypePlaceholder')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">{t('gender')}</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Male">{t('genderMale')}</option>
                  <option value="Female">{t('genderFemale')}</option>
                  <option value="Non-Binary">{t('genderNonBinary')}</option>
                  <option value="Robot">{t('genderRobot')}</option>
                  <option value="Monster">{t('genderMonster')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">{t('style')}</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Realistic">{t('styleRealistic')}</option>
                  <option value="Anime">{t('styleAnime')}</option>
                  <option value="3D Render">{t('style3D')}</option>
                  <option value="Cyberpunk">{t('styleCyberpunk')}</option>
                  <option value="Oil Painting">{t('styleOil')}</option>
                  <option value="Pixel Art">{t('stylePixel')}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === 'loading' || !genre}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center"
            >
              {status === 'loading' ? (
                <><Loader2 className="animate-spin mx-2" size={18} /> {t('generating')}</>
              ) : (
                <><Plus className="mx-2" size={18} /> {t('generateProfile')}</>
              )}
            </button>
            
            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">Failed. Check API Key.</p>
            )}
          </div>
        </div>
      </div>

      {/* List Panel */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-zinc-100">{t('charRoster')}</h2>
        
        {characters.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t('noChars')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all group">
                {/* Header Image Area */}
                <div className="h-48 bg-zinc-950 relative border-b border-zinc-800">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                      <p className="text-sm mb-2">No visualization yet</p>
                      <button 
                        onClick={() => handleGenerateImage(char.id, char.appearance)}
                        disabled={imgStatus[char.id] === 'loading'}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center transition-colors"
                      >
                         {imgStatus[char.id] === 'loading' ? <Loader2 className="animate-spin mx-2" size={14}/> : <Wand2 className="mx-2" size={14} />}
                         {t('visualize')}
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-900 to-transparent">
                    <h3 className="text-xl font-bold text-white shadow-sm">{char.name}</h3>
                    <div className="flex space-x-2 rtl:space-x-reverse text-xs text-amber-400 font-bold uppercase tracking-wider">
                       <span>{char.role}</span>
                       <span>•</span>
                       <span>{char.age}</span>
                       <span>•</span>
                       <span className="text-zinc-400">{char.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full uppercase">{char.visualStyle}</span>
                  </div>
                  <div>
                    <h4 className="text-xs text-zinc-500 uppercase font-bold mb-1">Personality</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{char.personality}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-zinc-500 uppercase font-bold mb-1">Backstory</h4>
                    <p className="text-sm text-zinc-400 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">{char.backstory}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;
