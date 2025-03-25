import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function BookingSuccess() {
  const [location, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(10);
  
  // Get appointment ID from URL query parameters
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const appointmentId = searchParams.get("id");
  
  // Countdown to redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to the home page when countdown reaches 0
      window.location.href = "/";
    }
  }, [countdown]);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Agendamento Confirmado!</h1>
          
          <p className="text-slate-600 mb-6">
            Seu agendamento foi confirmado com sucesso. Um e-mail de confirmação foi enviado com os detalhes da sua consulta.
            {appointmentId && <span className="font-medium"> ID do agendamento: {appointmentId}</span>}
          </p>
          
          <div className="bg-slate-100 p-4 rounded-lg mb-6">
            <h2 className="font-medium text-slate-800 mb-2">Próximos Passos:</h2>
            <ol className="text-left list-decimal pl-5 space-y-2 text-slate-600">
              <li>Verifique seu e-mail para os detalhes completos do agendamento</li>
              <li>Prepare os documentos solicitados para o dia da consulta</li>
              <li>Chegue com 15 minutos de antecedência no dia do atendimento</li>
              <li>Em caso de dúvidas, entre em contato pelo WhatsApp ou e-mail fornecido</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => window.print()} 
              variant="outline"
              className="w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Confirmação
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar à Página Inicial
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            Você será redirecionado para a página inicial em {countdown} segundos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
