import React from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { AttendanceModal } from './components/AttendanceModal';

import { InternalDashboard } from './pages/InternalDashboard';
import { InternalTasks } from './pages/InternalTasks';
import { InternalEquipment } from './pages/InternalEquipment';
import { InternalDrafts } from './pages/InternalDrafts';
import { InternalResources } from './pages/InternalResources';
import { InternalMembers } from './pages/InternalMembers';
import { InternalDatabase } from './pages/InternalDatabase';
import { InternalProfile } from './pages/InternalProfile';
import { InternalHRDashboard } from './pages/InternalHRDashboard';

const IntranetPortalContent = () => {
  const { activeTab, isAuthenticated, requirePasswordChange } = useClub();

  // If user is not authenticated yet, show Login Gate
  if (!isAuthenticated && !requirePasswordChange) {
    return <LoginModal />;
  }

  // If first time login, force password change modal
  if (requirePasswordChange) {
    return <ForcePasswordChangeModal />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col font-body selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex-1 pt-6 pb-20">
        <main className="min-h-screen">
          {activeTab === 'dashboard' && <InternalDashboard />}
          {activeTab === 'tasks' && <InternalTasks />}
          {activeTab === 'equipment' && <InternalEquipment />}
          {activeTab === 'drafts' && <InternalDrafts />}
          {activeTab === 'resources' && <InternalResources />}
          {activeTab === 'members' && <InternalMembers />}
          {activeTab === 'database' && <InternalDatabase />}
          {activeTab === 'profile' && <InternalProfile />}
          {activeTab === 'hr_dashboard' && <InternalHRDashboard />}
        </main>
      </div>
      <AttendanceModal />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ClubProvider>
      <IntranetPortalContent />
    </ClubProvider>
  );
}

export default App;
