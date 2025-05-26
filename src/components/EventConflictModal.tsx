import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Event } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';

interface EventConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingEvent: Event;
  newEvent: Event;
  onOverwrite: () => void;
}

const EventConflictModal: React.FC<EventConflictModalProps> = ({
  isOpen,
  onClose,
  conflictingEvent,
  newEvent,
  onOverwrite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center">
            <AlertTriangle size={22} className="text-amber-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Time Conflict Detected
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            The event you're trying to create conflicts with an existing event:
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h3 className="font-medium text-gray-900">{conflictingEvent.title}</h3>
            <p className="text-sm text-gray-600">
              {formatDateForDisplay(new Date(conflictingEvent.date))}
            </p>
            <p className="text-sm text-gray-600">
              {conflictingEvent.startTime.substring(0, 5)} - {conflictingEvent.endTime.substring(0, 5)}
            </p>
          </div>
          
          <p className="text-gray-700 mb-4">
            Would you like to:
          </p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Adjust Time
            </button>
            <button
              onClick={onOverwrite}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600"
            >
              Schedule Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventConflictModal;