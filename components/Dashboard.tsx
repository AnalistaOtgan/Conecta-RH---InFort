import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User, Role, Payslip, TimeOffRequest, MeetingRequest, Announcement, RequestStatus, Event, AppNotification, ImportResult, LogEntry } from '../types';
import Header from './shared/Header';
import Sidebar from './shared/Sidebar';
import EmployeeDashboard from './employee/EmployeeDashboard';
import Payslips from './employee/Payslips';
import RequestTimeOff from './employee/RequestTimeOff';
import ScheduleMeeting from './employee/ScheduleMeeting';
import HRDashboard from './hr/HRDashboard';
import ManageTimeOff from './hr/ManageTimeOff';
import ManageMeetings from './hr/ManageMeetings';
import UploadPayslip from './hr/UploadPayslip';
import PostAnnouncement from './hr/PostAnnouncement';
import Announcements from './shared/Announcements';
import ManageEvents from './hr/ManageEvents';
import MyEvents from './employee/MyEvents';
import ManageEmployees from './hr/ManageEmployees';
import FeedbackSystem from './hr/FeedbackSystem';
import ActivityLog from './hr/ActivityLog';
import BatchUploadPayslip from './hr/BatchUploadPayslip';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  data: {
    users: User[];
    payslips: Payslip[];
    timeOffRequests: TimeOffRequest[];
    meetingRequests: MeetingRequest[];
    announcements: Announcement[];
    events: Event[];
    appNotifications: AppNotification[];
    logs: LogEntry[];
  };
  actions: {
    addTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
    updateTimeOffStatus: (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => void;
    addMeetingRequest: (request: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
    updateMeetingStatus: (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => void;
    addPayslip: (payslip: Omit<Payslip, 'id' | 'fileUrl'>) => void;
    addBatchPayslips: (payslips: Omit<Payslip, 'id' | 'fileUrl'>[]) => Promise<{ successCount: number }>;
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
    registerEmployee: (name: string, email: string, cpf: string, emergencyPhone?: string) => void;
    addEvent: (event: Omit<Event, 'id'>) => void;
    updateEvent: (eventId: string, eventData: Partial<Omit<Event, 'id'>>) => void;
    markNotificationsAsRead: (userId: number) => void;
    updateUserStatus: (userId: number, status: 'ATIVO' | 'INATIVO') => void;
    resetUserPassword: (userId: number) => void;
    importEmployees: (data: any[]) => Promise<ImportResult>;
    updateUserRole: (userId: number, role: Role) => void;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, data, actions }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderRoutes = () => {
    const employees = data.users.filter(u => u.role === Role.FUNCIONARIO);
    if (user.role === Role.FUNCIONARIO) {
      return (
        <Routes>
          <Route path="/dashboard" element={<EmployeeDashboard user={user} announcements={data.announcements} />} />
          <Route path="/payslips" element={<Payslips payslips={data.payslips.filter(p => p.userId === user.id)} />} />
          <Route path="/request-timeoff" element={<RequestTimeOff onSubmit={actions.addTimeOffRequest} />} />
          <Route path="/schedule-meeting" element={<ScheduleMeeting onSubmit={actions.addMeetingRequest} />} />
          <Route path="/announcements" element={<Announcements announcements={data.announcements} />} />
          <Route path="/my-events" element={<MyEvents events={data.events.filter(e => e.participantIds.includes(user.id) && e.status !== 'ARCHIVED')} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    } else if (user.role === Role.RH) {
      const hrUsers = data.users.filter(u => u.role === Role.RH);
      return (
        <Routes>
          <Route path="/dashboard" element={<HRDashboard timeOffRequests={data.timeOffRequests} meetingRequests={data.meetingRequests} />} />
          <Route path="/payslips" element={<Payslips payslips={data.payslips.filter(p => p.userId === user.id)} />} />
          <Route path="/announcements" element={<Announcements announcements={data.announcements} />} />
          <Route path="/feedback-system" element={<FeedbackSystem />} />
          <Route path="/manage-timeoff" element={<ManageTimeOff requests={data.timeOffRequests} onUpdateStatus={actions.updateTimeOffStatus} employees={employees} />} />
          <Route path="/manage-meetings" element={<ManageMeetings requests={data.meetingRequests} onUpdateStatus={actions.updateMeetingStatus} employees={employees} />} />
          <Route path="/upload-payslip" element={<UploadPayslip employees={employees} onSubmit={actions.addPayslip} />} />
          <Route path="/batch-upload-payslip" element={<BatchUploadPayslip users={data.users} payslips={data.payslips} onImport={actions.addBatchPayslips} />} />
          <Route path="/post-announcement" element={<PostAnnouncement onSubmit={actions.addAnnouncement} />} />
          <Route path="/manage-employees" element={<ManageEmployees users={data.users} onUpdateStatus={actions.updateUserStatus} onResetPassword={actions.resetUserPassword} onImport={actions.importEmployees} onRegister={actions.registerEmployee} onUpdateRole={actions.updateUserRole} />} />
          <Route path="/manage-events" element={<ManageEvents events={data.events} employees={employees} onCreate={actions.addEvent} onUpdate={actions.updateEvent} />} />
          <Route path="/activity-log" element={<ActivityLog logs={data.logs} adminUsers={hrUsers} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar user={user} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={user} 
            onLogout={onLogout} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            data={data}
            markNotificationsAsRead={() => actions.markNotificationsAsRead(user.id)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          {renderRoutes()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;