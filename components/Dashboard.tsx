
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

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, announcement }) => {
  if (!isOpen || !announcement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {announcement.imageUrl && (
          <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-64 object-cover flex-shrink-0" />
        )}
        <div className="p-6 relative overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 z-10">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <p className="text-sm text-slate-500 mb-2">{new Date(announcement.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
            <h2 id="modal-title" className="text-2xl font-bold text-slate-900 mb-4 pr-8">{announcement.title}</h2>
            {announcement.content && (
              <p className="text-slate-600 text-base" style={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
            )}
        </div>
      </div>
    </div>
  );
};

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
    deleteUser: (userId: number) => void;
    deleteEvent: (eventId: string) => void;
    updateAnnouncementStatus: (announcementId: string, status: 'ACTIVE' | 'ARCHIVED') => void;
    deleteAnnouncement: (announcementId: string) => void;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, data, actions }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleOpenAnnouncement = (ann: Announcement) => setSelectedAnnouncement(ann);
  const handleCloseAnnouncement = () => setSelectedAnnouncement(null);

  const renderRoutes = () => {
    if (user.role === Role.FUNCIONARIO) {
      return (
        <Routes>
          <Route path="/dashboard" element={<EmployeeDashboard user={user} announcements={data.announcements.filter(a => a.status !== 'ARCHIVED')} onAnnouncementClick={handleOpenAnnouncement} />} />
          <Route path="/payslips" element={<Payslips payslips={data.payslips.filter(p => p.userId === user.id)} />} />
          <Route path="/request-timeoff" element={<RequestTimeOff onSubmit={actions.addTimeOffRequest} />} />
          <Route path="/schedule-meeting" element={<ScheduleMeeting onSubmit={actions.addMeetingRequest} />} />
          <Route path="/announcements" element={<Announcements user={user} announcements={data.announcements.filter(a => a.status !== 'ARCHIVED')} onAnnouncementClick={handleOpenAnnouncement} onUpdateStatus={actions.updateAnnouncementStatus} onDelete={actions.deleteAnnouncement} />} />
          <Route path="/my-events" element={<MyEvents events={data.events.filter(e => e.participantIds.includes(user.id) && e.status !== 'ARCHIVED')} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      );
    } else if (user.role === Role.RH || user.role === Role.ADMIN) {
      const employeesForPayslip = user.role === Role.ADMIN
        ? data.users.filter(u => u.role === Role.RH || u.role === Role.ADMIN)
        : data.users.filter(u => u.role === Role.FUNCIONARIO);

      const allEmployees = data.users.filter(u => u.role === Role.FUNCIONARIO);
      const hrAndAdminUsers = data.users.filter(u => u.role === Role.RH || u.role === Role.ADMIN);
      const announcementsForMgmt = user.role === Role.ADMIN ? data.announcements : data.announcements.filter(a => a.status !== 'ARCHIVED');

      return (
        <Routes>
          <Route path="/dashboard" element={<HRDashboard timeOffRequests={data.timeOffRequests} meetingRequests={data.meetingRequests} />} />
          <Route path="/payslips" element={<Payslips payslips={data.payslips.filter(p => p.userId === user.id)} />} />
          <Route path="/announcements" element={<Announcements user={user} announcements={announcementsForMgmt} onAnnouncementClick={handleOpenAnnouncement} onUpdateStatus={actions.updateAnnouncementStatus} onDelete={actions.deleteAnnouncement} />} />
          <Route path="/feedback-system" element={<FeedbackSystem />} />
          <Route path="/manage-timeoff" element={<ManageTimeOff requests={data.timeOffRequests} onUpdateStatus={actions.updateTimeOffStatus} employees={allEmployees} />} />
          <Route path="/manage-meetings" element={<ManageMeetings requests={data.meetingRequests} onUpdateStatus={actions.updateMeetingStatus} employees={allEmployees} />} />
          <Route path="/upload-payslip" element={<UploadPayslip employees={employeesForPayslip} users={data.users} payslips={data.payslips} onAddSingle={actions.addPayslip} onAddBatch={actions.addBatchPayslips} />} />
          <Route path="/post-announcement" element={<PostAnnouncement onSubmit={actions.addAnnouncement} />} />
          <Route path="/manage-employees" element={<ManageEmployees user={user} users={data.users} onUpdateStatus={actions.updateUserStatus} onResetPassword={actions.resetUserPassword} onImport={actions.importEmployees} onRegister={actions.registerEmployee} onUpdateRole={actions.updateUserRole} onDelete={actions.deleteUser} />} />
          <Route path="/manage-events" element={<ManageEvents user={user} events={data.events} employees={allEmployees} onCreate={actions.addEvent} onUpdate={actions.updateEvent} onDelete={actions.deleteEvent} />} />
          {user.role === Role.ADMIN && (
             <Route path="/activity-log" element={<ActivityLog logs={data.logs} adminUsers={hrAndAdminUsers} />} />
          )}
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
      <AnnouncementModal 
        isOpen={!!selectedAnnouncement}
        onClose={handleCloseAnnouncement}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default Dashboard;
