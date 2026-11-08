import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export interface OrganizationInfo {
  id: number;
  name: string;
  slug: string;
  type: 'catedral' | 'nucleo';
  city?: string;
  banner_path?: string;
  banner_url?: string | null;
  qr_pix_path?: string;
  qr_code_pix_url?: string | null;
  pix_key?: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'unit_admin' | 'reviewer' | 'scribe';
  phone?: string;
  organization_id?: number;
  organization?: OrganizationInfo;
}

export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('escriba_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('escriba_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await apiRequest<{ user: UserInfo }>('/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('escriba_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token?: string; access_token?: string; user: UserInfo }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const authToken = data.token || data.access_token || '';
    localStorage.setItem('escriba_token', authToken);
    setToken(authToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('escriba_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
