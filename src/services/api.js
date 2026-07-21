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
    let response = await fetch('/api/members');
    const contentType = response.headers.get('content-type') || '';
    
    // Nếu bị trả về HTML (do Nginx/Vite chưa proxy), tự động thử nối tới Backend Port 5000
    if (!response.ok || contentType.includes('text/html')) {
      try {
        const altUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/members`;
        const altResp = await fetch(altUrl);
        if (altResp.ok) {
          response = altResp;
        }
      } catch (altErr) {}
    }

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data.map(item => ({
        id: item.id,
        avatar: item.avatar_url || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        name: item.full_name || item.name,
        username: item.username,
        role: item.role || 'member',
        roleTitle: item.role_title || item.roleTitle || 'Thành Viên VMC',
        memberCode: item.member_code || item.memberCode,
        class: item.class_name || item.class,
        deptName: item.department || item.deptName,
        term: item.term || 'Gen 6',
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

// Secure Update Member API
export const updateMemberAPI = async (memberId, updatedFields) => {
  try {
    const response = await fetch(`/api/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: updatedFields.name,
        role: updatedFields.role || 'member',
        member_code: updatedFields.memberCode,
        class_name: updatedFields.class,
        department: updatedFields.deptName,
        phone: updatedFields.phone,
        dob: updatedFields.dob,
        email: updatedFields.email
      })
    });
    return await response.json();
  } catch (error) {
    console.warn('⚠️ Server Update API offline:', error.message);
    return { success: false, message: error.message };
  }
};
