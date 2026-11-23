import axios from 'axios';
import {
  StatesDistrictsResponse,
  DistrictAdminUser,
  DistrictAdminCreatePayload,
  CitizenReportItem,
  DistrictOverviewResponse,
  DistrictVillageItem,
  DistrictVillagesResponse,
  Shelter
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function obtainAdminToken(): Promise<string> {
  return localStorage.getItem("access_token") || "";
}

export async function getAdminAuthHeaders(): Promise<{ Authorization: string }> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Sign in as an administrator to continue.");
  }
  return { Authorization: "Bearer " + token };
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
 * Fetch District Admin command center overview statistics
 */
export async function fetchDistrictOverview(): Promise<DistrictOverviewResponse> {
  const res = await axios.get<DistrictOverviewResponse>(`${API_BASE}/district-admin/overview`, {
    headers: getAuthHeaders()
  });
  return res.data;
}
export const fetchNearestFacilities = async (lat?: number, lon?: number): Promise<any> => {
  try {
    const url = (lat && lon) 
      ? `${API_BASE}/citizen/nearest-facilities?lat=${lat}&lon=${lon}` 
      : `${API_BASE}/citizen/nearest-facilities`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearest facilities:', error);
    throw error;
  }
};

/**
 * Fetch District Admin active risk areas (stubbed or live pipeline)
 */
export async function fetchDistrictActiveRiskAreas(): Promise<{
  district_id: string;
  district_name?: string;
  total_alert_areas: number;
  areas: DistrictVillageItem[];
  message: string;
}> {
  const res = await axios.get(`${API_BASE}/district-admin/active-risk-areas`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

/**
 * Fetch settlements/villages within this District Admin jurisdiction
 * with real Model B risk scores, risk levels, and daily alert status.
 */
export async function fetchDistrictVillages(filters?: {
  risk_filter?: string;
  search?: string;
}): Promise<DistrictVillagesResponse> {
  const params: Record<string, string> = {};
  if (filters?.risk_filter) params.risk_filter = filters.risk_filter;
  if (filters?.search) params.search = filters.search;

  const res = await axios.get<DistrictVillagesResponse>(`${API_BASE}/district-admin/villages`, {
    headers: getAuthHeaders(),
    params
  });
  return res.data;
}

/**
 * Fetch all citizen hazard reports across all districts (Super-Admin only)
 * Supports filtering by state, district, status, and date range.
 */
export async function fetchAllAdminReports(filters?: {
  state?: string;
  district?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<CitizenReportItem[]> {
  const params: Record<string, string> = {};
  if (filters?.state && filters.state !== 'all') params.state = filters.state;
  if (filters?.district && filters.district !== 'all') params.district = filters.district;
  if (filters?.status && filters.status !== 'all') params.status = filters.status;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;

  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.get<CitizenReportItem[]>(`${API_BASE}/admin/reports`, {
      headers,
      params
    });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.get<CitizenReportItem[]>(`${API_BASE}/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
          params
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

/**
 * Manually trigger the data fetching pipeline from the admin dashboard
 */
export async function triggerDataPipeline(): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.post(
      `${API_BASE}/admin/run-pipeline`,
      {},
      { headers }
    );
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.post(
          `${API_BASE}/admin/run-pipeline`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
      }
    }
    throw err;
  }
}

/**
 * Fetch available data dates for data management
 */
export async function fetchDataDates(): Promise<string[]> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.get(`${API_BASE}/admin/data-dates`, { headers });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.get(`${API_BASE}/admin/data-dates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      }
    }
    throw err;
  }
}

/**
 * Delete data for a specific date
 */
export async function deleteDataDate(dateStr: string): Promise<{ success: boolean; message: string; deleted_count: number }> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.delete(`${API_BASE}/admin/data-dates/${dateStr}`, { headers });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.delete(`${API_BASE}/admin/data-dates/${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      }
    }
    throw err;
  }
}

/**
 * Fetch latest pipeline logs for the terminal UI
 */
export async function fetchPipelineLogs(): Promise<string> {
  try {
    const headers = await getAdminAuthHeaders();
    const res = await axios.get(`${API_BASE}/admin/pipeline-logs`, { headers });
    return res.data.logs;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      const token = await obtainAdminToken();
      if (token) {
        const res = await axios.get(`${API_BASE}/admin/pipeline-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.logs;
      }
    }
    throw err;
  }
}

/**
 * Manage Shelters
 */
export async function fetchShelters(): Promise<Shelter[]> {
  const res = await axios.get<Shelter[]>(`${API_BASE}/district-admin/shelters`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function createShelter(payload: Partial<Shelter>): Promise<Shelter> {
  const res = await axios.post<Shelter>(`${API_BASE}/district-admin/shelters`, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function updateShelter(id: string, payload: Partial<Shelter>): Promise<Shelter> {
  const res = await axios.patch<Shelter>(`${API_BASE}/district-admin/shelters/${id}`, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function deleteShelter(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete<{ success: boolean }>(`${API_BASE}/district-admin/shelters/${id}`, {
    headers: getAuthHeaders()
  });
  return res.data;
}
