import { useState, useEffect } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { WeeklyCalendar, TimeSlot } from "@/components/dashboard/weekly-calendar";
import { DocumentList } from "@/components/dashboard/document-list";
import { useQuery } from "@tanstack/react-query";
import { addDays, startOfWeek, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Fetch lawyer data (in a real app, this would be from an auth context)
  const lawyerId = 1;

  // Fetch appointments for the current week
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [
      `/api/lawyers/${lawyerId}/appointments`, 
      { weekStart: format(weekStart, 'yyyy-MM-dd') }
    ],
    enabled: !!lawyerId
  });

  // Transform appointments for today's list
  const todayAppointments = appointments
    ?.filter(apt => 
      apt.isPublic && 
      format(new Date(apt.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    )
    .map(apt => ({
      id: apt.id,
      clientName: apt.clientName || "Cliente",
      reason: apt.appointmentReason || "Consulta",
      startTime: apt.startTime,
      endTime: apt.endTime
    })) || [];

  // Transform appointments for the calendar
  const calendarTimeSlots: TimeSlot[] = appointments
    ?.map(apt => ({
      id: apt.id,
      day: new Date(apt.date).getDay(),
      date: format(new Date(apt.date), 'yyyy-MM-dd'),
      startTime: apt.startTime,
      endTime: apt.endTime,
      title: apt.isPublic 
        ? (apt.clientName || "Cliente") 
        : (apt.title || "Compromisso Privado"),
      isPublic: apt.isPublic
    })) || [];

  // Sample documents (in a real app, this would be fetched from the API)
  const recentDocuments = [
    {
      id: 1,
      clientName: "Maria Pereira",
      clientInitials: "MP",
      documentName: "Comprovante de Residência",
      fileType: "PDF",
      fileSize: "1.2 MB",
      uploadDate: "13/06/2023",
      status: "verified" as const
    },
    {
      id: 2,
      clientName: "João Santos",
      clientInitials: "JS",
      documentName: "Carteira de Identidade",
      fileType: "PDF",
      fileSize: "0.8 MB",
      uploadDate: "12/06/2023",
      status: "pending" as const
    },
    {
      id: 3,
      clientName: "Ana Pereira",
      clientInitials: "AP",
      documentName: "Certidão de Nascimento",
      fileType: "PDF",
      fileSize: "1.5 MB",
      uploadDate: "11/06/2023",
      status: "verified" as const
    }
  ];

  const handlePreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    // Navigate to appointment detail
    window.location.href = `/appointments/${slot.id}`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation currentPage="/dashboard" />
      
      <MobileNavigation />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader 
          title="Dashboard" 
          subtitle="Bem-vindo de volta, Dr. Rafael!"
          actionButton={{
            label: "Novo Agendamento",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            ),
            href: "/agenda"
          }}
        />
        
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Agendamentos Hoje" 
            value={todayAppointments.length}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            trend={{
              value: "20% a mais que ontem",
              isPositive: true
            }}
          />
          
          <StatCard 
            title="Novos Clientes (Mês)" 
            value="24"
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            trend={{
              value: "8% a mais que mês anterior",
              isPositive: true
            }}
          />
          
          <StatCard 
            title="Taxa de Comparecimento" 
            value="92%"
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            trend={{
              value: "2% menor que mês anterior",
              isPositive: false
            }}
          />
        </div>
        
        {/* Today's Appointments */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Agendamentos para Hoje</h2>
            <Link href="/agenda" className="text-primary text-sm hover:underline">
              Ver todos
            </Link>
          </div>
          
          <AppointmentList 
            appointments={todayAppointments} 
            emptyMessage="Não há agendamentos para hoje."
          />
        </div>
        
        {/* Weekly Calendar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Calendário Semanal</h2>
            <div className="flex space-x-2">
              {/* We'll use the calendar's built-in navigation */}
            </div>
          </div>
          
          <WeeklyCalendar 
            currentDate={currentDate}
            timeSlots={calendarTimeSlots}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
        
        {/* Recent Document Uploads */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Documentos Recentes</h2>
            <Link href="/clients" className="text-primary text-sm hover:underline">
              Ver todos
            </Link>
          </div>
          
          <DocumentList documents={recentDocuments} />
        </div>
      </main>
    </div>
  );
}
