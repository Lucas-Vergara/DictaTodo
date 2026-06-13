'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Plus, Trash2, Check, Keyboard, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSaveTasks: (taskTexts: string[]) => void;
  splitKeyword: string;
}

export default function VoiceRecorder({ onSaveTasks, splitKeyword }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  // Pre-save modal state
  const [showPreSaveModal, setShowPreSaveModal] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<string[]>([]);
  const [newParsedTask, setNewParsedTask] = useState('');
  
  // Manual text input mode
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualText, setManualText] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const startRecording = () => {
    setErrorMsg(null);
    setTranscript('');
    setInterimTranscript('');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Tu navegador no es compatible con el dictado por voz.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Acceso al micrófono denegado. Activa los permisos en tu navegador.');
        } else {
          setErrorMsg(`Error de dictado: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        // Process final transcript when recording stops
        processTranscript();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + ' ' + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setErrorMsg('Ocurrió un error al iniciar el micrófono.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processTranscript = () => {
    // Collect the full text
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) return;

    parseTextToTasks(fullText);
  };

  const parseTextToTasks = (text: string) => {
    // Split by the keyword (case insensitive, trimmed spacing)
    // Escaping regex characters in splitKeyword just in case
    const escapedKeyword = splitKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\s+${escapedKeyword}\\s+|^${escapedKeyword}\\s+|\\s+${escapedKeyword}$`, 'gi');
    
    // We also support commas or newlines as secondary delimiters if they are typed/spoken
    const items = text
      .split(regex)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => {
        // Capitalize first letter
        return item.charAt(0).toUpperCase() + item.slice(1);
      });

    if (items.length > 0) {
      setParsedTasks(items);
      setShowPreSaveModal(true);
    } else {
      setErrorMsg('No pudimos extraer ninguna tarea del dictado.');
    }
  };

  // Manual input submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    parseTextToTasks(manualText);
  };

  // Pre-save modal list edits
  const handleEditParsedTask = (index: number, text: string) => {
    const updated = [...parsedTasks];
    updated[index] = text;
    setParsedTasks(updated);
  };

  const handleDeleteParsedTask = (index: number) => {
    const updated = parsedTasks.filter((_, i) => i !== index);
    setParsedTasks(updated);
  };

  const handleAddParsedTask = () => {
    const text = newParsedTask.trim();
    if (!text) return;
    setParsedTasks(prev => [...prev, text.charAt(0).toUpperCase() + text.slice(1)]);
    setNewParsedTask('');
  };

  const handleSaveAndCommit = () => {
    // Filter out empty items
    const finalItems = parsedTasks.map(t => t.trim()).filter(t => t.length > 0);
    if (finalItems.length > 0) {
      onSaveTasks(finalItems);
      // Clean states
      setTranscript('');
      setInterimTranscript('');
      setManualText('');
      setShowPreSaveModal(false);
      setIsManualMode(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
      {/* Tips and Instructions */}
      <div className="w-full glass p-4 border border-white/5 flex gap-3 items-start">
        <Volume2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-slate-200">¿Cómo dictar tus tareas?</span>
          <p className="text-xs text-slate-400">
            Di tus tareas una detrás de otra separadas por la palabra <strong className="text-purple-300">&quot;{splitKeyword}&quot;</strong>.
          </p>
          <p className="text-[11px] text-slate-500 italic mt-1">
            Ejemplo: &quot;Hacer ejercicio {splitKeyword} comprar tomates {splitKeyword} llamar al electricista&quot;
          </p>
        </div>
      </div>

      {/* Main Action Card */}
      <div className="w-full glass p-6 border border-white/5 flex flex-col items-center gap-6 relative min-h-[220px] justify-center">
        {errorMsg && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isManualMode ? (
          /* VOICE MODE */
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Pulsing visual orbs when recording */}
            {isRecording && (
              <div className="flex gap-1 items-center justify-center h-8 mb-2">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
            )}

            <button
              onClick={toggleRecording}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? 'bg-gradient-to-tr from-red-600 to-pink-500 text-white pulse-record shadow-[0_0_25px_rgba(239,68,68,0.5)] scale-105'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              }`}
              type="button"
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <div className="text-center flex flex-col gap-1 mt-2">
              <span className="text-sm font-bold tracking-wide text-slate-200">
                {isRecording ? 'Escuchando tu dictado...' : 'Toca el micrófono para dictar'}
              </span>
              <span className="text-xs text-slate-400">
                {isRecording ? 'Toca de nuevo para terminar' : isSupported ? 'Usa tu voz en español' : 'Dictado no compatible'}
              </span>
            </div>

            {/* Realtime transcript preview box */}
            {(transcript || interimTranscript) && (
              <div className="w-full p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-left max-h-[120px] overflow-y-auto">
                <span className="text-slate-200">{transcript}</span>
                <span className="text-purple-400 italic">{interimTranscript}</span>
              </div>
            )}
          </div>
        ) : (
          /* MANUAL FALLBACK MODE */
          <form onSubmit={handleManualSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escribe tu lista de tareas</label>
              <textarea
                className="w-full glass-input min-h-[100px] text-sm resize-none"
                placeholder={`Escribe tus tareas separadas por "${splitKeyword}". Ejemplo: Tarea 1 ${splitKeyword} Tarea 2`}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!manualText.trim()}
              className="glass-button glass-button-primary w-full py-2.5 font-bold"
            >
              Procesar tareas
            </button>
          </form>
        )}

        {/* Toggle Mode Button */}
        <button
          onClick={() => {
            setIsManualMode(!isManualMode);
            setErrorMsg(null);
            setTranscript('');
            setInterimTranscript('');
          }}
          className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors border-t border-white/5 pt-3 w-full justify-center"
        >
          {isManualMode ? (
            <>
              <Mic className="w-3.5 h-3.5" />
              Cambiar a dictado por voz
            </>
          ) : (
            <>
              <Keyboard className="w-3.5 h-3.5" />
              Cambiar a teclado manual
            </>
          )}
        </button>
      </div>

      {/* Pre-save Review Modal */}
      {showPreSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
          <div className="w-full max-w-md glass p-6 border border-white/10 flex flex-col gap-4 max-h-[85vh]">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-200">Revisar Tareas Detectadas</h3>
              <p className="text-xs text-slate-400">Edita o elimina puntos antes de guardarlos.</p>
            </div>

            {/* List of detected tasks */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 max-h-[45vh]">
              {parsedTasks.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No hay tareas en el listado. Añade una abajo.</p>
              ) : (
                parsedTasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5 group">
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 focus:bg-white/5 px-2 py-1 rounded"
                      value={task}
                      onChange={(e) => handleEditParsedTask(index, e.target.value)}
                    />
                    <button
                      onClick={() => handleDeleteParsedTask(index)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Form to add another task in the modal */}
            <div className="flex gap-2 border-t border-white/5 pt-3">
              <input
                type="text"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
                placeholder="Añadir otra tarea..."
                value={newParsedTask}
                onChange={(e) => setNewParsedTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParsedTask();
                  }
                }}
              />
              <button
                onClick={handleAddParsedTask}
                className="glass-button py-1.5 px-3 text-xs font-semibold"
                type="button"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>

            {/* Confirm Actions */}
            <div className="flex gap-3 border-t border-white/5 pt-3">
              <button
                onClick={handleSaveAndCommit}
                disabled={parsedTasks.length === 0}
                className="flex-1 glass-button glass-button-primary py-2.5 text-sm font-bold flex gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar Lista
              </button>
              <button
                onClick={() => setShowPreSaveModal(false)}
                className="glass-button py-2.5 text-sm font-semibold border-white/5 text-slate-400 hover:text-slate-200"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
