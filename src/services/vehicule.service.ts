import { api } from './api';
import type {
  Vehicule,
  Option,
  ImageVehicule,
  HalResponse,
  VehiculeFilters,
  CreateVehiculeDTO,
  UpdateVehiculeDTO
} from './types';

const ENDPOINTS = {
  VEHICULES: '/api/vehicules',
  VEHICULES_CUSTOM: '/vehicules',
  OPTIONS: '/api/options',
  STOCKS: '/api/stocks',
};

export const vehiculeService = {
  /**
   * Récupérer tous les véhicules avec pagination
   */
  async getAll(params?: VehiculeFilters): Promise<{ vehicules: Vehicule[]; total: number; totalPages: number }> {
    const response = await api.get<HalResponse<Vehicule>>(ENDPOINTS.VEHICULES, {
      page: params?.page || 0,
      size: params?.size || 20,
      sort: params?.sort || 'idVehicule,asc',
    });

    const embedded = response.data._embedded;
    const vehicules = embedded?.vehicules || [];

    return {
      vehicules,
      total: response.data.page?.totalElements || vehicules.length,
      totalPages: response.data.page?.totalPages || 1,
    };
  },

  /**
   * Récupérer les véhicules via l'endpoint custom
   */
  async getAllCustom(): Promise<Vehicule[]> {
    const response = await api.get<Vehicule[]>(ENDPOINTS.VEHICULES_CUSTOM);
    return response.data;
  },

  /**
   * Récupérer un véhicule par son ID
   */
  async getById(id: number): Promise<Vehicule> {
    const response = await api.get<Vehicule>(`${ENDPOINTS.VEHICULES_CUSTOM}/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau véhicule (utilise Abstract Factory)
   */
  async create(data: CreateVehiculeDTO): Promise<Vehicule> {
    // Utiliser l'endpoint custom qui utilise l'Abstract Factory
    const response = await api.post<Vehicule>(`${ENDPOINTS.VEHICULES_CUSTOM}/`, data);
    return response.data;
  },

  /**
   * Mettre à jour un véhicule
   */
  async update(id: number, data: Partial<UpdateVehiculeDTO>): Promise<Vehicule> {
    const response = await api.put<Vehicule>(`${ENDPOINTS.VEHICULES_CUSTOM}/${id}`, data);
    return response.data;
  },

  /**
   * Mise à jour partielle d'un véhicule
   */
  async patch(id: number, data: Partial<UpdateVehiculeDTO>): Promise<Vehicule> {
    const response = await api.patch<Vehicule>(`${ENDPOINTS.VEHICULES_CUSTOM}/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un véhicule
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINTS.VEHICULES_CUSTOM}/${id}`);
  },

  /**
   * Récupérer les images d'un véhicule
   */
  async getImages(vehiculeId: number): Promise<ImageVehicule[]> {
    const response = await api.get<ImageVehicule[]>(`${ENDPOINTS.VEHICULES_CUSTOM}/${vehiculeId}/images`);
    return response.data;
  },

  /**
   * Uploader une image pour un véhicule
   */
  async uploadImage(
    vehiculeId: number,
    file: File,
    principale: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<ImageVehicule> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('principale', String(principale));

    const response = await api.upload<ImageVehicule>(
      `${ENDPOINTS.VEHICULES_CUSTOM}/${vehiculeId}/images/upload`,
      formData,
      onProgress
    );
    return response.data;
  },

  /**
   * Uploader plusieurs images
   */
  async uploadImages(
    vehiculeId: number,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<ImageVehicule[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await api.upload<ImageVehicule[]>(
      `${ENDPOINTS.VEHICULES_CUSTOM}/${vehiculeId}/images/upload/batch`,
      formData,
      onProgress
    );
    return response.data;
  },

  /**
   * Supprimer une image
   */
  async deleteImage(vehiculeId: number, imageId: number): Promise<void> {
    await api.delete(`${ENDPOINTS.VEHICULES_CUSTOM}/${vehiculeId}/images/${imageId}`);
  },

  /**
   * Définir une image comme principale
   */
  async setImagePrincipale(vehiculeId: number, imageId: number): Promise<ImageVehicule> {
    const response = await api.patch<ImageVehicule>(
      `${ENDPOINTS.VEHICULES_CUSTOM}/${vehiculeId}/images/${imageId}/principale`
    );
    return response.data;
  },

  /**
   * Récupérer toutes les options
   */
  async getOptions(): Promise<Option[]> {
    const response = await api.get<HalResponse<Option>>(ENDPOINTS.OPTIONS);
    return response.data._embedded?.options || [];
  },

  /**
   * Créer une nouvelle option
   */
  async createOption(data: Omit<Option, 'idOption'>): Promise<Option> {
    const response = await api.post<Option>(ENDPOINTS.OPTIONS, data);
    return response.data;
  },

  /**
   * Mettre à jour une option
   */
  async updateOption(id: number, data: Partial<Option>): Promise<Option> {
    const response = await api.patch<Option>(`${ENDPOINTS.OPTIONS}/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une option
   */
  async deleteOption(id: number): Promise<void> {
    await api.delete(`${ENDPOINTS.OPTIONS}/${id}`);
  },

  /**
   * Rechercher des véhicules avec filtres
   */
  async search(filters: VehiculeFilters): Promise<Vehicule[]> {
    let vehicules = await this.getAllCustom();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      vehicules = vehicules.filter(v =>
        (v.nom || '').toLowerCase().includes(searchLower) ||
        (v.marque || '').toLowerCase().includes(searchLower) ||
        (v.model || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.type) {
      vehicules = vehicules.filter(v => v.type === filters.type);
    }

    if (filters.engine) {
      vehicules = vehicules.filter(v => v.engine === filters.engine);
    }

    if (filters.marque) {
      vehicules = vehicules.filter(v => v.marque === filters.marque);
    }

    if (filters.solde !== undefined) {
      vehicules = vehicules.filter(v => v.solde === filters.solde);
    }

    if (filters.stockFaible) {
      vehicules = vehicules.filter(v => v.stock && v.stock.quantite <= 3);
    }

    return vehicules;
  },

  /**
   * Récupérer les marques disponibles
   */
  async getMarques(): Promise<string[]> {
    const vehicules = await this.getAllCustom();
    return [...new Set(vehicules.map(v => v.marque))].sort();
  },

  /**
   * Récupérer les véhicules avec stock faible
   */
  async getStockFaible(seuil: number = 3): Promise<Vehicule[]> {
    const vehicules = await this.getAllCustom();
    return vehicules.filter(v => v.stock && v.stock.quantite <= seuil);
  },
};

export default vehiculeService;
