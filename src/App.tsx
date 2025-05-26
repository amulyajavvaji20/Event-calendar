import React, { useState, useEffect } from 'react';
import CalendarHeader from './components/CalendarHeader';
import CalendarGrid from './components/CalendarGrid';
import EventFormModal from './components/EventFormModal';
import EventConflictModal from './components/EventConflictModal';
import { Event, EventFormData, CalendarMonth } from './types';
import { createCalendarMonth, getNextMonth, getPreviousMonth } from './utils/dateUtils';
import {
  loadEvents,
  saveEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  hasEventConflicts,
  moveEvent,
  filterEvents,
} from './utils/eventUtils';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarData, setCalendarData] = useState<CalendarMonth>(() => 
    createCalendarMonth(currentDate, [])
  );

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

  // Conflict state
  const [showConflict, setShowConflict] = useState(false);
  const [conflictingEvent, setConflictingEvent] = useState<Event | null>(null);
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);

  // Load events from localStorage on initial render
  useEffect(() => {
    const storedEvents = loadEvents();
    setEvents(storedEvents);
  }, []);

  // Update calendar when events or current date changes
  useEffect(() => {
    setCalendarData(createCalendarMonth(currentDate, filteredEvents));
  }, [currentDate, filteredEvents]);

  // Filter events when search term or events change
  useEffect(() => {
    setFilteredEvents(searchTerm ? filterEvents(events, searchTerm) : events);
  }, [events, searchTerm]);

  const handlePrevMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = (formData: EventFormData) => {
    let newEvent: Event;
    let updatedEvents: Event[];

    if (selectedEvent) {
      // Update existing event
      updatedEvents = updateEvent(selectedEvent.id, formData, events);
      newEvent = updatedEvents.find(e => e.id === selectedEvent.id)!;
    } else {
      // Create new event
      newEvent = createEvent(formData);
      updatedEvents = [...events, newEvent];
    }

    // Check for conflicts
    const conflict = hasEventConflicts(newEvent, events.filter(e => e.id !== (selectedEvent?.id || '')));
    
    if (conflict) {
      setConflictingEvent(conflict);
      setPendingEvent(newEvent);
      setShowConflict(true);
      return;
    }

    // Save event if no conflicts
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setShowEventForm(false);
  };

  const handleForceAddEvent = () => {
    if (pendingEvent) {
      const updatedEvents = [...events.filter(e => e.id !== pendingEvent.id), pendingEvent];
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
    }
    setShowConflict(false);
    setShowEventForm(false);
  };

  const handleDeleteEvent = (event: Event, deleteAll: boolean) => {
    let updatedEvents = events;
    
    if (deleteAll && event.originalEventId) {
      // Delete all instances of recurring event
      updatedEvents = events.filter(e => 
        e.id !== event.originalEventId && e.originalEventId !== event.originalEventId
      );
    } else {
      updatedEvents = deleteEvent(event.id, events);
    }
    
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  const handleEventDrop = (event: Event, newDate: Date) => {
    // For recurring instances, convert to a regular event
    const eventToMove = event.isRecurringInstance && event.originalEventId
      ? { ...event, id: event.originalEventId }
      : event;
    
    const { updatedEvents, conflict } = moveEvent(eventToMove, newDate, events);
    
    if (conflict) {
      setConflictingEvent(conflict);
      setPendingEvent({ ...eventToMove, date: newDate });
      setShowConflict(true);
      return;
    }
    
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onTodayClick={handleTodayClick}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <div className="flex-1 overflow-hidden">
        <CalendarGrid
          calendarData={calendarData}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onEventDrop={handleEventDrop}
        />
      </div>
      
      {/* Event Form Modal */}
      {showEventForm && (
        <EventFormModal
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          event={selectedEvent}
        />
      )}
      
      {/* Conflict Modal */}
      {showConflict && conflictingEvent && pendingEvent && (
        <EventConflictModal
          isOpen={showConflict}
          onClose={() => setShowConflict(false)}
          conflictingEvent={conflictingEvent}
          newEvent={pendingEvent}
          onOverwrite={handleForceAddEvent}
        />
      )}
    </div>
  );
}

export default App;