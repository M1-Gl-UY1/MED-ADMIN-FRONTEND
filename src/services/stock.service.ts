import { api } from './api';
import type { Stock, Vehicule, HalResponse } from './types';
import { vehiculeService } from './vehicule.service';

const ENDPOINTS = {
  STOCKS: '/api/stocks',
};

export const stockService = {
  /**
   * Récupérer tous les stocks
   */
  async getAll(): Promise<Stock[]> {
    const response = await api.get<HalResponse<Stock>>(ENDPOINTS.STOCKS);
    return response.data._embedded?.stocks || [];
  },

  /**
   * Récupérer le stock par ID
   */
  async getById(id: number): Promise<Stock> {
    const response = await api.get<Stock>(`${ENDPOINTS.STOCKS}/${id}`);
    return response.data;
  },

  /**
   * Mettre à jour la quantité de stock
   */
  async updateQuantite(stockId: number, quantite: number): Promise<Stock> {
    const response = await api.patch<Stock>(`${ENDPOINTS.STOCKS}/${stockId}`, {
      quantite,
      dateEntree: new Date().toISOString().split('T')[0],
    });
    return response.data;
  },

  /**
   * Récupérer l'inventaire complet (véhicules avec leur stock)
   */
  async getInventaire(): Promise<Array<Vehicule & { stockQuantite: number; stockStatut: 'critical' | 'low' | 'ok' | 'high' }>> {
    const vehicules = await vehiculeService.getAllCustom();

    return vehicules.map(v => {
      const quantite = v.stock?.quantite || 0;
      let stockStatut: 'critical' | 'low' | 'ok' | 'high';

      if (quantite === 0) {
        stockStatut = 'critical';
      } else if (quantite <= 3) {
        stockStatut = 'low';
      } else if (quantite <= 10) {
        stockStatut = 'ok';
      } else {
        stockStatut = 'high';
      }

      return {
        ...v,
        stockQuantite: quantite,
        stockStatut,
      };
    });
  },

  /**
   * Récupérer les véhicules avec stock critique
   */
  async getStockCritique(): Promise<Vehicule[]> {
    const inventaire = await this.getInventaire();
    return inventaire.filter(v => v.stockStatut === 'critical' || v.stockStatut === 'low');
  },

  /**
   * Calculer la valeur totale du stock
   */
  async getValeurStock(): Promise<{
    valeurTotale: number;
    quantiteTotale: number;
    nombreVehicules: number;
    parType: Record<string, { quantite: number; valeur: number }>;
  }> {
    const inventaire = await this.getInventaire();

    const parType: Record<string, { quantite: number; valeur: number }> = {};

    let valeurTotale = 0;
    let quantiteTotale = 0;

    inventaire.forEach(v => {
      const valeur = v.prixBase * v.stockQuantite;
      valeurTotale += valeur;
      quantiteTotale += v.stockQuantite;

      if (!parType[v.type]) {
        parType[v.type] = { quantite: 0, valeur: 0 };
      }
      parType[v.type].quantite += v.stockQuantite;
      parType[v.type].valeur += valeur;
    });

    return {
      valeurTotale,
      quantiteTotale,
      nombreVehicules: inventaire.length,
      parType,
    };
  },

  /**
   * Entrée de stock (ajout de quantité)
   */
  async entreeStock(vehiculeId: number, quantiteAjoutee: number): Promise<Stock> {
    // Récupérer le véhicule pour avoir son stock actuel
    const vehicule = await vehiculeService.getById(vehiculeId);
    const quantiteActuelle = vehicule.stock?.quantite || 0;
    const stockId = vehicule.stock?.idStock;

    if (!stockId) {
      throw new Error('Stock non trouvé pour ce véhicule');
    }

    return this.updateQuantite(stockId, quantiteActuelle + quantiteAjoutee);
  },

  /**
   * Sortie de stock (retrait de quantité)
   */
  async sortieStock(vehiculeId: number, quantiteRetiree: number): Promise<Stock> {
    const vehicule = await vehiculeService.getById(vehiculeId);
    const quantiteActuelle = vehicule.stock?.quantite || 0;
    const stockId = vehicule.stock?.idStock;

    if (!stockId) {
      throw new Error('Stock non trouvé pour ce véhicule');
    }

    const nouvelleQuantite = Math.max(0, quantiteActuelle - quantiteRetiree);
    return this.updateQuantite(stockId, nouvelleQuantite);
  },

  // Helpers pour les couleurs de statut
  getStatutColor(statut: 'critical' | 'low' | 'ok' | 'high'): string {
    const colors = {
      critical: 'error',
      low: 'warning',
      ok: 'info',
      high: 'success',
    };
    return colors[statut];
  },

  getStatutLabel(statut: 'critical' | 'low' | 'ok' | 'high'): string {
    const labels = {
      critical: 'Rupture',
      low: 'Faible',
      ok: 'Normal',
      high: 'Élevé',
    };
    return labels[statut];
  },
};

export default stockService;
