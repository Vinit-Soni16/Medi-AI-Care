import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { useCallback } from 'react';

export const useAuth = () => {
  const { user, token, isLoading } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    return authService.login(email, password);
  }, []);

  const register = useCallback(async (data: Parameters<typeof authService.register>[0]) => {
    return authService.register(data);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    return authService.updateProfile(data);
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };
};
