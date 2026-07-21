// Secure Server Login API
export const loginMemberAPI = async (memberCode, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    const response = await fetch('/api/members');
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data.map(item => ({
        id: item.id,
        avatar: item.avatar_url || item.avatar,
        name: item.full_name || item.name,
        roleTitle: item.role_title || item.role,
        memberCode: item.member_code || item.memberCode,
        class: item.class_name || item.class,
        deptName: item.department || item.deptName,
        phone: item.phone,
        dob: item.dob,
        email: item.email,
        status: item.status || 'Active'
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
        'Content-Type': 'application/json'
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
        phone: newAcc.phone,
        email: newAcc.email,
        dob: newAcc.dob
      })
    });
    return await response.json();
  } catch (error) {
    console.warn('⚠️ Server Create API offline:', error.message);
    return { success: false, message: error.message };
  }
};
