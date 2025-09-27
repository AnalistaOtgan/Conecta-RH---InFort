export enum Role {
  FUNCIONARIO = 'Funcionário',
  RH = 'RH'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  password?: string;
  needsPasswordSetup?: boolean;
  emergencyPhone?: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface Payslip {
  id: string;
  userId: number;
  month: number;
  year: number;
  fileUrl: string;
}

export enum TimeOffType {
  FERIAS = 'Férias',
  LICENCA_MEDICA = 'Licença Médica',
  OUTRO = 'Outro'
}

export enum RequestStatus {
  PENDENTE = 'Pendente',
  APROVADO = 'Aprovado',
  NEGADO = 'Negado'
}

export interface TimeOffRequest {
  id: string;
  userId: number;
  userName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  justification?: string;
  status: RequestStatus;
  medicalCertificateUrl?: string;
}

export interface MeetingRequest {
  id:string;
  userId: number;
  userName: string;
  topic: string;
  preferredDateTime: string;
  status: RequestStatus;
}

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  date: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  participantIds: number[];
  reminderMinutesBefore?: number;
  status?: 'ACTIVE' | 'ARCHIVED';
}

export interface AppNotification {
  id: string;
  userId: number;
  message: string;
  read: boolean;
  link: string;
  timestamp: string;
}

export interface ImportResult {
  successCount: number;
  errors: { row: number; data: any; reason: string }[];
}