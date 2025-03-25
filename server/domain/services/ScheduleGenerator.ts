
import { WeeklySchedule, ScheduleTemplate } from '@shared/schema';
import { addDays, format } from 'date-fns';

export class ScheduleGenerator {
  static generateFromTemplate(template: ScheduleTemplate, weekStart: Date): WeeklySchedule {
    return {
      ...template,
      weekStartDate: weekStart,
      timeSlots: template.timeSlots?.map(slot => ({
        ...slot,
        date: format(addDays(weekStart, slot.day - 1), 'yyyy-MM-dd')
      })) || []
    };
  }

  static generateFromPreviousWeek(previousWeek: WeeklySchedule): WeeklySchedule {
    const nextWeekStart = addDays(new Date(previousWeek.weekStartDate), 7);
    return {
      ...previousWeek,
      weekStartDate: nextWeekStart,
      timeSlots: previousWeek.timeSlots?.map(slot => ({
        ...slot,
        date: format(addDays(nextWeekStart, slot.day - 1), 'yyyy-MM-dd')
      })) || []
    };
  }
}
