const BASE_URL = import.meta.env.VITE_API_URL;

const PORTAL = 'ADMIN';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Portal': PORTAL,
});

const handleAuthError = (response, endpoint) => {
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();

    if (endpoint !== '/auth/me') {
      window.location.href = '/login';
    }

    throw new Error(
      response.status === 403
        ? 'Access denied. Please login again.'
        : 'Session expired. Please login again.'
    );
  }
};


// ======================================================
// API REQUEST
// ======================================================

export const apiRequest = async (
  endpoint,
  method = 'GET',
  body = null
) => {
  const config = {
    method,
    headers: getHeaders(),
    credentials: 'include',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    config
  );

  handleAuthError(response, endpoint);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      errorData.message || 'Something went wrong'
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};


// ======================================================
// DOWNLOAD FILE
// ======================================================

export const downloadFile = async (endpoint) => {
  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Portal': PORTAL,
      },
    }
  );

  handleAuthError(response, endpoint);

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
      `Server responded with status ${response.status}`
    );
  }

  return response.blob();
};


// ======================================================
// UPLOAD FILE
// ======================================================

export const uploadFile = async (endpoint, formData) => {
  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Portal': PORTAL,
      },
      body: formData,
    }
  );

  handleAuthError(response, endpoint);

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      "Backend didn't return a valid JSON format."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || 'File upload failed.'
    );
  }

  return data;
};