import { useState } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useLawyer } from "@/hooks/use-lawyer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAYS_OF_WEEK, COMMON_TIME_SLOTS } from "@/lib/constants";

// Required documents schema
const documentRequirementSchema = z.object({
  processType: z.string().min(1, "O tipo de processo é obrigatório"),
  requiredDocuments: z.array(z.string()).min(1, "Pelo menos um documento é obrigatório"),
});

// Weekly schedule template schema
const scheduleTemplateSchema = z.object({
  name: z.string().min(1, "O nome do modelo é obrigatório"),
  timeSlots: z.array(z.object({
    day: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean(),
  })).min(1, "Adicione pelo menos um horário disponível"),
});

export default function Settings() {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default
  const [timeSlots, setTimeSlots] = useState<{
    day: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]>([]);
  
  // Sample lawyer ID (would come from auth context in real app)
  const lawyerId = 1;
  
  // Get lawyer data
  const { lawyer, isLoading } = useLawyer({ id: lawyerId });
  
  // Set up document requirements form
  const documentForm = useForm<z.infer<typeof documentRequirementSchema>>({
    resolver: zodResolver(documentRequirementSchema),
    defaultValues: {
      processType: "",
      requiredDocuments: ["RG ou CPF", "Comprovante de Residência"],
    },
  });
  
  // Set up schedule template form
  const scheduleForm = useForm<z.infer<typeof scheduleTemplateSchema>>({
    resolver: zodResolver(scheduleTemplateSchema),
    defaultValues: {
      name: "Horário Padrão",
      timeSlots: [],
    },
  });
  
  // Handle adding a time slot
  const handleAddTimeSlot = () => {
    const newTimeSlot = {
      day: selectedDay,
      startTime: "09:00",
      endTime: "10:00",
      isAvailable: true,
    };
    
    setTimeSlots([...timeSlots, newTimeSlot]);
    scheduleForm.setValue("timeSlots", [...timeSlots, newTimeSlot]);
  };
  
  // Handle removing a time slot
  const handleRemoveTimeSlot = (index: number) => {
    const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedTimeSlots);
    scheduleForm.setValue("timeSlots", updatedTimeSlots);
  };
  
  // Update time slot values
  const updateTimeSlot = (index: number, field: string, value: any) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = {
      ...updatedTimeSlots[index],
      [field]: value,
    };
    
    setTimeSlots(updatedTimeSlots);
    scheduleForm.setValue("timeSlots", updatedTimeSlots);
  };
  
  // Submit document requirements form
  const handleDocumentSubmit = (data: z.infer<typeof documentRequirementSchema>) => {
    console.log("Document Requirements:", data);
    // In a real app, this would submit to the API
  };
  
  // Submit schedule template form
  const handleScheduleSubmit = (data: z.infer<typeof scheduleTemplateSchema>) => {
    console.log("Schedule Template:", data);
    // In a real app, this would submit to the API
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation currentPage="/settings" />
      
      <MobileNavigation />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader 
          title="Configurações" 
          subtitle="Configurações e preferências do sistema"
        />
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">Carregando configurações...</p>
          </div>
        ) : (
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="schedule">Agenda</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos de Documentos</CardTitle>
                  <CardDescription>
                    Configure os documentos necessários para cada tipo de processo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...documentForm}>
                    <form onSubmit={documentForm.handleSubmit(handleDocumentSubmit)} className="space-y-4">
                      <FormField
                        control={documentForm.control}
                        name="processType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Processo *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Direito Civil, Direito de Família, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={documentForm.control}
                        name="requiredDocuments"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Documentos Necessários *</FormLabel>
                              <FormDescription>
                                Selecione os documentos que o cliente deve enviar.
                              </FormDescription>
                            </div>
                            
                            <div className="space-y-2">
                              {["RG ou CPF", "Comprovante de Residência", "Certidão de Nascimento", "Certidão de Casamento", "Carteira de Trabalho", "Documentação de Bens", "Boletim de Ocorrência"].map((doc) => (
                                <FormField
                                  key={doc}
                                  control={documentForm.control}
                                  name="requiredDocuments"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={doc}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(doc)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, doc])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== doc
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {doc}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                              
                              {/* Add custom document input */}
                              <div className="flex items-center space-x-2 mt-2">
                                <Input 
                                  placeholder="Adicionar outro documento..." 
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const value = e.currentTarget.value;
                                      if (value) {
                                        const currentDocs = documentForm.getValues().requiredDocuments;
                                        documentForm.setValue("requiredDocuments", [...currentDocs, value]);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.querySelector('input[placeholder="Adicionar outro documento..."]') as HTMLInputElement;
                                    const value = input?.value;
                                    if (value) {
                                      const currentDocs = documentForm.getValues().requiredDocuments;
                                      documentForm.setValue("requiredDocuments", [...currentDocs, value]);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit">Salvar Requisitos</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos Cadastrados</CardTitle>
                  <CardDescription>
                    Lista de requisitos de documentos para cada tipo de processo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample requirements - would come from API in real app */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">Direito Civil</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>RG ou CPF</li>
                        <li>Comprovante de Residência</li>
                        <li>Documentos relacionados ao processo</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">Direito de Família</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>RG ou CPF</li>
                        <li>Comprovante de Residência</li>
                        <li>Certidão de Casamento/Nascimento</li>
                        <li>Documentação de bens</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">Direito Trabalhista</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>RG ou CPF</li>
                        <li>Comprovante de Residência</li>
                        <li>Carteira de Trabalho</li>
                        <li>Comprovantes de pagamento</li>
                        <li>Contratos de trabalho</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Modelo de Agenda</CardTitle>
                  <CardDescription>
                    Crie modelos de agenda para facilitar o agendamento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)} className="space-y-4">
                      <FormField
                        control={scheduleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Modelo *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Horário Padrão" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="border rounded-lg p-4 space-y-4">
                        <h3 className="font-medium">Adicionar Horários</h3>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="w-full md:w-1/3">
                            <FormLabel>Dia da Semana</FormLabel>
                            <Select 
                              value={selectedDay.toString()} 
                              onValueChange={(value) => setSelectedDay(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o dia" />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS_OF_WEEK.filter(day => day.value > 0 && day.value < 6).map((day) => (
                                  <SelectItem key={day.value} value={day.value.toString()}>
                                    {day.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button type="button" onClick={handleAddTimeSlot}>
                            Adicionar Horário
                          </Button>
                        </div>
                        
                        {timeSlots.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <div className="grid grid-cols-12 gap-2 font-medium text-sm text-slate-500 px-2">
                              <div className="col-span-3">Dia</div>
                              <div className="col-span-3">Início</div>
                              <div className="col-span-3">Fim</div>
                              <div className="col-span-2">Disponível</div>
                              <div className="col-span-1"></div>
                            </div>
                            
                            {timeSlots.map((slot, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-md">
                                <div className="col-span-3">
                                  {DAYS_OF_WEEK.find(day => day.value === slot.day)?.label}
                                </div>
                                <div className="col-span-3">
                                  <Select 
                                    value={slot.startTime} 
                                    onValueChange={(value) => updateTimeSlot(index, 'startTime', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {COMMON_TIME_SLOTS.map((timeSlot) => (
                                        <SelectItem key={timeSlot.startTime} value={timeSlot.startTime}>
                                          {timeSlot.startTime}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Select 
                                    value={slot.endTime} 
                                    onValueChange={(value) => updateTimeSlot(index, 'endTime', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {COMMON_TIME_SLOTS.map((timeSlot) => (
                                        <SelectItem key={timeSlot.endTime} value={timeSlot.endTime}>
                                          {timeSlot.endTime}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2 flex items-center">
                                  <Checkbox 
                                    checked={slot.isAvailable}
                                    onCheckedChange={(checked) => 
                                      updateTimeSlot(index, 'isAvailable', !!checked)
                                    }
                                  />
                                  <span className="ml-2 text-sm">Sim</span>
                                </div>
                                <div className="col-span-1 text-right">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleRemoveTimeSlot(index)}
                                  >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="h-5 w-5 text-slate-500 hover:text-danger" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M6 18L18 6M6 6l12 12" 
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit">Salvar Modelo</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Modelos Salvos</CardTitle>
                  <CardDescription>
                    Modelos de agenda salvos para uso rápido.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample templates - would come from API in real app */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">Horário Padrão</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm">Aplicar</Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">Total de 21 horários configurados</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Segunda-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>09:00 - 10:00</li>
                            <li>10:30 - 11:30</li>
                            <li>13:00 - 14:00</li>
                            <li>14:30 - 15:30</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Terça-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>09:00 - 10:00</li>
                            <li>10:30 - 11:30</li>
                            <li>14:00 - 15:00 (Privado)</li>
                            <li>15:30 - 16:30</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Quarta-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>09:30 - 10:30</li>
                            <li>11:00 - 12:00</li>
                            <li>14:00 - 15:00</li>
                            <li>15:30 - 16:30</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">Horário Reduzido</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm">Aplicar</Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">Total de 9 horários configurados</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Segunda-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>14:00 - 15:00</li>
                            <li>15:30 - 16:30</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Quarta-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>14:00 - 15:00</li>
                            <li>15:30 - 16:30</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="font-medium">Sexta-feira</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>09:00 - 10:00</li>
                            <li>10:30 - 11:30</li>
                            <li>14:00 - 15:00</li>
                            <li>15:30 - 16:30</li>
                            <li>17:00 - 18:00</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Configure suas preferências de notificação.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="font-medium">Notificações por WhatsApp</label>
                        <p className="text-sm text-slate-500">
                          Receber notificações por WhatsApp quando um cliente agendar uma consulta.
                        </p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="font-medium">Notificações por Email</label>
                        <p className="text-sm text-slate-500">
                          Receber notificações por email quando um cliente agendar uma consulta.
                        </p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="font-medium">Lembretes de Compromissos</label>
                        <p className="text-sm text-slate-500">
                          Receber lembretes 1 hora antes dos compromissos.
                        </p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button>Salvar Preferências</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Gerencie as configurações de segurança da sua conta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Alterar Senha</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Senha Atual
                          </label>
                          <Input type="password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nova Senha
                          </label>
                          <Input type="password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirmar Nova Senha
                          </label>
                          <Input type="password" />
                        </div>
                      </div>
                      <Button className="mt-2">Alterar Senha</Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Dispositivos Conectados</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">Chrome em Windows</p>
                            <p className="text-xs text-slate-500">São Paulo, Brasil - Último acesso: Hoje</p>
                          </div>
                          <Button variant="ghost" size="sm">Desconectar</Button>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">Safari em iPhone</p>
                            <p className="text-xs text-slate-500">São Paulo, Brasil - Último acesso: Ontem</p>
                          </div>
                          <Button variant="ghost" size="sm">Desconectar</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Exportação de Dados</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        Você pode exportar todos os seus dados em formato JSON ou CSV.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline">Exportar como JSON</Button>
                        <Button variant="outline">Exportar como CSV</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
