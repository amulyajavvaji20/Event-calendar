import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, ChevronsUpDown } from 'lucide-react';
import { formatMonthYear } from '../utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTodayClick,
  searchTerm,
  onSearchChange,
  onYearChange,
  onMonthChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate a list of years (20 years before and after current year)
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm px-4 py-3 sm:px-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="relative">
            <h1 
              className="text-2xl font-bold text-gray-800 mr-4 cursor-pointer flex items-center gap-1"
              onClick={() => setShowPicker(!showPicker)}
            >
              {formatMonthYear(currentDate)}
              <ChevronsUpDown size={20} className="text-gray-500" />
            </h1>
            
            {showPicker && (
              <div 
                ref={pickerRef}
                className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex"
              >
                {/* Month Picker */}
                <div className="w-48 border-r border-gray-200">
                  <div className="p-2 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-600">Month</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        className={`px-3 py-2 text-sm rounded-md text-left ${
                          index === currentMonth 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => {
                          onMonthChange(index);
                          setShowPicker(false);
                        }}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Picker */}
                <div className="w-32">
                  <div className="p-2 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-600">Year</h2>
                  </div>
                  <div className="h-64 overflow-y-auto">
                    {years.map(year => (
                      <button
                        key={year}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          year === currentYear 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => {
                          onYearChange(year);
                          setShowPicker(false);
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={onPrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={onTodayClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
              aria-label="Today"
            >
              <Calendar size={20} />
              <span className="ml-1 hidden sm:inline">Today</span>
            </button>
            <button 
              onClick={onNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;