import { v4 as uuidv4 } from 'uuid';
import { Event, EventFormData, RecurrenceRule } from '../types';
import { hasTimeConflict } from './dateUtils';

export const EVENT_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const STORAGE_KEY = 'calendar-events';

export const saveEvents = (events: Event[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const loadEvents = (): Event[] => {
  const storedEvents = localStorage.getItem(STORAGE_KEY);
  if (!storedEvents) return [];

  try {
    const events = JSON.parse(storedEvents);
    // Convert string dates back to Date objects
    return events.map((event: any) => ({
      ...event,
      date: new Date(event.date),
      recurrence: {
        ...event.recurrence,
        endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : null,
      },
      instanceDate: event.instanceDate ? new Date(event.instanceDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading events from localStorage:', error);
    return [];
  }
};

export const createEvent = (formData: EventFormData): Event => {
  return {
    id: uuidv4(),
    title: formData.title,
    date: new Date(formData.date),
    startTime: formData.startTime,
    endTime: formData.endTime,
    description: formData.description,
    color: formData.color,
    recurrence: formData.recurrence,
  };
};

export const updateEvent = (id: string, formData: EventFormData, events: Event[]): Event[] => {
  return events.map(event => 
    event.id === id ? { ...event, ...createEvent(formData), id } : event
  );
};

export const deleteEvent = (id: string, events: Event[]): Event[] => {
  return events.filter(event => event.id !== id);
};

export const deleteRecurringEvent = (
  id: string, 
  deleteAll: boolean, 
  instanceDate: Date | undefined, 
  events: Event[]
): Event[] => {
  if (deleteAll) {
    // Delete all instances of this recurring event
    return events.filter(event => event.id !== id && event.originalEventId !== id);
  } else if (instanceDate) {
    // Find the original event
    const originalEvent = events.find(event => event.id === id);
    if (!originalEvent) return events;

    // Create an exception for this specific date
    // In a more complete implementation, we would store exceptions
    // For this example, we'll just modify the recurrence rule end date if this is the last instance
    // This is simplified and not a complete solution
    return events;
  }
  
  return events;
};

export const hasEventConflicts = (newEvent: Event, existingEvents: Event[]): Event | null => {
  for (const event of existingEvents) {
    if (event.id === newEvent.id) continue; // Skip comparing with self
    
    if (hasTimeConflict(newEvent, event)) {
      return event;
    }
  }
  return null;
};

export const moveEvent = (
  event: Event, 
  newDate: Date, 
  events: Event[]
): { updatedEvents: Event[], conflict: Event | null } => {
  // Create a copy of the event with the new date
  const movedEvent: Event = {
    ...event,
    date: newDate,
  };

  // Check for conflicts
  const conflict = hasEventConflicts(movedEvent, events);
  if (conflict) {
    return { updatedEvents: events, conflict };
  }

  // Update the event with new date
  const updatedEvents = events.map(e => 
    e.id === event.id ? movedEvent : e
  );

  return { updatedEvents, conflict: null };
};

export const getDefaultRecurrenceRule = (): RecurrenceRule => {
  return {
    pattern: 'none',
  };
};

export const filterEvents = (events: Event[], searchTerm: string): Event[] => {
  if (!searchTerm.trim()) return events;
  
  const term = searchTerm.toLowerCase();
  return events.filter(event => 
    event.title.toLowerCase().includes(term) || 
    event.description.toLowerCase().includes(term)
  );
};