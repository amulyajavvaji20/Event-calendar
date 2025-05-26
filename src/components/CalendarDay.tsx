import React, { useState, useRef } from 'react';
import { CalendarDay as CalendarDayType, Event } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';
import { Plus } from 'lucide-react';

interface CalendarDayProps {
  day: CalendarDayType;
  onAddEvent: () => void;
  onEventClick: (event: Event) => void;
  onEventDrop: (event: Event) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  onAddEvent,
  onEventClick,
  onEventDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    
    try {
      const eventData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onEventDrop(eventData);
    } catch (error) {
      console.error('Error parsing dropped event data:', error);
    }
  };

  const dayClassNames = `
    relative min-h-[100px] p-1 border border-gray-200
    ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
    ${day.isToday ? 'border-blue-500 border-2' : ''}
    ${isDragOver ? 'bg-blue-50 border-blue-300 border-2' : ''}
  `;

  return (
    <div
      className={dayClassNames}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-start">
        <span 
          className={`text-sm font-medium ${
            !day.isCurrentMonth ? 'text-gray-400' : 
            day.isToday ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          {day.date.getDate()}
        </span>
        
        <button
          onClick={onAddEvent}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Add event"
          title="Add event"
        >
          <Plus size={16} className="text-gray-600" />
        </button>
      </div>
      
      <div className="mt-1 overflow-y-auto max-h-[80px]">
        {day.events.map((event) => (
          <EventItem 
            key={event.isRecurringInstance ? `${event.id}-${event.instanceDate?.getTime()}` : event.id} 
            event={event} 
            onClick={() => onEventClick(event)} 
          />
        ))}
      </div>
    </div>
  );
};

interface EventItemProps {
  event: Event;
  onClick: () => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(event));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="px-2 py-1 mb-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: event.color }}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="text-white truncate">{event.title}</div>
      <div className="text-white text-opacity-90 text-[10px]">
        {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
      </div>
    </div>
  );
};

export default CalendarDay;