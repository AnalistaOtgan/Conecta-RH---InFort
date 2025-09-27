import { USERS, PAYSLIPS, TIMEOFF_REQUESTS, MEETING_REQUESTS, ANNOUNCEMENTS, EVENTS, APP_NOTIFICATIONS } from '../constants';
import { User, Payslip, TimeOffRequest, MeetingRequest, Announcement, Event, AppNotification, RequestStatus, Role, ImportResult } from '../types';

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// This is a mock API service. In a real application, these functions would
// make HTTP requests to a backend server which interacts with the MySQL database.

export const api = {
  // ===================================
  // READ operations
  // ===================================
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

  async registerEmployee(name: string, email: string, emergencyPhone?: string): Promise<User> {
    await delay(500);
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
    return Promise.resolve(newUser);
  },

  async importEmployees(importedData: any[]): Promise<{ newUsers: User[]; errors: { row: number; data: any; reason: string }[] }> {
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
    }
    // FIX: The function was incorrectly typed to return ImportResult, but App.tsx expects an object with `newUsers` and `errors`.
    // The return value and type are updated to match the usage.
    return Promise.resolve({ newUsers, errors });
  },

  async updateUserStatus(userId: number, status: 'ATIVO' | 'INATIVO'): Promise<User> {
      await delay(300);
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("Usuário não encontrado.");
      USERS[userIndex].status = status;
      return Promise.resolve(USERS[userIndex]);
  },

  async resetUserPassword(userId: number): Promise<User> {
      await delay(300);
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("Usuário não encontrado.");
      USERS[userIndex].needsPasswordSetup = true;
      USERS[userIndex].password = undefined;
      return Promise.resolve(USERS[userIndex]);
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

  async updateTimeOffStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO): Promise<TimeOffRequest> {
      await delay(300);
      const reqIndex = TIMEOFF_REQUESTS.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Solicitação não encontrada.");
      TIMEOFF_REQUESTS[reqIndex].status = status;
      return Promise.resolve(TIMEOFF_REQUESTS[reqIndex]);
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
  
  async updateMeetingStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO): Promise<MeetingRequest> {
      await delay(300);
      const reqIndex = MEETING_REQUESTS.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Solicitação não encontrada.");
      MEETING_REQUESTS[reqIndex].status = status;
      return Promise.resolve(MEETING_REQUESTS[reqIndex]);
  },

  async addPayslip(payslipData: Omit<Payslip, 'id' | 'fileUrl'>): Promise<Payslip> {
      await delay(400);
      const newPayslip: Payslip = {
          ...payslipData,
          id: `p${Date.now()}`,
          fileUrl: `/payslips/new-${Date.now()}.pdf`,
      };
      PAYSLIPS.push(newPayslip);
      return Promise.resolve(newPayslip);
  },

  async addAnnouncement(announcementData: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> {
      await delay(400);
      const newAnnouncement: Announcement = {
          ...announcementData,
          id: `a${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
      };
      ANNOUNCEMENTS.unshift(newAnnouncement);
      return Promise.resolve(newAnnouncement);
  },

  async addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
      await delay(400);
      const newEvent: Event = {
          ...eventData,
          id: `e${Date.now()}`,
          status: 'ACTIVE',
      };
      EVENTS.unshift(newEvent);
      EVENTS.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      return Promise.resolve(newEvent);
  },

  async updateEvent(eventId: string, eventUpdateData: Partial<Omit<Event, 'id'>>): Promise<Event> {
      await delay(300);
      const eventIndex = EVENTS.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error("Evento não encontrado.");
      
      const updatedEvent = { ...EVENTS[eventIndex], ...eventUpdateData };
      EVENTS[eventIndex] = updatedEvent;
      
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