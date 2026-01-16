import { api, setToken, removeToken, setStoredUser, getStoredUser, getToken } from './api';

// Types pour l'authentification admin
export interface Admin {
  idUtilisateur: number;
  email: string;
  nom: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  derniereConnexion?: string;
  actif: boolean;
}

export interface UpdateProfileDTO {
  nom?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface LoginDTO {
  email: string;
  motDePasse: string;
}

interface AdminAuthResponse {
  token: string;
  user: Admin;
  type: 'ADMIN';
  message: string;
}

interface ValidateTokenResponse {
  user: Admin;
  type: 'ADMIN';
}

interface RefreshTokenResponse {
  token: string;
  message: string;
}

const AUTH_ENDPOINTS = {
  ADMIN_LOGIN: '/api/auth/admin/login',
  VALIDATE_TOKEN: '/api/auth/me',
  REFRESH_TOKEN: '/api/auth/refresh',
  UPDATE_PROFILE: '/api/auth/admin/profile',
  CHANGE_PASSWORD: '/api/auth/admin/password',
};

export const authService = {
  /**
   * Connexion administrateur
   */
  async login(credentials: LoginDTO): Promise<Admin> {
    const response = await api.post<AdminAuthResponse>(AUTH_ENDPOINTS.ADMIN_LOGIN, credentials);
    const { token, user } = response.data;

    // Stocker le token JWT
    setToken(token);

    // Stocker l'admin
    setStoredUser(user);

    return user;
  },

  /**
   * Valider le token actuel et recuperer les infos admin
   */
  async validateToken(): Promise<Admin | null> {
    const token = getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await api.get<ValidateTokenResponse>(AUTH_ENDPOINTS.VALIDATE_TOKEN);
      const { user, type } = response.data;

      // Verifier que c'est bien un admin
      if (type !== 'ADMIN') {
        removeToken();
        return null;
      }

      setStoredUser(user);
      return user;
    } catch {
      // Token invalide ou expire
      removeToken();
      return null;
    }
  },

  /**
   * Rafraichir le token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
      const { token } = response.data;
      setToken(token);
      return token;
    } catch {
      return null;
    }
  },

  /**
   * Deconnexion
   */
  logout(): void {
    removeToken();
  },

  /**
   * Recuperer l'admin connecte depuis le stockage local
   */
  getCurrentAdmin(): Admin | null {
    return getStoredUser<Admin>();
  },

  /**
   * Verifier si l'admin est connecte (a un token)
   */
  isAuthenticated(): boolean {
    return getToken() !== null;
  },

  /**
   * Mettre a jour le profil admin
   */
  async updateProfile(data: UpdateProfileDTO): Promise<Admin> {
    const response = await api.put<{ user: Admin; message: string }>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      data
    );
    const { user } = response.data;
    setStoredUser(user);
    return user;
  },

  /**
   * Changer le mot de passe admin
   */
  async changePassword(data: ChangePasswordDTO): Promise<void> {
    await api.put<{ message: string }>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },
};

export default authService;
