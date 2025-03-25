import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

export interface AppointmentListItem {
  id: number;
  clientName: string;
  reason: string;
  startTime: string;
  endTime: string;
}

interface AppointmentListProps {
  appointments: AppointmentListItem[];
  emptyMessage?: string;
}

export function AppointmentList({ appointments, emptyMessage = "Não há agendamentos para hoje." }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id}
          className="appointment-card bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary-light bg-opacity-10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-800">{appointment.clientName}</h3>
              <p className="text-sm text-slate-500">{appointment.reason}</p>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Link href={`/appointments/${appointment.id}`} className="text-slate-500 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
            <Link href={`/appointments/${appointment.id}/edit`} className="text-slate-500 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <Button className="bg-primary text-white px-3 py-1 rounded-lg text-sm">
              Confirmar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
