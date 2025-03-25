import { formatDate, cn } from "@/lib/utils";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TimeSlot {
  id: number;
  day: number; // 0-6 for Sunday-Saturday
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  isPublic: boolean;
}

interface WeeklyCalendarProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onDayClick?: (date: Date) => void;
  onTimeSlotClick?: (slot: TimeSlot) => void;
}

export function WeeklyCalendar({
  currentDate,
  timeSlots,
  onPreviousWeek,
  onNextWeek,
  onDayClick,
  onTimeSlotClick
}: WeeklyCalendarProps) {
  // Start the week on Monday (1) instead of Sunday (0)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Generate days of the week
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(weekStart, index);
    const dayNumber = parseInt(format(date, 'd', { locale: ptBR }));
    const dayName = format(date, 'EEE', { locale: ptBR }).toUpperCase();
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isWeekend = index > 4; // Saturday and Sunday
    
    return { date, dayNumber, dayName, isToday, isWeekend };
  });

  // Group time slots by day
  const timeSlotsByDay = weekDays.map((day, index) => {
    const dayTimeSlots = timeSlots.filter(
      slot => new Date(slot.date).getDay() === day.date.getDay()
    );
    return { ...day, timeSlots: dayTimeSlots };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
        <button 
          onClick={onPreviousWeek}
          className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        
        <h3 className="font-medium text-slate-800">
          {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
        </h3>
        
        <button 
          onClick={onNextWeek}
          className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-50"
        >
          Próxima
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-200">
        {timeSlotsByDay.map((day, index) => (
          <div 
            key={index}
            onClick={() => onDayClick?.(day.date)}
            className={cn(
              "p-4 text-center border-r border-slate-200 last:border-r-0 cursor-pointer",
              day.isToday && "bg-primary-light bg-opacity-10",
              day.isWeekend && "bg-slate-50"
            )}
          >
            <p 
              className={cn(
                "text-sm font-medium",
                day.isToday ? "text-primary" : day.isWeekend ? "text-slate-400" : "text-slate-600"
              )}
            >
              {day.dayName}
            </p>
            <p 
              className={cn(
                "text-lg font-bold mt-1", 
                day.isToday ? "text-primary" : day.isWeekend ? "text-slate-400" : ""
              )}
            >
              {day.dayNumber}
            </p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 divide-x divide-slate-200">
        {timeSlotsByDay.map((day, dayIndex) => (
          <div 
            key={dayIndex} 
            className={cn(
              "min-h-[200px] p-2",
              day.isToday && "bg-primary-light bg-opacity-5",
              day.isWeekend && "bg-slate-50"
            )}
          >
            {day.timeSlots.map((slot, slotIndex) => (
              <div 
                key={slotIndex}
                onClick={() => onTimeSlotClick?.(slot)}
                className={cn(
                  "time-slot text-xs p-2 rounded mb-2 border cursor-pointer",
                  slot.isPublic 
                    ? "bg-success bg-opacity-10 text-success border-success border-opacity-20" 
                    : "bg-danger bg-opacity-10 text-danger border-danger border-opacity-20"
                )}
              >
                {format(new Date(`2000-01-01T${slot.startTime}`), 'HH:mm')} - {slot.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
