import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services';
import type { Admin, UpdateProfileDTO, ChangePasswordDTO } from '../services/auth.service';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: UpdateProfileDTO) => Promise<boolean>;
  changePassword: (data: ChangePasswordDTO) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Valider le token au montage
  useEffect(() => {
    const validateAndLoadAdmin = async () => {
      try {
        const validatedAdmin = await authService.validateToken();
        if (validatedAdmin) {
          setAdmin(validatedAdmin);
        }
      } catch {
        // Token invalide ou API indisponible
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    validateAndLoadAdmin();
  }, []);

  const login = useCallback(async (email: string, motDePasse: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const authenticatedAdmin = await authService.login({ email, motDePasse });
      setAdmin(authenticatedAdmin);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la connexion';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAdmin(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileDTO): Promise<boolean> => {
    setError(null);

    try {
      const updatedAdmin = await authService.updateProfile(data);
      setAdmin(updatedAdmin);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise a jour du profil';
      setError(message);
      return false;
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordDTO): Promise<boolean> => {
    setError(null);

    try {
      await authService.changePassword(data);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      setError(message);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        error,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
