import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UseAppointmentsOptions {
  lawyerId?: number;
  weekStart?: Date;
  includePrivate?: boolean;
}

interface CreateAppointmentData {
  lawyerId: number;
  date: string;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  title?: string;
  description?: string;
  clientName?: string;
  clientCpf?: string;
  clientBirthDate?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  appointmentReason?: string;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lawyerId, weekStart, includePrivate = true } = options;
  
  // Format weekStart for query param if provided
  const weekStartParam = weekStart ? format(weekStart, 'yyyy-MM-dd') : undefined;
  
  // Get appointments list
  const appointmentsQuery = useQuery({
    queryKey: [
      `/api/lawyers/${lawyerId}/appointments`, 
      { weekStart: weekStartParam }
    ],
    enabled: !!lawyerId,
  });
  
  // Filter appointments if needed (for public/private separation)
  const appointments = appointmentsQuery.data
    ? includePrivate 
      ? appointmentsQuery.data 
      : appointmentsQuery.data.filter(apt => apt.isPublic)
    : [];
  
  // Get single appointment details by ID
  const getAppointment = (id: number) => {
    return useQuery({
      queryKey: [`/api/appointments/${id}`],
      enabled: !!id,
    });
  };
  
  // Create new appointment
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      return apiRequest("POST", `/api/appointments`, data);
    },
    onSuccess: async () => {
      // Invalidate appointments query to refetch
      if (lawyerId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/lawyers/${lawyerId}/appointments`] 
        });
      }
      
      toast({
        title: "Agendamento realizado",
        description: "O agendamento foi criado com sucesso.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Ocorreu um erro ao criar o agendamento.",
        variant: "destructive",
      });
    },
  });
  
  // Update appointment
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateAppointmentData> }) => {
      return apiRequest("PATCH", `/api/appointments/${id}`, data);
    },
    onSuccess: async () => {
      // Invalidate appointments query to refetch
      if (lawyerId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/lawyers/${lawyerId}/appointments`] 
        });
      }
      
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message || "Ocorreu um erro ao atualizar o agendamento.",
        variant: "destructive",
      });
    },
  });
  
  // Delete appointment
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/appointments/${id}`, undefined);
    },
    onSuccess: async () => {
      // Invalidate appointments query to refetch
      if (lawyerId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/lawyers/${lawyerId}/appointments`] 
        });
      }
      
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cancelar agendamento",
        description: error.message || "Ocorreu um erro ao cancelar o agendamento.",
        variant: "destructive",
      });
    },
  });
  
  return {
    appointments,
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    getAppointment,
    createAppointment: createAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    updateAppointment: updateAppointmentMutation.mutate,
    isUpdating: updateAppointmentMutation.isPending,
    deleteAppointment: deleteAppointmentMutation.mutate,
    isDeleting: deleteAppointmentMutation.isPending,
  };
}
