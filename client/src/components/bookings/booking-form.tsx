import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientInfoSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DocumentUpload } from "./document-upload";

interface BookingFormProps {
  onSubmit: (data: z.infer<typeof clientInfoSchema> & { documents: File[] }) => void;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const [documents, setDocuments] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof clientInfoSchema>>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      clientName: "",
      clientCpf: "",
      clientBirthDate: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      appointmentReason: "",
    },
  });
  
  const handleFormSubmit = (data: z.infer<typeof clientInfoSchema>) => {
    onSubmit({ ...data, documents });
  };
  
  const handleDocumentsChange = (files: File[]) => {
    setDocuments(files);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Suas Informações</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite seu nome completo" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientCpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">CPF *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="000.000.000-00" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientBirthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Data de Nascimento *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Telefone *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="(00) 00000-0000" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">Endereço *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Rua, número, bairro" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="appointmentReason"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-sm font-medium text-slate-700">Motivo da Consulta *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={3} 
                    placeholder="Descreva o motivo da sua consulta" 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Documentos *</label>
            <DocumentUpload onChange={handleDocumentsChange} />
          </div>
          
          <div className="mb-6">
            <label className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" required />
              <span className="text-sm text-slate-600">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>, incluindo o consentimento para o tratamento dos meus dados pessoais conforme a LGPD.
              </span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
            >
              {isSubmitting ? "Enviando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
