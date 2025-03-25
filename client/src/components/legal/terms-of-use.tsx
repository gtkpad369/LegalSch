
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TermsOfUseProps {
  open: boolean;
  onClose: () => void;
}

export function TermsOfUse({ open, onClose }: TermsOfUseProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Termos de Uso</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none">
          <h3>1. Serviços</h3>
          <p>Nossa plataforma oferece serviços de agendamento de consultas jurídicas online.</p>

          <h3>2. Responsabilidades</h3>
          <p>O usuário se compromete a:</p>
          <ul>
            <li>Fornecer informações verdadeiras</li>
            <li>Comparecer na data e horário agendados</li>
            <li>Enviar documentos válidos e legíveis</li>
          </ul>

          <h3>3. Cancelamento</h3>
          <p>Cancelamentos devem ser realizados com no mínimo 24 horas de antecedência.</p>

          <h3>4. Privacidade</h3>
          <p>O tratamento de dados segue nossa Política de Privacidade em conformidade com a LGPD.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
