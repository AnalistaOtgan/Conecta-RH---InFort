

export enum Role {
  FUNCIONARIO = 'Funcionário',
  RH = 'RH',
  ADMIN = 'Administrador'
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  matricula: string;
  role: Role;
  password?: string;
  needsPasswordSetup?: boolean;
  emergencyPhone?: string;
  status: 'ATIVO' | 'INATIVO';
  birthDate?: string; // YYYY-MM-DD
  photoUrl?: string;
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
  status?: 'ACTIVE' | 'ARCHIVED';
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

export enum LogActionType {
  CADASTRO_USUARIO = 'Cadastro de Usuário',
  IMPORTACAO_USUARIOS = 'Importação de Usuários',
  ATUALIZACAO_STATUS_USUARIO = 'Atualização de Status',
  ATUALIZACAO_DADOS_USUARIO = 'Atualização de Dados Cadastrais',
  RESET_SENHA = 'Reset de Senha',
  PROMOCAO_CARGO = 'Promoção de Cargo',
  APROVACAO_FOLGA = 'Aprovação de Folga',
  NEGACAO_FOLGA = 'Negação de Folga',
  APROVACAO_REUNIAO = 'Aprovação de Reunião',
  NEGACAO_REUNIAO = 'Negação de Reunião',
  LANCAMENTO_CONTRACHEQUE = 'Lançamento de Contracheque',
  PUBLICACAO_INFORMATIVO = 'Publicação de Informativo',
  CRIACAO_EVENTO = 'Criação de Evento',
  ATUALIZACAO_EVENTO = 'Atualização de Evento',
  ARQUIVAMENTO_REGISTRO = 'Arquivamento de Registro',
  EXCLUSAO_PERMANENTE = 'Exclusão Permanente',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  adminId: number;
  adminName: string;
  action: LogActionType;
  details: string;
}