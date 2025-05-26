import React, { useState } from 'react';
import CalendarDay from './CalendarDay';
import EventDetailsModal from './EventDetailsModal';
import EventFormModal from './EventFormModal';
import { CalendarMonth, Event } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface CalendarGridProps {
  calendarData: CalendarMonth;
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event, deleteAll: boolean) => void;
  onEventDrop: (event: Event, date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarData,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onEventDrop,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      setShowEventDetails(false);
      onEditEvent(selectedEvent);
    }
  };

  const handleDeleteEvent = (deleteAll: boolean = false) => {
    if (selectedEvent) {
      onDeleteEvent(selectedEvent, deleteAll);
      setShowEventDetails(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((day) => (
          <div 
            key={day} 
            className="py-2 text-center text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarData.days.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            onAddEvent={() => onAddEvent(day.date)}
            onEventClick={handleEventClick}
            onEventDrop={(event) => onEventDrop(event, day.date)}
          />
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && showEventDetails && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseEventDetails}
          onEdit={handleEditEvent}
          onDelete={() => handleDeleteEvent(false)}
          onDeleteAll={selectedEvent.recurrence.pattern !== 'none' ? () => handleDeleteEvent(true) : undefined}
        />
      )}
    </div>
  );
};

export default CalendarGrid;