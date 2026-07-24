// Secure Server Login API
export const loginMemberAPI = async (memberCode, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ memberCode, password })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('⚠️ Server Login API offline (Fallback to Local DB):', error.message);
    return { success: false, message: 'Server API offline' };
  }
};

// Service frontend kết nối API CSDL SQL
export const fetchMembersFromDatabaseAPI = async () => {
  try {
    const response = await fetch('/api/members', {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data.map(item => ({
        id: item.id,
        avatar: item.avatar || item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        name: item.name || item.full_name,
        username: item.username,
        password: item.password,
        role: item.role || 'member',
        roleTitle: item.roleTitle || item.role_title || 'Thành Viên VMC',
        memberCode: item.memberCode || item.member_code,
        class: item.class || item.class_name,
        deptName: item.deptName || item.department,
        department: item.deptName || item.department,
        term: item.term || 'Gen 6',
        phone: item.phone,
        dob: item.dob,
        email: item.email,
        address: item.address,
        facebook: item.facebook,
        status: item.status || 'Active',
        points: item.points !== undefined ? item.points : 0,
        isFirstLogin: item.isFirstLogin !== undefined ? item.isFirstLogin : true
      }));
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Lỗi gọi API CSDL SQL (Đang dùng dữ liệu dự phòng):', error.message);
    return null;
  }
};

// Secure Create Member API
export const createMemberAPI = async (newAcc) => {
  try {
    const response = await fetch('/api/members/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        member_code: newAcc.memberCode,
        username: newAcc.username,
        password: newAcc.password,
        full_name: newAcc.name,
        role: newAcc.role,
        role_title: newAcc.roleTitle,
        class_name: newAcc.class,
        department: newAcc.deptName,
        term: newAcc.term || newAcc.generation || newAcc.termName || 'Gen 6',
        phone: newAcc.phone,
        email: newAcc.email,
        dob: newAcc.dob,
        address: newAcc.address,
        facebook: newAcc.facebook
      })
    });
    return await response.json();
  } catch (error) {
    console.warn('⚠️ Server Create API offline:', error.message);
    return { success: false, message: error.message };
  }
};

// Secure Update Member API
export const updateMemberAPI = async (memberId, updatedFields) => {
  try {
    // Chỉ gửi các field có giá trị thực sự (không gửi undefined) để tránh ghi đè dữ liệu không cần thiết
    const payload = {};
    const fn = updatedFields.name !== undefined ? updatedFields.name : updatedFields.full_name;
    if (fn !== undefined) payload.full_name = fn;
    if (updatedFields.role !== undefined) payload.role = updatedFields.role;
    const rt = updatedFields.roleTitle !== undefined ? updatedFields.roleTitle : updatedFields.role_title;
    if (rt !== undefined) payload.role_title = rt;
    const mc = updatedFields.memberCode !== undefined ? updatedFields.memberCode : updatedFields.member_code;
    if (mc !== undefined) payload.member_code = mc;
    const cn = updatedFields.class !== undefined ? updatedFields.class : updatedFields.class_name;
    if (cn !== undefined) payload.class_name = cn;
    const dept = updatedFields.deptName !== undefined ? updatedFields.deptName : updatedFields.department;
    if (dept !== undefined) payload.department = dept;
    const term = updatedFields.term !== undefined ? updatedFields.term : updatedFields.termName;
    if (term !== undefined) payload.term = term;
    if (updatedFields.phone !== undefined) payload.phone = updatedFields.phone;
    if (updatedFields.dob !== undefined) payload.dob = updatedFields.dob;
    if (updatedFields.email !== undefined) payload.email = updatedFields.email;
    if (updatedFields.points !== undefined) payload.points = updatedFields.points;
    if (updatedFields.address !== undefined) payload.address = updatedFields.address;
    if (updatedFields.facebook !== undefined) payload.facebook = updatedFields.facebook;
    const av = updatedFields.avatar || updatedFields.avatar_url;
    if (av !== undefined) { payload.avatar_url = av; payload.avatar = av; }
    if (updatedFields.status !== undefined) payload.status = updatedFields.status;
    // Chỉ gửi password khi là string không rỗng
    if (typeof updatedFields.password === 'string' && updatedFields.password.length > 0) {
      payload.password = updatedFields.password;
    }
    const ifl = updatedFields.isFirstLogin !== undefined ? updatedFields.isFirstLogin : updatedFields.is_first_login;
    if (ifl !== undefined) { payload.is_first_login = ifl; payload.isFirstLogin = ifl; }
    if (updatedFields.milestones !== undefined) payload.milestones = updatedFields.milestones;

    const response = await fetch(`/api/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.warn('⚠️ Server Update API offline:', error.message);
    return { success: false, message: error.message };
  }
};

// Secure Delete Member API
export const deleteMemberAPI = async (memberId) => {
  try {
    const response = await fetch(`/api/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return await response.json();
  } catch (error) {
    console.warn('⚠️ Server Delete Member API offline:', error.message);
    return { success: false, message: error.message };
  }
};
