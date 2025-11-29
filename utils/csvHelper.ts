import { Student, ScheduleSlot } from '../types';

export const generateCSV = (slots: ScheduleSlot[], students: Student[], year: number, month: number): string => {
  const headers = ['Date', 'Slot', 'Time', 'Student Name', 'Student ID'];
  const rows: string[] = [headers.join(',')];

  const sortedSlots = [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.slotIndex - b.slotIndex;
  });

  sortedSlots.forEach(slot => {
    slot.studentIds.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      const timeLabel = ["10:00 - 11:30", "13:00 - 14:30", "15:00 - 16:30"][slot.slotIndex];
      rows.push([
        slot.date,
        (slot.slotIndex + 1).toString(),
        timeLabel,
        student ? `"${student.name}"` : 'Unknown',
        studentId
      ].join(','));
    });
  });

  return rows.join('\n');
};

export const parseStudentCSV = (csvText: string): Student[] => {
  const lines = csvText.trim().split('\n');
  const students: Student[] = [];
  
  // Skip header if present (simple check for "name" or "id")
  let startIndex = 0;
  if (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('id')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parser assuming no commas in names for simplicity
    const parts = line.split(',');
    if (parts.length >= 2) {
      const id = parts[0].trim();
      const name = parts[1].trim();
      // Safe parsing for preferred days
      const preferredDaysStr = parts[2] ? parts[2].replace(/"/g, '') : "";
      const preferredDays = preferredDaysStr 
        ? preferredDaysStr.split(';').map(d => parseInt(d.trim())).filter(n => !isNaN(n))
        : [];
      
      const ngStr = parts[3] ? parts[3].replace(/"/g, '') : "";
      const ngWith = ngStr ? ngStr.split(';').map(s => s.trim()) : [];

      if (id && name) {
        students.push({ id, name, preferredDays, ngWith });
      }
    }
  }
  return students;
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};