
import { Role, User, Payslip, TimeOffRequest, RequestStatus, TimeOffType, MeetingRequest, Announcement, Event, AppNotification, LogEntry } from './types';

const today = new Date();
const currentMonth = today.getMonth() + 1;
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayMonth = yesterday.getMonth() + 1;


export const USERS: User[] = [
  { id: 1, name: 'Ana Silva', email: 'ana@email.com', cpf: '11122233344', matricula: '00001001', role: Role.FUNCIONARIO, password: 'password', needsPasswordSetup: false, status: 'ATIVO', birthDate: `1990-${String(currentMonth).padStart(2, '0')}-15`, photoUrl: 'https://i.pravatar.cc/300?u=1' },
  { id: 2, name: 'Carlos Pereira', email: 'carlos@email.com', cpf: '22233344455', matricula: '00001002', role: Role.RH, password: 'password', needsPasswordSetup: false, status: 'ATIVO', birthDate: '1985-04-20', photoUrl: 'https://i.pravatar.cc/300?u=2' },
  { id: 3, name: 'Beatriz Costa', email: 'beatriz@email.com', cpf: '33344455566', matricula: '00001003', role: Role.FUNCIONARIO, password: 'password', needsPasswordSetup: false, status: 'ATIVO', birthDate: `1995-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`, photoUrl: 'https://i.pravatar.cc/300?u=3' },
  { id: 4, name: 'Davi Souza', email: 'davi@email.com', cpf: '44455566677', matricula: '00001004', role: Role.FUNCIONARIO, password: 'password', needsPasswordSetup: false, status: 'INATIVO', birthDate: '2000-11-05', photoUrl: 'https://i.pravatar.cc/300?u=4' },
  { id: 5, name: 'Analista RH', email: 'analista@email.com', cpf: '55566677788', matricula: '00001005', role: Role.RH, password: 'admin123', needsPasswordSetup: false, status: 'ATIVO', birthDate: `1988-${String(yesterdayMonth).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`, photoUrl: 'https://i.pravatar.cc/300?u=5' },
  { id: 6, name: 'Admin Geral', email: 'admin@email.com', cpf: '66677788899', matricula: '00000001', role: Role.ADMIN, password: 'admin123', needsPasswordSetup: false, status: 'ATIVO', birthDate: '1980-01-01' },
];

export const PAYSLIPS: Payslip[] = [
  { id: 'p1', userId: 1, month: 5, year: 2024, fileUrl: '/payslips/ana-2024-05.pdf' },
  { id: 'p2', userId: 1, month: 4, year: 2024, fileUrl: '/payslips/ana-2024-04.pdf' },
  { id: 'p3', userId: 3, month: 5, year: 2024, fileUrl: '/payslips/beatriz-2024-05.pdf' },
];

export const TIMEOFF_REQUESTS: TimeOffRequest[] = [
  { id: 'to1', userId: 1, userName: 'Ana Silva', type: TimeOffType.FERIAS, startDate: '2024-07-20', endDate: '2024-07-30', justification: 'Férias anuais', status: RequestStatus.APROVADO },
  { id: 'to2', userId: 3, userName: 'Beatriz Costa', type: TimeOffType.LICENCA_MEDICA, startDate: '2024-08-01', endDate: '2024-08-05', justification: 'Consulta médica', status: RequestStatus.PENDENTE, medicalCertificateUrl: '/certificates/beatriz-med-cert-2024-08.pdf' },
];

export const MEETING_REQUESTS: MeetingRequest[] = [
  { id: 'm1', userId: 1, userName: 'Ana Silva', topic: 'Discussão sobre plano de carreira', preferredDateTime: '2024-07-15T10:00', status: RequestStatus.PENDENTE },
];

export const ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'Feriado de Corpus Christi', content: 'Informamos que não haverá expediente no dia 30/05 devido ao feriado de Corpus Christi.', date: '2024-05-28', status: 'ACTIVE' },
    { id: 'a2', title: 'Campanha de Vacinação contra a Gripe', content: 'A campanha de vacinação ocorrerá em nosso escritório no dia 10/06. Inscreva-se com o RH.', imageUrl: 'https://picsum.photos/800/400?random=1', date: '2024-06-01', status: 'ACTIVE' },
    { id: 'a3', title: 'Inauguração do Novo Café', imageUrl: 'https://picsum.photos/800/400?random=2', date: '2024-06-05', status: 'ACTIVE' },
];

export const EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Reunião Trimestral de Alinhamento',
    description: 'Discussão sobre os resultados do Q2 e planejamento para o Q3. A presença de todos os líderes de equipe é obrigatória.',
    dateTime: '2024-08-01T10:00',
    participantIds: [1], // Ana Silva
    reminderMinutesBefore: 30,
    status: 'ACTIVE',
  },
  {
    id: 'e2',
    title: 'Treinamento de Segurança',
    description: 'Treinamento obrigatório sobre novas políticas de segurança de dados.',
    dateTime: '2024-08-15T14:00',
    participantIds: [1, 3], // Ana Silva, Beatriz Costa
    status: 'ACTIVE',
  }
];

export const APP_NOTIFICATIONS: AppNotification[] = [];

export const LOGS: LogEntry[] = [];