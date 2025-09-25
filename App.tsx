import React, { useState, useCallback, useEffect } from 'react';
import { USERS, PAYSLIPS, TIMEOFF_REQUESTS, MEETING_REQUESTS, ANNOUNCEMENTS, EVENTS, APP_NOTIFICATIONS } from './constants';
import { User, Role, Payslip, TimeOffRequest, MeetingRequest, Announcement, Notification as NotificationType, RequestStatus, Event, AppNotification } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Notification from './components/Notification';
import PasswordSetup from './components/PasswordSetup';

interface ImportResult {
  successCount: number;
  errors: { row: number; data: any; reason: string }[];
}


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [payslips, setPayslips] = useState<Payslip[]>(PAYSLIPS);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(TIMEOFF_REQUESTS);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>(MEETING_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(APP_NOTIFICATIONS);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [authFlow, setAuthFlow] = useState<'login' | 'setupPassword'>('login');
  const [userForSetup, setUserForSetup] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');

  const showNotification = (message: string, type: NotificationType['type']) => {
    setNotification({ id: Date.now().toString(), message, type });
  };
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addAppNotification = useCallback((userId: number, message: string, link: string) => {
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      message,
      link,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setAppNotifications(prev => [newNotification, ...prev]);
  }, []);
  
  const markNotificationsAsRead = useCallback((userId: number) => {
    setAppNotifications(prev => 
      prev.map(n => (n.userId === userId && !n.read) ? { ...n, read: true } : n)
    );
  }, []);

  const handleLoginAttempt = (email: string, password: string) => {
    // Provisional staging logins
    if (email === 'email@email.com' && password === 'senha123') {
        if (users.length > 0) {
            setCurrentUser(users[0]);
            showNotification(`Bem-vindo(a), ${users[0].name}!`, 'success');
            return;
        }
    }
    if (email === 'admin@email.com' && password === 'admin123') {
        const adminUser = users.find(u => u.role === Role.RH);
        if (adminUser) {
            setCurrentUser(adminUser);
            showNotification(`Bem-vindo(a), ${adminUser.name}!`, 'success');
            return;
        }
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setLoginError('Email ou senha inválidos.');
      return;
    }

    if (user.status === 'INATIVO') {
      setLoginError('Sua conta está desativada. Entre em contato com o RH.');
      return;
    }

    if (user.needsPasswordSetup) {
        setUserForSetup(user);
        setAuthFlow('setupPassword');
        return;
    }

    if (user.password === password) {
      setCurrentUser(user);
      showNotification(`Bem-vindo(a), ${user.name}!`, 'success');
    } else {
      setLoginError('Email ou senha inválidos.');
    }
  };
  
  const handlePasswordSetup = (email: string, newPassword: string) => {
      let updatedUser: User | null = null;
      setUsers(prevUsers => prevUsers.map(u => {
          if (u.email === email) {
              updatedUser = { ...u, password: newPassword, needsPasswordSetup: false };
              return updatedUser;
          }
          return u;
      }));
      
      if (updatedUser) {
          setCurrentUser(updatedUser);
          setAuthFlow('login');
          setUserForSetup(null);
          showNotification(`Senha criada com sucesso! Bem-vindo(a), ${updatedUser.name}!`, 'success');
      }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const registerEmployee = useCallback((name: string, email: string, emergencyPhone?: string) => {
    const newUser: User = {
        id: Date.now(),
        name,
        email,
        role: Role.FUNCIONARIO,
        needsPasswordSetup: true,
        status: 'ATIVO',
        emergencyPhone: emergencyPhone || undefined,
    };
    setUsers(prev => [...prev, newUser]);
    showNotification(`Funcionário ${name} cadastrado com sucesso.`, 'success');
  }, []);

  const importEmployees = useCallback((importedData: any[]): ImportResult => {
    const newUsers: User[] = [];
    const errors: { row: number; data: any; reason: string }[] = [];
    const existingEmails = new Set(users.map(u => u.email.toLowerCase()));

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
        id: Date.now() + index, // Ensure unique ID
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
  }, [users]);


  const updateUserStatus = useCallback((userId: number, status: 'ATIVO' | 'INATIVO') => {
    let userName = '';
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        userName = u.name;
        return { ...u, status };
      }
      return u;
    }));
    showNotification(`Status de ${userName} atualizado para ${status}.`, 'info');
  }, []);

  const resetUserPassword = useCallback((userId: number) => {
    let userName = '';
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        userName = u.name;
        return { ...u, needsPasswordSetup: true, password: undefined };
      }
      return u;
    }));
    showNotification(`Senha de ${userName} resetada. O usuário deverá criar uma nova senha no próximo login.`, 'success');
  }, []);

  const addTimeOffRequest = useCallback((request: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>) => {
    if(!currentUser) return;
    const newRequest: TimeOffRequest = {
      ...request,
      id: `to${Date.now()}`,
      status: RequestStatus.PENDENTE,
      userId: currentUser.id,
      userName: currentUser.name,
    };
    setTimeOffRequests(prev => [newRequest, ...prev]);
    showNotification('Solicitação de folga enviada com sucesso!', 'success');
    
    const hrUsers = users.filter(u => u.role === Role.RH);
    hrUsers.forEach(hr => {
        addAppNotification(hr.id, `Nova solicitação de folga de ${currentUser.name}.`, 'manage-timeoff');
    });
  }, [currentUser, users, addAppNotification]);

  const updateTimeOffStatus = useCallback((id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => {
    const request = timeOffRequests.find(req => req.id === id);
    if (request) {
        addAppNotification(request.userId, `Sua solicitação de folga de ${new Date(request.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} foi ${status === RequestStatus.APROVADO ? 'Aprovada' : 'Negada'}.`, 'dashboard');
    }
    setTimeOffRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    showNotification(`Solicitação ${status.toLowerCase()} com sucesso.`, 'info');
  }, [timeOffRequests, addAppNotification]);

  const addMeetingRequest = useCallback((request: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>) => {
    if(!currentUser) return;
    const newRequest: MeetingRequest = {
      ...request,
      id: `m${Date.now()}`,
      status: RequestStatus.PENDENTE,
      userId: currentUser.id,
      userName: currentUser.name,
    };
    setMeetingRequests(prev => [...prev, newRequest]);
    showNotification('Agendamento de reunião solicitado com sucesso!', 'success');

    const hrUsers = users.filter(u => u.role === Role.RH);
    hrUsers.forEach(hr => {
        addAppNotification(hr.id, `Nova solicitação de reunião de ${currentUser.name}.`, 'manage-meetings');
    });
  }, [currentUser, users, addAppNotification]);

  const updateMeetingStatus = useCallback((id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => {
    const request = meetingRequests.find(req => req.id === id);
    if (request) {
        addAppNotification(request.userId, `Sua reunião sobre "${request.topic}" foi ${status === RequestStatus.APROVADO ? 'Aprovada' : 'Negada'}.`, 'dashboard');
    }
    setMeetingRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    showNotification(`Agendamento ${status.toLowerCase()} com sucesso.`, 'info');
  }, [meetingRequests, addAppNotification]);

  const addPayslip = useCallback((payslip: Omit<Payslip, 'id' | 'fileUrl'>) => {
    const newPayslip: Payslip = {
      ...payslip,
      id: `p${Date.now()}`,
      fileUrl: `/payslips/new-${Date.now()}.pdf`,
    };
    setPayslips(prev => [...prev, newPayslip]);
    showNotification('Contracheque lançado com sucesso!', 'success');
  }, []);
  
  const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `a${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    showNotification('Informativo publicado com sucesso!', 'success');
  }, []);

  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
        ...event,
        id: `e${Date.now()}`,
    };
    setEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    showNotification('Evento criado e participantes notificados com sucesso!', 'success');
  }, []);

  if (currentUser) {
    return (
      <>
        {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          data={{ users, payslips, timeOffRequests, meetingRequests, announcements, events, appNotifications }}
          actions={{ addTimeOffRequest, updateTimeOffStatus, addMeetingRequest, updateMeetingStatus, addPayslip, addAnnouncement, registerEmployee, addEvent, markNotificationsAsRead, updateUserStatus, resetUserPassword, importEmployees }}
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