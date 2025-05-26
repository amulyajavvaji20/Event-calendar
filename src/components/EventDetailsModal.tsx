import React from 'react';
import { X, Edit, Trash, Clock, CalendarDays, Repeat } from 'lucide-react';
import { Event } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteAll?: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onDeleteAll,
}) => {
  const formatRecurrenceText = () => {
    switch (event.recurrence.pattern) {
      case 'daily':
        return 'Repeats daily';
      case 'weekly':
        const days = event.recurrence.weekDays?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
        return `Repeats weekly on ${days || 'specific days'}`;
      case 'monthly':
        return 'Repeats monthly';
      case 'custom':
        return `Repeats every ${event.recurrence.interval} days`;
      default:
        return 'Does not repeat';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4" style={{ backgroundColor: event.color }}>
          <h2 className="text-xl font-semibold text-white truncate">
            {event.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <CalendarDays size={18} className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900">{formatDateForDisplay(new Date(event.date))}</p>
                {event.isRecurringInstance && (
                  <p className="text-sm text-gray-500">
                    This is a recurring instance
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={18} className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
              <p className="text-gray-900">
                {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
              </p>
            </div>
            
            {event.recurrence.pattern !== 'none' && (
              <div className="flex items-start">
                <Repeat size={18} className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
                <p className="text-gray-900">
                  {formatRecurrenceText()}
                  {event.recurrence.endDate && (
                    <span className="block text-sm text-gray-500">
                      Until {formatDateForDisplay(event.recurrence.endDate)}
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {event.description && (
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onDelete}
              className="px-3 py-2 flex items-center text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <Trash size={16} className="mr-1" />
              {event.recurrence.pattern !== 'none' ? 'Delete This' : 'Delete'}
            </button>
            
            {onDeleteAll && (
              <button
                onClick={onDeleteAll}
                className="px-3 py-2 flex items-center text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                <Trash size={16} className="mr-1" />
                Delete All
              </button>
            )}
            
            <button
              onClick={onEdit}
              className="px-3 py-2 flex items-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;