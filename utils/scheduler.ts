import { Student, ScheduleSlot, ScheduleResult } from '../types';

export const MAX_CAPACITY = 5;

const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const runAutoSchedule = (
  year: number,
  month: number,
  students: Student[]
): ScheduleResult => {
  const slots: ScheduleSlot[] = [];
  const unassigned: string[] = [];
  
  // 1. Initialize empty slots for the month (Mon-Fri)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dateMap = new Map<string, ScheduleSlot[]>(); // Key: DateString, Value: [Slot0, Slot1, Slot2]

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (isBusinessDay(date)) {
      const dateStr = formatDate(date);
      const daySlots: ScheduleSlot[] = [
        { date: dateStr, slotIndex: 0, studentIds: [] },
        { date: dateStr, slotIndex: 1, studentIds: [] },
        { date: dateStr, slotIndex: 2, studentIds: [] },
      ];
      dateMap.set(dateStr, daySlots);
      slots.push(...daySlots);
    }
  }

  // 2. Sort students by constraint difficulty (More specific preferences = harder to place)
  // We prioritize those with fewer preferred days to ensure they get a spot.
  const sortedStudents = [...students].sort((a, b) => {
    const aLen = a.preferredDays.length || 999;
    const bLen = b.preferredDays.length || 999;
    return aLen - bLen;
  });

  // 3. Assignment Logic
  sortedStudents.forEach(student => {
    let placed = false;

    // Try preferred days first
    for (const dayNum of student.preferredDays) {
      if (placed) break;
      
      const date = new Date(year, month - 1, dayNum);
      const dateStr = formatDate(date);
      
      // If preferred day is valid (business day)
      if (dateMap.has(dateStr)) {
        const daySlots = dateMap.get(dateStr)!;
        
        // Try each slot in that day
        for (const slot of daySlots) {
            // Constraint 1: Capacity
            if (slot.studentIds.length >= MAX_CAPACITY) continue;

            // Constraint 2: NG Students
            const hasConflict = slot.studentIds.some(existingId => {
                const existingStudent = students.find(s => s.id === existingId);
                if (!existingStudent) return false;
                // Check if current student hates existing, or existing hates current
                return student.ngWith.includes(existingId) || existingStudent.ngWith.includes(student.id);
            });

            if (!hasConflict) {
                slot.studentIds.push(student.id);
                placed = true;
                break;
            }
        }
      }
    }

    if (!placed) {
        unassigned.push(student.id);
    }
  });

  return { slots, unassigned };
};