import React from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { AttendanceModal } from './components/AttendanceModal';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { InternalDashboard } from './pages/InternalDashboard';
import { InternalTasks } from './pages/InternalTasks';
import { InternalEquipment } from './pages/InternalEquipment';
import { InternalDrafts } from './pages/InternalDrafts';
import { InternalResources } from './pages/InternalResources';
import { InternalMembers } from './pages/InternalMembers';
import { InternalDatabase } from './pages/InternalDatabase';
import { InternalProfile } from './pages/InternalProfile';
import { InternalHRDashboard } from './pages/InternalHRDashboard';
import { InternalAdminSessions } from './pages/InternalAdminSessions';
import { InternalRecruitment } from './pages/InternalRecruitment';

const Loading = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] text-slate-200 font-sans">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

const pageComponents = {
  dashboard: InternalDashboard,
  tasks: InternalTasks,
  equipment: InternalEquipment,
  drafts: InternalDrafts,
  resources: InternalResources,
  members: InternalMembers,
  database: InternalDatabase,
  profile: InternalProfile,
  hr_dashboard: InternalHRDashboard,
  admin_sessions: InternalAdminSessions,
  recruitment: InternalRecruitment
};

const AppContent = () => {
  const { activeTab, isAuthenticated, isLoading, toasts, removeToast } = useClub();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  const ActivePage = pageComponents[activeTab];

  return (
    <div className="main-layout bg-[var(--bg-primary)] text-slate-100 transition-colors duration-300 font-body selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <div className="flex-1 pt-6 pb-20">
        <main className="min-h-screen">
          <div className="page-wrap">
            {ActivePage ? <ActivePage /> : null}
          </div>
        </main>
      </div>
      <AttendanceModal />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ClubProvider>
        <AppContent />
      </ClubProvider>
    </ErrorBoundary>
  );
}

export default App;
