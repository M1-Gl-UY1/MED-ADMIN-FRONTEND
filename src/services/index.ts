// Export du client API
export { default as apiClient, api, getToken, setToken, removeToken, getStoredUser, setStoredUser } from './api';
export type { ApiResponse, ApiError, PaginatedResponse } from './api';

// Export des services
export { default as authService } from './auth.service';
export type { Admin, LoginDTO } from './auth.service';
export { default as vehiculeService } from './vehicule.service';
export { default as commandeService, TAUX_TVA } from './commande.service';
export { default as clientService } from './client.service';
export { default as societeService } from './societe.service';
export { default as stockService } from './stock.service';
export { default as dashboardService } from './dashboard.service';

// Export des types
export * from './types';
