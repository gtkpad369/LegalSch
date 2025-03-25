/**
 * Application constants 
 */

// Appointment status options
export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show"
};

// Appointment status labels for display
export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: "Agendado",
  [APPOINTMENT_STATUS.COMPLETED]: "Concluído",
  [APPOINTMENT_STATUS.CANCELLED]: "Cancelado",
  [APPOINTMENT_STATUS.NO_SHOW]: "Não Compareceu"
};

// Document types
export const DOCUMENT_TYPES = {
  IDENTIFICATION: "identification",
  RESIDENCE_PROOF: "residence_proof",
  OTHER: "other"
};

// Document type labels for display
export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.IDENTIFICATION]: "Identificação",
  [DOCUMENT_TYPES.RESIDENCE_PROOF]: "Comprovante de Residência",
  [DOCUMENT_TYPES.OTHER]: "Outros Documentos"
};

// Days of the week
export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" }
];

// Common time slots for scheduling
export const COMMON_TIME_SLOTS = [
  { startTime: "08:00", endTime: "09:00" },
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "17:00" },
  { startTime: "17:00", endTime: "18:00" }
];

// Default profile fields for lawyers
export const PROFILE_FIELDS = [
  { key: "name", label: "Nome completo", required: true },
  { key: "oabNumber", label: "Número da OAB", required: true },
  { key: "address", label: "Endereço", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Telefone de contato", required: true }
];

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 3,
  ALLOWED_TYPES: ['.pdf'],
  MAX_FILES: 5
};

// Document expiration in days
export const DOCUMENT_EXPIRATION_DAYS = 30;

// Areas of expertise options for lawyers
export const AREAS_OF_EXPERTISE = [
  "Direito Civil",
  "Direito de Família",
  "Direito Trabalhista",
  "Direito Empresarial",
  "Direito Penal",
  "Direito Tributário",
  "Direito Imobiliário",
  "Direito Previdenciário",
  "Direito do Consumidor",
  "Direito Ambiental"
];

// Placeholder public URL for sharing
export const PUBLIC_BOOKING_URL = "https://jurisagenda.com.br/book";
