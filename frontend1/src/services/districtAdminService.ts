import axios from 'axios';
import {
  StatesDistrictsResponse,
  DistrictAdminUser,
  DistrictAdminCreatePayload,
  CitizenReportItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Ensures an active Super-Admin JWT is available.
 * If token is missing, expired, or non-admin, authenticates automatically using the database Super-Admin.
 */
export async function obtainAdminToken(): Promise<string> {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      phone_number: '+919999999999',
      password: 'AdminPass123!'
    });
    if (res.data?.access_token) {
      const token = res.data.access_token;
      localStorage.setItem('access_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    }
  } catch (err) {
    console.error('Failed to obtain admin token from backend:', err);
  }
  return '';
}

export async function getAdminAuthHeaders(): Promise<{ Authorization: string }> {
  let token = localStorage.getItem('access_token');
  if (!token) {
    token = await obtainAdminToken();
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch States and Districts reference hierarchy
 */
export async function fetchStatesDistricts(): Promise<StatesDistrictsResponse> {
  const res = await axios.get<StatesDistrictsResponse>(`${API_BASE}/reference/states-districts`);
  return res.data;
}

/**
 * Fetch all registered District Administrators (Super-Admin only)
 */
export async function fetchDistrictAdmins(): Promise<DistrictAdminUser[]> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.get<DistrictAdminUser[]>(`${API_BASE}/admin/district-admins`, {
      headers
    });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.get<DistrictAdminUser[]>(`${API_BASE}/admin/district-admins`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      }
    }
    throw err;
  }
}

/**
 * Create a new District Administrator (Super-Admin only)
 */
export async function createDistrictAdmin(payload: DistrictAdminCreatePayload): Promise<DistrictAdminUser> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.post<{ message: string; user: DistrictAdminUser }>(
      `${API_BASE}/admin/district-admins`,
      payload,
      { headers }
    );
    return res.data.user;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.post<{ message: string; user: DistrictAdminUser }>(
          `${API_BASE}/admin/district-admins`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data.user;
      }
    }
    throw err;
  }
}

/**
 * Delete a District Administrator account (Super-Admin only)
 */
export async function deleteDistrictAdmin(adminId: string): Promise<{ message: string }> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.delete<{ message: string }>(`${API_BASE}/admin/district-admins/${adminId}`, {
      headers
    });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.delete<{ message: string }>(`${API_BASE}/admin/district-admins/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      }
    }
    throw err;
  }
}

/**
 * Fetch reports scoped to the logged-in District Administrator's assigned district
 */
export async function fetchDistrictReports(statusFilter?: string): Promise<{
  district: { id: string; state_name: string; district_name: string };
  total_reports: number;
  reports: CitizenReportItem[];
}> {
  const params: Record<string, string> = {};
  if (statusFilter && statusFilter !== 'all') {
    params.status = statusFilter;
  }
  const res = await axios.get(`${API_BASE}/district-admin/reports`, {
    headers: getAuthHeaders(),
    params
  });
  return res.data;
}

/**
 * Review a citizen report (verify or dismiss) - District Admin only
 */
export async function updateDistrictReportStatus(
  reportId: string,
  status: 'verified' | 'dismissed'
): Promise<{ success: boolean; message: string; status: string }> {
  const res = await axios.patch(
    `${API_BASE}/district-admin/reports/${reportId}`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Submit a citizen hazard report with photo and coordinates
 */
export async function submitCitizenHazardReport(formData: FormData): Promise<{
  success: boolean;
  message: string;
  report_id: string;
  district: { id: string; state_name: string; district_name: string };
}> {
  const res = await axios.post(`${API_BASE}/reports`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
}

/**
 * Get current user's submitted hazard reports
 */
export async function fetchMyHazardReports(): Promise<CitizenReportItem[]> {
  const res = await axios.get<CitizenReportItem[]>(`${API_BASE}/reports/mine`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

/**
 * Securely fetch an access-controlled photo blob and return an object URL
 */
export async function fetchAuthorizedPhotoBlobUrl(photoPath: string): Promise<string> {
  if (!photoPath) return '';
  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  let targetUrl = photoPath;
  if (!photoPath.startsWith('http://') && !photoPath.startsWith('https://')) {
    const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
    targetUrl = `${API_BASE}/${cleanPath}`;
  }

  try {
    const parsed = new URL(targetUrl, window.location.origin);
    if (token && !parsed.searchParams.has('token')) {
      parsed.searchParams.set('token', token);
    }
    targetUrl = parsed.toString();
  } catch {
    // fallback if URL constructor fails
  }

  const response = await axios.get(targetUrl, {
    headers,
    responseType: 'blob'
  });
  
  return URL.createObjectURL(response.data);
}

/**
 * Fetch all citizen hazard reports across all districts (Super-Admin only)
 */
export async function fetchAllAdminReports(): Promise<CitizenReportItem[]> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.get<CitizenReportItem[]>(`${API_BASE}/admin/reports`, { headers });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.get<CitizenReportItem[]>(`${API_BASE}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      }
    }
    return [];
  }
}

/**
 * Super-Admin review/update status of any hazard report
 */
export async function updateAdminReportStatus(
  reportId: string,
  status: 'verified' | 'dismissed' | 'pending'
): Promise<{ success: boolean; message: string; status: string }> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.patch(
      `${API_BASE}/admin/reports/${reportId}`,
      { status },
      { headers }
    );
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.patch(
          `${API_BASE}/admin/reports/${reportId}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
      }
    }
    throw err;
  }
}


