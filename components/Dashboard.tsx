import React, { useState } from 'react';
import { User, Role, Payslip, TimeOffRequest, MeetingRequest, Announcement, RequestStatus, Event, AppNotification, ImportResult } from '../types';
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
  };
  actions: {
    addTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
    updateTimeOffStatus: (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => void;
    addMeetingRequest: (request: Omit<MeetingRequest, 'id' | 'status' | 'userName' | 'userId'>) => void;
    updateMeetingStatus: (id: string, status: RequestStatus.APROVADO | RequestStatus.NEGADO) => void;
    addPayslip: (payslip: Omit<Payslip, 'id' | 'fileUrl'>) => void;
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
    registerEmployee: (name: string, email: string, emergencyPhone?: string) => void;
    addEvent: (event: Omit<Event, 'id'>) => void;
    updateEvent: (eventId: string, eventData: Partial<Omit<Event, 'id'>>) => void;
    markNotificationsAsRead: (userId: number) => void;
    updateUserStatus: (userId: number, status: 'ATIVO' | 'INATIVO') => void;
    resetUserPassword: (userId: number) => void;
    importEmployees: (data: any[]) => Promise<ImportResult>;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, data, actions }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    const employees = data.users.filter(u => u.role === Role.FUNCIONARIO);
    if (user.role === Role.FUNCIONARIO) {
      switch (activeView) {
        case 'dashboard': return <EmployeeDashboard user={user} announcements={data.announcements} />;
        case 'payslips': return <Payslips payslips={data.payslips.filter(p => p.userId === user.id)} />;
        case 'request-timeoff': return <RequestTimeOff onSubmit={actions.addTimeOffRequest} />;
        case 'schedule-meeting': return <ScheduleMeeting onSubmit={actions.addMeetingRequest} />;
        case 'announcements': return <Announcements announcements={data.announcements} />;
        case 'my-events': return <MyEvents events={data.events.filter(e => e.participantIds.includes(user.id) && e.status !== 'ARCHIVED')} />;
        default: return <EmployeeDashboard user={user} announcements={data.announcements} />;
      }
    } else if (user.role === Role.RH) {
      switch (activeView) {
        case 'dashboard': return <HRDashboard timeOffRequests={data.timeOffRequests} meetingRequests={data.meetingRequests} />;
        case 'announcements': return <Announcements announcements={data.announcements} />;
        case 'feedback-system': return <FeedbackSystem />;
        case 'manage-timeoff': return <ManageTimeOff requests={data.timeOffRequests} onUpdateStatus={actions.updateTimeOffStatus} employees={employees} />;
        case 'manage-meetings': return <ManageMeetings requests={data.meetingRequests} onUpdateStatus={actions.updateMeetingStatus} employees={employees} />;
        case 'upload-payslip': return <UploadPayslip employees={employees} onSubmit={actions.addPayslip} />;
        case 'post-announcement': return <PostAnnouncement onSubmit={actions.addAnnouncement} />;
        case 'manage-employees': return <ManageEmployees users={data.users} onUpdateStatus={actions.updateUserStatus} onResetPassword={actions.resetUserPassword} onImport={actions.importEmployees} onRegister={actions.registerEmployee} />;
        case 'manage-events': return <ManageEvents events={data.events} employees={employees} onCreate={actions.addEvent} onUpdate={actions.updateEvent} />;
        default: return <HRDashboard timeOffRequests={data.timeOffRequests} meetingRequests={data.meetingRequests} />;
      }
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar user={user} activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={user} 
            onLogout={onLogout} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            data={data}
            markNotificationsAsRead={() => actions.markNotificationsAsRead(user.id)}
            setActiveView={setActiveView}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;