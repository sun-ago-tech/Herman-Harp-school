import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import StudentManager from './components/StudentManager';
import CalendarView from './components/CalendarView';
import { Student, ScheduleSlot, ScheduleResult } from './types';
import { runAutoSchedule } from './utils/scheduler';
import { generateCSV, downloadCSV } from './utils/csvHelper';
import { LayoutDashboard, Users, Calendar, Settings, AlertCircle, Download } from 'lucide-react';

// Dummy Data
const INITIAL_STUDENTS: Student[] = Array.from({ length: 15 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `生徒 ${String.fromCharCode(65 + i)}`,
  preferredDays: [1, 5, 10, 15, 20].map(d => (d + i) % 28 + 1), // Random-ish preferences
  ngWith: i % 3 === 0 ? [((i + 2) % 15 + 1).toString()] : [] // Some conflicts
}));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'schedule'>('students');
  
  // App State
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  
  // Schedule Result
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [unassigned, setUnassigned] = useState<string[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const handleGenerate = () => {
    const result = runAutoSchedule(year, month, students);
    setSchedule(result.slots);
    setUnassigned(result.unassigned);
    setLastGenerated(new Date().toLocaleString());
    setActiveTab('schedule');
  };

  const handleDownload = () => {
    if (schedule.length === 0) return;
    const csvContent = generateCSV(schedule, students, year, month);
    downloadCSV(csvContent, `schedule_${year}_${month}.csv`);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">Hermann Harp<br/><span className="text-indigo-400">Scheduler</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users size={20} />
            生徒・設定
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calendar size={20} />
            スケジュール
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">対象年月</div>
          <div className="flex gap-2 mb-4">
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-20 bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-indigo-500 outline-none"
            />
            <span className="text-slate-400 flex items-center">年</span>
            <input 
              type="number" 
              min="1" max="12"
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:border-indigo-500 outline-none"
            />
            <span className="text-slate-400 flex items-center">月</span>
          </div>
          <button 
            onClick={handleGenerate}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Settings size={16} /> 自動作成
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'students' ? 'データ管理' : '月間スケジュール'}
                </h2>
                {lastGenerated && activeTab === 'schedule' && (
                    <p className="text-sm text-gray-500 mt-1">最終作成日時: {lastGenerated}</p>
                )}
            </div>
            {activeTab === 'schedule' && schedule.length > 0 && (
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors"
                >
                    <Download size={18} /> CSV出力
                </button>
            )}
        </header>

        {activeTab === 'students' ? (
          <StudentManager students={students} setStudents={setStudents} />
        ) : (
          <div className="space-y-6">
            {/* Alerts */}
            {unassigned.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-500 w-5 h-5 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-yellow-800 font-bold">未割り当ての生徒がいます</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      以下の生徒は希望日または条件により配置できませんでした:<br/>
                      {unassigned.map(id => {
                        const s = students.find(std => std.id === id);
                        return s ? s.name : id;
                      }).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {schedule.length > 0 ? (
                <CalendarView year={year} month={month} slots={schedule} students={students} />
            ) : (
                <div className="bg-white p-12 text-center rounded-lg shadow-sm text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">まだスケジュールが作成されていません。</p>
                    <p className="text-sm mt-2">サイドバーの「自動作成」ボタンを押してください。</p>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;