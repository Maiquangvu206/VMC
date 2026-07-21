// Service frontend kết nối API CSDL SQL
export const fetchMembersFromDatabaseAPI = async () => {
  try {
    const response = await fetch('/api/members');
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      // Map đúng 8 trường dữ liệu từ CSDL SQL sang Frontend Component
      return result.data.map(item => ({
        id: item.id,
        avatar: item.avatar_url,          // avatar_url
        name: item.full_name,             // full_name
        roleTitle: item.role,             // role
        memberCode: item.member_code,     // member_code
        class: item.class_name,           // class_name
        deptName: item.department,        // department
        phone: item.phone,                // phone
        dob: item.dob,                    // dob
        email: item.email,                // email
        status: item.status || 'Active'
      }));
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Lỗi gọi API CSDL SQL (Đang dùng dữ liệu dự phòng):', error.message);
    return null;
  }
};
