import React, { useState, useEffect } from 'react';
import { ScheduleSlot, Student, HOURS } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutList } from 'lucide-react';

interface CalendarViewProps {
  year: number;
  month: number;
  slots: ScheduleSlot[];
  students: Student[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ year, month, slots, students }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Month view calculations
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startOffset }, (_, i) => i);

  // Week view state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  // Reset week view when year/month changes
  useEffect(() => {
    const d = new Date(year, month - 1, 1);
    const day = d.getDay(); // 0=Sun, 1=Mon
    // Find previous Monday (or today if Monday)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const newDate = new Date(d);
    newDate.setDate(diff);
    setCurrentWeekStart(newDate);
  }, [year, month]);

  const getSlotsForDay = (d: Date) => {
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    return slots.filter(s => s.date === dateStr).sort((a,b) => a.slotIndex - b.slotIndex);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || id;

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Generate days for the current week view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const formatDateShort = (d: Date) => {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm overflow-hidden">
        {/* Header with controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-800">
                {year}年 {month}月 
                {viewMode === 'week' && <span className="text-sm font-normal text-gray-500 ml-2">週間表示</span>}
            </h3>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('month')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <CalendarIcon size={16} /> 月表示
                </button>
                <button
                    onClick={() => setViewMode('week')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <LayoutList size={16} /> 週表示
                </button>
            </div>
        </div>

      {viewMode === 'month' ? (
        /* MONTH VIEW */
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
            {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
            <div key={d} className={`p-2 text-center text-sm font-bold ${i >= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-700'}`}>
                {d}
            </div>
            ))}
            
            {blanks.map(b => (
            <div key={`blank-${b}`} className="bg-white h-32 md:h-48" />
            ))}

            {daysArray.map(day => {
            const dateObj = new Date(year, month - 1, day);
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySlots = slots.filter(s => s.date === dateStr).sort((a,b) => a.slotIndex - b.slotIndex);
            
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            
            return (
                <div key={day} className={`bg-white min-h-[12rem] md:min-h-[16rem] p-1 md:p-2 border-t md:border-t-0 relative group ${isWeekend ? 'bg-gray-50' : ''}`}>
                <div className={`text-sm font-semibold mb-1 ${isWeekend ? 'text-gray-400' : 'text-gray-900'}`}>{day}</div>
                
                <div className="space-y-1 overflow-y-auto max-h-[10rem] md:max-h-[14rem] no-scrollbar">
                    {daySlots.map(slot => (
                    slot.studentIds.length > 0 && (
                        <div key={slot.slotIndex} className="text-xs bg-indigo-50 border border-indigo-100 rounded p-1">
                            <div className="font-bold text-indigo-700 mb-0.5">{HOURS[slot.slotIndex]}</div>
                            <div className="flex flex-wrap gap-1">
                                {slot.studentIds.map(sid => (
                                    <span key={sid} className="inline-block px-1 bg-white border border-indigo-200 rounded text-[10px] text-gray-700 truncate max-w-full">
                                        {getStudentName(sid)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                    ))}
                </div>
                </div>
            );
            })}
        </div>
      ) : (
        /* WEEK VIEW */
        <div>
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded">
                <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="font-semibold text-gray-700">
                    {formatDateShort(weekDays[0])} - {formatDateShort(weekDays[6])}
                </div>
                <button onClick={handleNextWeek} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border-collapse border border-gray-200 table-fixed">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 border border-gray-200">時間</th>
                            {weekDays.map((d, i) => {
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                return (
                                    <th key={i} className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider border border-gray-200 ${isWeekend ? 'text-red-500 bg-red-50' : 'text-gray-700'}`}>
                                        <div className="text-sm">{d.getDate()}</div>
                                        <div className="text-[10px]">{['日', '月', '火', '水', '木', '金', '土'][d.getDay()]}</div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {HOURS.map((hour, slotIndex) => (
                            <tr key={slotIndex}>
                                <td className="px-2 py-4 text-center text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200">
                                    <div className="whitespace-pre-line">{hour.replace(' - ', '\n|\n')}</div>
                                </td>
                                {weekDays.map((day, dayIndex) => {
                                    const daySlots = getSlotsForDay(day);
                                    const slot = daySlots.find(s => s.slotIndex === slotIndex);
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    
                                    return (
                                        <td key={dayIndex} className={`px-1 py-2 align-top border border-gray-200 h-32 ${isWeekend ? 'bg-gray-50' : ''}`}>
                                            {slot && slot.studentIds.length > 0 ? (
                                                <div className="flex flex-col gap-1 h-full overflow-y-auto">
                                                    {slot.studentIds.map(sid => (
                                                        <div key={sid} className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded shadow-sm truncate" title={getStudentName(sid)}>
                                                            {getStudentName(sid)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">
                                                   -
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;