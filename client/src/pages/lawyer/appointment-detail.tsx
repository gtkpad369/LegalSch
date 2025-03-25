import { useState } from "react";
import { useRoute } from "wouter";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCPF, formatPhone, getInitials } from "@/lib/utils";
import { useAppointments } from "@/hooks/use-appointments";
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { Link } from "wouter";

export default function AppointmentDetail() {
  const [match, params] = useRoute<{ id: string }>("/appointments/:id");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const appointmentId = parseInt(params?.id || "0");
  
  // Get appointment details
  const { 
    getAppointment,
    updateAppointment,
    isUpdating,
    deleteAppointment,
    isDeleting
  } = useAppointments();
  
  const { data: appointment, isLoading } = getAppointment(appointmentId);
  
  if (!match || appointmentId === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Agendamento Não Encontrado</h1>
              <p className="text-slate-600">
                O agendamento que você está procurando não existe ou foi removido.
              </p>
              <Button asChild>
                <Link href="/agenda">Voltar para Agenda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleStatusChange = (status: string) => {
    updateAppointment({
      id: appointmentId,
      data: { status }
    });
  };
  
  const handleDeleteAppointment = () => {
    deleteAppointment(appointmentId);
    window.location.href = "/agenda";
  };
  
  // Format appointment date for display
  const formatAppointmentDate = (date: string | Date) => {
    if (!date) return "";
    return formatDate(date, "dd 'de' MMMM 'de' yyyy");
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation />
      
      <MobileNavigation />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader 
          title="Detalhes do Agendamento" 
          subtitle={isLoading ? "Carregando..." : formatAppointmentDate(appointment?.date)}
          actionButton={{
            label: "Voltar",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            ),
            href: "/agenda"
          }}
        />
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">Carregando detalhes do agendamento...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Appointment Information */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">
                      {appointment?.isPublic 
                        ? "Consulta Jurídica" 
                        : appointment?.title || "Compromisso Privado"}
                    </CardTitle>
                    <CardDescription>
                      {formatAppointmentDate(appointment?.date)} • {appointment?.startTime} - {appointment?.endTime}
                    </CardDescription>
                  </div>
                  <Badge className={
                    appointment?.status === APPOINTMENT_STATUS.SCHEDULED ? "bg-success" :
                    appointment?.status === APPOINTMENT_STATUS.COMPLETED ? "bg-primary" :
                    appointment?.status === APPOINTMENT_STATUS.CANCELLED ? "bg-danger" :
                    "bg-slate-500"
                  }>
                    {APPOINTMENT_STATUS_LABELS[appointment?.status || "scheduled"]}
                  </Badge>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {appointment?.isPublic ? (
                    <>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary-light bg-opacity-10 flex items-center justify-center text-primary font-semibold text-lg">
                          {getInitials(appointment?.clientName || "")}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{appointment?.clientName}</h3>
                          <p className="text-slate-500">{formatCPF(appointment?.clientCpf || "")}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Motivo da Consulta</h4>
                          <p className="text-slate-800">{appointment?.appointmentReason}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Data de Nascimento</h4>
                            <p className="text-slate-800">{formatDate(appointment?.clientBirthDate || "")}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Contato</h4>
                            <p className="text-slate-800">{formatPhone(appointment?.clientPhone || "")}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Email</h4>
                            <p className="text-slate-800">{appointment?.clientEmail}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Endereço</h4>
                            <p className="text-slate-800">{appointment?.clientAddress}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-1">Título</h4>
                        <p className="text-slate-800">{appointment?.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-1">Descrição</h4>
                        <p className="text-slate-800">{appointment?.description || "Sem descrição."}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t pt-6 flex justify-between flex-wrap gap-2">
                  {appointment?.isPublic && (
                    <a 
                      href={`https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(appointment?.clientName || '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-slate-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                      </svg>
                      Buscar no JusBrasil
                    </a>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cancelar Agendamento
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Client Documents (if applicable) */}
              {appointment?.isPublic && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos do Cliente</CardTitle>
                    <CardDescription>
                      Documentos enviados pelo cliente para esta consulta.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Sample documents - would come from API in real app */}
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="font-medium">RG.pdf</p>
                            <p className="text-xs text-slate-500">PDF • 1.2 MB • Identificação</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Baixar</Button>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="font-medium">Comprovante_Residencia.pdf</p>
                            <p className="text-xs text-slate-500">PDF • 0.8 MB • Comprovante de Residência</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Baixar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Side Panel */}
            <div className="space-y-6">
              {/* Status Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Agendamento</CardTitle>
                  <CardDescription>
                    Atualize o status deste agendamento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant={appointment?.status === APPOINTMENT_STATUS.SCHEDULED ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(APPOINTMENT_STATUS.SCHEDULED)}
                      disabled={isUpdating}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Agendado
                    </Button>
                    
                    <Button 
                      variant={appointment?.status === APPOINTMENT_STATUS.COMPLETED ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(APPOINTMENT_STATUS.COMPLETED)}
                      disabled={isUpdating}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Concluído
                    </Button>
                    
                    <Button 
                      variant={appointment?.status === APPOINTMENT_STATUS.CANCELLED ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(APPOINTMENT_STATUS.CANCELLED)}
                      disabled={isUpdating}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelado
                    </Button>
                    
                    <Button 
                      variant={appointment?.status === APPOINTMENT_STATUS.NO_SHOW ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(APPOINTMENT_STATUS.NO_SHOW)}
                      disabled={isUpdating}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Não Compareceu
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/agenda?edit=${appointmentId}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Agendamento
                      </Link>
                    </Button>
                    
                    {appointment?.isPublic && (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            // In a real app, this would send a WhatsApp message via API
                            alert("Mensagem de lembrete enviada por WhatsApp!");
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Enviar Lembrete
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href={`/agenda?reschedule=${appointmentId}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reagendar
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Appointment History */}
              {appointment?.isPublic && (
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border-l-2 border-primary pl-3 py-1">
                        <p className="text-sm font-medium">Primeira Consulta</p>
                        <p className="text-xs text-slate-500">10/06/2023 - Direito Trabalhista</p>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-1">
                        <p className="text-sm font-medium">Segunda Consulta</p>
                        <p className="text-xs text-slate-500">17/06/2023 - Direito Trabalhista</p>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-1">
                        <p className="text-sm font-medium">Consulta Atual</p>
                        <p className="text-xs text-slate-500">{formatDate(appointment?.date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar Agendamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Não, manter
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAppointment}
                disabled={isDeleting}
              >
                {isDeleting ? "Cancelando..." : "Sim, cancelar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
