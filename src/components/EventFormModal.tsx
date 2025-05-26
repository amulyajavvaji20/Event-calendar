import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Event, EventFormData, RecurrencePattern, WeekDay } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import { EVENT_COLORS, getDefaultRecurrenceRule } from '../utils/eventUtils';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: EventFormData) => void;
  selectedDate?: Date;
  event?: Event;
}

const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  event,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    color: EVENT_COLORS[0],
    recurrence: getDefaultRecurrenceRule(),
  });

  // Reset form when modal opens or event changes
  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({
          title: event.title,
          date: formatDateForInput(new Date(event.date)),
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description,
          color: event.color,
          recurrence: event.recurrence,
        });
      } else if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          date: formatDateForInput(selectedDate),
        }));
      }
    }
  }, [isOpen, event, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pattern = e.target.value as RecurrencePattern;
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        pattern,
        interval: pattern === 'custom' ? 1 : undefined,
        weekDays: pattern === 'weekly' ? ['monday'] : undefined,
      },
    }));
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interval = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        interval: isNaN(interval) ? 1 : interval,
      },
    }));
  };

  const handleWeekDayChange = (day: WeekDay) => {
    setFormData(prev => {
      const weekDays = prev.recurrence.weekDays || [];
      const updatedWeekDays = weekDays.includes(day)
        ? weekDays.filter(d => d !== day)
        : [...weekDays, day];
      
      return {
        ...prev,
        recurrence: {
          ...prev.recurrence,
          weekDays: updatedWeekDays,
        },
      };
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? new Date(e.target.value) : null;
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        endDate,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add title"
              />
            </div>
            
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            
            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add description (optional)"
              />
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {EVENT_COLORS.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            
            {/* Recurrence */}
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
                Repeats
              </label>
              <select
                id="recurrence"
                name="recurrence"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.recurrence.pattern}
                onChange={handleRecurrenceChange}
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {/* Recurrence Options */}
            {formData.recurrence.pattern !== 'none' && (
              <div className="pl-4 border-l-2 border-blue-100 space-y-3">
                {/* Interval for custom */}
                {formData.recurrence.pattern === 'custom' && (
                  <div>
                    <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                      Repeat every
                    </label>
                    <div className="flex items-center mt-1">
                      <input
                        type="number"
                        id="interval"
                        min="1"
                        className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.recurrence.interval || 1}
                        onChange={handleIntervalChange}
                      />
                      <span className="ml-2 text-sm text-gray-500">days</span>
                    </div>
                  </div>
                )}
                
                {/* Week days for weekly */}
                {formData.recurrence.pattern === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Repeat on
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`w-9 h-9 rounded-full text-xs ${
                            formData.recurrence.weekDays?.includes(day as WeekDay)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleWeekDayChange(day as WeekDay)}
                        >
                          {day.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* End date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Ends
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.recurrence.endDate ? formatDateForInput(formData.recurrence.endDate) : ''}
                    onChange={handleEndDateChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;