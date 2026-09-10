import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AlertStatus {
  provider: string;
  enabled: boolean;
  cooldown_minutes: number;
  sender_id: string;
  is_configured: boolean;
}

export interface SendAlertPayload {
  phone_number: string;
  risk_level?: string;
  location_name?: string;
  custom_message?: string;
  latitude?: number;
  longitude?: number;
  template_id?: string;
  variables?: Record<string, any>;
  bypass_cooldown?: boolean;
}

export interface AlertResult {
  success: boolean;
  status: string;
  message: string;
  alert_id?: string;
  provider?: string;
  reference_id?: string;
  masked_recipient?: string;
  risk_level?: string;
  location?: string;
  cooldown_remaining_minutes?: number;
}

export interface AlertHistoryItem {
  id: string;
  recipient_masked: string;
  risk_level: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  message: string;
  provider: string;
  status: string;
  reference_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface HazardAlertPayload {
  latitude: number;
  longitude: number;
  phone_number: string;
  location_name?: string;
}

export const AlertService = {
  async getStatus(): Promise<AlertStatus> {
    const res = await axios.get(`${API_BASE}/api/alerts/status`);
    return res.data;
  },

  async sendEmergencySms(payload: SendAlertPayload): Promise<AlertResult> {
    const res = await axios.post(`${API_BASE}/api/alerts/sms`, payload);
    return res.data;
  },

  async dispatchHazardAlert(payload: HazardAlertPayload) {
    const res = await axios.post(`${API_BASE}/api/alerts/dispatch-hazard`, payload);
    return res.data;
  },

  async getHistory(limit: number = 25): Promise<AlertHistoryItem[]> {
    const res = await axios.get(`${API_BASE}/api/alerts/history?limit=${limit}`);
    return res.data;
  }
};
