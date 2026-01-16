import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  _links?: {
    self: { href: string };
    first?: { href: string };
    last?: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
}

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Clé de stockage du token (différent du frontend client pour permettre les sessions séparées)
const TOKEN_KEY = 'med_admin_auth_token';
const USER_KEY = 'med_admin_user';

// Fonctions utilitaires pour le token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = <T>(): T | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = <T>(user: T): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Intercepteur de requête - Ajoute le token d'authentification
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion des erreurs centralisée
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          removeToken();
          // Rediriger vers login admin si pas déjà sur la page
          if (!window.location.pathname.includes('login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Accès interdit - Droits administrateur requis');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 422:
          console.error('Erreur de validation:', data?.errors);
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error('Erreur API:', data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Erreur réseau - Impossible de contacter le serveur');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Méthodes utilitaires pour les requêtes courantes
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data),

  delete: <T>(url: string) =>
    apiClient.delete<T>(url),

  upload: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void) =>
    apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),
};
