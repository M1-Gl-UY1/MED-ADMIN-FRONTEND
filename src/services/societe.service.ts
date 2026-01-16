import { api } from './api';
import type { Societe, ClientFilters } from './types';

const ENDPOINTS = {
  SOCIETES: '/api/societes',
};

export const societeService = {
  /**
   * Récupérer toutes les sociétés
   */
  async getAll(): Promise<Societe[]> {
    const response = await api.get<Societe[]>(ENDPOINTS.SOCIETES);
    return response.data;
  },

  /**
   * Récupérer toutes les sociétés avec filtres
   */
  async getAllFiltered(params?: ClientFilters): Promise<{ societes: Societe[]; total: number }> {
    let societes = await this.getAll();

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      societes = societes.filter(s =>
        (s.nom || '').toLowerCase().includes(searchLower) ||
        (s.email || '').toLowerCase().includes(searchLower) ||
        (s.numeroFiscal || '').toLowerCase().includes(searchLower)
      );
    }

    if (params?.pays) {
      societes = societes.filter(s => s.pays === params.pays);
    }

    return {
      societes,
      total: societes.length,
    };
  },

  /**
   * Récupérer une société par son ID
   */
  async getById(id: number): Promise<Societe> {
    const response = await api.get<Societe>(`${ENDPOINTS.SOCIETES}/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle société
   */
  async create(data: Omit<Societe, 'idSociete'>): Promise<Societe> {
    const response = await api.post<Societe>(ENDPOINTS.SOCIETES, data);
    return response.data;
  },

  /**
   * Mettre à jour une société
   */
  async update(id: number, data: Partial<Societe>): Promise<Societe> {
    const response = await api.put<Societe>(`${ENDPOINTS.SOCIETES}/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une société
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINTS.SOCIETES}/${id}`);
  },

  /**
   * Récupérer les filiales d'une société mère
   */
  async getFiliales(societeMereId: number): Promise<Societe[]> {
    const societes = await this.getAll();
    return societes.filter(s => s.societeMereId === societeMereId);
  },

  /**
   * Récupérer les sociétés mères (sans societeMereId)
   */
  async getSocietesMeres(): Promise<Societe[]> {
    const societes = await this.getAll();
    return societes.filter(s => !s.societeMereId);
  },
};

export default societeService;
