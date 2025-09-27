import React, { useState, useCallback, useEffect } from 'react';
import { api } from './services/api';
import { User, Role, Payslip, TimeOffRequest, MeetingRequest, Announcement, Notification as NotificationType, RequestStatus, Event, AppNotification, ImportResult } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Notification from './components/Notification';
import PasswordSetup from './components/PasswordSetup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [authFlow, setAuthFlow] = useState<'login' | 'setupPassword'>('login');
  const [userForSetup, setUserForSetup] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [sentReminders, setSentReminders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showNotification = (message: string, type: NotificationType['type']) => {
    setNotification({ id: Date.now().toString(), message, type });
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [
          usersData,
          payslipsData,
          timeOffData,
          meetingData,
          announcementsData,
          eventsData,
          notificationsData,
        ] = await Promise.all([
          api.getUsers(),
          api.getPayslips(),
          api.getTimeOffRequests(),
          api.getMeetingRequests(),
          api.getAnnouncements(),
          api.getEvents(),
          api.getAppNotifications(),
        ]);
        setUsers(usersData);
        setPayslips(payslipsData);
        setTimeOffRequests(timeOffData);
        setMeetingRequests(meetingData);
        setAnnouncements(announcementsData);
        setEvents(eventsData);
        setAppNotifications(notificationsData);
      } catch (error) {
        console.error("Failed to load initial data", error);
        showNotification("Não foi possível carregar os dados do aplicativo.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addAppNotification = useCallback(async (userId: number, message: string, link: string) => {
    try {
        const newNotification = await api.addAppNotification(userId, message, link);
        setAppNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
        console.error("Failed to add app notification:", error);
    }
  }, []);
  
  // Effect for checking and sending event reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(event => {
        if (event.reminderMinutesBefore && !sentReminders.includes(event.id) && event.status !== 'ARCHIVED') {
          const eventDate = new Date(event.dateTime);
          const reminderTime = new Date(eventDate.getTime() - event.reminderMinutesBefore * 60000);

          // Check if it's time to send the reminder and the event hasn't passed
          if (now >= reminderTime && now < eventDate) {
            event.participantIds.forEach(userId => {
              addAppNotification(
                userId,
                `Lembrete: O evento "${event.title}" começa em breve.`,
                'my-events'
              );
            });
            setSentReminders(prev => [...prev, event.id]);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [events, sentReminders, addAppNotification]);
  
  const markNotificationsAsRead = useCallback(async (userId: number) => {
    try {
        await api.markNotificationsAsRead(userId);
        setAppNotifications(prev => 
          prev.map(n => (n.userId === userId && !n.read) ? { ...n, read: true } : n)
        );
    } catch (error) {
        console.error("Failed to mark notifications as read:", error);
    }
  }, []);

  const handleLoginAttempt = async (email: string, password: string) => {
    setLoginError('');
    try {
        const user = await api.login(email, password);
        if (user.needsPasswordSetup) {
            setUserForSetup(user);
            setAuthFlow('setupPassword');
        } else {
            setCurrentUser(user);
            showNotification(`Bem-vindo(a), ${user.name}!`, 'success');
        }
    } catch (error: any) {
        setLoginError(error.message || 'Ocorreu um erro ao fazer login.');
    }
  };
  
  const handlePasswordSetup = async (email: string, newPassword: string) => {
      try {
          const updatedUser = await api.setupPassword(email, newPassword);
          setCurrentUser(updatedUser);
          setAuthFlow('login');
          setUserForSetup(null);
          showNotification(`Senha criada com sucesso! Bem-vindo(a), ${updatedUser.name}!`, 'success');
      } catch (error: any) {
          showNotification(error.message || 'Falha ao configurar a senha.', 'error');
      }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const registerEmployee = useCallback(async (name: string, email: string, emergencyPhone?: string) => {
    try {
        const newUser = await api.registerEmployee(name, email, emergencyPhone);
        setUsers(prev => [...prev, newUser]);
        showNotification(`Funcionário ${name} cadastrado com sucesso.`, 'success');
    } catch (error) {
        showNotification('Erro ao cadastrar funcionário.', 'error');
    }
  }, []);

  const importEmployees = useCallback(async (importedData: any[]): Promise<ImportResult> => {
    try {
        const { newUsers, errors } = await api.importEmployees(importedData);
        if (newUsers.length > 0) {
            setUsers(prev => [...prev, ...newUsers]);
        }
        
        const result = { successCount: newUsers.length, errors };
        
        if (result.successCount > 0 && result.errors.length === 0) {
            showNotification(`${result.successCount} funcionários importados com sucesso!`, 'success');
        } else if (result.successCount > 0 && result.errors.length > 0) {
            showNotification(`${result.successCount} importados com sucesso. ${result.errors.length} linhas com erros.`, 'info');
        } else if (result.successCount === 0 && result.errors.length > 0) {
            showNotification(`Importação falhou. ${result.errors.length} linhas com erros. Verifique o relatório.`, 'error');
        } else {
            showNotification('Nenhum funcionário novo encontrado no arquivo.', 'info');
        }
        
        return result;
    } catch (error) {
        showNotification('Ocorreu um erro inesperado durante a importação.', 'error');
        return { successCount: 0, errors: [] };
    }
  }, []);


  const updateUserStatus = useCallback(async (userId: number, status: 'ATIVO' | 'INATIVO') => {
    try {
        const updatedUser = await api.updateUserStatus(userId, status);
        setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
        showNotification(`Status de ${updatedUser.name} atualizado para ${status}.`, 'info');
    } catch (error) {
        showNotification('Erro ao atualizar status do funcionário.', 'error');
    }
  }, []);

  const resetUserPassword = useCallback(async (userId: number) => {
    try {
        const updatedUser = await api.resetUserPassword(userId);
        setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
        showNotification(`Senha de ${updatedUser.name} resetada. O usuário deverá criar uma nova senha no próximo login.`, 'success');
    } catch (error) {
        showNotification('Erro ao resetar a senha.', 'error');
    }
  }, []);

  const addTimeOffRequest = useCallback(async (request: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>) => {
    if(!currentUser) return;
    try {
        const newRequest = await api.addTimeOffRequest(request, currentUser);
        setTimeOffRequests(prev => [newRequest, ...prev]);
        showNotification('Solicitação de folga enviada com sucesso!', 'success');
        
        const hrUsers = users.filter(u => u.role === Role.RH);
        hrUsers.forEach(hr => {
            addAppNotification(hr.id, `Nova solicitação de folga de ${currentUser.name}.`, 'manage-timeoff');
        });
    } catch (error) {
        showNotification('Erro ao enviar solicitação.', 'error');
    }
  }, [currentUser, users, addAppNotification]);

  const updateTimeOffStatus = useCallback(async (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => {
    try {
        const updatedRequest = await api.updateTimeOffStatus(id, status);
        setTimeOffRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
        showNotification(`Solicitação ${status.toLowerCase()} com sucesso.`, 'info');
        addAppNotification(updatedRequest.userId, `Sua solicitação de folga de ${new Date(updatedRequest.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} foi ${status === RequestStatus.APROVADO ? 'Aprovada' : 'Negada'}.`, 'dashboard');
    } catch (error) {
        showNotification('Erro ao atualizar solicitação.', 'error');
    }
  }, [addAppNotification]);

  const addMeetingRequest = useCallback(async (request: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>) => {
    if(!currentUser) return;
    try {
        const newRequest = await api.addMeetingRequest(request, currentUser);
        setMeetingRequests(prev => [...prev, newRequest]);
        showNotification('Agendamento de reunião solicitado com sucesso!', 'success');

        const hrUsers = users.filter(u => u.role === Role.RH);
        hrUsers.forEach(hr => {
            addAppNotification(hr.id, `Nova solicitação de reunião de ${currentUser.name}.`, 'manage-meetings');
        });
    } catch (error) {
        showNotification('Erro ao solicitar agendamento.', 'error');
    }
  }, [currentUser, users, addAppNotification]);

  const updateMeetingStatus = useCallback(async (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => {
    try {
        const updatedRequest = await api.updateMeetingStatus(id, status);
        setMeetingRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
        showNotification(`Agendamento ${status.toLowerCase()} com sucesso.`, 'info');
        addAppNotification(updatedRequest.userId, `Sua reunião sobre "${updatedRequest.topic}" foi ${status === RequestStatus.APROVADO ? 'Aprovada' : 'Negada'}.`, 'dashboard');
    } catch (error) {
        showNotification('Erro ao atualizar agendamento.', 'error');
    }
  }, [addAppNotification]);

  const addPayslip = useCallback(async (payslip: Omit<Payslip, 'id' | 'fileUrl'>) => {
    try {
        const newPayslip = await api.addPayslip(payslip);
        setPayslips(prev => [...prev, newPayslip]);
        showNotification('Contracheque lançado com sucesso!', 'success');
    } catch (error) {
        showNotification('Erro ao lançar contracheque.', 'error');
    }
  }, []);
  
  const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'date'>) => {
    try {
        const newAnnouncement = await api.addAnnouncement(announcement);
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        showNotification('Informativo publicado com sucesso!', 'success');
    } catch (error) {
        showNotification('Erro ao publicar informativo.', 'error');
    }
  }, []);

  const addEvent = useCallback(async (event: Omit<Event, 'id'>) => {
    try {
        const newEvent = await api.addEvent(event);
        setEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        showNotification('Evento criado e participantes notificados com sucesso!', 'success');
    } catch (error) {
        showNotification('Erro ao criar evento.', 'error');
    }
  }, []);
  
  const updateEvent = useCallback(async (eventId: string, eventData: Partial<Omit<Event, 'id'>>) => {
    try {
        const updatedEvent = await api.updateEvent(eventId, eventData);
        setEvents(prev => {
            const newEvents = prev.map(e => (e.id === eventId ? updatedEvent : e));
            return newEvents.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        });
        const message = eventData.status ? `Evento ${eventData.status === 'ARCHIVED' ? 'arquivado' : 'reativado'} com sucesso!` : 'Evento atualizado com sucesso!';
        showNotification(message, eventData.status ? 'info' : 'success');
    } catch (error) {
        showNotification('Erro ao atualizar evento.', 'error');
    }
  }, []);

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-slate-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-600">Carregando...</p>
            </div>
        </div>
    );
  }

  if (currentUser) {
    return (
      <>
        {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          data={{ users, payslips, timeOffRequests, meetingRequests, announcements, events, appNotifications }}
          actions={{ addTimeOffRequest, updateTimeOffStatus, addMeetingRequest, updateMeetingStatus, addPayslip, addAnnouncement, registerEmployee, addEvent, updateEvent, markNotificationsAsRead, updateUserStatus, resetUserPassword, importEmployees }}
        />
      </>
    );
  }
  
  if (authFlow === 'setupPassword' && userForSetup) {
      return <PasswordSetup user={userForSetup} onSetup={handlePasswordSetup} />;
  }

  return <Login onLoginAttempt={handleLoginAttempt} error={loginError} clearError={() => setLoginError('')} />;
};

export default App;