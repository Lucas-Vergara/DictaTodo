'use client';

import React, { useState, useEffect } from 'react';
import { Mic, ListTodo, Settings, Sparkles } from 'lucide-react';
import { Task } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DateSelector, { formatLocalDate } from '@/components/DateSelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TaskList from '@/components/TaskList';
import SettingsPanel from '@/components/SettingsPanel';

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('dictatodo-tasks', []);
  const [splitKeyword, setSplitKeyword] = useLocalStorage<string>('dictatodo-split-keyword', 'siguiente');
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dictar' | 'tareas'>('dictar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set default date to tomorrow and mark mount state on client side
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(formatLocalDate(tomorrow));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveTasks = (taskTexts: string[]) => {
    const newTasks: Task[] = taskTexts.map(text => ({
      id: Math.random().toString(36).substring(2, 11),
      text,
      completed: false,
      date: selectedDate,
      createdAt: Date.now(),
    }));

    setTasks(prev => [...prev, ...newTasks]);
    // Switch to task list tab after saving
    setActiveTab('tareas');
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleEditTask = (id: string, newText: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  // Filter tasks for the selected date
  const filteredTasks = tasks.filter(task => task.date === selectedDate);
  const pendingCount = filteredTasks.filter(t => !t.completed).length;

  if (!isMounted || !selectedDate) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Cargando DictaTodo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-white/5 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
              DictaTodo
            </h1>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Productividad por Voz
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all"
          type="button"
          aria-label="Ajustes de la aplicación"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      {/* Date Selector Navigation */}
      <section className="mt-4 shrink-0">
        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </section>

      {/* Tabs Menu */}
      <section className="mt-5 shrink-0">
        <div className="tab-container">
          <button
            onClick={() => setActiveTab('dictar')}
            className={`tab-btn ${activeTab === 'dictar' ? 'active' : ''}`}
            type="button"
          >
            <Mic className="w-4 h-4" />
            <span>Dictar</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tareas')}
            className={`tab-btn ${activeTab === 'tareas' ? 'active' : ''}`}
            type="button"
          >
            <ListTodo className="w-4 h-4" />
            <span>Mis Tareas</span>
            {pendingCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black bg-purple-500 text-white rounded-full flex items-center justify-center animate-scale-in">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Main Viewport Content */}
      <main className="main-content">
        {activeTab === 'dictar' ? (
          <VoiceRecorder
            onSaveTasks={handleSaveTasks}
            splitKeyword={splitKeyword}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Settings Panel Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        splitKeyword={splitKeyword}
        setSplitKeyword={setSplitKeyword}
        tasks={tasks}
        setTasks={setTasks}
      />
    </div>
  );
}
