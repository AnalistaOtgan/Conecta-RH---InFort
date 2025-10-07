// services/api.ts

import { supabaseClient } from './supabaseClient';
import { User, Payslip, TimeOffRequest, MeetingRequest, Announcement, Event, AppNotification, RequestStatus, Role, LogActionType, LogEntry, MedicalCertificate } from '../types';

// Internal logging function
const addLog = async (admin: User, action: LogActionType, details: string) => {
    const logEntry = {
        admin_id: admin.id,
        admin_name: admin.name,
        action,
        details,
    };
    const { error } = await supabaseClient.from('logs').insert(logEntry);
    if (error) {
        console.error("Failed to add log:", error.message);
    }
};


// The API service now uses Supabase instead of mock data.
export const api = {
  // ===================================
  // READ operations
  // ===================================
  async getLogs(): Promise<LogEntry[]> {
    const { data, error } = await supabaseClient.from('logs').select('*').order('timestamp', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },
  
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabaseClient.from('users').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },

  async getPayslips(): Promise<Payslip[]> {
    const { data, error } = await supabaseClient.from('payslips').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },

  async getTimeOffRequests(): Promise<TimeOffRequest[]> {
    const { data, error } = await supabaseClient.from('timeoff_requests').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },

  async getMedicalCertificates(): Promise<MedicalCertificate[]> {
    const { data, error } = await supabaseClient.from('medical_certificates').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },
  
  async getMeetingRequests(): Promise<MeetingRequest[]> {
    const { data, error } = await supabaseClient.from('meeting_requests').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabaseClient.from('announcements').select('*').order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },
  
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabaseClient.from('events').select('*');
    if (error) throw new Error(error.message);
    return (data as any) || [];
  },

  async getAppNotifications(): Promise<AppNotification[]> {
      const { data, error } = await supabaseClient.from('app_notifications').select('*').order('timestamp', { ascending: false });
      if (error) throw new Error(error.message);
      return (data as any) || [];
  },

  // ===================================
  // AUTH operations
  // ===================================
  async login(loginIdentifier: string, password?: string): Promise<User> {
      // Step 1: Find the user in our public.users table
      const { data: rpcData, error: rpcError } = await supabaseClient
        .rpc('get_user_for_login', { identifier: loginIdentifier });
      
      if (rpcError || !rpcData || rpcData.length === 0) {
          throw new Error('Email/Matrícula ou senha inválidos.');
      }

      const userProfile = rpcData[0];

      if (userProfile.status === 'INATIVO') {
          throw new Error('Sua conta está desativada. Entre em contato com o RH.');
      }
      
      // Step 2: Handle first-time login (needs to set up a password)
      if (userProfile.needs_password_setup) {
          if (password && password.length > 0) {
              throw new Error('Você precisa criar uma senha antes de fazer login, deixe o campo senha em branco.');
          }
          return userProfile as User; // Proceed to setup screen
      }

      // Step 3: Handle existing user login - password is now mandatory
      if (!password || password.length === 0) {
          throw new Error('Senha é obrigatória.');
      }

      // Step 4: Authenticate with Supabase Auth
      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: userProfile.email,
          password: password,
      });

      // Step 5: Verify that authentication was successful and a session was created
      if (signInError || !data.session) {
          throw new Error('Email/Matrícula ou senha inválidos.');
      }
      
      // Step 6: Success, return the user profile from our table
      return userProfile as User;
  },

  async logout(): Promise<void> {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        // Log the error but don't prevent the user from being logged out on the client-side.
        console.error("Error signing out from Supabase:", error.message);
    }
  },

  async setupPassword(email: string, newPassword: string): Promise<User> {
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (profileError || !userProfile) throw new Error('Usuário não encontrado.');
      
      const { error: signUpError } = await supabaseClient.auth.signUp({
          email: userProfile.email,
          password: newPassword,
      });

      if (signUpError && !signUpError.message.includes("User already registered")) {
          throw new Error(`Falha ao criar usuário de autenticação: ${signUpError.message}`);
      }
      
      if (signUpError?.message.includes("User already registered")) {
        const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (updateError) throw new Error(`Falha ao atualizar a senha: ${updateError.message}`);
      }

      const { data: updatedProfile, error: updateProfileError } = await supabaseClient
          .from('users')
          .update({ needs_password_setup: false })
          .eq('id', userProfile.id)
          .select()
          .single();

      if (updateProfileError) throw new Error('Falha ao finalizar a configuração do perfil.');

      return updatedProfile as User;
  },

  // ===================================
  // WRITE operations
  // ===================================
  async registerEmployee(name: string, email: string, matricula: string, adminUser: User, emergencyPhone?: string, birthDate?: string): Promise<User> {
    const { data, error } = await supabaseClient.rpc('create_new_user', {
        p_name: name,
        p_email: email,
        p_matricula: matricula,
        p_emergency_phone: emergencyPhone || null,
        p_birth_date: birthDate || null,
    });
    
    if (error) {
        throw new Error(error.message.includes('unique constraint') ? 'Email ou Matrícula já existem.' : error.message);
    }
    if (!data || data.length === 0) {
        throw new Error('Não foi possível criar o usuário. Ocorreu um erro inesperado.');
    }
    
    await addLog(adminUser, LogActionType.CADASTRO_USUARIO, `Cadastrou o novo usuário '${name}' (Matrícula: ${matricula}, Email: ${email}).`);
    // The RPC function returns an array, even for a single new user. We take the first element.
    return data[0] as User;
  },

  async importEmployees(importedData: any[], adminUser: User): Promise<{ newUsers: User[]; errors: { row: number; data: any; reason: string }[] }> {
    const errors: { row: number; data: any; reason: string }[] = [];
    
    const { data: activeUsers, error: fetchError } = await supabaseClient.from('users').select('email, matricula').eq('status', 'ATIVO');
    if (fetchError) throw new Error(fetchError.message);

    const existingEmails = new Set(activeUsers?.map(u => u.email.toLowerCase()));
    const existingMatriculas = new Set(activeUsers?.map(u => u.matricula));

    const { data: maxMatriculaData, error: maxMatriculaError } = await supabaseClient.from('users').select('matricula').order('matricula', { ascending: false }).limit(1).single();
    if(maxMatriculaError && maxMatriculaError.code !== 'PGRST116') throw new Error(maxMatriculaError.message);
    let maxMatricula = maxMatriculaData ? parseInt(maxMatriculaData.matricula, 10) : 0;
    
    const usersToInsert: any[] = [];
    const matriculasInThisBatch = new Set<string>();

    importedData.forEach((row, index) => {
        const name = row['Nome Completo'];
        const email = row['Email'];
        const matricula = row['Matrícula'] ? String(row['Matrícula']) : null;
        const birthDateRaw = row['Data de Nascimento'];
        const emergencyPhone = row['Telefone de Emergencia'];
        const rowIndex = index + 2;

        if (!name || !email) {
            errors.push({ row: rowIndex, data: row, reason: 'Nome Completo e Email são obrigatórios.' });
            return;
        }
        if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            errors.push({ row: rowIndex, data: row, reason: 'Formato de email inválido.' });
            return;
        }
        const lowercasedEmail = email.toLowerCase();
        if (existingEmails.has(lowercasedEmail) || usersToInsert.some(u => u.email.toLowerCase() === lowercasedEmail)) {
            errors.push({ row: rowIndex, data: row, reason: 'Email já cadastrado.' });
            return;
        }
        
        let finalMatricula = '';
        if (matricula) {
            if (!/^\d{6}$/.test(matricula)) {
                errors.push({ row: rowIndex, data: row, reason: 'Matrícula deve conter 6 dígitos.' });
                return;
            }
            if (existingMatriculas.has(matricula) || matriculasInThisBatch.has(matricula)) {
                errors.push({ row: rowIndex, data: row, reason: 'Matrícula já cadastrada.' });
                return;
            }
            finalMatricula = matricula;
        } else {
            maxMatricula++;
            finalMatricula = String(maxMatricula).padStart(6, '0');
        }
        matriculasInThisBatch.add(finalMatricula);
        
        let birth_date: string | null = null;
        if (birthDateRaw instanceof Date) {
            birth_date = birthDateRaw.toISOString().split('T')[0];
        } else if (typeof birthDateRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(birthDateRaw)) {
            birth_date = birthDateRaw;
        }
        
        usersToInsert.push({ name: String(name), email, cpf: String(Date.now() + index).slice(-11), matricula: finalMatricula, role: Role.FUNCIONARIO, needs_password_setup: true, status: 'ATIVO', emergency_phone: emergencyPhone ? String(emergencyPhone) : null, birth_date });
    });
    
    if (usersToInsert.length === 0) {
        return { newUsers: [], errors };
    }

    const { data: newUsers, error: insertError } = await supabaseClient.rpc('import_new_users', { users_to_add: usersToInsert });
    
    if (insertError) throw new Error(insertError.message);
    if (newUsers && newUsers.length > 0) {
      await addLog(adminUser, LogActionType.IMPORTACAO_USUARIOS, `Importou ${newUsers.length} novo(s) usuário(s).`);
    }

    return { newUsers: (newUsers as any) || [], errors };
  },

  async updateUserStatus(userId: number, status: 'ATIVO' | 'INATIVO', adminUser: User): Promise<User> {
      const { data, error } = await supabaseClient.from('users').update({ status }).eq('id', userId).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.ATUALIZACAO_STATUS_USUARIO, `Alterou o status de '${data.name}' para ${status}.`);
      return data as User;
  },

  async resetUserPassword(userId: number, adminUser: User): Promise<User> {
      const { data, error } = await supabaseClient.from('users').update({ needs_password_setup: true }).eq('id', userId).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.RESET_SENHA, `Resetou a senha de '${data.name}'.`);
      return data as User;
  },

  async updateUserRole(userId: number, role: Role, adminUser: User): Promise<User> {
      const { data: targetUser, error: fetchError } = await supabaseClient.from('users').select('role, name').eq('id', userId).single();
      if (fetchError) throw new Error(fetchError.message);
      if (adminUser.role === Role.RH && (role === Role.ADMIN || targetUser.role === Role.ADMIN)) {
          throw new Error("RH não pode alterar ou atribuir o cargo de Administrador.");
      }
      const { data, error } = await supabaseClient.from('users').update({ role }).eq('id', userId).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.PROMOCAO_CARGO, `Alterou o cargo de '${data.name}' para ${role}.`);
      return data as User;
  },

  async updateEmployee(userId: number, data: Partial<Pick<User, 'name' | 'email' | 'emergencyPhone' | 'matricula' | 'birthDate'>>, adminUser: User): Promise<User> {
      const updatePayload: any = { ...data };
      if (data.emergencyPhone) { updatePayload.emergency_phone = data.emergencyPhone; delete updatePayload.emergencyPhone; }
      if (data.birthDate) { updatePayload.birth_date = data.birthDate; delete updatePayload.birthDate; }

      const { data: updatedUser, error } = await supabaseClient.from('users').update(updatePayload).eq('id', userId).select().single();
      if (error) throw new Error(error.message.includes('unique constraint') ? 'Email ou Matrícula já existem.' : error.message);
      await addLog(adminUser, LogActionType.ATUALIZACAO_DADOS_USUARIO, `Atualizou os dados de '${updatedUser.name}'.`);
      return updatedUser as User;
  },

  async deleteUser(userId: number, adminUser: User): Promise<void> {
      if (userId === adminUser.id) throw new Error("Não é possível excluir a própria conta.");
      const { data: userToDelete, error: fetchError } = await supabaseClient.from('users').select('name').eq('id', userId).single();
      if (fetchError) throw new Error(fetchError.message);
      const { error } = await supabaseClient.from('users').delete().eq('id', userId);
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.EXCLUSAO_PERMANENTE, `Excluiu o usuário: "${userToDelete.name}".`);
  },

  async addTimeOffRequest(requestData: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>, currentUser: User): Promise<TimeOffRequest> {
      const payload = { ...requestData, status: RequestStatus.PENDENTE, user_id: currentUser.id, user_name: currentUser.name, start_date: requestData.startDate, end_date: requestData.endDate, approved_by_leader: requestData.approvedByLeader };
      const { data, error } = await supabaseClient.from('timeoff_requests').insert(payload).select().single();
      if (error) throw new Error(error.message);
      return data as TimeOffRequest;
  },

  async updateTimeOffStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO, adminUser: User): Promise<TimeOffRequest> {
      const { data, error } = await supabaseClient.from('timeoff_requests').update({ status }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      const actionType = status === RequestStatus.APROVADO ? LogActionType.APROVACAO_FOLGA : LogActionType.NEGACAO_FOLGA;
      await addLog(adminUser, actionType, `${status === 'Aprovado' ? 'Aprovou' : 'Negou'} a solicitação de ${data.type} de '${data.user_name}'.`);
      return data as TimeOffRequest;
  },
  
  async addMedicalCertificate(requestData: Omit<MedicalCertificate, 'id' | 'status' | 'userName' | 'userId' | 'submissionDate' | 'fileUrl'>, currentUser: User): Promise<MedicalCertificate> {
    const payload = { ...requestData, status: RequestStatus.PENDENTE, user_id: currentUser.id, user_name: currentUser.name, submission_date: new Date().toISOString(), file_url: `/certificates/med-cert-${Date.now()}.pdf`, start_date: requestData.startDate, cid_code: requestData.cidCode };
    const { data, error } = await supabaseClient.from('medical_certificates').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data as MedicalCertificate;
  },

  async updateMedicalCertificateStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO, adminUser: User): Promise<MedicalCertificate> {
      const { data, error } = await supabaseClient.from('medical_certificates').update({ status }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      const actionType = status === RequestStatus.APROVADO ? LogActionType.APROVACAO_ATESTADO : LogActionType.NEGACAO_ATESTADO;
      await addLog(adminUser, actionType, `${status === 'Aprovado' ? 'Aprovou' : 'Negou'} o atestado de '${data.user_name}'.`);
      return data as MedicalCertificate;
  },

  async addMeetingRequest(requestData: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>, currentUser: User): Promise<MeetingRequest> {
      const payload = { ...requestData, status: RequestStatus.PENDENTE, user_id: currentUser.id, user_name: currentUser.name, preferred_date_time: requestData.preferredDateTime };
      const { data, error } = await supabaseClient.from('meeting_requests').insert(payload).select().single();
      if (error) throw new Error(error.message);
      return data as MeetingRequest;
  },
  
  async updateMeetingStatus(id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO, adminUser: User): Promise<MeetingRequest> {
      const { data, error } = await supabaseClient.from('meeting_requests').update({ status }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      const actionType = status === RequestStatus.APROVADO ? LogActionType.APROVACAO_REUNIAO : LogActionType.NEGACAO_REUNIAO;
      await addLog(adminUser, actionType, `${status === 'Aprovado' ? 'Aprovou' : 'Negou'} a reunião de '${data.user_name}'.`);
      return data as MeetingRequest;
  },

  async addPayslip(payslipData: Omit<Payslip, 'id' | 'fileUrl'>, adminUser: User): Promise<Payslip> {
      const payload = { ...payslipData, user_id: payslipData.userId, file_url: `/payslips/new-${Date.now()}.pdf` };
      const { data, error } = await supabaseClient.from('payslips').upsert(payload, { onConflict: 'user_id, month, year' }).select().single();
      if (error) throw new Error(error.message);
      const { data: employee } = await supabaseClient.from('users').select('name').eq('id', payslipData.userId).single();
      await addLog(adminUser, LogActionType.LANCAMENTO_CONTRACHEQUE, `Lançou o contracheque de ${payslipData.month}/${payslipData.year} para '${employee?.name || 'ID desconhecido'}'.`);
      return data as Payslip;
  },

  async addBatchPayslips(payslipsData: Omit<Payslip, 'id' | 'fileUrl'>[], adminUser: User): Promise<{ newPayslips: Payslip[], successCount: number }> {
      const payloads = payslipsData.map((p, i) => ({ ...p, user_id: p.userId, file_url: `/payslips/batch-${Date.now()}-${i}.pdf` }));
      const { data, error } = await supabaseClient.from('payslips').upsert(payloads, { onConflict: 'user_id, month, year' }).select();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.LANCAMENTO_CONTRACHEQUE, `Lançou ${data?.length || 0} contracheque(s) em lote.`);
      return { newPayslips: data as Payslip[], successCount: data?.length || 0 };
  },

  async addAnnouncement(announcementData: Omit<Announcement, 'id' | 'date'>, adminUser: User): Promise<Announcement> {
      const payload = { ...announcementData, date: new Date().toISOString().split('T')[0], status: 'ACTIVE', image_url: announcementData.imageUrl };
      const { data, error } = await supabaseClient.from('announcements').insert(payload).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.PUBLICACAO_INFORMATIVO, `Publicou o informativo: "${data.title}".`);
      return data as Announcement;
  },

  async updateAnnouncementStatus(announcementId: string, status: 'ACTIVE' | 'ARCHIVED', adminUser: User): Promise<Announcement> {
      const { data, error } = await supabaseClient.from('announcements').update({ status }).eq('id', announcementId).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.ARQUIVAMENTO_REGISTRO, `${status === 'ARCHIVED' ? 'Arquivou' : 'Reativou'} o informativo: "${data.title}".`);
      return data as Announcement;
  },

  async deleteAnnouncement(announcementId: string, adminUser: User): Promise<void> {
      const { data, error: fetchError } = await supabaseClient.from('announcements').select('title').eq('id', announcementId).single();
      if (fetchError) throw new Error(fetchError.message);
      const { error } = await supabaseClient.from('announcements').delete().eq('id', announcementId);
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.EXCLUSAO_PERMANENTE, `Excluiu o informativo: "${data.title}".`);
  },

  async addEvent(eventData: Omit<Event, 'id'>, adminUser: User): Promise<Event> {
      const payload = { ...eventData, status: 'ACTIVE', date_time: eventData.dateTime, participant_ids: eventData.participantIds, reminder_minutes_before: eventData.reminderMinutesBefore };
      const { data, error } = await supabaseClient.from('events').insert(payload).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.CRIACAO_EVENTO, `Criou o evento: "${data.title}".`);
      return data as Event;
  },

  async updateEvent(eventId: string, eventUpdateData: Partial<Omit<Event, 'id'>>, adminUser: User): Promise<Event> {
      const payload: any = { ...eventUpdateData };
      if (eventUpdateData.dateTime) { payload.date_time = eventUpdateData.dateTime; delete payload.dateTime; }
      if (eventUpdateData.participantIds) { payload.participant_ids = eventUpdateData.participantIds; delete payload.participantIds; }
      if (eventUpdateData.reminderMinutesBefore) { payload.reminder_minutes_before = eventUpdateData.reminderMinutesBefore; delete payload.reminderMinutesBefore; }
      
      const { data, error } = await supabaseClient.from('events').update(payload).eq('id', eventId).select().single();
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.ATUALIZACAO_EVENTO, `Atualizou o evento "${data.title}".`);
      return data as Event;
  },

  async deleteEvent(eventId: string, adminUser: User): Promise<void> {
      const { data, error: fetchError } = await supabaseClient.from('events').select('title').eq('id', eventId).single();
      if (fetchError) throw new Error(fetchError.message);
      const { error } = await supabaseClient.from('events').delete().eq('id', eventId);
      if (error) throw new Error(error.message);
      await addLog(adminUser, LogActionType.EXCLUSAO_PERMANENTE, `Excluiu o evento: "${data.title}".`);
  },

  async addAppNotification(userId: number, message: string, link: string): Promise<AppNotification> {
      const { data, error } = await supabaseClient.from('app_notifications').insert({ user_id: userId, message, link, read: false }).select().single();
      if (error) throw new Error(error.message);
      return data as AppNotification;
  },

  async markNotificationsAsRead(userId: number): Promise<AppNotification[]> {
      const { data, error } = await supabaseClient.from('app_notifications').update({ read: true }).eq('user_id', userId).eq('read', false).select();
      if (error) throw new Error(error.message);
      return (data as any) || [];
  },
};