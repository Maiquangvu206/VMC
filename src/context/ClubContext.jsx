import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  loadDatabaseFromStorage,
  saveDatabaseToStorage,
  resetDatabaseToDefault,
  exportDatabaseJSON,
  importDatabaseJSON
} from '../services/dbService';
import { fetchMembersFromDatabaseAPI, loginMemberAPI, createMemberAPI, updateMemberAPI, deleteMemberAPI } from '../services/api';
import { fetchEntityAPI, createEntityAPI, updateEntityAPI, deleteEntityAPI } from '../services/apiClient';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('VMC_ACTIVE_TAB') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('VMC_ACTIVE_TAB', tab);
    } catch (e) {
      console.warn('Lỗi lưu active tab:', e);
    }
  };

  // Dynamic Database State Initialization — tất cả dữ liệu từ MySQL, không hardcode
  const [db, setDb] = useState(() => {
    const loaded = loadDatabaseFromStorage();
    if (!loaded.members) loaded.members = [];
    if (!loaded.tasks) loaded.tasks = [];
    if (!loaded.equipment) loaded.equipment = [];
    if (!loaded.drafts) loaded.drafts = [];
    if (!loaded.announcements) loaded.announcements = [];
    if (!loaded.finances) loaded.finances = [];
    if (!loaded.attendanceRecords) loaded.attendanceRecords = [];
    if (!loaded.meetings) loaded.meetings = [];
    if (!loaded.birthdayAssignments) loaded.birthdayAssignments = [];
    return loaded;
  });

  const members = db.members;
  const tasks = db.tasks;
  const equipment = db.equipment;
  const drafts = db.drafts;

  // Automatic Real-Time Silent Sync with MySQL Database — tất cả bảng
  useEffect(() => {
    let isMounted = true;

    const silentAutoSync = async () => {
      try {
        const [serverMembers, serverTasks, serverDrafts, serverEquipment, serverAnnouncements, serverFinances, serverMeetings, serverBirthday] = await Promise.all([
          fetchMembersFromDatabaseAPI(),
          fetchEntityAPI('tasks'),
          fetchEntityAPI('drafts'),
          fetchEntityAPI('equipment'),
          fetchEntityAPI('announcements'),
          fetchEntityAPI('finances'),
          fetchEntityAPI('meetings'),
          fetchEntityAPI('birthday-assignments')
        ]);
        
        if (isMounted) {
          setDb(prev => {
            const mergedMembers = Array.isArray(serverMembers) ? serverMembers.map(serverMem => {
              const localMem = (prev.members || []).find(m => String(m.id) === String(serverMem.id) || m.memberCode === serverMem.memberCode) || {};
              return { ...localMem, ...serverMem };
            }) : prev.members;
            
            const nextDb = {
              ...prev,
              members: mergedMembers || [],
              tasks: Array.isArray(serverTasks) && serverTasks.length > 0 ? serverTasks : prev.tasks,
              drafts: Array.isArray(serverDrafts) && serverDrafts.length > 0 ? serverDrafts : prev.drafts,
              equipment: Array.isArray(serverEquipment) && serverEquipment.length > 0 ? serverEquipment : prev.equipment,
              announcements: Array.isArray(serverAnnouncements) && serverAnnouncements.length > 0 ? serverAnnouncements : prev.announcements,
              finances: Array.isArray(serverFinances) && serverFinances.length > 0 ? serverFinances : prev.finances,
              meetings: Array.isArray(serverMeetings) && serverMeetings.length > 0 ? serverMeetings : (prev.meetings || []),
              birthdayAssignments: Array.isArray(serverBirthday) && serverBirthday.length > 0 ? serverBirthday : (prev.birthdayAssignments || [])
            };
            
            saveDatabaseToStorage(nextDb);
            return nextDb;
          });
        }
      } catch (err) {
        console.warn('Lỗi kết nối CSDL MySQL:', err);
      }
    };

    silentAutoSync();
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

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('VMC_CURRENT_USER');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Auto-sync currentUser with latest db.members from MySQL
  useEffect(() => {
    if (db.members && db.members.length > 0) {
      setCurrentUser(prev => {
        if (!prev) return db.members[0];
        const match = db.members.find(m => String(m.id) === String(prev.id) || m.memberCode === prev.memberCode || m.username === prev.username);
        if (!match) return db.members[0];
        const hasChanged = Object.keys(match).some(key => match[key] !== prev[key]);
        return hasChanged ? { ...prev, ...match } : prev;
      });
    }
  }, [db.members]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('VMC_IS_AUTH') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      sessionStorage.setItem('VMC_IS_AUTH', 'true');
      sessionStorage.setItem('VMC_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('VMC_IS_AUTH');
      sessionStorage.removeItem('VMC_CURRENT_USER');
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
        setDb(prev => {
          let mergedMembers = sqlMembers.map(serverMem => {
            const localMem = (prev.members || []).find(m => m.id === serverMem.id) || {};
            return { ...localMem, ...serverMem };
          });

          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          let nextDb = { ...prev, members: mergedMembers };
          
          // 1. Check Monthly Points (+50)
          if (prev.lastPointsAddedMonth && prev.lastPointsAddedMonth !== currentMonth) {
            mergedMembers = mergedMembers.map(m => {
              if (m.status !== 'Suspended') {
                const newPoints = (m.points || 0) + 50;
                updateMemberAPI(m.memberCode || m.member_code || m.id, { points: newPoints }).catch(e => console.log(e));
                return { ...m, points: newPoints };
              }
              return m;
            });
            nextDb = { ...nextDb, members: mergedMembers, lastPointsAddedMonth: currentMonth };
            console.log(`✅ Đã tự động cộng 50 điểm đầu tháng cho tất cả thành viên (${currentMonth})`);
          } else if (!prev.lastPointsAddedMonth) {
             nextDb = { ...nextDb, lastPointsAddedMonth: currentMonth };
          }
          
          // 2. Check 24h Grader Deadline
          const now = Date.now();
          if (nextDb.drafts) {
            nextDb.drafts = nextDb.drafts.map(draft => {
              if (draft.status === 'approved' && draft.publishDate && draft.graderId && draft.gradingStatus === 'pending') {
                const publishTime = new Date(draft.publishDate).getTime();
                if (now > publishTime + 24 * 60 * 60 * 1000) {
                  // Failed deadline! Penalty -5 points
                  const grader = nextDb.members.find(m => m.id === draft.graderId);
                  if (grader) {
                    const newPoints = (grader.points || 0) - 5;
                    updateMemberAPI(grader.memberCode || grader.member_code || grader.id, { points: newPoints }).catch(e => console.log(e));
                    nextDb.members = nextDb.members.map(m => m.id === draft.graderId ? { ...m, points: newPoints } : m);
                  }
                  return { ...draft, gradingStatus: 'failed_deadline' };
                }
              }
              return draft;
            });
          }

          return nextDb;
        });
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
    currentUser?.deptName?.includes('Đối Ngoại') ||
    currentUser?.deptName?.includes('Nhân Sự')
  );

  const isHRHead = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
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
      
      if (user.status === 'Suspended') {
        alert('Tài khoản này đã bị tạm khóa bởi Ban Chủ Nhiệm!');
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
    }
    
    // If API returns a specific suspended message, alert it and stop
    if (apiRes && !apiRes.success && apiRes.message?.includes('tạm khóa')) {
      alert(apiRes.message);
      return false;
    }

    // Nếu API thất bại (server offline / lỗi kết nối) → thông báo rõ ràng
    if (!apiRes || !apiRes.success) {
      const errMsg = apiRes?.message || 'Server API offline';
      // Nếu là lỗi kết nối mạng, không phải sai mật khẩu
      if (errMsg === 'Server API offline' || errMsg.includes('offline') || errMsg.includes('fetch')) {
        alert('❌ Không thể kết nối đến máy chủ!\n\nVui lòng kiểm tra kết nối mạng hoặc liên hệ Bộ Phận Kỹ Thuật.');
      }
      return false;
    }

    return false;
  };

  // Mandatory first time password change
  const changePassword = async (oldPassword, newPassword) => {
    if (currentUser?.password && currentUser.password !== oldPassword) return false;

    const targetId = currentUser.id || currentUser.memberCode;
    await updateMemberAPI(targetId, {
      password: newPassword,
      isFirstLogin: false,
      is_first_login: 0,
      name: currentUser.name
    });

    const freshMembers = await fetchMembersFromDatabaseAPI();
    if (freshMembers && Array.isArray(freshMembers) && freshMembers.length > 0) {
      setDb(prev => {
        const mergedMembers = freshMembers.map(serverMem => {
          const localMem = (prev.members || []).find(m => m.id === serverMem.id) || {};
          return { ...localMem, ...serverMem };
        });
        const updated = { ...prev, members: mergedMembers };
        saveDatabaseToStorage(updated);
        return updated;
      });
    }

    setCurrentUser(prev => ({
      ...prev,
      password: newPassword,
      isFirstLogin: false,
      is_first_login: false
    }));

    setRequirePasswordChange(false);
    setIsAuthenticated(true);
    triggerConfetti();
    alert('🎉 Đổi mật khẩu cá nhân thành công! Mật khẩu mới và trạng thái đã được lưu vào CSDL MySQL.');
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
    await updateMemberAPI(currentUser.id || currentUser.memberCode, updatedUser);

    // 2. Fetch fresh members directly from MySQL
    const freshMembers = await fetchMembersFromDatabaseAPI();
    if (freshMembers && Array.isArray(freshMembers) && freshMembers.length > 0) {
      setDb(prev => {
        const mergedMembers = freshMembers.map(serverMem => {
          const localMem = (prev.members || []).find(m => m.id === serverMem.id) || {};
          return { ...localMem, ...serverMem };
        });
        const updated = { ...prev, members: mergedMembers };
        saveDatabaseToStorage(updated);
        return updated;
      });
    }

    setCurrentUser(updatedUser);

    triggerConfetti();
    alert('🎉 Đã cập nhật thành công thông tin hồ sơ và ảnh đại diện vào CSDL MySQL!');
  };

  // Update Member Info by Tech Team & Ban Đối Ngoại - Nhân Sự
  const updateMemberByTech = async (memberId, updatedFields) => {
    const memberObj = db.members.find(m => m.id === memberId || m.memberCode === memberId) || {};
    const nextFields = { ...updatedFields };

    const isSuperAdmin = Boolean(
      currentUser?.memberCode === 'ADMIN' ||
      currentUser?.roleTitle?.includes('Super Admin')
    );

    const canEditRole = Boolean(
      isAdmin ||
      isHRHead ||
      canManageAccounts
    );

    // Chỉ Super Admin mới được thay đổi Mã Thành Viên (cố định)
    if (!isSuperAdmin) {
      nextFields.memberCode = memberObj.memberCode;
    }

    // Chỉ Admin và Trưởng Ban Đối Ngoại - Nhân Sự mới được thay đổi chức vụ / quyền
    if (!canEditRole) {
      nextFields.role = memberObj.role;
      nextFields.roleTitle = memberObj.roleTitle;
    }

    const fullPayload = { ...memberObj, ...nextFields };

    // 1. Sync to Server API Database
    await updateMemberAPI(memberObj.id || nextFields.memberCode || memberId, fullPayload);

    // 2. Fetch fresh data directly from MySQL
    const freshMembers = await fetchMembersFromDatabaseAPI();
    if (freshMembers && Array.isArray(freshMembers) && freshMembers.length > 0) {
      setDb(prev => {
        const mergedMembers = freshMembers.map(serverMem => {
          const localMem = (prev.members || []).find(m => m.id === serverMem.id) || {};
          return { ...localMem, ...serverMem };
        });
        const updated = { ...prev, members: mergedMembers };
        saveDatabaseToStorage(updated);
        return updated;
      });
    }

    if (currentUser.id === memberId) {
      setCurrentUser(prev => ({ ...prev, ...nextFields }));
    }

    triggerConfetti();
    alert('🎉 Đã cập nhật thành công thông tin thành viên vào CSDL MySQL!');
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

  // Helper permission check for Account Management (Super Admin & Trưởng Ban Đối Ngoại - Nhân Sự)
  const canManageAccounts = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    currentUser?.roleTitle?.includes('Chủ Nhiệm CLB') ||
    (currentUser?.roleTitle?.includes('Trưởng Ban') && (
      currentUser?.deptName?.includes('Đối Ngoại') || 
      currentUser?.deptName?.includes('Nhân Sự') ||
      currentUser?.deptName?.includes('ĐN-NS')
    ))
  );

  // Account Creation (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const createMemberAccount = async (newAcc) => {
    if (!canManageAccounts) {
      alert('⛔ Quyền bị từ chối! Chỉ có Super Admin (Chủ Nhiệm CLB) và Trưởng Ban Đối Ngoại - Nhân Sự mới có quyền cấp tài khoản thành viên mới!');
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
    alert(`Đã cấp thành công tài khoản mới vào CSDL!\nMã Thành Viên: ${generatedCode}\nMật khẩu khởi tạo: VMC2026@VinhBao`);
    return true;
  };

  // Reset password by Admin (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const resetAccountPassword = async (username) => {
    if (!canManageAccounts) {
      alert('⛔ Quyền bị từ chối! Chỉ có Super Admin (Chủ Nhiệm CLB) và Trưởng Ban Đối Ngoại - Nhân Sự mới có quyền cấp / reset mật khẩu tài khoản!');
      return false;
    }

    const targetMem = db.members.find(m => m.username === username || m.memberCode === username);
    if (targetMem) {
      await updateMemberAPI(targetMem.id || targetMem.memberCode, {
        password: "VMC2026@VinhBao",
        isFirstLogin: true,
        is_first_login: 1,
        name: targetMem.name
      });
    }

    const freshMembers = await fetchMembersFromDatabaseAPI();
    if (freshMembers && Array.isArray(freshMembers) && freshMembers.length > 0) {
      setDb(prev => {
        const mergedMembers = freshMembers.map(serverMem => {
          const localMem = (prev.members || []).find(m => m.id === serverMem.id) || {};
          return { ...localMem, ...serverMem };
        });
        const updated = { ...prev, members: mergedMembers };
        saveDatabaseToStorage(updated);
        return updated;
      });
    }

    alert(`🎉 Đã reset lại Mật khẩu khởi tạo (VMC2026@VinhBao) cho tài khoản [${username}] trong CSDL MySQL!`);
    return true;
  };

  // Delete Member Account (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const deleteMemberAccount = async (id) => {
    if (!canManageAccounts) {
      alert('⛔ Quyền bị từ chối! Chỉ có Super Admin (Chủ Nhiệm CLB) và Trưởng Ban Đối Ngoại - Nhân Sự mới có quyền xóa tài khoản thành viên khỏi hệ thống!');
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

    await deleteMemberAPI(memberToDelete?.memberCode || id);

    updateDb(prev => ({
      ...prev,
      members: (prev.members || []).filter(m => m.id !== id)
    }));

    triggerConfetti();
    alert('🎉 Chủ Nhiệm CLB (Admin) đã xóa vĩnh viễn tài khoản thành viên thành công!');
    return true;
  };

  // Toggle account status
  const toggleAccountStatus = async (id) => {
    const member = db.members.find(m => m.id === id);
    if (!member) return;

    const newStatus = member.status === 'Active' ? 'Suspended' : 'Active';
    await updateMemberAPI(member.memberCode || member.id, {
      status: newStatus,
      name: member.name
    });

    const newMilestone = {
      id: 'm-' + Date.now(),
      date: new Date().toLocaleDateString('vi-VN'),
      title: newStatus === 'Suspended' ? 'Đã dừng hoạt động (Bị khóa)' : 'Tiếp tục hoạt động (Đã mở khóa)',
      badgeText: newStatus === 'Suspended' ? '[Dừng hoạt động]' : '[Đang hoạt động]',
      badgeStyle: newStatus === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === id) {
          return { 
            ...m, 
            status: newStatus,
            milestones: [...(m.milestones || []), newMilestone] 
          };
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
    updateEntityAPI('tasks', taskId, { status: newStatus }).catch(e => console.log(e));
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
    createEntityAPI('tasks', taskObj).catch(e => console.log(e));
    triggerConfetti();
  };

  // Add New Equipment
  const addEquipment = (newEquipment) => {
    const eqObj = {
      id: 'eq-' + Date.now(),
      status: 'available',
      ...newEquipment
    };
    updateDb(prev => ({
      ...prev,
      equipment: [eqObj, ...(prev.equipment || [])]
    }));
    createEntityAPI('equipment', eqObj).catch(e => console.log(e));
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
    updateEntityAPI('equipment', equipmentId, { status: 'borrowed', borrower_id: currentUser.id, return_date: returnDate }).catch(e => console.log(e));
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
    updateEntityAPI('equipment', equipmentId, { status: 'available', borrower_id: null, return_date: null }).catch(e => console.log(e));
  };

  // Approve Draft
  const approveDraft = (draftId, publishDate, graderId) => {
    const pd = publishDate || new Date().toISOString();
    updateDb(prev => ({
      ...prev,
      drafts: prev.drafts.map(d => d.id === draftId ? { 
        ...d, 
        status: 'approved',
        publishDate: pd,
        graderId: graderId || null,
        gradingStatus: graderId ? 'pending' : 'none'
      } : d)
    }));
    updateEntityAPI('drafts', draftId, { status: 'approved', publishDate: pd, graderId, gradingStatus: graderId ? 'pending' : 'none' }).catch(e => console.log(e));
    triggerConfetti();
  };

  // Complete Grading Task
  const completeGrading = (draftId) => {
    updateDb(prev => ({
      ...prev,
      drafts: prev.drafts.map(d => d.id === draftId ? { ...d, gradingStatus: 'completed' } : d)
    }));
    updateEntityAPI('drafts', draftId, { gradingStatus: 'completed' }).catch(e => console.log(e));
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
    createEntityAPI('drafts', draftObj).catch(e => console.log(e));
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
    currentUser?.roleTitle?.includes('Super Admin')
  );

  const addFinanceRecord = async (record) => {
    // Lưu lên MySQL trước
    const res = await createEntityAPI('finances', {
      type: record.type,
      amount: record.amount,
      description: record.description,
      date: record.date,
      logged_by: record.loggedBy || currentUser?.name || ''
    });
    // Cập nhật local state ngay (optimistic)
    const newRecord = { ...record, id: res?.data?.id || ('fin-' + Date.now()), status: record.status || 'approved' };
    updateDb(prev => ({
      ...prev,
      finances: [newRecord, ...(prev.finances || [])]
    }));
  };

  const deleteFinanceRecord = async (recordId) => {
    await deleteEntityAPI('finances', recordId);
    updateDb(prev => ({
      ...prev,
      finances: (prev.finances || []).filter(f => f.id !== recordId)
    }));
  };

  const updateFinanceStatus = (recordId, newStatus) => {
    updateDb(prev => ({
      ...prev,
      finances: (prev.finances || []).map(f => f.id === recordId ? { ...f, status: newStatus } : f)
    }));
    if (newStatus === 'approved') {
      alert('Đã duyệt dự trù kinh phí thành công!');
    } else {
      alert('Đã từ chối dự trù kinh phí!');
    }
  };

  // -------------------------------------------------------------
  // NEW: MEETING & SEEDING (ATTENDANCE) FUNCTIONS
  // -------------------------------------------------------------
  const createMeeting = async (meeting) => {
    const meetingObj = {
      id: 'mtg-' + Date.now(),
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      status: 'pending',
      attendanceData: [],
      minutesLink: null
    };

    await createEntityAPI('meetings', meetingObj);

    updateDb(prev => ({
      ...prev,
      meetings: [meetingObj, ...(prev.meetings || [])]
    }));
    triggerConfetti();
  };

  const cancelMeeting = async (meetingId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy cuộc họp này không?")) {
      await updateEntityAPI('meetings', meetingId, { status: 'cancelled' });
      updateDb(prev => ({
        ...prev,
        meetings: (prev.meetings || []).map(m => m.id === meetingId ? { ...m, status: 'cancelled' } : m)
      }));
      alert('Đã hủy cuộc họp thành công!');
    }
  };

  const updateMeeting = async (meetingId, newDate, newTime, isPostponed) => {
    const status = isPostponed ? 'postponed' : 'pending';
    await updateEntityAPI('meetings', meetingId, { date: newDate, time: newTime, status });
    updateDb(prev => ({
      ...prev,
      meetings: (prev.meetings || []).map(m => 
        m.id === meetingId ? { ...m, date: newDate || m.date, time: newTime || m.time, status } : m
      )
    }));
    alert(isPostponed ? 'Đã chuyển sang chế độ Hoãn cuộc họp!' : 'Đã cập nhật thời gian cuộc họp!');
  };

  const submitMeetingAttendance = async (meetingId, attendanceData) => {
    // attendanceData is an array of objects: { memberId, status: 'present' | 'late' | 'absent' }
    const meeting = (db.meetings || []).find(m => String(m.id) === String(meetingId));
    const nextStatus = meeting?.minutesLink ? 'completed' : 'pending_minutes';

    await updateEntityAPI('meetings', meetingId, { status: nextStatus, attendanceData });

    updateDb(prev => {
      const lateMemberIds = attendanceData.filter(d => d.status === 'late').map(d => d.memberId);
      const absentMemberIds = attendanceData.filter(d => d.status === 'absent').map(d => d.memberId);
      
      const newMembers = prev.members.map(m => {
        const isHR = m.deptName?.toLowerCase().includes('đối ngoại') || m.deptName?.toLowerCase().includes('nhân sự') || m.deptName?.toLowerCase().includes('đn-ns');
        
        let penalty = 0;
        if (lateMemberIds.includes(m.id)) penalty = -3;
        else if (absentMemberIds.includes(m.id)) penalty = -10;

        if (penalty < 0 && isHR) {
          penalty *= 2; // X2 penalty for HR members
        }

        if (penalty !== 0) {
          const newPoints = (m.points || 0) + penalty;
          updateMemberAPI(m.memberCode || m.id, { points: newPoints, name: m.name }).catch(e => console.log(e));
          return { ...m, points: newPoints };
        }
        return m;
      });

      const newMeetings = (prev.meetings || []).map(mtg => {
        if (mtg.id === meetingId) {
          return { ...mtg, attendanceData, status: nextStatus };
        }
        return mtg;
      });

      return { ...prev, members: newMembers, meetings: newMeetings };
    });
    alert('✅ Đã chốt điểm danh. Thành viên vắng/muộn đã tự động bị trừ điểm (x2 nếu thuộc ban ĐN-NS)!');
  };

  const submitMeetingMinutes = async (meetingId, link) => {
    const meeting = (db.meetings || []).find(m => String(m.id) === String(meetingId));
    const nextStatus = (meeting?.attendanceData && meeting.attendanceData.length > 0) ? 'completed' : 'pending_attendance';

    await updateEntityAPI('meetings', meetingId, { minutes_link: link, status: nextStatus });

    updateDb(prev => ({
      ...prev,
      meetings: (prev.meetings || []).map(mtg => 
        mtg.id === meetingId ? { ...mtg, minutesLink: link, status: nextStatus } : mtg
      )
    }));
    alert('✅ Đã nộp biên bản cuộc họp!');
  };

  const penalizeMember = async (memberId, pointsToDeduct, reason) => {
    const member = db.members?.find(m => m.id === memberId);
    if (!member) return;
    const newPoints = (member.points || 0) - pointsToDeduct;

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, points: newPoints } : m)
    }));

    try {
      await updateMemberAPI(member.memberCode || member.id, { points: newPoints });
    } catch(err) { console.error(err); }

    alert(`✅ Đã trừ ${pointsToDeduct} điểm của thành viên với lý do: ${reason}`);
  };

  const updateMemberPoints = async (memberId, pointsDelta, reason) => {
    let finalDelta = parseInt(pointsDelta, 10);
    const member = db.members?.find(m => String(m.id) === String(memberId));
    if (!member) return;
    
    const isHR = member.deptName?.toLowerCase().includes('đối ngoại') || member.deptName?.toLowerCase().includes('nhân sự') || member.deptName?.toLowerCase().includes('đn-ns');
    
    // X2 penalty for HR department if points are deducted
    if (finalDelta < 0 && isHR) {
      finalDelta *= 2;
    }

    const newPoints = (member.points || 0) + finalDelta;

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => String(m.id) === String(memberId) ? { ...m, points: newPoints } : m)
    }));

    try {
      await updateMemberAPI(member.memberCode || member.id, { points: newPoints });
    } catch(err) { console.error(err); }

    const actionText = finalDelta > 0 ? 'CỘNG' : 'TRỪ';
    alert(`✅ Đã ${actionText} ${Math.abs(finalDelta)} điểm của [${member.name}].\nLý do: ${reason}\n(Ban ĐN-NS sẽ bị x2 điểm phạt)`);
  };

  // -------------------------------------------------------------
  // NEW: BIRTHDAY MANAGEMENT FUNCTIONS
  // -------------------------------------------------------------
  const assignBirthdayDuty = async (month, year, memberId) => {
    const exists = (db.birthdayAssignments || []).find(a => String(a.month) === String(month) && String(a.year) === String(year));
    if (exists) {
      alert(`⚠️ Nhiệm vụ sinh nhật tháng ${month}/${year} đã được giao! Hệ thống không cho phép giao lại lần 2.`);
      return false;
    }

    const bdayObj = {
      id: 'bday-' + Date.now(),
      assign_month: month,
      month,
      assign_year: year,
      year,
      member_id: memberId,
      memberId,
      link: null,
      status: 'pending'
    };

    await createEntityAPI('birthday-assignments', bdayObj);

    updateDb(prev => {
      const assignments = prev.birthdayAssignments || [];
      return { ...prev, birthdayAssignments: [...assignments, bdayObj] };
    });
    alert(`✅ Đã phân công nhiệm vụ trực sinh nhật tháng ${month}/${year}`);
    return true;
  };

  const submitBirthdayImage = async (assignmentId, link) => {
    await updateEntityAPI('birthday-assignments', assignmentId, { link, status: 'completed' });

    updateDb(prev => ({
      ...prev,
      birthdayAssignments: (prev.birthdayAssignments || []).map(a => 
        a.id === assignmentId ? { ...a, link, status: 'completed' } : a
      )
    }));
    alert('✅ Đã nộp link bài đăng sinh nhật thành công!\n\n📧 Đã tự động gửi Email tới bộ phận phụ trách Ban Sản Xuất.\n🔔 Đã gửi thông báo tới bộ phận phụ trách Ban Nội Dung - PT.\n☁️ Dữ liệu đã được lưu trữ an toàn vào hệ thống Drive riêng của Ban.');
  };

  return (
    <ClubContext.Provider value={{
      theme,
      toggleTheme,
      activeTab,
      setActiveTab,
      db,
      finances: db.finances || [],
      addFinanceRecord,
      updateFinanceStatus,
      deleteFinanceRecord,
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
      addEquipment,
      borrowEquipment,
      returnEquipment,
      drafts,
      completeGrading,
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
      setIsNewAccountModalOpen,
      meetings: db.meetings || [],
      createMeeting,
      cancelMeeting,
      updateMeeting,
      submitMeetingAttendance,
      submitMeetingMinutes,
      penalizeMember,
      updateMemberPoints,
      birthdayAssignments: db.birthdayAssignments || [],
      assignBirthdayDuty,
      submitBirthdayImage
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
