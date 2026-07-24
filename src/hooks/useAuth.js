import { useState, useEffect } from 'react';
import { loginMemberAPI } from '../services/api';

export const useAuth = (db, setDb) => {
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

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('VMC_CURRENT_USER', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    sessionStorage.setItem('VMC_IS_AUTH', isAuthenticated);
  }, [isAuthenticated]);

  const login = async (memberCode, password) => {
    try {
      const apiRes = await loginMemberAPI(memberCode, password);
      if (apiRes && apiRes.success && apiRes.user) {
        const user = apiRes.user;

        if (user.status === 'Suspended') {
          return { success: false, message: 'Tài khoản này đã bị tạm khóa bởi Ban Chủ Nhiệm!' };
        }

        setCurrentUser(user);
        if (user.isFirstLogin && user.memberCode !== 'ADMIN') {
          setRequirePasswordChange(true);
          setIsAuthenticated(false);
        } else {
          setRequirePasswordChange(false);
          setIsAuthenticated(true);
        }
        return { success: true };
      }

      if (apiRes && !apiRes.success && apiRes.message?.includes('tạm khóa')) {
        return { success: false, message: apiRes.message };
      }

      if (!apiRes || !apiRes.success) {
        const rawErrMsg = apiRes?.message || 'Server API offline';
        const errMsg = rawErrMsg;
        if (errMsg === 'Server API offline' || errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('fetch')) {
          return { success: false, message: '❌ Không thể kết nối đến máy chủ! Vui lòng kiểm tra kết nối mạng hoặc liên hệ Bộ Phận Kỹ Thuật.' };
        }
        return { success: false, message: rawErrMsg };
      }

      return { success: false, message: 'Mã Thành Viên hoặc Mật khẩu không chính xác!' };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối server' };
    }
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

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setDb(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === updatedUser.id ? updatedUser : m
      )
    }));
  };

  return {
    currentUser,
    isAuthenticated,
    requirePasswordChange,
    setRequirePasswordChange,
    login,
    logout,
    updateUser,
    currentSessionId,
    setCurrentSessionId
  };
};
