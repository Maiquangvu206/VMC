import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  loadDatabaseFromStorage, 
  saveDatabaseToStorage, 
  resetDatabaseToDefault, 
  exportDatabaseJSON, 
  importDatabaseJSON 
} from '../services/dbService';
import { fetchMembersFromDatabaseAPI } from '../services/api';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Database State Initialization
  const [db, setDb] = useState(() => {
    const loaded = loadDatabaseFromStorage();
    if (!loaded.attendanceRecords) {
      loaded.attendanceRecords = [
        {
          id: 'att-1',
          sessionName: 'Buổi Sinh Hoạt Định Kỳ Tuần 3 tháng 7',
          date: '21/07/2026',
          takenBy: 'Nguyễn Văn Kỹ (Thành Viên Ban ĐN-NS)',
          presentMemberIds: [1, 2, 3],
          status: 'pending_approval',
          approvedBy: null
        }
      ];
    }
    return loaded;
  });

  const members = db.members;
  const tasks = db.tasks;
  const equipment = db.equipment;
  const drafts = db.drafts;
  const announcements = db.announcements;
  const resources = db.resources;
  const attendanceRecords = db.attendanceRecords || [];

  // Auth state
  const [currentUser, setCurrentUser] = useState(db.members[0]); // Default Admin
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  // Modals & Drawers
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Members from SQL Database API on Mount
  useEffect(() => {
    const loadSqlMembers = async () => {
      const sqlMembers = await fetchMembersFromDatabaseAPI();
      if (sqlMembers && sqlMembers.length > 0) {
        setDb(prev => ({
          ...prev,
          members: sqlMembers
        }));
        console.log('✅ Đã load thành công dữ liệu thành viên từ API CSDL SQL!');
      }
    };
    loadSqlMembers();
  }, []);

  // Sync state changes into Dynamic Database
  const updateDb = (updater) => {
    setDb(prev => {
      const nextDb = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveDatabaseToStorage(nextDb);
      return nextDb;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Role Checks for Attendance Feature
  const isHRMember = Boolean(
    currentUser?.deptName?.includes('Đối Ngoại') || 
    currentUser?.deptName?.includes('Nhân Sự') || 
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    currentUser?.memberCode?.includes('VMC-TECH')
  );

  const isHRHead = Boolean(
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    (currentUser?.roleTitle?.includes('Trưởng Ban') && (currentUser?.deptName?.includes('Đối Ngoại') || currentUser?.deptName?.includes('Nhân Sự'))) ||
    (currentUser?.roleTitle?.includes('Tổ Trưởng') && currentUser?.deptName?.includes('Kỹ Thuật'))
  );

  // Submit Attendance Checkin (Performed by External Relations - HR Member)
  const submitAttendanceCheckin = (sessionName, presentMemberIds) => {
    const recordObj = {
      id: 'att-' + Date.now(),
      sessionName: sessionName || `Buổi Sinh Hoạt CLB ngày ${new Date().toLocaleDateString('vi-VN')}`,
      date: new Date().toLocaleDateString('vi-VN'),
      takenBy: `${currentUser.name} (${currentUser.roleTitle})`,
      presentMemberIds: presentMemberIds,
      status: 'pending_approval',
      approvedBy: null
    };

    updateDb(prev => ({
      ...prev,
      attendanceRecords: [recordObj, ...(prev.attendanceRecords || [])]
    }));

    triggerConfetti();
    alert('✅ Đã gửi danh sách điểm danh sinh hoạt! Vui lòng chờ Trưởng Ban Đối Ngoại - Nhân Sự duyệt.');
  };

  // Approve Attendance Checkin (Performed by Head of External Relations - HR)
  const approveAttendanceCheckin = (recordId) => {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;

    const presentIds = record.presentMemberIds || [];

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (presentIds.includes(m.id)) {
          return { ...m, points: (m.points || 0) + 50 };
        }
        return m;
      }),
      attendanceRecords: (prev.attendanceRecords || []).map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            status: 'approved',
            approvedBy: `${currentUser.name} (${currentUser.roleTitle})`
          };
        }
        return r;
      })
    }));

    if (presentIds.includes(currentUser.id)) {
      setCurrentUser(prev => ({ ...prev, points: (prev.points || 0) + 50 }));
    }

    triggerConfetti();
    alert('🎉 Trưởng Ban Đối Ngoại - Nhân Sự đã duyệt thành công buổi điểm danh sinh hoạt! Tất cả thành viên có mặt đã được cộng 50 điểm PTS.');
  };

  // Login function matching Member Code & Password
  const login = (memberCode, password) => {
    const user = db.members.find(m => 
      (m.memberCode?.toUpperCase() === memberCode.toUpperCase() || m.username?.toLowerCase() === memberCode.toLowerCase()) && 
      m.password === password
    );

    if (!user) return false;
    if (user.status === 'Suspended') {
      alert('Tài khoản này đã bị tạm khóa bởi Bộ Phận Kỹ Thuật!');
      return false;
    }

    setCurrentUser(user);

    if (user.isFirstLogin) {
      setRequirePasswordChange(true);
    } else {
      setIsAuthenticated(true);
      triggerConfetti();
    }
    return true;
  };

  // Mandatory first time password change
  const changePassword = (oldPassword, newPassword) => {
    if (currentUser.password !== oldPassword) return false;

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === currentUser.id) {
          return {
            ...m,
            password: newPassword,
            isFirstLogin: false
          };
        }
        return m;
      })
    }));

    setCurrentUser(prev => ({
      ...prev,
      password: newPassword,
      isFirstLogin: false
    }));

    setRequirePasswordChange(false);
    setIsAuthenticated(true);
    triggerConfetti();
    alert('Đổi mật khẩu cá nhân thành công! Dữ liệu đã được lưu vào CSDL.');
    return true;
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setRequirePasswordChange(false);
  };

  // Switch user role (demo)
  const switchUserAccount = (id) => {
    const acc = db.members.find(m => m.id === id);
    if (acc) {
      setCurrentUser(acc);
      if (acc.isFirstLogin) {
        setRequirePasswordChange(true);
        setIsAuthenticated(false);
      } else {
        setRequirePasswordChange(false);
        setIsAuthenticated(true);
      }
      triggerConfetti();
    }
  };

  // Update Self Profile
  const updateSelfProfile = (selfData) => {
    const updatedUser = {
      ...currentUser,
      phone: selfData.phone,
      email: selfData.email,
      address: selfData.address,
      facebook: selfData.facebook
    };

    setCurrentUser(updatedUser);

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === currentUser.id ? updatedUser : m)
    }));

    triggerConfetti();
    alert('Đã cập nhật thành công Số điện thoại, Email, Địa chỉ và Facebook cá nhân!');
  };

  // Update Member Info by Tech Team
  const updateMemberByTech = (memberId, updatedFields) => {
    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, ...updatedFields } : m)
    }));

    if (currentUser.id === memberId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }

    triggerConfetti();
    alert('Bộ Phận Kỹ Thuật đã cập nhật thành công hồ sơ thành viên!');
  };

  // Tech Team Account Creation Function
  const createMemberAccount = (newAcc) => {
    const generatedCode = "VMC-" + Math.floor(1000 + Math.random() * 9000);
    const accountObj = {
      id: "vmc-acc-" + Math.floor(100 + Math.random() * 900),
      memberCode: generatedCode,
      password: "VMC2026@VinhBao",
      isFirstLogin: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
      points: 100,
      status: "Active",
      ...newAcc
    };

    updateDb(prev => ({
      ...prev,
      members: [...prev.members, accountObj]
    }));

    triggerConfetti();
    alert(`Bộ Phận Kỹ Thuật đã cấp thành công vào CSDL!\nMã Thành Viên: ${generatedCode}\nMật khẩu khởi tạo: VMC2026@VinhBao`);
  };

  // Reset password by Tech Team
  const resetAccountPassword = (username) => {
    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.username === username || m.memberCode === username) {
          return {
            ...m,
            password: "VMC2026@VinhBao",
            isFirstLogin: true
          };
        }
        return m;
      })
    }));
    alert(`Bộ Phận Kỹ Thuật đã reset lại Mật khẩu khởi tạo (VMC2026@VinhBao) cho tài khoản [${username}] vào CSDL.`);
  };

  // Toggle account status
  const toggleAccountStatus = (id) => {
    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === id) {
          const newStatus = m.status === 'Active' ? 'Suspended' : 'Active';
          return { ...m, status: newStatus };
        }
        return m;
      })
    }));
  };

  // Update Task Status
  const updateTaskStatus = (taskId, newStatus) => {
    updateDb(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    }));
  };

  // Add New Task
  const addTask = (newTask) => {
    const taskObj = {
      id: "task-" + Math.floor(100 + Math.random() * 900),
      ...newTask,
      status: "todo"
    };

    updateDb(prev => ({
      ...prev,
      tasks: [taskObj, ...prev.tasks]
    }));
    triggerConfetti();
  };

  // Borrow Equipment
  const borrowEquipment = (equipmentId, returnDate) => {
    updateDb(prev => ({
      ...prev,
      equipment: prev.equipment.map(eq => {
        if (eq.id === equipmentId) {
          return {
            ...eq,
            status: 'borrowed',
            borrower: `${currentUser.name} (${currentUser.class})`,
            returnDate: returnDate || '2026-07-30'
          };
        }
        return eq;
      })
    }));
    triggerConfetti();
  };

  // Return Equipment
  const returnEquipment = (equipmentId) => {
    updateDb(prev => ({
      ...prev,
      equipment: prev.equipment.map(eq => {
        if (eq.id === equipmentId) {
          return {
            ...eq,
            status: 'available',
            borrower: null,
            returnDate: null
          };
        }
        return eq;
      })
    }));
  };

  // Approve Draft
  const approveDraft = (draftId) => {
    updateDb(prev => ({
      ...prev,
      drafts: prev.drafts.map(d => d.id === draftId ? { ...d, status: 'approved' } : d)
    }));
    triggerConfetti();
  };

  // Add New Draft
  const addDraft = (newDraft) => {
    const draftObj = {
      id: "draft-" + Math.floor(200 + Math.random() * 800),
      author: `${currentUser.name} (${currentUser.roleTitle})`,
      department: currentUser.department,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'pending',
      ...newDraft
    };

    updateDb(prev => ({
      ...prev,
      drafts: [draftObj, ...prev.drafts]
    }));
    triggerConfetti();
  };

  // Attendance checkin legacy fallback
  const checkinAttendance = () => {
    setIsAttendanceModalOpen(true);
  };

  // Database Management Actions
  const handleExportDB = () => {
    exportDatabaseJSON();
  };

  const handleImportDB = async (file) => {
    try {
      const importedDb = await importDatabaseJSON(file);
      setDb(importedDb);
      triggerConfetti();
      alert('Đã khôi phục thành công Cơ sở dữ liệu từ file JSON!');
    } catch (err) {
      alert('Lỗi khi nhập file CSDL: ' + err.message);
    }
  };

  const handleResetDB = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset toàn bộ Cơ sở dữ liệu về mặc định ban đầu không?')) {
      const defaultDb = resetDatabaseToDefault();
      setDb(defaultDb);
      alert('Đã khôi phục CSDL về mặc định!');
    }
  };

  return (
    <ClubContext.Provider value={{
      theme,
      toggleTheme,
      activeTab,
      setActiveTab,
      db,
      currentUser,
      isAuthenticated,
      requirePasswordChange,
      login,
      changePassword,
      logout,
      switchUserAccount,
      updateSelfProfile,
      updateMemberByTech,
      tasks,
      updateTaskStatus,
      addTask,
      equipment,
      borrowEquipment,
      returnEquipment,
      drafts,
      approveDraft,
      addDraft,
      announcements,
      members,
      createMemberAccount,
      resetAccountPassword,
      toggleAccountStatus,
      resources,
      attendanceRecords,
      isHRMember,
      isHRHead,
      submitAttendanceCheckin,
      approveAttendanceCheckin,
      isAttendanceModalOpen,
      setIsAttendanceModalOpen,
      checkinAttendance,
      triggerConfetti,
      handleExportDB,
      handleImportDB,
      handleResetDB,
      isBorrowModalOpen,
      setIsBorrowModalOpen,
      selectedEquipment,
      setSelectedEquipment,
      isNewTaskModalOpen,
      setIsNewTaskModalOpen,
      isNewDraftModalOpen,
      setIsNewDraftModalOpen,
      isNewAccountModalOpen,
      setIsNewAccountModalOpen
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
