export interface Student {
  id: string;
  name: string;
  preferredDays: number[]; // Day of month (e.g., 1, 15, 20)
  ngWith: string[]; // List of Student IDs
}

export interface ScheduleSlot {
  date: string; // YYYY-MM-DD
  slotIndex: number; // 0, 1, 2
  studentIds: string[];
}

export interface ScheduleResult {
  slots: ScheduleSlot[];
  unassigned: string[]; // List of Student IDs
}

export const HOURS = ["10:00 - 11:30", "13:00 - 14:30", "15:00 - 16:30"];
