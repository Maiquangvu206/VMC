// Helper for dynamically connecting to Port 5000 if proxy fails
const getValidFetchUrl = async (endpoint, method = 'GET') => {
  const primaryUrl = endpoint;
  try {
    const resp = await fetch(primaryUrl, { method });
    const contentType = resp.headers.get('content-type') || '';
    if (resp.ok && !contentType.includes('text/html')) {
      return primaryUrl; // Proxy works!
    }
  } catch(e) {}
  
  // Fallback to Port 5000 directly
  return `${window.location.protocol}//${window.location.hostname}:5000${endpoint}`;
};

export const fetchEntityAPI = async (endpoint) => {
  try {
    const url = await getValidFetchUrl(`/api/${endpoint}`, 'GET');
    const response = await fetch(url);
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
    const url = await getValidFetchUrl(`/api/${endpoint}`, 'POST');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const url = await getValidFetchUrl(`/api/${endpoint}/${id}`, 'PUT');
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    const url = await getValidFetchUrl(`/api/${endpoint}/${id}`, 'DELETE');
    const response = await fetch(url, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to delete /api/${endpoint}/${id}`, error.message);
    return { success: false };
  }
};
