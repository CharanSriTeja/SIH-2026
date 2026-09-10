import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { UserRole } from '../../types';

export interface User {
  id: string;
  phone_number: string;
  name: string | null;
  role: UserRole;
  preferred_language: string;
  is_verified: boolean;
  last_latitude?: number | null;
  last_longitude?: number | null;
  address_label?: string | null;
  location_updated_at?: string | null;
  created_at?: string | null;
  district_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  performLogin: (token: string) => Promise<User | null>;
  updateUserLocation: (lat: number, lon: number, addressLabel?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for token on load
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      performLogin(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const performLogin = async (newToken: string): Promise<User | null> => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    try {
      // Fetch comprehensive profile including location fields
      const response = await axios.get('http://localhost:8000/profile/me');
      setUser(response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn("Session expired or unauthorized, logging out.");
        logout();
      } else {
        console.warn("Backend server temporarily unreachable:", error?.message);
      }
      return null;
    }
  };



  const updateUserLocation = (lat: number, lon: number, addressLabel?: string) => {
    if (user) {
      setUser({
        ...user,
        last_latitude: lat,
        last_longitude: lon,
        address_label: addressLabel || user.address_label,
        location_updated_at: new Date().toISOString()
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, performLogin, updateUserLocation, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
