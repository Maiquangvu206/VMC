const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

const getUrl = (endpoint) => `/api/${endpoint}`;

// Gọi fetch có timeout để chống treo khi máy chủ phản hồi chậm (Render free/starter
// thường 5-15s cho request đầu tiên, cộng thêm cold start).
const fetchWithTimeout = async (url, options = {}, timeoutMs = 45000) => {
  const run = async (ms) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    return await run(timeoutMs);
  } catch (err) {
    // GET bị timeout/mất mạng: thử lại 1 lần vì request đầu sau cold start rất chậm.
    const method = String(options.method || 'GET').toUpperCase();
    if (err?.name === 'AbortError' || err instanceof TypeError) {
      if (method === 'GET') {
        return await run(timeoutMs);
      }
    }
    throw err;
  }
};

// Gộp các request GET trùng endpoint đang bay (ví dụ members được gọi ở 2 effect
// cùng lúc) để khỏi chạy 2 query nặng song song trên server yếu.
const inFlightGets = new Map();

export const fetchEntityAPI = async (endpoint) => {
  if (inFlightGets.has(endpoint)) {
    return inFlightGets.get(endpoint);
  }

  const promise = (async () => {
    try {
      const response = await fetchWithTimeout(getUrl(endpoint), {
        headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) {
        let body = '';
        try { body = await response.text(); } catch (e) {}
        console.warn(`⚠️ HTTP ${response.status} from /api/${endpoint}`, body.slice(0, 500));
        return [];
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) return result.data;
      if (result.success && result.data !== undefined) return result.data;
      return [];
    } catch (error) {
      console.warn(`⚠️ Failed to fetch /api/${endpoint}:`, error.message);
      return [];
    }
  })();

  inFlightGets.set(endpoint, promise);
  try {
    return await promise;
  } finally {
    inFlightGets.delete(endpoint);
  }
};

export const createEntityAPI = async (endpoint, data) => {
  try {
    const response = await fetchWithTimeout(getUrl(endpoint), {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`⚠️ Create /api/${endpoint} failed (${response.status}):`, errText);
      return { success: false, status: response.status };
    }
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to create /api/${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
};

export const updateEntityAPI = async (endpoint, id, data) => {
  try {
    const response = await fetchWithTimeout(getUrl(`${endpoint}/${id}`), {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`⚠️ Update /api/${endpoint}/${id} failed (${response.status}):`, errText);
      return { success: false, status: response.status };
    }
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to update /api/${endpoint}/${id}:`, error.message);
    return { success: false, error: error.message };
  }
};

export const deleteEntityAPI = async (endpoint, id) => {
  try {
    const response = await fetchWithTimeout(getUrl(`${endpoint}/${id}`), {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) return { success: false, status: response.status };
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to delete /api/${endpoint}/${id}:`, error.message);
    return { success: false, error: error.message };
  }
};
