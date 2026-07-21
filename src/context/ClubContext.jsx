import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  loadDatabaseFromStorage,
  saveDatabaseToStorage,
  resetDatabaseToDefault,
  exportDatabaseJSON,
  importDatabaseJSON
} from '../services/dbService';
import { fetchMembersFromDatabaseAPI, loginMemberAPI, createMemberAPI, updateMemberAPI } from '../services/api';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic Database State Initialization
  const [db, setDb] = useState(() => {
    const loaded = loadDatabaseFromStorage();
    if (loaded && Array.isArray(loaded.members)) {
      loaded.members = loaded.members.map(m => {
        if (m.memberCode === 'ADMIN' && m.name === 'Vũ Mai Quang') {
          return { ...m, name: 'Vũ Hoàng Long' };
        }
        return m;
      });
    }
    if (!loaded.attendanceRecords) {
      loaded.attendanceRecords = [
        {
          id: 'att-1',
          sessionName: 'Buổi Sinh Hoạt Định Kỳ Tuần 3 tháng 7',
          date: '21/07/2026',
          takenBy: 'Nguyễn Văn Kỹ (Thành Viên Ban Đối Ngoại - Nhân Sự)',
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

  // Automatic Real-Time Silent Sync with MySQL Database (No manual button click needed!)
  useEffect(() => {
    let isMounted = true;

    const silentAutoSync = async () => {
      try {
        const serverMembers = await fetchMembersFromDatabaseAPI();
        if (isMounted && serverMembers && Array.isArray(serverMembers) && serverMembers.length > 0) {
          setDb(prev => {
            const isDifferent = JSON.stringify(prev.members) !== JSON.stringify(serverMembers);
            if (isDifferent) {
              const updated = { ...prev, members: serverMembers };
              saveDatabaseToStorage(updated);
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent background fallback
      }
    };

    // Immediate initial sync on page mount
    silentAutoSync();

    // Auto-sync polling every 3 seconds
    const syncInterval = setInterval(silentAutoSync, 3000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);
  const announcements = db.announcements;
  const resources = db.resources || [];
  const departmentDrives = db.departmentDrives || [];
  const attendanceRecords = db.attendanceRecords || [];

  // Auth state persisted in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('VMC_CURRENT_USER');
      return savedUser ? JSON.parse(savedUser) : db.members[0];
    } catch (e) {
      return db.members[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('VMC_IS_AUTH') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('VMC_IS_AUTH', 'true');
      localStorage.setItem('VMC_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('VMC_IS_AUTH');
      localStorage.removeItem('VMC_CURRENT_USER');
    }
  }, [isAuthenticated, currentUser]);

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

  // Role Checks for Management Features (Admin & Ban Đối Ngoại - Nhân Sự ONLY)
  const isHRMember = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    currentUser?.deptName?.includes('Đối Ngoại') ||
    currentUser?.deptName?.includes('Nhân Sự')
  );

  const isHRHead = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm') ||
    (currentUser?.roleTitle?.includes('Trưởng Ban') && (currentUser?.deptName?.includes('Đối Ngoại') || currentUser?.deptName?.includes('Nhân Sự')))
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
    alert('🎉 Trưởng Ban Đối Ngoại - Nhân Sự đã duyệt thành công buổi điểm danh sinh hoạt! Tất cả thành viên có mặt đã được cộng 50 điểm thi đua PTS.');
  };

  // Login function matching Member Code & Password (API Auth & Local fallback)
  const login = async (memberCode, password) => {
    // 1. Authenticate via Private Server API
    const apiRes = await loginMemberAPI(memberCode, password);
    if (apiRes && apiRes.success && apiRes.user) {
      const user = apiRes.user;
      setCurrentUser(user);
      if (user.isFirstLogin) {
        setRequirePasswordChange(true);
      } else {
        setIsAuthenticated(true);
        triggerConfetti();
      }
      return true;
    }

    // 2. Fallback matching for demo environment
    const user = db.members.find(m =>
      (m.memberCode?.toUpperCase() === memberCode.toUpperCase() || m.username?.toLowerCase() === memberCode.toLowerCase())
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

  // Add new Resource item (Google Drive Link)
  const addResource = (newResData) => {
    const resourceObj = {
      id: 'res-' + Date.now(),
      name: newResData.name || 'Tài nguyên không tên',
      category: newResData.category || 'Khác',
      type: newResData.type || 'Link Drive',
      size: newResData.size || 'Cloud',
      driveUrl: newResData.driveUrl || 'https://drive.google.com/',
      uploader: currentUser?.name || 'Thành viên VMC'
    };

    updateDb(prev => ({
      ...prev,
      resources: [resourceObj, ...(prev.resources || [])]
    }));

    triggerConfetti();
    alert('🎉 Đã thêm thành công tài nguyên mới vào Kho Google Drive VMC!');
    return true;
  };

  // Delete Resource item
  const deleteResource = (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này khỏi kho Drive?')) return;
    updateDb(prev => ({
      ...prev,
      resources: (prev.resources || []).filter(r => r.id !== id)
    }));
  };

  // Update Department Root Google Drive URL
  const updateDepartmentDrive = (deptId, newDriveUrl) => {
    updateDb(prev => ({
      ...prev,
      departmentDrives: (prev.departmentDrives || []).map(d =>
        d.id === deptId ? { ...d, driveUrl: newDriveUrl } : d
      )
    }));
    triggerConfetti();
    alert('🎉 Đã cập nhật thành công thư mục Google Drive của Ban!');
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
  const updateSelfProfile = async (selfData) => {
    const updatedUser = {
      ...currentUser,
      phone: selfData.phone !== undefined ? selfData.phone : currentUser.phone,
      email: selfData.email !== undefined ? selfData.email : currentUser.email,
      dob: selfData.dob !== undefined ? selfData.dob : currentUser.dob,
      address: selfData.address !== undefined ? selfData.address : currentUser.address,
      facebook: selfData.facebook !== undefined ? selfData.facebook : currentUser.facebook,
      avatar: selfData.avatar || currentUser.avatar
    };

    // 1. Sync to Server API Database
    await updateMemberAPI(currentUser.memberCode || currentUser.id, updatedUser);

    setCurrentUser(updatedUser);

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === currentUser.id ? updatedUser : m)
    }));

    triggerConfetti();
    alert('🎉 Đã cập nhật thành công thông tin hồ sơ vào CSDL!');
  };

  // Update Member Info by Tech Team & Ban Đối Ngoại - Nhân Sự
  const updateMemberByTech = async (memberId, updatedFields) => {
    const memberObj = db.members.find(m => m.id === memberId || m.memberCode === memberId) || {};
    const fullPayload = { ...memberObj, ...updatedFields };

    // 1. Sync to Server API Database
    await updateMemberAPI(updatedFields.memberCode || memberObj.memberCode || memberId, fullPayload);

    // 2. Update local state & storage
    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, ...updatedFields } : m)
    }));

    if (currentUser.id === memberId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }

    triggerConfetti();
    alert('🎉 Đã cập nhật thành công thông tin thành viên vào CSDL SQL Server!');
  };

  // Add Role Milestone to a Member (Ban ĐN-NS & Admin)
  const addMemberMilestone = (memberId, milestone) => {
    const milestoneObj = {
      id: 'm-' + Date.now(),
      date: milestone.date || new Date().toLocaleDateString('vi-VN'),
      title: milestone.title || 'Cập nhật chức vụ mới',
      badgeText: milestone.badgeText || '[Chức vụ]',
      badgeStyle: milestone.badgeStyle || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === memberId) {
          const currentMilestones = m.milestones || [];
          return { ...m, milestones: [...currentMilestones, milestoneObj] };
        }
        return m;
      })
    }));

    if (currentUser.id === memberId) {
      setCurrentUser(prev => ({
        ...prev,
        milestones: [...(prev.milestones || []), milestoneObj]
      }));
    }

    triggerConfetti();
    alert('🎉 Đã thêm cột mốc lịch sử chức vụ mới thành công!');
  };

  // Account Creation (ADMIN / SUPER ADMIN ONLY)
  const createMemberAccount = async (newAcc) => {
    const isAdmin = Boolean(
      currentUser?.role === 'admin' ||
      currentUser?.memberCode === 'ADMIN' ||
      currentUser?.roleTitle?.includes('Super Admin') ||
      currentUser?.roleTitle?.includes('Chủ Nhiệm CLB')
    );

    if (!isAdmin) {
      alert('⛔ Quyền bị từ chối! Chỉ có Chủ Nhiệm CLB (Super Admin / Admin) mới có quyền cấp tài khoản thành viên mới!');
      return false;
    }

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

    // 1. Sync to Server API Database
    await createMemberAPI(accountObj);

    // 2. Update local state & storage
    updateDb(prev => ({
      ...prev,
      members: [...prev.members, accountObj]
    }));

    triggerConfetti();
    alert(`Chủ Nhiệm CLB (Admin) đã cấp thành công tài khoản mới vào CSDL!\nMã Thành Viên: ${generatedCode}\nMật khẩu khởi tạo: VMC2026@VinhBao`);
    return true;
  };

  // Reset password by Admin (ADMIN / SUPER ADMIN ONLY)
  const resetAccountPassword = (username) => {
    const isAdmin = Boolean(
      currentUser?.role === 'admin' ||
      currentUser?.memberCode === 'ADMIN' ||
      currentUser?.roleTitle?.includes('Super Admin') ||
      currentUser?.roleTitle?.includes('Chủ Nhiệm CLB')
    );

    if (!isAdmin) {
      alert('⛔ Quyền bị từ chối! Chỉ có Chủ Nhiệm CLB (Super Admin / Admin) mới có quyền cấp / reset mật khẩu tài khoản!');
      return false;
    }

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
    alert(`Chủ Nhiệm CLB (Admin) đã reset lại Mật khẩu khởi tạo (VMC2026@VinhBao) cho tài khoản [${username}].`);
    return true;
  };

  // Delete Member Account (ADMIN / SUPER ADMIN ONLY)
  const deleteMemberAccount = (id) => {
    const isAdmin = Boolean(
      currentUser?.role === 'admin' ||
      currentUser?.memberCode === 'ADMIN' ||
      currentUser?.roleTitle?.includes('Super Admin') ||
      currentUser?.roleTitle?.includes('Chủ Nhiệm CLB')
    );

    if (!isAdmin) {
      alert('⛔ Quyền bị từ chối! Chỉ có Chủ Nhiệm CLB (Super Admin / Admin) mới có quyền xóa tài khoản thành viên khỏi hệ thống!');
      return false;
    }

    const memberToDelete = db.members.find(m => m.id === id);
    if (memberToDelete?.role === 'admin' || memberToDelete?.memberCode === 'ADMIN') {
      alert('⛔ Không thể xóa tài khoản Super Admin chính!');
      return false;
    }

    if (!window.confirm(`⚠️ XÁC NHẬN BẢO MẬT (QUYỀN ADMIN):\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản thành viên [${memberToDelete?.name || id}] khỏi hệ thống CSDL?`)) {
      return false;
    }

    updateDb(prev => ({
      ...prev,
      members: (prev.members || []).filter(m => m.id !== id)
    }));

    triggerConfetti();
    alert('🎉 Chủ Nhiệm CLB (Admin) đã xóa vĩnh viễn tài khoản thành viên thành công!');
    return true;
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

  const isAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm CLB')
  );

  return (
    <ClubContext.Provider value={{
      theme,
      toggleTheme,
      activeTab,
      setActiveTab,
      db,
      currentUser,
      isAdmin,
      isAuthenticated,
      requirePasswordChange,
      login,
      changePassword,
      logout,
      switchUserAccount,
      updateSelfProfile,
      updateMemberByTech,
      addMemberMilestone,
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
      deleteMemberAccount,
      resetAccountPassword,
      toggleAccountStatus,
      resources,
      addResource,
      deleteResource,
      departmentDrives,
      updateDepartmentDrive,
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
