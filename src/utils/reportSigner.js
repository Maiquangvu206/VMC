/**
 * Helper to manage Report Signers (Người Ký Báo Cáo)
 * Hiện tại áp dụng CHỈ RIÊNG Ban Đối Ngoại - Nhân Sự:
 * - Trưởng Ban: TM. BAN ĐỐI NGOẠI - NHÂN SỰ / TRƯỞNG BAN
 * - Phó Ban: TM. BAN ĐỐI NGOẠI - NHÂN SỰ / KT. TRƯỞNG BAN / PHÓ BAN
 */

export const getAvailableSigners = (members = []) => {
  const result = [];
  const seenIds = new Set();

  const addSigner = (m, labelPrefix, roleType) => {
    if (!m || seenIds.has(m.id)) return;
    seenIds.add(m.id);
    result.push({
      id: String(m.id),
      name: m.name || m.full_name || 'Đặng Nguyệt Minh',
      title: m.roleTitle || m.role_title || '',
      label: `${labelPrefix}: ${m.name || m.full_name}`,
      roleType // 'head' | 'vice'
    });
  };

  // 1. Trưởng Ban Đối Ngoại - Nhân Sự
  const hrHeads = (members || []).filter(m => {
    const role = (m.roleTitle || m.role_title || '').toLowerCase();
    const dept = (m.deptName || m.department || '').toLowerCase();
    const isEx = role.includes('cựu') || role.includes('cố vấn') || dept.includes('cố vấn');
    return !isEx && (
      (role.includes('trưởng ban') || role.includes('trưởng ban đối ngoại') || role.includes('trưởng ban nhân sự')) &&
      (role.includes('đối ngoại') || role.includes('nhân sự') || dept.includes('đối ngoại') || dept.includes('nhân sự') || role.includes('đn-ns') || dept.includes('đn-ns'))
    );
  });
  hrHeads.forEach(m => addSigner(m, 'Trưởng Ban', 'head'));

  // 2. Phó Ban Đối Ngoại - Nhân Sự
  const hrVices = (members || []).filter(m => {
    const role = (m.roleTitle || m.role_title || '').toLowerCase();
    const dept = (m.deptName || m.department || '').toLowerCase();
    const isEx = role.includes('cựu') || role.includes('cố vấn') || dept.includes('cố vấn');
    return !isEx && (
      role.includes('phó ban') &&
      (role.includes('đối ngoại') || role.includes('nhân sự') || dept.includes('đối ngoại') || dept.includes('nhân sự') || role.includes('đn-ns') || dept.includes('đn-ns'))
    );
  });
  hrVices.forEach(m => addSigner(m, 'TM. & KT. Phó Ban', 'vice'));

  // Fallback defaults if list is empty
  if (result.length === 0) {
    result.push({
      id: 'default-head',
      name: 'Đặng Nguyệt Minh',
      title: 'Trưởng Ban Đối Ngoại - Nhân Sự',
      label: 'Trưởng Ban: Đặng Nguyệt Minh',
      roleType: 'head'
    });
    result.push({
      id: 'default-vice',
      name: 'Đào Trung Kiên',
      title: 'Phó Ban Đối Ngoại - Nhân Sự',
      label: 'TM. & KT. Phó Ban: Đào Trung Kiên',
      roleType: 'vice'
    });
  }

  return result;
};

export const findSigner = (signers = [], selectedSignerId = '') => {
  if (!Array.isArray(signers) || signers.length === 0) return null;
  if (!selectedSignerId) return signers[0];
  return signers.find(s => String(s.id) === String(selectedSignerId)) || signers[0];
};

export const renderSignerFooterHtml = (
  selectedSigner,
  todayStr,
  currentUserName,
  preparerTitle = 'NGƯỜI LẬP BẢNG'
) => {
  const roleType = selectedSigner?.roleType || 'head';
  const signerName = selectedSigner?.name || (typeof selectedSigner === 'string' && selectedSigner ? selectedSigner : 'Đặng Nguyệt Minh');
  const preparerName = currentUserName || 'Ban Đối Ngoại - Nhân Sự';
  const displayDate = todayStr || new Date().toLocaleDateString('vi-VN');

  let signerHeaderHtml = '';

  if (roleType === 'vice') {
    // Phó ban ĐN-NS: TM. Ban ĐN-NS / KT. Trưởng Ban / Phó Ban
    signerHeaderHtml = `
      <p style="margin: 0; font-size: 11pt; color: #374151; font-style: italic;">Hải Phòng, ngày ${displayDate}</p>
      <p style="margin: 4px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">TM. BAN ĐỐI NGOẠI - NHÂN SỰ</p>
      <p style="margin: 2px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11pt;">KT. TRƯỞNG BAN</p>
      <p style="margin: 2px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11pt;">PHÓ BAN</p>
      <p style="margin: 3px 0 0 0; font-style: italic; font-size: 10.5pt; color: #4b5563;">(Ký và ghi rõ họ tên)</p>
      <div style="height: 50px;"></div>
      <p style="margin: 0; font-weight: bold; font-size: 12pt;">${signerName}</p>
    `;
  } else {
    // Trưởng ban ĐN-NS: TM. Ban ĐN-NS / Trưởng Ban
    signerHeaderHtml = `
      <p style="margin: 0; font-size: 11pt; color: #374151; font-style: italic;">Hải Phòng, ngày ${displayDate}</p>
      <p style="margin: 4px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11.5pt;">TM. BAN ĐỐI NGOẠI - NHÂN SỰ</p>
      <p style="margin: 2px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 11pt;">TRƯỞNG BAN</p>
      <p style="margin: 3px 0 0 0; font-style: italic; font-size: 10.5pt; color: #4b5563;">(Ký và ghi rõ họ tên)</p>
      <div style="height: 65px;"></div>
      <p style="margin: 0; font-weight: bold; font-size: 12pt;">${signerName}</p>
    `;
  }

  return `
    <div class="footer">
      <div class="sign-box">
        <p style="margin: 0; font-weight: bold; text-transform: uppercase;">${preparerTitle}</p>
        <p style="margin: 3px 0 0 0; font-style: italic; font-size: 10.5pt; color: #4b5563;">(Ký và ghi rõ họ tên)</p>
        <div style="height: 65px;"></div>
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">${preparerName}</p>
      </div>
      <div class="sign-box">
        ${signerHeaderHtml}
      </div>
    </div>
  `;
};
