import { useState } from "react";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useAppointments } from "@/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate, formatCPF, formatPhone, getInitials } from "@/lib/utils";
import { Link } from "wouter";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample lawyer ID (would come from auth context in real app)
  const lawyerId = 1;
  
  // Get appointments data (specifically public ones)
  const { 
    appointments, 
    isLoading
  } = useAppointments({ 
    lawyerId
  });
  
  // Filter appointments to public ones only (client appointments)
  const clientAppointments = appointments
    ? appointments.filter(apt => apt.isPublic)
    : [];
  
  // Create a unique list of clients from appointments
  const uniqueClients = clientAppointments.reduce((clients, appointment) => {
    // Skip if no client name
    if (!appointment.clientName) return clients;
    
    // Check if client already exists in the list
    const existingClient = clients.find(
      client => client.clientCpf === appointment.clientCpf
    );
    
    if (!existingClient) {
      // Add new client
      clients.push({
        name: appointment.clientName,
        cpf: appointment.clientCpf,
        birthDate: appointment.clientBirthDate,
        email: appointment.clientEmail,
        phone: appointment.clientPhone,
        address: appointment.clientAddress,
        lastAppointment: appointment.date,
        appointmentCount: 1,
        appointments: [appointment]
      });
    } else {
      // Update existing client
      existingClient.appointmentCount += 1;
      existingClient.appointments.push(appointment);
      
      // Update last appointment if this one is more recent
      if (new Date(appointment.date) > new Date(existingClient.lastAppointment)) {
        existingClient.lastAppointment = appointment.date;
      }
    }
    
    return clients;
  }, []);
  
  // Filter clients based on search term
  const filteredClients = searchTerm
    ? uniqueClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpf.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : uniqueClients;
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <SidebarNavigation currentPage="/clients" />
      
      <MobileNavigation />
      
      <main className="flex-1 p-4 md:p-6 md:ml-64 pb-16 md:pb-6">
        <PageHeader 
          title="Clientes" 
          subtitle="Gerencie informações de clientes"
        />
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
                Buscar cliente
              </label>
              <Input 
                id="search"
                type="text" 
                placeholder="Nome, CPF ou Email" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" type="button" onClick={() => setSearchTerm("")}>
              Limpar Filtros
            </Button>
          </div>
        </div>
        
        {/* Clients List */}
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">
              {searchTerm 
                ? "Nenhum cliente encontrado com os filtros informados." 
                : "Nenhum cliente cadastrado ainda."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Último Atendimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-light bg-opacity-10 flex items-center justify-center text-primary text-xs font-medium mr-3">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-xs text-slate-500">{formatCPF(client.cpf)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.email}</div>
                      <div className="text-xs text-slate-500">{formatPhone(client.phone)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(client.lastAppointment)}</div>
                      <div className="text-xs text-slate-500">{client.appointmentCount} consulta(s)</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/appointments/${client.appointments[0].id}`} className="w-full flex">
                              Ver último atendimento
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a 
                              href={`https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(client.name)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full flex"
                            >
                              Buscar no JusBrasil
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/agenda?client=${client.cpf}`} className="w-full flex">
                              Novo agendamento
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
