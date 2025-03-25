import { useState } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
  WeeklyCalendar,
  TimeSlot,
} from "@/components/dashboard/weekly-calendar";
import { useAppointments } from "@/hooks/use-appointments";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Link } from "wouter";

// Form schema for creating/editing appointments
const appointmentSchema = z.object({
  date: z.string().min(1, "Data obrigatória"),
  startTime: z.string().min(1, "Horário inicial obrigatório"),
  endTime: z.string().min(1, "Horário final obrigatório"),
  isPublic: z.boolean().default(false),
  title: z.string().optional(),
  description: z.string().optional(),
});

export default function Agenda() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Sample lawyer ID (would come from auth context in real app)
  const lawyerId = 1;

  // Get appointments data
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const { appointments, isLoading, createAppointment, isCreating } =
    useAppointments({
      lawyerId,
      weekStart,
    });

  // Set up form for creating appointments
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      isPublic: false,
      title: "",
      description: "",
    },
  });

  // Transform appointments for the calendar
  const calendarTimeSlots: TimeSlot[] = appointments
    ? appointments.map((apt) => ({
        id: apt.id,
        day: new Date(apt.date).getDay(),
        date: format(new Date(apt.date), "yyyy-MM-dd"),
        startTime: apt.startTime,
        endTime: apt.endTime,
        title: apt.isPublic
          ? apt.clientName || "Cliente"
          : apt.title || "Compromisso Privado",
        isPublic: apt.isPublic,
      }))
    : [];

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    // Pre-populate the form with the selected date
    form.setValue("date", format(date, "yyyy-MM-dd"));

    // Open the create dialog
    setIsCreateDialogOpen(true);
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);

    // Navigate to appointment detail
    window.location.href = `/appointments/${slot.id}`;
  };

  const handleCreateAppointment = (data: z.infer<typeof appointmentSchema>) => {
    createAppointment({
      lawyerId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      isPublic: data.isPublic,
      title: data.title,
      description: data.description,
    });

    setIsCreateDialogOpen(false);
    form.reset();
  };

  // Generate week range for display
  const weekRange = `${format(weekStart, "d 'de' MMMM")} a ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d 'de' MMMM, yyyy")}`;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation currentPage="/agenda" />

      <MobileNavigation />

      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader
          title="Agenda"
          subtitle={`Gerenciamento de horários - ${weekRange}`}
          actionButton={{
            label: "Novo Compromisso",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            ),
            onClick: () => {
              setSelectedDate(new Date());
              form.reset({
                date: format(new Date(), "yyyy-MM-dd"),
                startTime: "09:00",
                endTime: "10:00",
                isPublic: false,
                title: "",
                description: "",
              });
              setIsCreateDialogOpen(true);
            },
          }}
        />

        {/* Weekly Calendar View */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Calendário Semanal
            </h2>
            <div className="flex space-x-2">
              {/* Calendar navigation is handled inside the WeeklyCalendar component */}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500">Carregando agenda...</p>
            </div>
          ) : (
            <WeeklyCalendar
              currentDate={currentDate}
              timeSlots={calendarTimeSlots}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              onDayClick={handleDayClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
        </div>

        {/* Public Booking Link */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Link de Agendamento Público
          </h2>
          <p className="text-slate-600 mb-3">
            Compartilhe este link com seus clientes para que eles possam agendar
            consultas diretamente.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              readOnly
              value={`https://jurisagenda.com.br/book/rafael-silva`}
              className="flex-1 bg-slate-50"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://jurisagenda.com.br/book/rafael-silva`,
                );
                toast({
                  title: "Link copiado",
                  description:
                    "O link de agendamento foi copiado para a área de transferência.",
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copiar Link
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/settings">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configurar Horários
              </Link>
            </Button>
          </div>
        </div>

        {/* Upcoming Appointments List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Próximos Agendamentos
            </h2>
            <Link
              href="/agenda?view=list"
              className="text-primary text-sm hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500">Carregando agendamentos...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
              <p className="text-slate-500">Não há agendamentos próximos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Data/Hora
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Cliente/Título
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Tipo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="font-medium">
                          {format(
                            parseISO(appointment.date.toString()),
                            "dd/MM/yyyy",
                          )}
                        </div>
                        <div className="text-slate-500">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {appointment.isPublic ? (
                          <div>
                            <div className="font-medium">
                              {appointment.clientName}
                            </div>
                            <div className="text-slate-500 truncate max-w-[200px]">
                              {appointment.appointmentReason}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">
                              {appointment.title}
                            </div>
                            <div className="text-slate-500 truncate max-w-[200px]">
                              {appointment.description}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.isPublic ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
                            Consulta
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-light text-danger">
                            Compromisso
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className="text-primary hover:text-primary-dark mr-4"
                        >
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Appointment Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Compromisso</DialogTitle>
              <DialogDescription>
                Crie um novo compromisso ou agendamento na sua agenda.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateAppointment)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horário Inicial</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horário Final</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Tipo de Compromisso</FormLabel>
                        <FormDescription>
                          Defina se este é um horário disponível para
                          agendamento de clientes.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch("isPublic") && (
                  <>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: Audiência, Reunião, etc."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Detalhes do compromisso..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Criando..." : "Criar Compromisso"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
