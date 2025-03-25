
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PrivacyPolicyProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ open, onClose }: PrivacyPolicyProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none">
          <h3>1. Coleta de Dados</h3>
          <p>Coletamos apenas os dados necessários para a prestação dos serviços jurídicos:</p>
          <ul>
            <li>Nome completo</li>
            <li>CPF</li>
            <li>Data de nascimento</li>
            <li>Endereço</li>
            <li>Contatos (email e telefone)</li>
            <li>Documentos relacionados ao caso</li>
          </ul>

          <h3>2. Uso dos Dados</h3>
          <p>Seus dados serão utilizados exclusivamente para:</p>
          <ul>
            <li>Agendamento e gestão de consultas</li>
            <li>Comunicação sobre seu caso</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>

          <h3>3. Armazenamento</h3>
          <p>Seus dados são armazenados de forma segura e criptografada, sendo mantidos apenas pelo tempo necessário.</p>

          <h3>4. Seus Direitos</h3>
          <p>Você tem direito a:</p>
          <ul>
            <li>Acessar seus dados</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar a exclusão dos dados</li>
            <li>Revogar o consentimento</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
