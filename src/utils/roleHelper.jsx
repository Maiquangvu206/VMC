import React from 'react';

/**
 * Tách chuỗi chức vụ nếu có 2 hoặc nhiều chức vụ (phân cách bởi '/', '\n', hoặc dấu phẩy)
 * Ví dụ: "Phó Chủ Nhiệm / Trưởng Ban Đối Ngoại - Nhân Sự"
 * => ["Phó Chủ Nhiệm", "Trưởng Ban Đối Ngoại - Nhân Sự"]
 */
export const splitRoleTitles = (roleTitle) => {
  if (!roleTitle) return [];
  if (Array.isArray(roleTitle)) return roleTitle.filter(Boolean);
  return roleTitle
    .toString()
    .split(/\s*[\/\n]\s*/)
    .map(r => r.trim())
    .filter(Boolean);
};

/**
 * Component hiển thị chức vụ, tự động xuống dòng khi có từ 2 chức vụ trở lên
 */
export const RoleTitleDisplay = ({
  roleTitle,
  className = "text-xs text-blue-400 font-semibold",
  itemClassName = "leading-tight",
  fallback = "Thành viên"
}) => {
  const roles = splitRoleTitles(roleTitle || fallback);
  if (roles.length === 0) return null;

  return (
    <div className={`space-y-0.5 ${className}`}>
      {roles.map((role, idx) => (
        <div key={idx} className={itemClassName}>
          {role}
        </div>
      ))}
    </div>
  );
};
