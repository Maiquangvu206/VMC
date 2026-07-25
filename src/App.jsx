import React, { lazy, Suspense, useMemo } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { AttendanceModal } from './components/AttendanceModal';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const Loading = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f17] text-slate-200 font-sans">
    <div className="text-slate-400 text-sm font-mono animate-pulse">Đang tải...</div>
  </div>
);

const InternalDashboard = lazy(() => import('./pages/InternalDashboard'));
const InternalTasks = lazy(() => import('./pages/InternalTasks'));
const InternalEquipment = lazy(() => import('./pages/InternalEquipment'));
const InternalDrafts = lazy(() => import('./pages/InternalDrafts'));
const InternalResources = lazy(() => import('./pages/InternalResources'));
const InternalMembers = lazy(() => import('./pages/InternalMembers'));
const InternalDatabase = lazy(() => import('./pages/InternalDatabase'));
const InternalProfile = lazy(() => import('./pages/InternalProfile'));
const InternalHRDashboard = lazy(() => import('./pages/InternalHRDashboard'));
const InternalAdminSessions = lazy(() => import('./pages/InternalAdminSessions'));
const InternalRecruitment = lazy(() => import('./pages/InternalRecruitment'));

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
  const { activeTab, isAuthenticated, requirePasswordChange, isLoading, toasts, removeToast } = useClub();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated && !requirePasswordChange) {
    return <LoginModal />;
  }
  if (requirePasswordChange) {
    return <ForcePasswordChangeModal />;
  }

  const ActivePage = pageComponents[activeTab];

  return (
    <div className="main-layout bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-body selection:bg-blue-600 selection:text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Navbar />
      <div className="flex-1 pt-6 pb-20">
        <main className="min-h-screen">
          <div className="page-wrap">
            <Suspense fallback={<Loading />}>
              {ActivePage ? <ActivePage /> : null}
            </Suspense>
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
