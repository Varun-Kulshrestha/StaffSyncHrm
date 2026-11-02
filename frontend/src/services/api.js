const API_BASE = '/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('staffsync_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getAdminStats: () => apiRequest('/admin/stats')
};

export const employeeApi = {
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.department) searchParams.set('department', params.department);
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.include_inactive !== undefined) searchParams.set('include_inactive', params.include_inactive);
    const qs = searchParams.toString();
    return apiRequest(`/employees${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/employees/${id}`),
  create: (data) =>
    apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deactivate: (id) =>
    apiRequest(`/employees/${id}`, {
      method: 'DELETE'
    })
};

export const leaveApi = {
  getBalances: () => apiRequest('/leaves/balances'),
  apply: (data) =>
    apiRequest('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getMyHistory: () => apiRequest('/leaves/my-history'),
  getPendingQueue: () => apiRequest('/leaves/pending'),
  updateStatus: (id, data) =>
    apiRequest(`/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
};

export const attendanceApi = {
  clockIn: () =>
    apiRequest('/attendance/clock-in', {
      method: 'POST'
    }),
  clockOut: () =>
    apiRequest('/attendance/clock-out', {
      method: 'POST'
    }),
  getToday: () => apiRequest('/attendance/today'),
  getHistory: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    const qs = params.toString();
    return apiRequest(`/attendance/history${qs ? `?${qs}` : ''}`);
  },
  getAdminDailyReport: (date) =>
    apiRequest(`/attendance/admin/daily-report${date ? `?date=${date}` : ''}`)
};


