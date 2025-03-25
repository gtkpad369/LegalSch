import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export interface UseLawyerOptions {
  id?: number;
  slug?: string;
}

export function useLawyer(options: UseLawyerOptions = {}) {
  const queryClient = useQueryClient();
  const { id, slug } = options;
  
  // Get lawyer by ID
  const getLawyerByIdQuery = useQuery({
    queryKey: [`/api/lawyers/${id}`],
    enabled: !!id && !slug,
  });
  
  // Get lawyer by slug
  const getLawyerBySlugQuery = useQuery({
    queryKey: [`/api/lawyers/slug/${slug}`],
    enabled: !!slug && !id,
  });
  
  // Use the appropriate query result
  const lawyer = slug 
    ? getLawyerBySlugQuery.data 
    : getLawyerByIdQuery.data;
  
  const isLoading = slug 
    ? getLawyerBySlugQuery.isLoading 
    : getLawyerByIdQuery.isLoading;
  
  const error = slug 
    ? getLawyerBySlugQuery.error 
    : getLawyerByIdQuery.error;
  
  // Update lawyer profile
  const updateLawyerMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!lawyer?.id) throw new Error("Lawyer ID is required");
      return apiRequest("PATCH", `/api/lawyers/${lawyer.id}`, data);
    },
    onSuccess: async () => {
      // Invalidate the lawyer query to refetch the updated data
      if (id) {
        queryClient.invalidateQueries({ queryKey: [`/api/lawyers/${id}`] });
      }
      if (slug) {
        queryClient.invalidateQueries({ queryKey: [`/api/lawyers/slug/${slug}`] });
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    },
  });
  
  // Create new lawyer profile (signup)
  const createLawyerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/lawyers`, data);
    },
    onSuccess: async (response) => {
      const newLawyer = await response.json();
      
      toast({
        title: "Conta criada",
        description: "Sua conta foi criada com sucesso.",
        variant: "success",
      });
      
      return newLawyer;
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
        variant: "destructive",
      });
    },
  });
  
  return {
    lawyer,
    isLoading,
    error,
    updateLawyer: updateLawyerMutation.mutate,
    isUpdating: updateLawyerMutation.isPending,
    createLawyer: createLawyerMutation.mutate,
    isCreating: createLawyerMutation.isPending,
  };
}
