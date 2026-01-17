import { api } from './api';
import type {
  Commande,
  HalResponse,
  PaysLivraison,
  StatutCommande,
  TypeMethodePaiement,
  CommandeFilters,
  UpdateCommandeStatutDTO
} from './types';

const ENDPOINTS = {
  COMMANDES: '/api/commandes',
  EXECUTER: (id: number) => `/api/commandes/${id}/executer`,
  LIVRER: (id: number) => `/api/commandes/${id}/livrer`,
  ANNULER: (id: number) => `/api/commandes/${id}/annuler`,
  TOTAL: (id: number, pays: string) => `/api/commandes/${id}/total/${pays}`,
  DOCUMENTS: '/api/documents',
  LIASSE: (commandeId: number) => `/api/documents/liasse/${commandeId}`,
};

export const TAUX_TVA: Record<PaysLivraison, number> = {
  CM: 19.25,
  FR: 20,
  US: 8,
  NG: 7.5,
};

export const commandeService = {
  /**
   * Récupérer toutes les commandes avec pagination
   */
  async getAll(params?: CommandeFilters): Promise<{ commandes: Commande[]; total: number; totalPages: number }> {
    const response = await api.get<Commande[] | HalResponse<Commande>>(ENDPOINTS.COMMANDES, {
      page: params?.page || 0,
      size: params?.size || 20,
      sort: params?.sort || 'dateCommande,desc',
    });

    // Gérer les deux formats de réponse possibles (tableau direct ou HAL)
    let commandes: Commande[];
    if (Array.isArray(response.data)) {
      commandes = response.data;
    } else {
      commandes = response.data._embedded?.commandes || [];
    }

    // Appliquer les filtres côté client si nécessaire
    if (params?.statut) {
      commandes = commandes.filter(c => c.statut === params.statut);
    }

    if (params?.paysLivraison) {
      commandes = commandes.filter(c => c.paysLivraison === params.paysLivraison);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      commandes = commandes.filter(c =>
        (c.reference || '').toLowerCase().includes(searchLower) ||
        c.utilisateur?.nom?.toLowerCase().includes(searchLower)
      );
    }

    return {
      commandes,
      total: Array.isArray(response.data) ? commandes.length : (response.data.page?.totalElements || commandes.length),
      totalPages: Array.isArray(response.data) ? 1 : (response.data.page?.totalPages || 1),
    };
  },

  /**
   * Récupérer une commande par son ID
   */
  async getById(id: number): Promise<Commande> {
    const response = await api.get<Commande>(`${ENDPOINTS.COMMANDES}/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateStatut(id: number, data: UpdateCommandeStatutDTO): Promise<Commande> {
    const response = await api.patch<Commande>(`${ENDPOINTS.COMMANDES}/${id}`, data);
    return response.data;
  },

  /**
   * Exécuter une commande (Command pattern - valider)
   */
  async executer(id: number): Promise<Commande> {
    const response = await api.post<Commande>(ENDPOINTS.EXECUTER(id));
    return response.data;
  },

  /**
   * Annuler une commande (Command pattern)
   */
  async annuler(id: number): Promise<Commande> {
    const response = await api.post<Commande>(ENDPOINTS.ANNULER(id));
    return response.data;
  },

  /**
   * Marquer une commande comme livrée
   */
  async marquerLivree(id: number): Promise<Commande> {
    const response = await api.post<Commande>(ENDPOINTS.LIVRER(id));
    return response.data;
  },

  /**
   * Générer la liasse documentaire
   */
  async genererLiasse(commandeId: number): Promise<void> {
    await api.post(ENDPOINTS.LIASSE(commandeId));
  },

  /**
   * Calculer le total avec TVA pour un pays (Template Method pattern)
   */
  async calculerTotal(id: number, pays: PaysLivraison): Promise<number> {
    const response = await api.get<{ total: number }>(ENDPOINTS.TOTAL(id, pays));
    return response.data.total;
  },

  /**
   * Récupérer les commandes par statut
   */
  async getByStatut(statut: StatutCommande): Promise<Commande[]> {
    const result = await this.getAll({ statut, size: 1000 });
    return result.commandes;
  },

  /**
   * Récupérer les commandes récentes
   */
  async getRecentes(limit: number = 5): Promise<Commande[]> {
    const result = await this.getAll({ size: limit, sort: 'dateCommande,desc' });
    return result.commandes;
  },

  /**
   * Statistiques des commandes
   */
  async getStats(): Promise<{
    total: number;
    enCours: number;
    validees: number;
    livrees: number;
    montantTotal: number;
  }> {
    const { commandes } = await this.getAll({ size: 1000 });

    return {
      total: commandes.length,
      enCours: commandes.filter(c => c.statut === 'ACTIF').length,
      validees: commandes.filter(c => c.statut === 'VALIDEE' || c.statut === 'CONVERTI').length,
      livrees: commandes.filter(c => c.statut === 'REFUSEE').length,
      montantTotal: commandes.reduce((sum, c) => sum + (c.total || 0), 0),
    };
  },

  // Helpers
  getStatutLabel(statut: StatutCommande | string): string {
    const labels: Record<string, string> = {
      ACTIF: 'En cours',
      CONVERTI: 'Convertie',
      VALIDEE: 'Validée',
      REFUSEE: 'Refusée',
    };
    return labels[statut] || statut;
  },

  getStatutColor(statut: StatutCommande | string): 'warning' | 'info' | 'success' | 'error' {
    const colors: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
      ACTIF: 'warning',
      CONVERTI: 'info',
      VALIDEE: 'success',
      REFUSEE: 'error',
    };
    return colors[statut] || 'warning';
  },

  getPaysLabel(pays: PaysLivraison): string {
    const labels: Record<PaysLivraison, string> = {
      CM: 'Cameroun',
      FR: 'France',
      US: 'États-Unis',
      NG: 'Nigeria',
    };
    return labels[pays];
  },

  getMethodePaiementLabel(methode: TypeMethodePaiement | string): string {
    const labels: Record<string, string> = {
      CARTE_BANCAIRE: 'Carte bancaire',
      PAYPAL: 'PayPal',
      COMPTANT: 'Comptant',
      CREDIT: 'Crédit',
    };
    return labels[methode] || methode;
  },

  calculerTaxes(montantHT: number, pays: PaysLivraison): number {
    return montantHT * (TAUX_TVA[pays] / 100);
  },
};

export default commandeService;
