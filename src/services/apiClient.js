const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

const getUrl = (endpoint) => `/api/${endpoint}`;

export const fetchEntityAPI = async (endpoint) => {
  try {
    const response = await fetch(getUrl(endpoint), {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const result = await response.json();
    if (result.success) return result.data;
    return [];
  } catch (error) {
    console.warn(`⚠️ Failed to fetch /api/${endpoint}`, error.message);
    return [];
  }
};

export const createEntityAPI = async (endpoint, data) => {
  try {
    const response = await fetch(getUrl(endpoint), {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to create /api/${endpoint}`, error.message);
    return { success: false };
  }
};

export const updateEntityAPI = async (endpoint, id, data) => {
  try {
    const response = await fetch(getUrl(`${endpoint}/${id}`), {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to update /api/${endpoint}/${id}`, error.message);
    return { success: false };
  }
};

export const deleteEntityAPI = async (endpoint, id) => {
  try {
    const response = await fetch(getUrl(`${endpoint}/${id}`), {
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to delete /api/${endpoint}/${id}`, error.message);
    return { success: false };
  }
};
