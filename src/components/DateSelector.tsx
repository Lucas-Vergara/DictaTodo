'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

// Helper to format Date to YYYY-MM-DD in local time
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
  // Generate list of 7 days starting from Today
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = formatLocalDate(date);
    
    let label = '';
    if (i === 0) label = 'Hoy';
    else if (i === 1) label = 'Mañana';
    else {
      // Get short weekday in Spanish
      label = date.toLocaleDateString('es-ES', { weekday: 'short' });
      // Remove trailing period if present
      label = label.replace('.', '');
      // Capitalize first letter
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    
    return {
      dateStr,
      dayNumber: date.getDate(),
      label,
      fullDate: date,
    };
  });

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
    }
  };

  // Check if selectedDate is not in the generated 7 days, so we can show it as "custom"
  const isCustomDateSelected = !days.some(d => d.dateStr === selectedDate);
  
  const getCustomDateLabel = () => {
    if (!selectedDate) return 'Fecha';
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return 'Fecha';
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selecciona el día</span>
        {isCustomDateSelected && (
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
            {getCustomDateLabel()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full">
        {/* Timeline Horizontal Scroll */}
        <div className="timeline-scroll flex-1">
          {days.map((day) => {
            const isActive = day.dateStr === selectedDate;
            return (
              <button
                key={day.dateStr}
                onClick={() => onSelectDate(day.dateStr)}
                className={`timeline-item ${isActive ? 'active' : ''}`}
                type="button"
              >
                <span className={`day-name text-xs font-semibold transition-colors ${isActive ? 'text-zinc-950' : 'text-slate-400'}`}>
                  {day.label}
                </span>
                <span className={`day-number text-lg font-extrabold transition-colors mt-0.5 ${isActive ? 'text-zinc-950' : 'text-slate-100'}`}>
                  {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Calendar Picker Icon */}
        <label className={`relative flex items-center justify-center p-3 rounded-xl cursor-pointer border transition-all ${
          isCustomDateSelected 
            ? 'background-primary bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
            : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
        }`} style={{ minWidth: '46px', height: '52px', alignSelf: 'flex-start', marginTop: '4px' }}>
          <Calendar className="w-5 h-5" />
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            value={selectedDate}
            onChange={handleCustomDateChange}
          />
        </label>
      </div>
    </div>
  );
}
