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

const DEFAULT_GENERATIONS = [
  { id: 'gen-6', name: 'Gen 6', years: '2025-2026', description: '✨ Gen 6 (2025 - 2026)' },
  { id: 'gen-5', name: 'Gen 5', years: '2024-2025', description: '🎓 Gen 5 (2024 - 2025)' },
  { id: 'gen-4', name: 'Gen 4', years: '2023-2024', description: '🏆 Gen 4 (2023 - 2024)' },
  { id: 'gen-3', name: 'Gen 3', years: '2022-2023', description: '👑 Gen 3 (2022 - 2023)' },
  { id: 'gen-2', name: 'Gen 2', years: '2021-2022', description: '🚀 Gen 2 (2021 - 2022)' },
  { id: 'gen-1', name: 'Gen 1', years: '2020-2021', description: '🌟 Gen 1 (2020 - 2021)' }
];

export const ClubProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('VMC_ACTIVE_TAB') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    try {
      localStorage.setItem('VMC_ACTIVE_TAB', tabId);
    } catch (e) { }
  };

  const [db, setDb] = useState(() => loadDatabaseFromStorage());

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      let savedId = sessionStorage.getItem('VMC_SESSION_ID');
      if (!savedId) {
        savedId = 'sess-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        sessionStorage.setItem('VMC_SESSION_ID', savedId);
      }
      return savedId;
    } catch (e) {
      return 'sess-' + Date.now();
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('VMC_CURRENT_USER');
      return savedUser ? JSON.parse(savedUser) : (db.members?.[0] || null);
    } catch (e) {
      return db.members?.[0] || null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('VMC_IS_AUTH') === 'true';
    } catch (e) {
      return true;
    }
  });

  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [membersFilterDept, setMembersFilterDept] = useState('ALL');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      sessionStorage.setItem('VMC_IS_AUTH', 'true');
      sessionStorage.setItem('VMC_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('VMC_IS_AUTH');
      sessionStorage.removeItem('VMC_CURRENT_USER');
    }
  }, [isAuthenticated, currentUser]);

  const logoutMember = () => {
    try {
      const sessionId = sessionStorage.getItem('VMC_SESSION_ID') || currentSessionId;
      fetch('/api/sessions/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, memberId: currentUser?.id, username: currentUser?.username || currentUser?.memberCode })
      }).catch(() => {});
      sessionStorage.removeItem('VMC_IS_AUTH');
      sessionStorage.removeItem('VMC_CURRENT_USER');
      sessionStorage.removeItem('VMC_SESSION_ID');
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    const newId = 'sess-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    setCurrentSessionId(newId);
    try {
      sessionStorage.setItem('VMC_SESSION_ID', newId);
    } catch (e) {}
  };

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

          const currentMonth = new Date().toISOString().slice(0, 7);
          let nextDb = { ...prev, members: mergedMembers };

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
          } else if (!prev.lastPointsAddedMonth) {
            nextDb = { ...nextDb, lastPointsAddedMonth: currentMonth };
          }

          // Check 24h Grader Deadline
          const now = Date.now();
          if (nextDb.drafts) {
            nextDb.drafts = nextDb.drafts.map(draft => {
              if (draft.status === 'approved' && draft.publishDate && draft.graderId && draft.gradingStatus === 'pending') {
                const publishTime = new Date(draft.publishDate).getTime();
                if (now > publishTime + 24 * 60 * 60 * 1000) {
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

          saveDatabaseToStorage(nextDb);
          return nextDb;
        });
      }
    };
    loadSqlMembers();
  }, []);

  // Automatic Real-Time Silent Sync with MySQL Database
  useEffect(() => {
    let isMounted = true;

    const silentAutoSync = async () => {
      try {
        const [serverMembers, serverTasks, serverDrafts, serverEquipment, serverAnnouncements, serverFinances, serverMeetings, serverBirthday, serverMilestones, serverGenerations, serverResources, serverDrives, serverAttendance] = await Promise.all([
          fetchMembersFromDatabaseAPI(),
          fetchEntityAPI('tasks'),
          fetchEntityAPI('drafts'),
          fetchEntityAPI('equipment'),
          fetchEntityAPI('announcements'),
          fetchEntityAPI('finances'),
          fetchEntityAPI('meetings'),
          fetchEntityAPI('birthday-assignments'),
          fetchEntityAPI('milestones'),
          fetchEntityAPI('generations'),
          fetchEntityAPI('resources'),
          fetchEntityAPI('department-drives'),
          fetchEntityAPI('attendance-records')
        ]);

        if (isMounted) {
          const buildDefaultMilestones = (m) => [
            {
              id: 'm-def-1-' + m.id,
              memberId: m.id,
              date: '20/09/2024',
              title: `Gia nhập VMC (${m.deptName || m.department || 'Ban Chuyên Môn'})`,
              badgeText: '[Gia nhập]',
              badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            },
            {
              id: 'm-def-2-' + m.id,
              memberId: m.id,
              date: '01/06/2025',
              title: `Bổ nhiệm chức vụ: ${m.roleTitle || m.role_title || 'Thành Viên VMC'}`,
              badgeText: '[Chức vụ]',
              badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }
          ];

          const mergedMembers = (Array.isArray(serverMembers) ? serverMembers : []).map(m => {
            const tableMs = (Array.isArray(serverMilestones) ? serverMilestones : []).filter(ms => String(ms.memberId) === String(m.id) || String(ms.memberId) === String(m.memberCode));
            const existingMs = Array.isArray(m.milestones) ? m.milestones : [];
            const combinedMs = [...tableMs, ...existingMs];
            const uniqueMs = combinedMs.filter((v, idx, self) => self.findIndex(t => t.id === v.id) === idx);
            const finalMs = uniqueMs.length > 0 ? uniqueMs : buildDefaultMilestones(m);
            return { ...m, milestones: finalMs };
          });

          setDb(prev => {
            const currentMembers = mergedMembers.length > 0 ? mergedMembers : (prev.members || []);
            const normalizedTasks = Array.isArray(serverTasks)
              ? serverTasks.map(st => normalizeServerTask(st, (prev.tasks || []).find(t => t.id === st.id), currentMembers))
              : prev.tasks;
            const updated = {
              ...prev,
              members: currentMembers,
              tasks: normalizedTasks,
              drafts: Array.isArray(serverDrafts) ? serverDrafts : prev.drafts,
              equipment: Array.isArray(serverEquipment) ? serverEquipment : prev.equipment,
              announcements: Array.isArray(serverAnnouncements) ? serverAnnouncements : prev.announcements,
              finances: Array.isArray(serverFinances) ? serverFinances : prev.finances,
              meetings: Array.isArray(serverMeetings) ? serverMeetings : prev.meetings,
              birthdayAssignments: Array.isArray(serverBirthday) ? serverBirthday : prev.birthdayAssignments,
              generations: (Array.isArray(serverGenerations) && serverGenerations.length > 0) ? serverGenerations : (prev.generations || DEFAULT_GENERATIONS),
              resources: Array.isArray(serverResources) ? serverResources : prev.resources,
              departmentDrives: (Array.isArray(serverDrives) && serverDrives.length > 0) ? serverDrives : prev.departmentDrives,
              attendanceRecords: Array.isArray(serverAttendance) ? serverAttendance : prev.attendanceRecords
            };
            saveDatabaseToStorage(updated);
            return updated;
          });

          // Sync Sessions for Super Admin Session Management in real-time
          fetchEntityAPI('sessions').then(serverSessions => {
            if (Array.isArray(serverSessions)) setSessions(serverSessions);
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('ℹ️ Real-time MySQL sync status:', err.message);
      }
    };

    silentAutoSync();
    const intervalId = setInterval(silentAutoSync, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

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

  const announcements = db.announcements || [];
  const resources = db.resources || [];
  const departmentDrives = db.departmentDrives || [];
  const attendanceRecords = db.attendanceRecords || [];

  // Sync state changes into Dynamic Database
  const updateDb = (updater) => {
    setDb(prev => {
      const nextDb = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveDatabaseToStorage(nextDb);
      return nextDb;
    });
  };

  const getFirstLine = (text) => {
    if (typeof text !== 'string') return text;
    return text.split(/\r?\n/)[0] || text;
  };

  const normalizeYearMonth = (year, month) => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (Number.isNaN(y) || Number.isNaN(m) || m < 1 || m > 12) return null;
    return { y, m };
  };

  const getPhotoAndDataDeadline = (year, month) => {
    const normalized = normalizeYearMonth(year, month);
    if (!normalized) return null;
    return new Date(normalized.y, normalized.m - 2, 28);
  };

  const getMonitoringDeadline = (year, month) => {
    const normalized = normalizeYearMonth(year, month);
    if (!normalized) return null;
    return new Date(normalized.y, normalized.m, 0);
  };

  const findMemberById = (memberId, membersList) => {
    if (!memberId) return null;
    const list = (membersList && membersList.length > 0) ? membersList : (db.members || []);
    return list.find(m =>
      String(m.id) === String(memberId) ||
      String(m.memberCode) === String(memberId) ||
      String(m.username) === String(memberId)
    );
  };

  const getMemberNameById = (memberId, membersList) => {
    const member = findMemberById(memberId, membersList);
    return member?.name || member?.full_name || member?.memberCode || '';
  };

  const getHRHeadMember = () => {
    return (db.members || []).find(m => {
      const roleTitle = String(m.roleTitle || m.role_title || '').toLowerCase();
      const deptName = String(m.deptName || m.department || '').toLowerCase();
      return roleTitle.includes('trưởng ban') && (
        deptName.includes('đối ngoại') ||
        deptName.includes('nhân sự') ||
        deptName.includes('đn-ns') ||
        deptName.includes('dn-ns')
      );
    }) || (db.members || []).find(m => m.role === 'admin' || m.memberCode === 'ADMIN');
  };

  const normalizeServerTask = (task, localTask = {}, membersList = []) => {
    const assId = task.assigneeId || task.assignee_id || localTask.assigneeId;
    const resolvedName = getMemberNameById(assId, membersList);
    
    let assigneeName = task.assignee || localTask.assignee;
    if (resolvedName && resolvedName !== '') {
      assigneeName = resolvedName;
    } else if (!assigneeName || assigneeName === 'Chưa phân công') {
      assigneeName = 'Chưa phân công';
    }

    return {
      ...task,
      department: task.department || localTask.department || 'hr_external',
      desc: task.description || task.desc || localTask.desc || '',
      assigneeId: assId,
      assignee: assigneeName,
      pointsReward: task.pointsReward ?? task.points_reward ?? localTask.pointsReward ?? 10,
      status: task.status || localTask.status || 'todo',
      deadline: task.deadline || localTask.deadline || ''
    };
  };

  const createTaskRecord = async (taskData) => {
    const taskId = taskData.id || 'task-' + Date.now();
    let resolvedAssigneeId = taskData.assigneeId;
    if (!resolvedAssigneeId && taskData.assignee && taskData.assignee !== 'Cả Ban') {
      const matchMem = (db.members || []).find(m => m.name === taskData.assignee);
      if (matchMem) {
        resolvedAssigneeId = matchMem.id;
      }
    }
    const assigneeName = taskData.assignee || getMemberNameById(resolvedAssigneeId) || 'Chưa phân công';
    const deadline = taskData.deadline || taskData.deadlineDate || new Date().toISOString().slice(0, 10);
    const taskObj = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || taskData.desc || '',
      desc: taskData.desc || taskData.description || '',
      department: taskData.department || 'hr_external',
      assignee: assigneeName,
      assigneeId: resolvedAssigneeId,
      deadline,
      status: taskData.status || 'todo',
      pointsReward: taskData.pointsReward ?? taskData.points ?? 10,
      createdAt: taskData.createdAt || new Date().toISOString().slice(0, 10)
    };

    updateDb(prev => ({
      ...prev,
      tasks: [taskObj, ...((prev.tasks || []).filter(t => t.id !== taskId))]
    }));

    await createEntityAPI('tasks', {
      id: taskObj.id,
      title: taskObj.title,
      description: taskObj.description,
      assigneeId: taskObj.assigneeId,
      created_by: taskData.createdById || currentUser?.id,
      deadline: taskObj.deadline,
      status: taskObj.status,
      points_reward: taskObj.pointsReward
    }).catch(() => {});

    return taskObj;
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerConfetti = () => {
    // Disabled fireworks effect per user request
  };

  // Role Checks for Management Features (Admin & Ban Đối Ngoại - Nhân Sự ONLY)
  const currentUserRoleTitle = String(currentUser?.roleTitle || '').toLowerCase();
  const currentUserDeptName = String(currentUser?.deptName || currentUser?.department || '').toLowerCase();

  const isHRMember = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUserRoleTitle.includes('super admin') ||
    currentUserDeptName.includes('đối ngoại') ||
    currentUserDeptName.includes('nhân sự') ||
    currentUserDeptName.includes('đn-ns') ||
    currentUserDeptName.includes('dn-ns')
  );

  const isHRHead = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUserRoleTitle.includes('super admin') ||
    (currentUserRoleTitle.includes('trưởng ban') && (
      currentUserDeptName.includes('đối ngoại') ||
      currentUserDeptName.includes('nhân sự') ||
      currentUserDeptName.includes('đn-ns') ||
      currentUserDeptName.includes('dn-ns')
    ))
  );

  const isAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUserRoleTitle.includes('super admin') ||
    currentUserRoleTitle.includes('chủ nhiệm') ||
    isHRHead
  );

  const isSuperAdmin = Boolean(
    currentUser?.memberCode === 'ADMIN' ||
    currentUserRoleTitle.includes('super admin')
  );

  // Submit Attendance Checkin (Performed by External Relations - HR Member)
  const submitAttendanceCheckin = async (sessionName, presentMemberIds) => {
    const recordObj = {
      id: 'att-' + Date.now(),
      sessionName: sessionName || `Buổi Sinh Hoạt CLB ngày ${new Date().toLocaleDateString('vi-VN')}`,
      date: new Date().toLocaleDateString('vi-VN'),
      takenBy: `${currentUser.name} (${currentUser.roleTitle})`,
      presentMemberIds: presentMemberIds,
      status: 'pending_approval'
    };

    await createEntityAPI('attendance-records', recordObj);

    updateDb(prev => ({
      ...prev,
      attendanceRecords: [recordObj, ...(prev.attendanceRecords || [])]
    }));

    const hrHead = getHRHeadMember();
    await createTaskRecord({
      id: `task-approve-${recordObj.id}`,
      title: `Duyệt điểm danh ${recordObj.sessionName}`,
      description: `Có một danh sách điểm danh đang chờ Trưởng Ban Đối Ngoại - Nhân Sự duyệt. Vui lòng kiểm tra và xác nhận danh sách để cộng điểm.`,
      desc: `Điểm danh buổi ${recordObj.sessionName} đang chờ duyệt.`,
      department: 'hr_external',
      assigneeId: hrHead?.id,
      assignee: hrHead?.name || 'Trưởng Ban Đối Ngoại - Nhân Sự',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdById: currentUser?.id,
      pointsReward: 0,
      status: 'todo'
    });

    showToast('✅ Đã gửi yêu cầu điểm danh tới Trưởng Ban Đối Ngoại - Nhân Sự. Vui lòng chờ duyệt để cộng 50 PTS.', 'success');
  };

  // Approve Attendance Checkin (Performed by Head of External Relations - HR)
  const approveAttendanceCheckin = async (recordId) => {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) return;

    const presentIds = record.presentMemberIds || [];

    await updateEntityAPI('attendance-records', recordId, { status: 'approved' });

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
    showToast('🎉 Trưởng Ban Đối Ngoại - Nhân Sự đã duyệt thành công buổi điểm danh sinh hoạt! Tất cả thành viên có mặt đã được cộng 50 điểm thi đua PTS.', 'success');
  };

  // Login function matching Member Code & Password (API Auth & Local fallback)
  const login = async (memberCode, password) => {
    // 1. Authenticate via Private Server API
    const apiRes = await loginMemberAPI(memberCode, password);
    if (apiRes && apiRes.success && apiRes.user) {
      const user = apiRes.user;

      if (user.status === 'Suspended') {
        const errorText = getFirstLine('Tài khoản này đã bị tạm khóa bởi Ban Chủ Nhiệm!');
        showToast(errorText, 'error');
        return false;
      }

      setCurrentUser(user);
      if (user.isFirstLogin && user.memberCode !== 'ADMIN') {
        setRequirePasswordChange(true);
        setIsAuthenticated(false);
      } else {
        setRequirePasswordChange(false);
        setIsAuthenticated(true);
        triggerConfetti();
      }
      return true;
    }

    // If API returns a specific suspended message, alert it and stop
    if (apiRes && !apiRes.success && apiRes.message?.includes('tạm khóa')) {
      const errorText = getFirstLine(apiRes.message);
      showToast(errorText, 'error');
      return false;
    }

    // Nếu API thất bại (server offline / lỗi kết nối) → thông báo rõ ràng
    if (!apiRes || !apiRes.success) {
      const rawErrMsg = apiRes?.message || 'Server API offline';
      const errMsg = getFirstLine(rawErrMsg);
      if (errMsg === 'Server API offline' || errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('fetch')) {
        showToast('❌ Không thể kết nối đến máy chủ! Vui lòng kiểm tra kết nối mạng hoặc liên hệ Bộ Phận Kỹ Thuật.', 'error');
      }
      return false;
    }

    showToast('Mã Thành Viên hoặc Mật khẩu không chính xác!', 'error');
    return false;
  };

  // Mandatory first time password change
  const changePassword = async (oldPassword, newPassword) => {
    const targetId = currentUser?.id || currentUser?.memberCode;
    if (!targetId) return false;
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
    showToast('🎉 Đổi mật khẩu cá nhân thành công! Mật khẩu mới và trạng thái đã được lưu vào CSDL MySQL.', 'success');
    return true;
  };



  const logout = async () => {
    const sessionId = sessionStorage.getItem('VMC_SESSION_ID') || currentSessionId;
    try {
      await fetch('/api/sessions/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, memberId: currentUser?.id, username: currentUser?.username || currentUser?.memberCode })
      });
    } catch (e) {
      console.warn('⚠️ Không thể cập nhật trạng thái phiên khi đăng xuất:', e.message);
    }
    sessionStorage.removeItem('VMC_SESSION_ID');
    setIsAuthenticated(false);
    setRequirePasswordChange(false);
    setCurrentUser(null);
    const newId = 'sess-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    setCurrentSessionId(newId);
    try {
      sessionStorage.setItem('VMC_SESSION_ID', newId);
    } catch (e) {}
  };

  // Add new Resource item (Google Drive Link)
  const addResource = async (newResData) => {
    const resourceObj = {
      id: 'res-' + Date.now(),
      title: newResData.name || newResData.title || 'Tài nguyên mới',
      name: newResData.name || newResData.title || 'Tài nguyên mới',
      category: newResData.category || 'Khác',
      type: newResData.type || 'Link Drive',
      size: newResData.size || 'Cloud',
      driveUrl: newResData.driveUrl || newResData.link || 'https://drive.google.com/',
      link: newResData.driveUrl || newResData.link || 'https://drive.google.com/',
      uploader: currentUser?.name || 'Thành viên VMC',
      uploaderId: currentUser?.id
    };

    await createEntityAPI('resources', resourceObj);

    updateDb(prev => ({
      ...prev,
      resources: [resourceObj, ...(prev.resources || [])]
    }));

    triggerConfetti();
    showToast('🎉 Đã thêm thành công tài nguyên mới vào CSDL & Kho Drive VMC!', 'success');
    return true;
  };

  // Delete Resource item
  const deleteResource = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này khỏi kho Drive?')) return;
    await deleteEntityAPI('resources', id);
    updateDb(prev => ({
      ...prev,
      resources: (prev.resources || []).filter(r => r.id !== id)
    }));
    showToast('Đã xóa tài nguyên thành công!', 'info');
  };

  // Update Department Root Google Drive URL
  const updateDepartmentDrive = async (deptId, newDriveUrl) => {
    await updateEntityAPI('department-drives', deptId, { link: newDriveUrl, drive_link: newDriveUrl });

    updateDb(prev => ({
      ...prev,
      departmentDrives: (prev.departmentDrives || []).map(d =>
        d.id === deptId || d.deptName === deptId ? { ...d, driveUrl: newDriveUrl, link: newDriveUrl } : d
      )
    }));
    triggerConfetti();
    showToast('🎉 Đã cập nhật thành công thư mục Google Drive của Ban vào CSDL!', 'success');
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
    showToast('🎉 Đã cập nhật thành công thông tin hồ sơ và ảnh đại diện vào CSDL MySQL!', 'success');
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

    let newMsList = Array.isArray(memberObj.milestones) ? [...memberObj.milestones] : [];
    if (nextFields.roleTitle && nextFields.roleTitle !== memberObj.roleTitle) {
      const autoMs = {
        id: 'm-' + Date.now(),
        memberId: memberId,
        date: new Date().toLocaleDateString('vi-VN'),
        title: `Cập nhật chức vụ mới: ${nextFields.roleTitle}`,
        badgeText: '[Đổi chức vụ]',
        badgeStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
      };
      newMsList.push(autoMs);
      await createEntityAPI('milestones', autoMs).catch(() => { });
      nextFields.milestones = newMsList;
    }

    const fullPayload = { ...memberObj, ...nextFields };

    // 1. Sync to Server API Database
    await updateMemberAPI(memberObj.id || nextFields.memberCode || memberId, fullPayload);

    // 2. Fetch fresh data directly from MySQL
    const freshMembers = await fetchMembersFromDatabaseAPI();
    if (freshMembers && Array.isArray(freshMembers) && freshMembers.length > 0) {
      setDb(prev => {
        const mergedMembers = freshMembers.map(serverMem => {
          const localMem = (prev.members || []).find(m => String(m.id) === String(serverMem.id)) || {};
          const ms = (Array.isArray(serverMem.milestones) && serverMem.milestones.length > 0) ? serverMem.milestones : newMsList;
          return { ...localMem, ...serverMem, milestones: ms };
        });
        return { ...prev, members: mergedMembers };
      });
    }

    if (String(currentUser?.id) === String(memberId) || currentUser?.memberCode === memberId) {
      setCurrentUser(prev => ({ ...prev, ...nextFields, milestones: newMsList }));
    }

    triggerConfetti();
    showToast('🎉 Đã cập nhật thành công thông tin thành viên và lưu lịch sử vào CSDL!', 'success');
  };

  // Add Role Milestone to a Member (Ban ĐN-NS & Admin)
  const addMemberMilestone = async (memberId, milestone) => {
    const milestoneObj = {
      id: 'm-' + Date.now(),
      memberId: memberId,
      date: milestone.date || new Date().toLocaleDateString('vi-VN'),
      title: milestone.title || 'Cập nhật chức vụ mới',
      badgeText: milestone.badgeText || '[Chức vụ]',
      badgeStyle: milestone.badgeStyle || 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };

    // 1. Save directly into Member_Milestones table in MySQL
    await createEntityAPI('milestones', milestoneObj);

    // 2. Also update Members table milestones column for fast access
    const targetMem = db.members.find(m => String(m.id) === String(memberId) || m.memberCode === memberId);
    const existingMilestones = (targetMem?.milestones && Array.isArray(targetMem.milestones)) ? targetMem.milestones : [];
    const updatedMilestones = [...existingMilestones, milestoneObj];

    await updateMemberAPI(memberId, { milestones: updatedMilestones });

    setDb(prev => ({
      ...prev,
      members: prev.members.map(m => (String(m.id) === String(memberId) || m.memberCode === memberId) ? { ...m, milestones: updatedMilestones } : m)
    }));

    if (currentUser.id === memberId || currentUser.memberCode === memberId) {
      setCurrentUser(prev => ({
        ...prev,
        milestones: updatedMilestones
      }));
    }

    triggerConfetti();
    showToast('🎉 Đã thêm cột mốc mới vào bảng CSDL Member_Milestones thành công!', 'success');
  };

  // Helper permission check for Account Management (STRICTLY ONLY ADMIN & KỸ THUẬT BAN ĐỐI NGOẠI - NHÂN SỰ)
  const canManageAccounts = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.memberCode === 'ADMIN' ||
    currentUser?.roleTitle?.includes('Super Admin') ||
    (currentUser?.roleTitle?.includes('Kỹ Thuật') && (
      currentUser?.deptName?.includes('Đối Ngoại') ||
      currentUser?.deptName?.includes('Nhân Sự') ||
      currentUser?.deptName?.includes('ĐN-NS') ||
      currentUser?.department?.includes('Đối Ngoại') ||
      currentUser?.department?.includes('Nhân Sự')
    ))
  );

  // Account Creation (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const createMemberAccount = async (newAcc) => {
    if (!canManageAccounts) {
      showToast('⛔ Quyền bị từ chối! Chỉ có bộ phận kỹ thuật ban Đối Ngoại - Nhân Sự mới có quyền cấp tài khoản thành viên mới!', 'error');
      return false;
    }

    const generatedCode = "VMC-" + Math.floor(1000 + Math.random() * 9000);
    const accountObj = {
      id: "vmc-acc-" + Math.floor(100 + Math.random() * 900),
      memberCode: generatedCode,
      password: generatedCode,
      term: newAcc.term || newAcc.generation || 'Gen 6 (2025-2026)',
      isFirstLogin: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
      points: 100,
      status: "Active",
      ...newAcc
    };

    const firstMilestone = {
      id: 'm-' + Date.now(),
      memberId: accountObj.id,
      date: new Date().toLocaleDateString('vi-VN'),
      title: `Bắt đầu làm thành viên VMC (${accountObj.deptName || accountObj.department || 'Ban Chuyên Môn'})`,
      badgeText: '[Gia nhập]',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };
    accountObj.milestones = [firstMilestone];

    // 1. Sync to Server API Database
    await createMemberAPI(accountObj);

    // 2. Sync first milestone into Member_Milestones table
    await createEntityAPI('milestones', firstMilestone).catch(() => { });

    // 3. Update local state
    setDb(prev => ({
      ...prev,
      members: [...(prev.members || []), accountObj]
    }));

    triggerConfetti();
    showToast(`🎉 Thành viên ${accountObj.name || accountObj.full_name} đã được cấp tài khoản với mã thành viên ${generatedCode}`, 'success');
    return true;
  };

  // Reset password by Admin (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const resetAccountPassword = async (username) => {
    if (!canManageAccounts) {
      showToast('⛔ Quyền bị từ chối! Chỉ có Super Admin (Chủ Nhiệm CLB) và Trưởng Ban Đối Ngoại - Nhân Sự mới có quyền đặt lại mật khẩu thành viên!', 'error');
      return false;
    }

    const member = db.members.find(m => m.username === username || m.memberCode === username || m.id === username);
    if (!member) return false;

    const defaultPwd = member.memberCode || 'VMC2026@VinhBao';

    try {
      await fetch('/api/members/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          email: member.email,
          name: member.name,
          defaultPassword: defaultPwd
        })
      });
    } catch (e) {
      console.warn('⚠️ Lỗi kết nối API reset password:', e.message);
    }

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === member.id ? { ...m, password: defaultPwd, isFirstLogin: true } : m)
    }));

    showToast(`🔑 Đã đặt lại mật khẩu cho ${member.name} về mã thành viên (${defaultPwd}) thành công!`, 'success');
    return true;
  };

  const resetMemberPassword = async (memberId) => {
    const member = db.members.find(m => m.id === memberId || m.memberCode === memberId);
    if (!member) return false;
    return resetAccountPassword(member.username || member.memberCode || member.id);
  };

  // Delete Member Account (SUPER ADMIN & TRƯỞNG BAN ĐỐI NGOẠI - NHÂN SỰ ONLY)
  const deleteMemberAccount = async (id) => {
    if (!canManageAccounts) {
      showToast('⛔ Quyền bị từ chối! Chỉ có Super Admin (Chủ Nhiệm CLB) và Kỹ Thuật Ban Đối Ngoại - Nhân Sự mới có quyền xóa tài khoản thành viên khỏi hệ thống!', 'error');
      return false;
    }

    const memberToDelete = (db.members || []).find(m =>
      String(m.id) === String(id) ||
      String(m.memberCode || m.member_code).toUpperCase() === String(id).toUpperCase()
    );

    if (memberToDelete?.role === 'admin' || memberToDelete?.memberCode === 'ADMIN') {
      showToast('⛔ Không thể xóa tài khoản Super Admin chính!', 'error');
      return false;
    }

    const targetCode = memberToDelete?.memberCode || memberToDelete?.id || id;

    if (!window.confirm(`⚠️ XÁC NHẬN BẢO MẬT (QUYỀN ADMIN):\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản thành viên [${memberToDelete?.name || targetCode}] khỏi hệ thống CSDL?`)) {
      return false;
    }

    const res = await deleteMemberAPI(targetCode);

    if (!res || !res.success) {
      showToast(`❌ Xóa tài khoản thất bại: ${res?.message || 'Không thể kết nối CSDL'}`, 'error');
      return false;
    }

    updateDb(prev => ({
      ...prev,
      members: (prev.members || []).filter(m =>
        String(m.id) !== String(id) &&
        String(m.id) !== String(memberToDelete?.id) &&
        String(m.memberCode || m.member_code).toUpperCase() !== String(targetCode).toUpperCase()
      )
    }));

    triggerConfetti();
    showToast('🎉 Đã xóa vĩnh viễn tài khoản thành viên khỏi CSDL MySQL thành công!', 'success');
    return true;
  };

  const toggleAccountStatus = async (id) => {
    const member = db.members.find(m => m.id === id);
    if (!member) return;

    const newStatus = member.status === 'Active' ? 'Suspended' : 'Active';

    // Optimistic update ngay lập tức — trước khi API trả về
    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, status: newStatus } : m)
    }));

    try {
      // Gọi API cập nhật status vào DB
      const res = await updateMemberAPI(member.memberCode || member.member_code || member.id, {
        status: newStatus,
        name: member.name
      });

      if (!res || !res.success) {
        // Rollback nếu API thất bại
        updateDb(prev => ({
          ...prev,
          members: prev.members.map(m => m.id === id ? { ...m, status: member.status } : m)
        }));
        showToast('❌ Lỗi cập nhật trạng thái tài khoản!', 'error');
        return;
      }
    } catch (err) {
      // Rollback nếu lỗi kết nối
      updateDb(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === id ? { ...m, status: member.status } : m)
      }));
      showToast('❌ Lỗi kết nối server!', 'error');
      return;
    }

    if (newStatus === 'Suspended') {
      // Ép đăng xuất tất cả phiên của tài khoản bị khóa
      try {
        await fetch('/api/sessions/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            username: member.username || member.memberCode || member.member_code || member.id
          })
        });
      } catch (e) {
        console.warn('Lỗi khi đăng xuất phiên của tài khoản bị khóa:', e.message);
      }

      const normalizedIdentifiers = [member.id, member.memberCode, member.member_code, member.username]
        .filter(Boolean)
        .map(String);

      setSessions(prev => prev.map(s => {
        const sessionIdentifiers = [s.member_id, s.username].filter(Boolean).map(String);
        if (sessionIdentifiers.some(sid => normalizedIdentifiers.includes(sid))) {
          return { ...s, is_active: 0, logout_reason: 'suspended' };
        }
        return s;
      }));
    }

    const newMilestone = {
      id: 'm-' + Date.now(),
      memberId: member.id,
      date: new Date().toLocaleDateString('vi-VN'),
      title: newStatus === 'Suspended' ? 'Đã dừng hoạt động (Bị khóa bởi Admin)' : 'Tiếp tục hoạt động (Đã mở khóa)',
      badgeText: newStatus === 'Suspended' ? '[Dừng hoạt động]' : '[Đang hoạt động]',
      badgeStyle: newStatus === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };

    updateDb(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === id) {
          return { ...m, status: newStatus, milestones: [...(m.milestones || []), newMilestone] };
        }
        return m;
      })
    }));

    showToast(
      newStatus === 'Suspended'
        ? `🔒 Đã khóa tài khoản ${member.name} thành công!`
        : `🔓 Đã mở khóa tài khoản ${member.name} thành công!`,
      newStatus === 'Suspended' ? 'warning' : 'success'
    );
  };

  // Update Task Status
  const updateTaskStatus = (taskId, newStatus) => {
    if (String(taskId).startsWith('virtual-')) {
      showToast('Nhiệm vụ này được quản lý tự động. Vui lòng thực hiện trong phần Điểm Danh / Sinh Nhật tương ứng!', 'warning');
      return;
    }
    updateDb(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    }));
    updateEntityAPI('tasks', taskId, { status: newStatus }).catch(e => console.log(e));
  };

  // Add New Task
  const addTask = (newTask) => {
    createTaskRecord({
      ...newTask,
      status: 'todo'
    }).catch(() => {});
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
  const completeGrading = (draftId, gradingData) => {
    const { likesCount, sharesCount, commentsCount, contentScore, finalScore } = gradingData || {};
    
    updateDb(prev => {
      const updatedDrafts = (prev.drafts || []).map(d => {
        if (d.id === draftId) {
          return {
            ...d,
            gradingStatus: 'completed',
            likesCount: likesCount || 0,
            sharesCount: sharesCount || 0,
            commentsCount: commentsCount || 0,
            contentScore: contentScore || 0,
            finalScore: finalScore || 0
          };
        }
        return d;
      });
      
      // Tìm tác giả của bài viết và cộng điểm
      const draft = (prev.drafts || []).find(d => d.id === draftId);
      if (draft && draft.authorId) {
        setTimeout(() => {
          updateMemberPoints(draft.authorId, finalScore || 10, `Được chấm điểm từ bài viết Fanpage "${draft.title}" đạt ${finalScore || 0} điểm`);
        }, 100);
      }

      return {
        ...prev,
        drafts: updatedDrafts
      };
    });

    updateEntityAPI('drafts', draftId, {
      gradingStatus: 'completed',
      likesCount: likesCount || 0,
      sharesCount: sharesCount || 0,
      commentsCount: commentsCount || 0,
      contentScore: contentScore || 0,
      finalScore: finalScore || 0
    }).catch(e => console.log(e));

    triggerConfetti();
  };

  // Add New Draft
  const addDraft = (newDraft) => {
    const draftObj = {
      id: "draft-" + Math.floor(200 + Math.random() * 800),
      author: `${currentUser.name} (${currentUser.roleTitle})`,
      authorId: currentUser.id,
      author_id: currentUser.id,
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
      showToast('Đã khôi phục thành công Cơ sở dữ liệu từ file JSON!', 'success');
    } catch (err) {
      showToast('Lỗi khi nhập file CSDL: ' + err.message, 'error');
    }
  };

  const handleResetDB = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset toàn bộ Cơ sở dữ liệu về mặc định ban đầu không?')) {
      const defaultDb = resetDatabaseToDefault();
      setDb(defaultDb);
      showToast('Đã khôi phục CSDL về mặc định!', 'info');
    }
  };

  const addFinanceRecord = async (record) => {
    // Lưu lên MySQL trước
    const res = await createEntityAPI('finances', {
      type: record.type,
      amount: record.amount,
      description: record.description,
      date: record.date,
      logged_by: record.loggedBy || currentUser?.name || '',
      status: record.status
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
    // Persist to backend
    updateEntityAPI('finances', recordId, { status: newStatus }).catch(e => console.log(e));
    if (newStatus === 'approved') {
      showToast('✅ Đã duyệt dự trù kinh phí thành công!', 'success');
    } else {
      showToast('❌ Đã từ chối dự trù kinh phí!', 'info');
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
      attendance_taker_id: meeting.attendanceTakerId || meeting.attendance_taker_id || null,
      minute_taker_id: meeting.minuteTakerId || meeting.minute_taker_id || null,
      attendanceTakerId: meeting.attendanceTakerId || meeting.attendance_taker_id || null,
      minuteTakerId: meeting.minuteTakerId || meeting.minute_taker_id || null,
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
    showToast(isPostponed ? 'Đã chuyển sang chế độ Hoãn cuộc họp!' : 'Đã cập nhật thời gian cuộc họp!', 'info');
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
    showToast('✅ Đã nộp biên bản cuộc họp!', 'success');
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
    } catch (err) { console.error(err); }

    showToast(`✅ Đã trừ ${pointsToDeduct} điểm của thành viên với lý do: ${reason}`, 'warning');
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
    } catch (err) { console.error(err); }

    const actionText = finalDelta > 0 ? 'CỘNG' : 'TRỪ';
    showToast(`✅ Đã ${actionText} ${Math.abs(finalDelta)} điểm của [${member.name}]. Lý do: ${reason}`, 'info');
  };

  // -------------------------------------------------------------
  // NEW: BIRTHDAY MANAGEMENT FUNCTIONS
  // -------------------------------------------------------------
  const assignBirthdayDuty = async (month, year, memberId) => {
    const exists = (db.birthdayAssignments || []).find(a => String(a.month) === String(month) && String(a.year) === String(year));
    if (exists) {
      showToast(`⚠️ Nhiệm vụ sinh nhật tháng ${month}/${year} đã được giao! Hệ thống không cho phép giao lại lần 2.`, 'warning');
      return false;
    }

    const assignedMember = (db.members || []).find(m => String(m.id) === String(memberId) || String(m.memberCode) === String(memberId));

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
 
    // Task 1: Chuẩn bị tư liệu — deadline ngày 28 tháng TRƯỚC
    const prepDeadlineDate = getPhotoAndDataDeadline(year, month) || new Date();
    const prepDeadline = `${prepDeadlineDate.getFullYear()}-${String(prepDeadlineDate.getMonth() + 1).padStart(2, '0')}-${String(prepDeadlineDate.getDate()).padStart(2, '0')}`;

    await createTaskRecord({
      id: `task-bday-prep-${bdayObj.id}`,
      title: `Chuẩn bị tư liệu sinh nhật tháng ${month}/${year}`,
      description: `Tìm hình ảnh, viết lời chúc cho thành viên sinh nhật tháng ${month}/${year}. Hạn chót nộp tư liệu: ${prepDeadline}.`,
      desc: `Nộp tư liệu sinh nhật tháng ${month}/${year} trước ngày ${prepDeadline}.`,
      department: 'hr_external',
      assigneeId: memberId,
      assignee: assignedMember?.name || 'Thành viên còn thiếu',
      deadline: prepDeadline,
      createdById: currentUser?.id,
      pointsReward: 0,
      status: 'todo'
    });

    // Task 2: Trực sinh nhật — deadline ngày cuối tháng sinh nhật
    const monitorDeadlineDate = getMonitoringDeadline(year, month) || new Date();
    const monitorDeadline = `${monitorDeadlineDate.getFullYear()}-${String(monitorDeadlineDate.getMonth() + 1).padStart(2, '0')}-${String(monitorDeadlineDate.getDate()).padStart(2, '0')}`;

    await createTaskRecord({
      id: `task-bday-monitor-${bdayObj.id}`,
      title: `Trực sinh nhật tháng ${month}/${year}`,
      description: `Thành viên ${assignedMember?.name || assignedMember?.memberCode || 'Chưa có'} phụ trách đăng bài chúc mừng sinh nhật cho các thành viên trong tháng ${month}/${year}. Hạn chót: ${monitorDeadline}.`,
      desc: `Trực sinh nhật tháng ${month}/${year} — hạn cuối tháng (${monitorDeadline}).`,
      department: 'hr_external',
      assigneeId: memberId,
      assignee: assignedMember?.name || 'Thành viên còn thiếu',
      deadline: monitorDeadline,
      createdById: currentUser?.id,
      pointsReward: 0,
      status: 'todo'
    });
 
    showToast(`✅ Đã phân công nhiệm vụ trực sinh nhật tháng ${month}/${year}`, 'success');
    return true;
  };
 
  const submitBirthdayImage = async (assignmentId, link) => {
    await updateEntityAPI('birthday-assignments', assignmentId, { link, status: 'completed' });
 
    updateDb(prev => ({
      ...prev,
      birthdayAssignments: (prev.birthdayAssignments || []).map(a =>
        a.id === assignmentId ? { ...a, link, status: 'completed' } : a
      ),
      tasks: (prev.tasks || []).map(task =>
        task.id === `task-bday-${assignmentId}` ? { ...task, status: 'done' } : task
      )
    }));
    showToast('✅ Đã nộp link bài đăng sinh nhật thành công!', 'success');
  };

  const submitMemberBirthdayData = async (assignmentId, memberId, link) => {
    const assignment = (db.birthdayAssignments || []).find(a => String(a.id) === String(assignmentId));
    if (!assignment) return;

    const currentSubs = assignment.submissions || {};
    const newSubs = { ...currentSubs, [memberId]: link };

    const bdayMonthMembers = (db.members || []).filter(m => {
      if (!m.dob) return false;
      const parts = m.dob.split('/');
      return parts.length >= 2 && parseInt(parts[1], 10) === parseInt(assignment.month, 10);
    });

    const isAllSubmitted = bdayMonthMembers.length > 0 && bdayMonthMembers.every(m => Boolean(newSubs[m.id]));
    const newStatus = isAllSubmitted ? 'completed' : 'pending';

    await updateEntityAPI('birthday-assignments', assignmentId, {
      submissions: newSubs,
      status: newStatus,
      link: link || assignment.link
    });

    updateDb(prev => ({
      ...prev,
      birthdayAssignments: (prev.birthdayAssignments || []).map(a =>
        a.id === assignmentId ? { ...a, submissions: newSubs, status: newStatus, link: link || a.link } : a
      )
    }));
 
    if (isAllSubmitted) {
      updateDb(prev => ({
        ...prev,
        tasks: (prev.tasks || []).map(task =>
          task.id === `task-bday-${assignmentId}` ? { ...task, status: 'done' } : task
        )
      }));
    }
 
    showToast(isAllSubmitted ? '🎉 Đã nộp đủ dữ liệu sinh nhật cho tất cả thành viên trong tháng!' : '✅ Đã cập nhật link sinh nhật thành công!', 'success');
  };

  const submitBirthdayExcuse = async (assignmentId, reason) => {
    await updateEntityAPI('birthday-assignments', assignmentId, {
      excuseReason: reason,
      excuseStatus: 'pending'
    });

    updateDb(prev => ({
      ...prev,
      birthdayAssignments: (prev.birthdayAssignments || []).map(a =>
        a.id === assignmentId ? { ...a, excuseReason: reason, excuseStatus: 'pending' } : a
      )
    }));

    showToast('📩 Đã gửi đơn giải trình lý do nộp chậm tới Trưởng Ban!', 'info');
  };

  const reviewBirthdayExcuse = async (assignmentId, status) => {
    await updateEntityAPI('birthday-assignments', assignmentId, { excuseStatus: status });

    updateDb(prev => ({
      ...prev,
      birthdayAssignments: (prev.birthdayAssignments || []).map(a =>
        a.id === assignmentId ? { ...a, excuseStatus: status } : a
      )
    }));

    showToast(status === 'approved' ? '✅ Đã duyệt miễn phạt nộp chậm sinh nhật!' : '❌ Đã từ chối đơn giải trình', status === 'approved' ? 'success' : 'warning');
  };

  // -------------------------------------------------------------
  // SESSIONS MANAGEMENT (SUPER ADMIN)
  // -------------------------------------------------------------

  const loadSqlSessions = async () => {
    try {
      const res = await fetchEntityAPI('sessions');
      if (Array.isArray(res)) setSessions(res);
    } catch (e) {}
  };

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const registerSession = async () => {
      try {
        const resp = await fetch('/api/sessions/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            memberId: currentUser.id,
            username: currentUser.username || currentUser.memberCode,
            name: currentUser.name,
            roleTitle: currentUser.roleTitle,
            userAgent: navigator.userAgent
          })
        });
        const data = await resp.json();
        if (data && data.success && data.sessionId && data.sessionId !== currentSessionId) {
          setCurrentSessionId(data.sessionId);
          try {
            sessionStorage.setItem('VMC_SESSION_ID', data.sessionId);
          } catch (e) {}
        }
      } catch (e) {}
    };

    registerSession();

    const hbInterval = setInterval(async () => {
      try {
        const resp = await fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId })
        });
        const data = await resp.json();
        if (data && data.success && data.isActive === false) {
          showToast('⚠️ Phiên làm việc của bạn đã bị Super Admin đóng từ xa.', 'error');
          logoutMember();
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(hbInterval);
  }, [isAuthenticated, currentUser?.id, currentSessionId]);

  const revokeSession = async (sId) => {
    try {
      await fetch(`/api/sessions/${sId}`, { method: 'DELETE' });
      showToast('✅ Đã hủy phiên làm việc thành công', 'success');
      loadSqlSessions();
    } catch (e) {
      showToast('❌ Lỗi khi hủy phiên', 'error');
    }
  };

  const revokeAllSessions = async () => {
    try {
      await fetch('/api/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSessionId })
      });
      showToast('✅ Đã cưỡng chế đăng xuất tất cả các phiên khác thành công', 'success');
      loadSqlSessions();
    } catch (e) {
      showToast('❌ Lỗi khi đăng xuất tất cả phiên', 'error');
    }
  };

  // Add BCN Announcement
  const addAnnouncement = async (annData) => {
    const annObj = {
      id: 'ann-' + Date.now(),
      title: annData.title,
      content: annData.content,
      authorId: currentUser?.id,
      date: new Date().toLocaleDateString('vi-VN'),
      priority: annData.isPinned ? 'Ghim đầu' : 'Thông báo',
      isPinned: annData.isPinned || false
    };

    await createEntityAPI('announcements', annObj);

    updateDb(prev => ({
      ...prev,
      announcements: [annObj, ...(prev.announcements || [])]
    }));

    showToast('🎉 Đã đăng thông báo Ban Chủ Nhiệm thành công vào CSDL!', 'success');
    return true;
  };

  // Delete BCN Announcement
  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này khỏi CSDL?')) return;
    await deleteEntityAPI('announcements', id);
    updateDb(prev => ({
      ...prev,
      announcements: (prev.announcements || []).filter(a => a.id !== id)
    }));
    showToast('Đã xóa thông báo thành công!', 'info');
  };

  return (
    <ClubContext.Provider value={{
      theme,
      toggleTheme,
      toasts,
      showToast,
      removeToast,
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
      user: currentUser,
      members: db.members || [],
      tasks: [
        ...(db.tasks || []),
        ...((() => {
          const virtuals = [];
          
          // 1. Birthday Assignments -> Tasks (2 task riêng biệt)
          const birthdayAssignments = db.birthdayAssignments || [];
          birthdayAssignments.forEach(b => {
            const assigneeObj = (db.members || []).find(m => String(m.id) === String(b.memberId) || String(m.memberCode) === String(b.memberId));
            const assigneeName = assigneeObj ? assigneeObj.name : 'Chưa phân công';
            const status = b.status === 'completed' ? 'done' : 'doing';

            // Task 1: Chuẩn bị tư liệu — deadline ngày 28 tháng TRƯỚC
            const prepDate = getPhotoAndDataDeadline(b.year, b.month) || new Date();
            const prepDeadline = `${prepDate.getFullYear()}-${String(prepDate.getMonth() + 1).padStart(2, '0')}-${String(prepDate.getDate()).padStart(2, '0')}`;
            virtuals.push({
              id: `virtual-bday-prep-${b.id}`,
              title: `🎂 Chuẩn bị tư liệu sinh nhật tháng ${b.month}/${b.year}`,
              description: `Tìm hình ảnh, viết lời chúc cho thành viên sinh nhật tháng ${b.month}/${b.year}. Hạn nộp tư liệu: ngày 28 tháng trước.`,
              desc: `Nộp tư liệu sinh nhật tháng ${b.month}/${b.year} trước ngày ${prepDeadline}.`,
              department: 'hr_external',
              assignee: assigneeName,
              assigneeId: b.memberId,
              deadline: prepDeadline,
              status,
              pointsReward: 10,
              isVirtual: true,
              virtualType: 'birthday_prep'
            });

            // Task 2: Trực sinh nhật — deadline ngày cuối tháng sinh nhật
            const monitorDate = getMonitoringDeadline(b.year, b.month) || new Date();
            const monitorDeadline = `${monitorDate.getFullYear()}-${String(monitorDate.getMonth() + 1).padStart(2, '0')}-${String(monitorDate.getDate()).padStart(2, '0')}`;
            virtuals.push({
              id: `virtual-bday-monitor-${b.id}`,
              title: `🎉 Trực sinh nhật tháng ${b.month}/${b.year}`,
              description: `Đăng bài chúc mừng sinh nhật cho các thành viên trong tháng ${b.month}/${b.year}. Hạn chót: cuối tháng ${b.month}.`,
              desc: `Trực sinh nhật tháng ${b.month}/${b.year} — hạn cuối tháng (${monitorDeadline}).`,
              department: 'hr_external',
              assignee: assigneeName,
              assigneeId: b.memberId,
              deadline: monitorDeadline,
              status,
              pointsReward: 10,
              isVirtual: true,
              virtualType: 'birthday_monitor'
            });
          });

          // 2. Meeting Attendance & Minutes Takers -> Tasks
          const meetings = db.meetings || [];
          meetings.forEach(m => {
            if (m.attendanceTakerId || m.attendance_taker_id) {
              const takerId = m.attendanceTakerId || m.attendance_taker_id;
              const takerObj = (db.members || []).find(mem => String(mem.id) === String(takerId) || String(mem.memberCode) === String(takerId));
              const takerName = takerObj ? takerObj.name : 'Chưa phân công';
              
              const status = (m.status === 'completed' || m.status === 'pending_minutes') ? 'done' : 'todo';
              
              virtuals.push({
                id: `virtual-meet-att-${m.id}`,
                title: `📝 Phụ trách điểm danh họp: ${m.title}`,
                description: `Tiến hành điểm danh các thành viên có mặt và vắng mặt trong buổi họp diễn ra vào lúc ${m.time} ngày ${m.date}.`,
                desc: `Tiến hành điểm danh các thành viên có mặt và vắng mặt trong buổi họp diễn ra vào lúc ${m.time} ngày ${m.date}.`,
                department: 'hr_external',
                assignee: takerName,
                assigneeId: takerId,
                deadline: m.date,
                status,
                pointsReward: 10,
                isVirtual: true,
                virtualType: 'attendance'
              });
            }

            if (m.minuteTakerId || m.minute_taker_id) {
              const takerId = m.minuteTakerId || m.minute_taker_id;
              const takerObj = (db.members || []).find(mem => String(mem.id) === String(takerId) || String(mem.memberCode) === String(takerId));
              const takerName = takerObj ? takerObj.name : 'Chưa phân công';
              
              const status = (m.status === 'completed' || m.minutesLink) ? 'done' : 'todo';

              virtuals.push({
                id: `virtual-meet-min-${m.id}`,
                title: `✍️ Ghi biên bản cuộc họp: ${m.title}`,
                description: `Ghi lại biên bản chi tiết các nội dung, biểu quyết và phân công công việc của buổi họp vào Google Docs.`,
                desc: `Ghi lại biên bản chi tiết các nội dung, biểu quyết và phân công công việc của buổi họp vào Google Docs.`,
                department: 'hr_external',
                assignee: takerName,
                assigneeId: takerId,
                deadline: m.date,
                status,
                pointsReward: 10,
                isVirtual: true,
                virtualType: 'minutes'
              });
            }
          });

          return virtuals;
        })())
      ],
      updateTaskStatus,
      addTask,
      equipment: db.equipment || [],
      addEquipment,
      borrowEquipment,
      returnEquipment,
      drafts: db.drafts || [],
      completeGrading,
      approveDraft,
      addDraft,
      announcements: db.announcements || [],
      addAnnouncement,
      deleteAnnouncement,
      generations: db.generations || DEFAULT_GENERATIONS,
      createMemberAccount,
      deleteMemberAccount,
      resetAccountPassword,
      resetMemberPassword,
      toggleAccountStatus,
      resources: db.resources || [],
      addResource,
      deleteResource,
      departmentDrives: db.departmentDrives || [],
      updateDepartmentDrive,
      attendanceRecords: db.attendanceRecords || [],
      isHRMember,
      isHRHead,
      isAdmin,
      isSuperAdmin,
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
      membersFilterDept,
      setMembersFilterDept,
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
      submitBirthdayImage,
      submitMemberBirthdayData,
      submitBirthdayExcuse,
      reviewBirthdayExcuse,
      getPhotoAndDataDeadline,
      getMonitoringDeadline,
      sessions,
      currentSessionId,
      loadSqlSessions,
      revokeSession,
      revokeAllSessions,
      logoutMember,
      works: [],
      events: [],
      products: [],
      cart: [],
      addToCart: () => {},
      registerEvent: () => {},
      likeWork: () => {}
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
