import React, { useState } from 'react';
import { Student } from '../types';
import { Upload, Plus, Trash2, Download } from 'lucide-react';
import { parseStudentCSV } from '../utils/csvHelper';

interface StudentManagerProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ students, setStudents }) => {
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: '', preferredDays: [], ngWith: [] });
  const [prefDaysInput, setPrefDaysInput] = useState('');
  const [ngInput, setNgInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseStudentCSV(text);
        setStudents(parsed);
      };
      reader.readAsText(file);
    }
  };

  const addStudent = () => {
    if (!newStudent.name) return;
    const id = (Math.max(...students.map(s => parseInt(s.id)), 0) + 1).toString();
    
    const pDays = prefDaysInput.split(/[,、]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const ngs = ngInput.split(/[,、]/).map(s => s.trim()).filter(s => s !== '');

    const s: Student = {
      id,
      name: newStudent.name!,
      preferredDays: pDays,
      ngWith: ngs
    };
    setStudents([...students, s]);
    setNewStudent({ name: '' });
    setPrefDaysInput('');
    setNgInput('');
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const downloadTemplate = () => {
     const header = "ID,Name,PreferredDays(semicolon sep),NG_IDs(semicolon sep)\n1,田中太郎,1;5;10,2;3\n2,佐藤花子,10;15,";
     const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = "student_template.csv";
     link.click();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">生徒データ管理</h3>
        <div className="flex gap-2">
            <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
            >
                <Download size={16} /> テンプレート
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200">
            <Upload size={16} />
            <span>CSVアップロード</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">新規登録</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500">名前</label>
            <input 
              type="text" 
              value={newStudent.name}
              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
              className="w-full border p-2 rounded text-sm"
              placeholder="例: 山田 花子"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">希望日 (カンマ区切り)</label>
            <input 
              type="text" 
              value={prefDaysInput}
              onChange={e => setPrefDaysInput(e.target.value)}
              className="w-full border p-2 rounded text-sm"
              placeholder="例: 1, 15, 20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">NG生徒ID (カンマ区切り)</label>
            <input 
              type="text" 
              value={ngInput}
              onChange={e => setNgInput(e.target.value)}
              className="w-full border p-2 rounded text-sm"
              placeholder="例: 5, 8"
            />
          </div>
          <button 
            onClick={addStudent}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          >
            <Plus size={16} /> 追加
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">希望日</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NG生徒</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.preferredDays.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.ngWith.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => removeStudent(student.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManager;