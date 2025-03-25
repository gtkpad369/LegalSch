import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ClientBookingHeader } from "@/components/bookings/client-booking-header";
import { BookingCalendar } from "@/components/bookings/booking-calendar";
import { BookingForm } from "@/components/bookings/booking-form";
import { useLawyer } from "@/hooks/use-lawyer";
import { useQuery } from "@tanstack/react-query";
import { addDays, startOfWeek, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { clientInfoSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookAppointment() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute<{ slug: string }>("/book/:slug");
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get lawyer data by slug
  const { lawyer, isLoading: isLoadingLawyer } = useLawyer({ slug: params?.slug });

  // Get weekly schedule for the lawyer
  const { data: weeklySchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: [`/api/lawyers/${lawyer?.id}/weekly-schedules`, { date: format(startDate, 'yyyy-MM-dd') }],
    enabled: !!lawyer?.id,
  });

  // Extract time slots from weekly schedule
  const timeSlots = weeklySchedule?.timeSlots || [];

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: any) => {
    setSelectedTimeSlot(slot);
  };

  const handleFormSubmit = async (data: z.infer<typeof clientInfoSchema> & { documents: File[] }) => {
    if (!selectedTimeSlot || !lawyer) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um horário para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create appointment
      const appointmentResponse = await apiRequest("POST", "/api/appointments", {
        lawyerId: lawyer.id,
        date: selectedTimeSlot.date,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        isPublic: true,
        status: "scheduled",
        clientName: data.clientName,
        clientCpf: data.clientCpf,
        clientBirthDate: data.clientBirthDate,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        appointmentReason: data.appointmentReason,
      });

      const appointment = await appointmentResponse.json();

      // In a real app, we would upload the documents here
      // using FormData and a file upload endpoint

      // Redirect to success page
      setLocation(`/booking-success?id=${appointment.id}`);
    } catch (error) {
      toast({
        title: "Erro ao agendar consulta",
        description: "Ocorreu um erro ao agendar sua consulta. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Advogado não encontrado</h1>
              <p className="text-slate-600">
                O advogado que você está procurando não existe ou está indisponível.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingLawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Carregando...</h1>
              <p className="text-slate-600">
                Aguarde enquanto carregamos as informações do advogado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Advogado não encontrado</h1>
              <p className="text-slate-600">
                O advogado que você está procurando não existe ou está indisponível.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Lawyer Header */}
      <ClientBookingHeader
        lawyer={{
          name: lawyer.name,
          oabNumber: lawyer.oabNumber,
          initials: lawyer.name.split(' ').map(part => part[0]).join(''),
          rating: 5,
          reviewCount: 28
        }}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lawyer Profile */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Sobre o Advogado</h2>
              <p className="text-slate-600 mb-4">
                {lawyer.description || "Especialista em Direito Civil, Direito de Família e Direito Trabalhista, com mais de 10 anos de experiência no mercado jurídico."}
              </p>
              
              <h3 className="font-medium text-slate-800 mb-2">Áreas de Atuação</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {lawyer.areasOfExpertise?.map(area => (
                  <span key={area} className="bg-primary-light bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
              
              <h3 className="font-medium text-slate-800 mb-2">Endereço</h3>
              <p className="text-slate-600 mb-4">
                {lawyer.address}
              </p>
              
              <h3 className="font-medium text-slate-800 mb-2">Contato</h3>
              <p className="text-slate-600 mb-1">
                <span className="font-medium">Email:</span> {lawyer.email}
              </p>
              <p className="text-slate-600 mb-4">
                <span className="font-medium">Telefone:</span> {lawyer.phone}
              </p>
              
              <h3 className="font-medium text-slate-800 mb-2">Redes Sociais</h3>
              <div className="flex space-x-3">
                {lawyer.socialLinks?.facebook && (
                  <a href={lawyer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                )}
                {lawyer.socialLinks?.twitter && (
                  <a href={lawyer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                )}
                {lawyer.socialLinks?.linkedin && (
                  <a href={lawyer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Documentos Necessários</h2>
              <div className="space-y-2">
                <div className="p-3 bg-primary-light bg-opacity-10 rounded-lg">
                  <h3 className="font-medium text-primary mb-1">Identificação (obrigatório)</h3>
                  <p className="text-sm text-slate-600">RG, CPF, CNH ou CTPS</p>
                </div>
                <div className="p-3 bg-primary-light bg-opacity-10 rounded-lg">
                  <h3 className="font-medium text-primary mb-1">Comprovante de Residência (obrigatório)</h3>
                  <p className="text-sm text-slate-600">Conta de luz, água ou telefone (últimos 3 meses)</p>
                </div>
                <div className="p-3 bg-primary-light bg-opacity-10 rounded-lg">
                  <h3 className="font-medium text-primary mb-1">Documentos Complementares</h3>
                  <p className="text-sm text-slate-600">Boletim de Ocorrência, contratos, documentações civis, etc.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="md:col-span-2">
            {/* Calendar */}
            <BookingCalendar
              startDate={startDate}
              timeSlots={timeSlots.map(slot => ({
                ...slot,
                isAvailable: slot.isAvailable
              }))}
              onDateChange={handleDateChange}
              onTimeSlotSelect={handleTimeSlotSelect}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot || undefined}
            />
            
            {/* Personal Information Form */}
            <div className="mt-6">
              <BookingForm 
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
