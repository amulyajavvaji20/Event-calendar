import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  format,
  parseISO,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
  addWeeks,
  addMonths as addMonthsFn,
  getDay,
  getDate,
} from 'date-fns';
import { CalendarDay, CalendarMonth, Event, RecurrenceRule, WeekDay } from '../types';

export const createCalendarMonth = (date: Date, events: Event[]): CalendarMonth => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const today = new Date();

  const days: CalendarDay[] = allDays.map((day) => {
    return {
      date: day,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, today),
      events: getEventsForDay(day, events),
    };
  });

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    days,
  };
};

export const getEventsForDay = (date: Date, events: Event[]): Event[] => {
  const dayEvents: Event[] = [];

  // Get regular events for this day
  const regularEvents = events.filter(
    (event) => isSameDay(date, new Date(event.date)) && event.recurrence.pattern === 'none'
  );
  dayEvents.push(...regularEvents);

  // Get recurring events
  events
    .filter((event) => event.recurrence.pattern !== 'none')
    .forEach((event) => {
      if (isRecurringEventOnDay(event, date)) {
        // Create a new instance of the recurring event
        const instanceEvent: Event = {
          ...event,
          isRecurringInstance: true,
          originalEventId: event.id,
          instanceDate: date,
        };
        dayEvents.push(instanceEvent);
      }
    });

  return dayEvents;
};

export const isRecurringEventOnDay = (event: Event, date: Date): boolean => {
  const eventDate = new Date(event.date);
  const recurrence = event.recurrence;
  
  // If date is before the event's start date, it can't be recurring
  if (isBefore(date, eventDate)) {
    return false;
  }

  // If there's an end date and we're after it, it's not recurring
  if (recurrence.endDate && isAfter(date, recurrence.endDate)) {
    return false;
  }

  switch (recurrence.pattern) {
    case 'daily':
      // For daily, check if it's a continuous day since the start
      if (isSameDay(date, eventDate)) return true;
      const daysSinceStart = Math.floor((date.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceStart % (recurrence.interval || 1) === 0;

    case 'weekly':
      // For weekly, check if it's the right day of the week
      if (!recurrence.weekDays || recurrence.weekDays.length === 0) {
        // If no specific days set, use the original event's day
        const originalDayOfWeek = getDayNameFromIndex(getDay(eventDate));
        recurrence.weekDays = [originalDayOfWeek];
      }
      
      const dayOfWeek = getDayNameFromIndex(getDay(date));
      const weeksSinceStart = Math.floor((date.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      return recurrence.weekDays.includes(dayOfWeek) && weeksSinceStart % (recurrence.interval || 1) === 0;

    case 'monthly':
      // For monthly, check if it's the same day of the month
      const isSameDayOfMonth = getDate(date) === getDate(eventDate);
      const monthsSinceStart = (date.getFullYear() - eventDate.getFullYear()) * 12 + 
                              (date.getMonth() - eventDate.getMonth());
      return isSameDayOfMonth && monthsSinceStart % (recurrence.interval || 1) === 0;

    case 'custom':
      // For custom, use the interval to determine if it's a recurring day
      if (!recurrence.interval || recurrence.interval <= 0) return false;
      
      const dayDiff = Math.floor((date.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff % recurrence.interval === 0;

    default:
      return false;
  }
};

export const getDayNameFromIndex = (index: number): WeekDay => {
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[index];
};

export const formatDateForDisplay = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const hasTimeConflict = (event1: Event, event2: Event): boolean => {
  if (!isSameDay(new Date(event1.date), new Date(event2.date))) {
    return false;
  }

  const start1 = parseISO(`2023-01-01T${event1.startTime}`);
  const end1 = parseISO(`2023-01-01T${event1.endTime}`);
  const start2 = parseISO(`2023-01-01T${event2.startTime}`);
  const end2 = parseISO(`2023-01-01T${event2.endTime}`);

  return (
    isWithinInterval(start1, { start: start2, end: end2 }) ||
    isWithinInterval(end1, { start: start2, end: end2 }) ||
    isWithinInterval(start2, { start: start1, end: end1 }) ||
    isWithinInterval(end2, { start: start1, end: end1 })
  );
};