import { USERS, PAYSLIPS, TIMEOFF_REQUESTS, MEETING_REQUESTS, ANNOUNCEMENTS, EVENTS, APP_NOTIFICATIONS, LOGS } from '../constants';
import { User, Payslip, TimeOffRequest, MeetingRequest, Announcement, Event, AppNotification, RequestStatus, Role, LogActionType, LogEntry } from '../types';

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Internal logging function
const addLog = (admin: User, action: LogActionType, details: string) => {
    const logEntry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminId: admin.id,
        adminName: admin.name,
        action,
        details,
    };
    LOGS.unshift(logEntry);
};


// This is a mock API service. In a real application, these functions would
// make HTTP requests to a backend server which interacts with the MySQL database.

export const api = {
  // ===================================
  // READ operations
  // ===================================
  async getLogs(): Promise<LogEntry[]> {
    await delay(200);
    return Promise.resolve(LOGS);
  },
  
  async getUsers(): Promise<User[]> {
    await delay(200);
    return Promise.resolve(USERS);
  },

  async getPayslips(): Promise<Payslip[]> {
    await delay(200);
    return Promise.resolve(PAYSLIPS);
  },

  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    await delay(200);
    return Promise.resolve(TIMEOFF_REQUESTS);
  },
  
  async getMeetingRequests(): Promise<MeetingRequest[]> {
    await delay(200);
    return Promise.resolve(MEETING_REQUESTS);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    await delay(200);
    return Promise.resolve(ANNOUNCEMENTS);
  },
  
  async getEvents(): Promise<Event[]> {
    await delay(200);
    return Promise.resolve(EVENTS);
  },

  async getAppNotifications(): Promise<AppNotification[]> {
      await delay(200);
      return Promise.resolve(APP_NOTIFICATIONS);
  },

  // ===================================
  // AUTH operations
  // ===================================
  async login(email: string, password?: string): Promise<User> {
      await delay(500);
      const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
          throw new Error('Email ou senha inválidos.');
      }
      if (user.status === 'INATIVO') {
          throw new Error('Sua conta está desativada. Entre em contato com o RH.');
      }
      // If password is provided, check it. Otherwise, assume it's for setup check.
      if (password && !user.needsPasswordSetup && user.password !== password) {
          throw new Error('Email ou senha inválidos.');
      }
      return Promise.resolve(user);
  },

  async setupPassword(email: string, newPassword: string): Promise<User> {
      await delay(500);
      const userIndex = USERS.findIndex(u => u.email === email);
      if (userIndex === -1) {
          throw new Error('Usuário não encontrado.');
      }
      const updatedUser = { ...USERS[userIndex], password: newPassword, needsPasswordSetup: false };
      // In a real DB, this would be an UPDATE query. Here we just modify the mock array.
      USERS[userIndex] = updatedUser;
      return Promise.resolve(updatedUser);
  },

  // ===================================
  // WRITE operations
  // ===================================

  async registerEmployee(name: string, email: string, adminUser: User, emergencyPhone?: string): Promise<User> {
    await delay(500);
    if (USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este email já está em uso.');
    }
    const newUser: User = {
        id: Date.now(),
        name,
        email,
        role: Role.FUNCIONARIO,
        needsPasswordSetup: true,
        status: 'ATIVO',
        emergencyPhone: emergencyPhone || undefined,
    };
    USERS.push(newUser); // Mutating mock data
    addLog(adminUser, LogActionType.CADASTRO_USUARIO, `Cadastrou o novo usuário '${name}' (${email}).`);
    return Promise.resolve(newUser);
  },

  async importEmployees(importedData: any[], adminUser: User): Promise<{ newUsers: User[]; errors: { row: number; data: any; reason: string }[] }> {
    await delay(1000);
    const newUsers: User[] = [];
    const errors: { row: number; data: any; reason: string }[] = [];
    const existingEmails = new Set(USERS.map(u => u.email.toLowerCase()));

    importedData.forEach((row, index) => {
      const name = row['Nome Completo'];
      const email = row['Email'];
      const emergencyPhone = row['Telefone de Emergencia'];

      if (!name || !email) {
        errors.push({ row: index + 2, data: row, reason: 'Nome Completo e Email são obrigatórios.' });
        return;
      }
       if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push({ row: index + 2, data: row, reason: 'Formato de email inválido.' });
        return;
      }
      const lowercasedEmail = email.toLowerCase();
      if (existingEmails.has(lowercasedEmail) || newUsers.some(u => u.email.toLowerCase() === lowercasedEmail)) {
        errors.push({ row: index + 2, data: row, reason: 'Email já cadastrado no sistema.' });
        return;
      }
      
      const newUser: User = {
        id: Date.now() + index,
        name: String(name),
        email: email,
        role: Role.FUNCIONARIO,
        needsPasswordSetup: true,
        status: 'ATIVO',
        emergencyPhone: emergencyPhone ? String(emergencyPhone) : undefined,
      };
      newUsers.push(newUser);
    });

    if (newUsers.length > 0) {
      USERS.push(...newUsers); // Mutating mock data
      addLog(adminUser, LogActionType.IMPORTACAO_USUARIOS, `Importou ${newUsers.length} novo(s) usuário(s).`);
    }

    return Promise.resolve({ newUsers, errors });
  },

  async updateUserStatus(userId: number, status: 'ATIVO' | 'INATIVO', adminUser: User): Promise<User> {
      await delay(300);
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("Usuário não encontrado.");
      const user = USERS[userIndex];
      user.status = status;
      addLog(adminUser, LogActionType.ATUALIZACAO_STATUS_USUARIO, `Alterou o status de '${user.name}' para ${status}.`);
      return Promise.resolve(user);
  },

  async resetUserPassword(userId: number, adminUser: User): Promise<User> {
      await delay(300);
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("Usuário não encontrado.");
      const user = USERS[userIndex];
      user.needsPasswordSetup = true;
      user.password = undefined;
      addLog(adminUser, LogActionType.RESET_SENHA, `Resetou a senha de '${user.name}'.`);
      return Promise.resolve(user);
  },

  async updateUserRole(userId: number, role: Role, adminUser: User): Promise<User> {
      await delay(300);
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("Usuário não encontrado.");
      const user = USERS[userIndex];
      user.role = role;
      addLog(adminUser, LogActionType.PROMOCAO_CARGO, `Promoveu o usuário '${user.name}' para o cargo de ${role}.`);
      return Promise.resolve(user);
  },

  async addTimeOffRequest(requestData: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>, currentUser: User): Promise<TimeOffRequest> {
      await delay(400);
      const newRequest: TimeOffRequest = {
          ...requestData,
          id: `to${Date.now()}`,
          status: RequestStatus.PENDENTE,
          userId: currentUser.id,
          userName: currentUser.name,
      };
      TIMEOFF_REQUESTS.unshift(newRequest);
      return Promise.resolve(newRequest);
  },

  async updateTimeOffStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO, adminUser: User): Promise<TimeOffRequest> {
      await delay(300);
      const reqIndex = TIMEOFF_REQUESTS.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Solicitação não encontrada.");
      const request = TIMEOFF_REQUESTS[reqIndex];
      request.status = status;
      
      const actionType = status === RequestStatus.APROVADO ? LogActionType.APROVACAO_FOLGA : LogActionType.NEGACAO_FOLGA;
      const actionVerb = status === RequestStatus.APROVADO ? 'Aprovou' : 'Negou';
      addLog(adminUser, actionType, `${actionVerb} a solicitação de ${request.type} de '${request.userName}'.`);

      return Promise.resolve(request);
  },

  async addMeetingRequest(requestData: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>, currentUser: User): Promise<MeetingRequest> {
      await delay(400);
      const newRequest: MeetingRequest = {
          ...requestData,
          id: `m${Date.now()}`,
          status: RequestStatus.PENDENTE,
          userId: currentUser.id,
          userName: currentUser.name,
      };
      MEETING_REQUESTS.push(newRequest);
      return Promise.resolve(newRequest);
  },
  
  async updateMeetingStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO, adminUser: User): Promise<MeetingRequest> {
      await delay(300);
      const reqIndex = MEETING_REQUESTS.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Solicitação não encontrada.");
      const request = MEETING_REQUESTS[reqIndex];
      request.status = status;
      
      const actionType = status === RequestStatus.APROVADO ? LogActionType.APROVACAO_REUNIAO : LogActionType.NEGACAO_REUNIAO;
      const actionVerb = status === RequestStatus.APROVADO ? 'Aprovou' : 'Negou';
      addLog(adminUser, actionType, `${actionVerb} a solicitação de reunião de '${request.userName}' sobre "${request.topic}".`);

      return Promise.resolve(request);
  },

  async addPayslip(payslipData: Omit<Payslip, 'id' | 'fileUrl'>, adminUser: User): Promise<Payslip> {
      await delay(400);
      const employee = USERS.find(u => u.id === payslipData.userId);
      const newPayslip: Payslip = {
          ...payslipData,
          id: `p${Date.now()}`,
          fileUrl: `/payslips/new-${Date.now()}.pdf`,
      };
      PAYSLIPS.push(newPayslip);
      addLog(adminUser, LogActionType.LANCAMENTO_CONTRACHEQUE, `Lançou o contracheque de ${payslipData.month}/${payslipData.year} para '${employee?.name || 'ID desconhecido'}'.`);
      return Promise.resolve(newPayslip);
  },

  async addAnnouncement(announcementData: Omit<Announcement, 'id' | 'date'>, adminUser: User): Promise<Announcement> {
      await delay(400);
      const newAnnouncement: Announcement = {
          ...announcementData,
          id: `a${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
      };
      ANNOUNCEMENTS.unshift(newAnnouncement);
      addLog(adminUser, LogActionType.PUBLICACAO_INFORMATIVO, `Publicou o informativo: "${newAnnouncement.title}".`);
      return Promise.resolve(newAnnouncement);
  },

  async addEvent(eventData: Omit<Event, 'id'>, adminUser: User): Promise<Event> {
      await delay(400);
      const newEvent: Event = {
          ...eventData,
          id: `e${Date.now()}`,
          status: 'ACTIVE',
      };
      EVENTS.unshift(newEvent);
      EVENTS.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      addLog(adminUser, LogActionType.CRIACAO_EVENTO, `Criou o evento: "${newEvent.title}".`);
      return Promise.resolve(newEvent);
  },

  async updateEvent(eventId: string, eventUpdateData: Partial<Omit<Event, 'id'>>, adminUser: User): Promise<Event> {
      await delay(300);
      const eventIndex = EVENTS.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error("Evento não encontrado.");
      
      const originalEvent = { ...EVENTS[eventIndex] };
      const updatedEvent = { ...originalEvent, ...eventUpdateData };
      EVENTS[eventIndex] = updatedEvent;
      
      let details = `Atualizou o evento "${originalEvent.title}".`;
      if (originalEvent.status !== updatedEvent.status) {
          details = `${updatedEvent.status === 'ARCHIVED' ? 'Arquivou' : 'Reativou'} o evento "${originalEvent.title}".`;
      }

      addLog(adminUser, LogActionType.ATUALIZACAO_EVENTO, details);
      
      EVENTS.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      return Promise.resolve(updatedEvent);
  },

  async addAppNotification(userId: number, message: string, link: string): Promise<AppNotification> {
      await delay(100);
      const newNotification: AppNotification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          userId,
          message,
          link,
          read: false,
          timestamp: new Date().toISOString(),
      };
      APP_NOTIFICATIONS.unshift(newNotification);
      return Promise.resolve(newNotification);
  },

  async markNotificationsAsRead(userId: number): Promise<AppNotification[]> {
      await delay(200);
      const userNotifications = APP_NOTIFICATIONS.filter(n => n.userId === userId);
      userNotifications.forEach(n => n.read = true);
      return Promise.resolve(userNotifications);
  },
};