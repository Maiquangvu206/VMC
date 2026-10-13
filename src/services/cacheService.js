/**
 * VMC Client-Side Cache Service (Bộ Nhớ Đệm Tự Động Cho Dữ Liệu Ít Biến Động)
 * Hỗ trợ chiến lược Stale-While-Revalidate (SWR):
 * 1. Tải tức thì 0ms từ Cache LocalStorage khi reload trang / F5
 * 2. Tự động tải ngầm toàn bộ dữ liệu ít biến động trong lần truy cập đầu tiên
 * 3. Tự động đồng bộ âm thầm với CSDL MySQL để cập nhật dữ liệu mới nhất
 */

const CACHE_PREFIX = 'VMC_CACHE_';
const CACHE_VERSION = 'v1.3';

// Thời gian sống mặc định (TTL) cho từng loại dữ liệu ít biến động
export const CACHE_TTL = {
  GENERATIONS: 7 * 24 * 60 * 60 * 1000,      // 7 ngày (Thế hệ Gen rất hiếm khi đổi)
  DEPARTMENT_DRIVES: 3 * 24 * 60 * 60 * 1000, // 3 ngày (Link Google Drive các ban)
  RESOURCES: 2 * 24 * 60 * 60 * 1000,         // 2 ngày (Tài nguyên thư viện biểu mẫu)
  SYSTEM_SETTINGS: 1 * 24 * 60 * 60 * 1000,   // 24 giờ (Cấu hình hệ thống & thông tin CLB)
  HOMEPAGE: 24 * 60 * 60 * 1000,              // 24 giờ (Nội dung, bài viết, media trang chủ)
  MEMBERS: 2 * 60 * 60 * 1000,                // 2 giờ (Danh sách thành viên, điểm số)
};

// In-Memory Fast Cache Map
const memoryCache = new Map();

/**
 * Lấy dữ liệu từ cache (LocalStorage + Memory)
 * @param {string} key
 * @returns {any|null}
 */
export const getCachedData = (key) => {
  try {
    // 1. Kiểm tra bộ nhớ RAM trước (nhanh nhất)
    if (memoryCache.has(key)) {
      const memItem = memoryCache.get(key);
      if (memItem && memItem.version === CACHE_VERSION) {
        let d = memItem.data;
        if (Array.isArray(d)) {
          d = d.filter(item => item && !['art-1', 'art-2', 'art-3', 'med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'].includes(item.id) && !item.title?.includes('Hành Trình 6 Năm'));
        }
        return d;
      }
    }

    // 2. Kiểm tra LocalStorage
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    let d = parsed.data;
    if (Array.isArray(d)) {
      d = d.filter(item => item && !['art-1', 'art-2', 'art-3', 'med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'].includes(item.id) && !item.title?.includes('Hành Trình 6 Năm'));
    }

    // Lưu ngược lại Memory Cache
    memoryCache.set(key, { ...parsed, data: d });
    return d;
  } catch (e) {
    console.warn(`[CacheService] Lỗi đọc cache key "${key}":`, e);
    return null;
  }
};

/**
 * Kiểm tra xem cache của key còn hạn sử dụng (fresh) hay đã cũ (stale)
 * @param {string} key 
 * @param {number} ttlMs 
 * @returns {boolean}
 */
export const isCacheFresh = (key, ttlMs = 3600000) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CACHE_VERSION) return false;
    return (Date.now() - parsed.timestamp) < (parsed.ttl || ttlMs);
  } catch (e) {
    return false;
  }
};

/**
 * Lưu dữ liệu vào cache
 * @param {string} key 
 * @param {any} data 
 * @param {number} ttlMs 
 */
export const setCachedData = (key, data, ttlMs = 24 * 60 * 60 * 1000) => {
  try {
    const payload = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      version: CACHE_VERSION
    };
    memoryCache.set(key, payload);
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (e) {
    console.warn(`[CacheService] Lỗi ghi cache key "${key}":`, e);
  }
};

/**
 * Xóa cache của một key (dùng khi Admin cập nhật dữ liệu)
 * @param {string} key 
 */
