import { useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TimeSlot {
  date: string; // "2023-06-13"
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isAvailable: boolean;
}

interface BookingCalendarProps {
  startDate: Date;
  timeSlots: TimeSlot[];
  onDateChange: (date: Date) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  selectedDate: Date;
  selectedTimeSlot?: TimeSlot;
}

export function BookingCalendar({
  startDate,
  timeSlots,
  onDateChange,
  onTimeSlotSelect,
  selectedDate,
  selectedTimeSlot
}: BookingCalendarProps) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday start
  
  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i);
    const dayNum = format(date, 'd');
    const dayName = format(date, 'EEE', { locale: ptBR }).toUpperCase();
    const isWeekend = i >= 5; // Saturday and Sunday
    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    return { date, dayNum, dayName, isWeekend, isSelected };
  });
  
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter time slots for the selected date
  const availableTimeSlots = timeSlots.filter(
    slot => slot.date === selectedDateStr
  );
  
  const handlePreviousWeek = () => {
    onDateChange(addDays(startDate, -7));
  };
  
  const handleNextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };
  
  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Selecione uma Data e Horário</h2>
      
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePreviousWeek}
          className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Semana Anterior
        </button>
        <h3 className="font-medium text-slate-800">
          {format(weekStart, "d 'de' MMMM", { locale: ptBR })} a {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
        </h3>
        <button 
          onClick={handleNextWeek}
          className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-50"
        >
          Próxima Semana
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDates.map((day, index) => (
          <div key={index} className="text-center">
            <p className={cn(
              "text-xs font-medium mb-1",
              day.isWeekend ? "text-slate-400" : "text-slate-500"
            )}>
              {day.dayName}
            </p>
            <button 
              onClick={() => handleDateSelect(day.date)}
              disabled={day.isWeekend}
              className={cn(
                "w-10 h-10 rounded-full mx-auto flex items-center justify-center",
                day.isSelected 
                  ? "bg-primary text-white" 
                  : day.isWeekend 
                    ? "text-slate-400 opacity-50 cursor-not-allowed" 
                    : "hover:bg-slate-100"
              )}
            >
              {day.dayNum}
            </button>
          </div>
        ))}
      </div>
      
      {/* Available Time Slots */}
      <h3 className="font-medium text-slate-800 mb-3">
        Horários Disponíveis - {format(selectedDate, "EEEE, dd/MM", { locale: ptBR })}
      </h3>
      
      {availableTimeSlots.length === 0 ? (
        <p className="text-center text-slate-500 py-4">
          Não há horários disponíveis para esta data.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {availableTimeSlots.map((slot, index) => (
            <button 
              key={index}
              onClick={() => onTimeSlotSelect(slot)}
              disabled={!slot.isAvailable}
              className={cn(
                "time-slot text-sm p-2 rounded border",
                slot.isAvailable 
                  ? selectedTimeSlot === slot 
                    ? "bg-success text-white border-success" 
                    : "bg-success-light text-success border-success border-opacity-20 hover:bg-success hover:text-white" 
                  : "bg-danger-light text-danger border-danger border-opacity-20 opacity-50 cursor-not-allowed"
              )}
            >
              {format(new Date(`2000-01-01T${slot.startTime}`), 'HH:mm')} - {format(new Date(`2000-01-01T${slot.endTime}`), 'HH:mm')}
            </button>
          ))}
        </div>
      )}
      
      {/* Selected Time Summary */}
      {selectedTimeSlot && (
        <div className="bg-primary-light bg-opacity-10 p-3 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-primary mb-1">Horário Selecionado</h3>
              <p className="text-sm text-slate-700">
                {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })} • {format(new Date(`2000-01-01T${selectedTimeSlot.startTime}`), 'HH:mm')} - {format(new Date(`2000-01-01T${selectedTimeSlot.endTime}`), 'HH:mm')}
              </p>
            </div>
            <button 
              onClick={() => onTimeSlotSelect(undefined as any)}
              className="text-slate-500 hover:text-danger"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
