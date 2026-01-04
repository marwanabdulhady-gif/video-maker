import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { useAppStore } from '../App';
import { ScriptScene } from '../types';
import { Loader2, Image as ImageIcon, Download } from 'lucide-react';

const Storyboard = () => {
  const { scripts, updateScript, t } = useAppStore();
  const [loadingSceneId, setLoadingSceneId] = useState<string | null>(null);

  const handleGenerateSceneImage = async (scriptId: string, scene: ScriptScene) => {
    setLoadingSceneId(scene.id);
    try {
      const prompt = `Cinematic storyboard shot, ${scene.location}, ${scene.time}. ${scene.visualPrompt}. 4k, atmospheric lighting, movie concept art style.`;
      const imageUrl = await generateImage(prompt);
      
      const script = scripts.find(s => s.id === scriptId);
      if (script) {
        const updatedScenes = script.scenes.map(s => s.id === scene.id ? { ...s, storyboardUrl: imageUrl } : s);
        updateScript(scriptId, { scenes: updatedScenes });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Try again.");
    } finally {
      setLoadingSceneId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">{t('storyboardGallery')}</h1>
        <p className="text-zinc-400">{t('storyboardDesc')}</p>
      </header>

      {scripts.length === 0 ? (
         <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
           <p>{t('noScripts')}</p>
         </div>
      ) : (
        <div className="space-y-12">
          {scripts.map(script => (
            <div key={script.id} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-amber-500 mb-6 border-b border-zinc-800 pb-2">{script.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {script.scenes.map(scene => (
                  <div key={scene.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-600 transition-colors">
                    {/* Image Area */}
                    <div className="aspect-video bg-zinc-900 relative">
                      {scene.storyboardUrl ? (
                        <>
                          <img src={scene.storyboardUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={scene.storyboardUrl} download={`scene-${scene.sceneNumber}.png`} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors">
                              <Download size={20} />
                            </a>
                            <button 
                                onClick={() => handleGenerateSceneImage(script.id, scene)}
                                className="mx-2 p-2 bg-amber-600 rounded-full hover:bg-amber-500 text-white transition-colors"
                                title="Regenerate"
                            >
                                <Loader2 size={20} className={loadingSceneId === scene.id ? "animate-spin" : ""} />
                            </button>
                          </div>
                        </>
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                           <ImageIcon className="text-zinc-700 mb-2" size={32} />
                           <p className="text-xs text-zinc-600 mb-4">No image</p>
                           <button
                             onClick={() => handleGenerateSceneImage(script.id, scene)}
                             disabled={loadingSceneId === scene.id}
                             className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors flex items-center"
                           >
                             {loadingSceneId === scene.id ? (
                               <><Loader2 className="animate-spin mx-2" size={12} />...</>
                             ) : (
                               t('generateConcept')
                             )}
                           </button>
                         </div>
                      )}
                    </div>
                    
                    {/* Info Area */}
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-amber-500 uppercase">{t('generateConcept').split(' ')[1] || 'Scene'} {scene.sceneNumber}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{scene.location}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-3" title={scene.visualPrompt}>
                        {scene.visualPrompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Storyboard;