export const invalidateCache = (key) => {
  try {
    memoryCache.delete(key);
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (e) {}
};

/**
 * Xóa toàn bộ cache ứng dụng
 */
export const clearAllCache = () => {
  try {
    memoryCache.clear();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
};

/**
 * Lấy dữ liệu với cơ chế Stale-While-Revalidate (SWR):
 * - Trả về dữ liệu cache ngay lập tức (nếu có)
 * - Tự động fetch ngầm từ API để cập nhật cache mới nhất
 * @param {string} key
 * @param {Function} fetcherFn
 * @param {number} ttlMs
 * @param {Function} onFreshDataCallback - Hàm callback gọi khi có dữ liệu mới từ CSDL
 */
export const fetchWithSWR = async (key, fetcherFn, ttlMs = 3600000, onFreshDataCallback = null) => {
  const cached = getCachedData(key);

  // Nếu cache còn mới, trả về ngay và không cần fetch ngầm
  const fresh = isCacheFresh(key, ttlMs);
  if (cached !== null && fresh) {
    return cached;
  }

  // Khởi động fetch ngầm từ CSDL MySQL
  const fetchPromise = (async () => {
    try {
      const freshData = await fetcherFn();
      if (freshData !== undefined && freshData !== null) {
        setCachedData(key, freshData, ttlMs);
        if (typeof onFreshDataCallback === 'function') {
          onFreshDataCallback(freshData);
        }
        return freshData;
      }
    } catch (err) {
      console.warn(`[CacheService] SWR background revalidate thất bại cho key "${key}":`, err.message);
    }
    return cached;
  })();

  // Nếu đã có cache (kể cả stale), trả về cache trước để render 0ms
  if (cached !== null) {
    return cached;
  }

  // Nếu chưa có cache (lần đầu truy cập), chờ fetch hoàn tất
  return await fetchPromise;
};

/**
 * Khởi tạo & Tự động tải nạp toàn bộ dữ liệu ít biến động lên Cache trong lần truy cập đầu tiên
 * (Generations, Department Drives, Resources, System Settings, Homepage Info)
 */
export const warmupStaticDataCache = async () => {
  try {
    const promises = [];

    // 1. Cấu hình hệ thống & Trang chủ
    if (!isCacheFresh('system_settings', CACHE_TTL.SYSTEM_SETTINGS)) {
      promises.push(
        fetch('/api/admin/system-settings', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && res.data) {
              setCachedData('system_settings', res.data, CACHE_TTL.SYSTEM_SETTINGS);
              // Nạp các nhánh con
              if (res.data.VMC_HOMEPAGE_INFO) setCachedData('homepage_info', JSON.parse(res.data.VMC_HOMEPAGE_INFO), CACHE_TTL.HOMEPAGE);
              if (res.data.VMC_HOMEPAGE_ORG) setCachedData('homepage_org', JSON.parse(res.data.VMC_HOMEPAGE_ORG), CACHE_TTL.HOMEPAGE);
              if (res.data.VMC_CLUB_INFO) setCachedData('club_info', JSON.parse(res.data.VMC_CLUB_INFO), CACHE_TTL.SYSTEM_SETTINGS);
            }
          })
          .catch(() => {})
      );

      promises.push(
        fetch('/api/homepage/articles', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setCachedData('homepage_articles', res.data, CACHE_TTL.HOMEPAGE);
            }
          })
          .catch(() => {})
      );

      promises.push(
        fetch('/api/homepage/media', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setCachedData('homepage_media', res.data, CACHE_TTL.HOMEPAGE);
            }
          })
          .catch(() => {})
      );
    }

    // 2. Thế hệ Gen
    if (!isCacheFresh('generations', CACHE_TTL.GENERATIONS)) {
      promises.push(
        fetch('/api/generations', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setCachedData('generations', res.data, CACHE_TTL.GENERATIONS);
            }
          })
          .catch(() => {})
      );
    }

    // 3. Link Google Drive các ban
    if (!isCacheFresh('department-drives', CACHE_TTL.DEPARTMENT_DRIVES)) {
      promises.push(
        fetch('/api/department-drives', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setCachedData('department-drives', res.data, CACHE_TTL.DEPARTMENT_DRIVES);
            }
          })
          .catch(() => {})
      );
    }

    // 4. Tài nguyên thư viện VMC
    if (!isCacheFresh('resources', CACHE_TTL.RESOURCES)) {
      promises.push(
        fetch('/api/resources', { headers: { 'ngrok-skip-browser-warning': 'true' } })
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data)) {
              setCachedData('resources', res.data, CACHE_TTL.RESOURCES);
            }
          })
          .catch(() => {})
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (err) {
    console.warn('[CacheService] Warmup static data error:', err);
  }
};
