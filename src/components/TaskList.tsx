'use client';

import React, { useState } from 'react';
import { Check, Trash2, Edit2, Award, Calendar } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
  selectedDate: string;
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  selectedDate,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editText.trim();
    if (trimmed) {
      onEditTask(id, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const getFriendlyDateLabel = () => {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (selectedDate === todayStr) return 'para Hoy';
      if (selectedDate === tomorrowStr) return 'para Mañana';
      
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return `para el ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      {/* Progress & Metrics Card */}
      {totalTasks > 0 && (
        <div className="w-full glass p-5 border border-white/5 flex flex-col gap-3.5">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">Progreso del día</span>
              <span className="text-xs text-slate-400">Completadas {completedTasks} de {totalTasks} tareas</span>
            </div>
            <div className="text-right flex items-center gap-1.5">
              {progressPercent === 100 ? (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5" /> ¡Completado!
                </span>
              ) : (
                <span className="text-lg font-black text-purple-400">{progressPercent}%</span>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                progressPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List container */}
      <div className="flex flex-col gap-3">
        {totalTasks === 0 ? (
          /* Empty State */
          <div className="w-full glass p-8 border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[260px] animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-slate-200">No hay tareas {getFriendlyDateLabel()}</h3>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                Tu lista está vacía. Toca la pestaña &quot;Dictar&quot; y graba con tu voz las cosas por hacer.
              </p>
            </div>
          </div>
        ) : (
          /* Tasks Items */
          tasks.map((task) => {
            const isEditing = editingId === task.id;
            return (
              <div
                key={task.id}
                className={`w-full glass p-4 border border-white/5 flex items-center justify-between gap-3 transition-all duration-300 animate-scale-in ${
                  task.completed ? 'opacity-60 bg-white/[0.01]' : 'hover:bg-white/[0.03]'
                }`}
              >
                {/* Left side: Checkbox and Text */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <label className="checkbox-container shrink-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleComplete(task.id)}
                    />
                    <span className="checkmark">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      className="flex-1 bg-white/5 border border-purple-500/30 rounded px-2 py-1 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-purple-500"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => onToggleComplete(task.id)}
                      className={`text-sm font-semibold select-none cursor-pointer truncate transition-all ${
                        task.completed
                          ? 'text-slate-500 line-through dec-decoration-2 decoration-slate-500'
                          : 'text-slate-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  )}
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex gap-1 shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => (isEditing ? handleSaveEdit(task.id) : startEditing(task))}
                      className={`p-2 rounded-lg transition-colors ${
                        isEditing
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                      type="button"
                    >
                      {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
