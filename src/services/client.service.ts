import { api } from './api';
import { societeService } from './societe.service';
import type { Client, Societe, ClientFilters, UtilisateurComplet } from './types';

const ENDPOINTS = {
  CLIENTS: '/api/clients',
};

export const clientService = {
  /**
   * Récupérer tous les clients (particuliers)
   */
  async getAll(): Promise<Client[]> {
    const response = await api.get<Client[]>(ENDPOINTS.CLIENTS);
    return response.data;
  },

  /**
   * Récupérer tous les clients avec filtres (pour compatibilité)
   */
  async getAllClients(params?: ClientFilters): Promise<{ clients: Client[]; total: number }> {
    let clients = await this.getAll();

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      clients = clients.filter(c =>
        (c.nom || '').toLowerCase().includes(searchLower) ||
        (c.prenom || '').toLowerCase().includes(searchLower) ||
        (c.email || '').toLowerCase().includes(searchLower)
      );
    }

    if (params?.pays) {
      clients = clients.filter(c => c.pays === params.pays);
    }

    return {
      clients,
      total: clients.length,
    };
  },

  /**
   * Créer un nouveau client
   */
  async create(data: Omit<Client, 'idClient'>): Promise<Client> {
    const response = await api.post<Client>(ENDPOINTS.CLIENTS, data);
    return response.data;
  },

  /**
   * Récupérer un client par son ID
   */
  async getClientById(id: number): Promise<Client> {
    const response = await api.get<Client>(`${ENDPOINTS.CLIENTS}/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour un client
   */
  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    const response = await api.patch<Client>(`${ENDPOINTS.CLIENTS}/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un client
   */
  async deleteClient(id: number): Promise<void> {
    await api.delete(`${ENDPOINTS.CLIENTS}/${id}`);
  },

  /**
   * Statistiques clients
   */
  async getStats(): Promise<{
    totalClients: number;
    totalSocietes: number;
    totalFiliales: number;
    clientsParPays: Record<string, number>;
  }> {
    try {
      const [clients, societes] = await Promise.all([
        this.getAll().catch(() => []),
        societeService.getAll().catch(() => []),
      ]);

      const clientsParPays: Record<string, number> = {};
      clients.forEach(c => {
        const pays = c.pays || 'Inconnu';
        clientsParPays[pays] = (clientsParPays[pays] || 0) + 1;
      });

      const filiales = societes.filter(s => s.societeMereId);

      return {
        totalClients: clients.length,
        totalSocietes: societes.length,
        totalFiliales: filiales.length,
        clientsParPays,
      };
    } catch {
      // Base de données vide ou erreur
      return {
        totalClients: 0,
        totalSocietes: 0,
        totalFiliales: 0,
        clientsParPays: {},
      };
    }
  },

  /**
   * Récupérer tous les utilisateurs (clients + sociétés)
   */
  async getAllUtilisateurs(): Promise<UtilisateurComplet[]> {
    try {
      const [clients, societes] = await Promise.all([
        this.getAll().catch(() => []),
        societeService.getAll().catch(() => []),
      ]);

      return [...clients, ...societes].sort((a, b) => {
        const dateA = new Date(a.dateInscription || 0);
        const dateB = new Date(b.dateInscription || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch {
      return [];
    }
  },
};

export default clientService;
