'use client';

import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, Sliders, Check, HelpCircle } from 'lucide-react';
import { Task } from '@/types/task';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  splitKeyword: string;
  setSplitKeyword: (val: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  splitKeyword,
  setSplitKeyword,
  tasks,
  setTasks,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keywordInput, setKeywordInput] = useState(splitKeyword);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSaveKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (!trimmed) {
      showStatus('La palabra clave no puede estar vacía.', 'error');
      return;
    }
    setSplitKeyword(trimmed);
    showStatus('Palabra clave guardada.', 'success');
  };

  const handleExportTasks = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dictatodo-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showStatus('Tareas exportadas con éxito.', 'success');
    } catch {
      showStatus('Error al exportar tareas.', 'error');
    }
  };

  const handleImportTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Simple validation
          const isValid = parsed.every(item => 
            item && 
            typeof item.id === 'string' && 
            typeof item.text === 'string' && 
            typeof item.completed === 'boolean' && 
            typeof item.date === 'string'
          );
          
          if (isValid) {
            setTasks(parsed);
            showStatus(`${parsed.length} tareas importadas correctamente.`, 'success');
            if (fileInputRef.current) fileInputRef.current.value = '';
          } else {
            showStatus('El archivo JSON no tiene el formato correcto.', 'error');
          }
        } else {
          showStatus('El archivo JSON debe ser una lista.', 'error');
        }
      } catch {
        showStatus('Error al parsear el archivo JSON.', 'error');
      }
    };
    fileReader.readAsText(file);
  };

  const handleResetAll = () => {
    setTasks([]);
    setShowConfirmReset(false);
    showStatus('Todas las tareas han sido eliminadas.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className="w-full max-w-md glass p-6 relative border border-white/10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold">Ajustes</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Messages */}
        {statusMsg && (
          <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <Check className="w-4 h-4" />
            {statusMsg.text}
          </div>
        )}

        {/* Setting: Split Keyword */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
            Palabra clave de división
            <span className="group relative cursor-pointer text-slate-500 hover:text-slate-300">
              <HelpCircle className="w-4 h-4 inline" />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-slate-900/95 p-2 text-xs text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 border border-white/5 shadow-xl">
                Al dictar, di esta palabra para separar tus tareas. Ejemplo: &quot;Hacer café siguiente pasear perro&quot;.
              </span>
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 glass-input py-2 px-3 text-sm"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="siguiente"
            />
            <button
              onClick={handleSaveKeyword}
              className="glass-button glass-button-primary py-2 px-4 text-sm font-semibold"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Setting: Import/Export */}
        <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-slate-300">Datos (Respaldos)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportTasks}
              className="glass-button text-sm flex gap-2 items-center justify-center border-white/5 py-2.5"
            >
              <Download className="w-4 h-4 text-purple-400" />
              Exportar JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button text-sm flex gap-2 items-center justify-center border-white/5 py-2.5"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              Importar JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportTasks}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Setting: Reset Data */}
        <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-slate-300">Peligro</h3>
          
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="glass-button border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm flex gap-2 py-2.5"
            >
              <Trash2 className="w-4 h-4" />
              Borrar todas las tareas
            </button>
          ) : (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col gap-3">
              <p className="text-xs text-red-300 font-medium">
                ¿Estás seguro de que quieres borrar TODAS las tareas? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAll}
                  className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Sí, eliminar todo
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-lg border border-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
