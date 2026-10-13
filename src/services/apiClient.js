const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

const getUrl = (endpoint) => `/api/${endpoint}`;

// Safe fetch with 15-second timeout for homeserver / WAN connection resilience
const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const fetchEntityAPI = async (endpoint) => {
  try {
    const response = await fetchWithTimeout(getUrl(endpoint), {
      headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) {
      console.warn(`⚠️ HTTP ${response.status} from /api/${endpoint}`);
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
