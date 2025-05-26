export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RecurrenceRule {
  pattern: RecurrencePattern;
  interval?: number; // For custom: every X days/weeks/months
  weekDays?: WeekDay[]; // For weekly: which days of the week
  endDate?: Date | null; // Optional end date for recurrence
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description: string;
  color: string;
  recurrence: RecurrenceRule;
  isRecurringInstance?: boolean;
  originalEventId?: string;
  instanceDate?: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  color: string;
  recurrence: RecurrenceRule;
}