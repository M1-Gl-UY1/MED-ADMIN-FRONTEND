import { vehiculeService } from './vehicule.service';
import { commandeService } from './commande.service';
import { clientService } from './client.service';
import { stockService } from './stock.service';
import type {
  DashboardStats,
  DashboardComplet,
  VentesParMois,
  VentesParPays,
  VehiculePopulaire,
  AlerteStock,
  PaysLivraison
} from './types';

// Stats par défaut pour une base de données vide
const DEFAULT_STATS: DashboardStats = {
  totalVentes: 0,
  nombreCommandes: 0,
  commandesEnCours: 0,
  commandesValidees: 0,
  commandesLivrees: 0,
  nombreClients: 0,
  nombreVehicules: 0,
  stockTotal: 0,
};

export const dashboardService = {
  /**
   * Récupérer les statistiques principales du dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const [commandeStats, clientStats, vehicules, inventaireStats] = await Promise.all([
        commandeService.getStats().catch(() => ({ montantTotal: 0, total: 0, enCours: 0, validees: 0, livrees: 0 })),
        clientService.getStats().catch(() => ({ totalClients: 0, totalSocietes: 0, totalFiliales: 0, clientsParPays: {} })),
        vehiculeService.getAllCustom().catch(() => []),
        stockService.getValeurStock().catch(() => ({ valeurTotale: 0, quantiteTotale: 0, nombreVehicules: 0, parType: {} })),
      ]);

      return {
        totalVentes: commandeStats.montantTotal || 0,
        nombreCommandes: commandeStats.total || 0,
        commandesEnCours: commandeStats.enCours || 0,
        commandesValidees: commandeStats.validees || 0,
        commandesLivrees: commandeStats.livrees || 0,
        nombreClients: (clientStats.totalClients || 0) + (clientStats.totalSocietes || 0),
        nombreVehicules: vehicules.length || 0,
        stockTotal: inventaireStats.quantiteTotale || 0,
      };
    } catch (error) {
      console.warn('Erreur lors du chargement des stats, utilisation des valeurs par défaut:', error);
      return DEFAULT_STATS;
    }
  },

  /**
   * Récupérer les ventes par mois (12 derniers mois)
   */
  async getVentesParMois(): Promise<VentesParMois[]> {
    try {
      const result = await commandeService.getAll({ size: 1000, sort: 'dateCommande,desc' }).catch(() => ({ commandes: [] }));
      const commandes = result.commandes || [];

      if (commandes.length === 0) return [];

      // Grouper par mois
      const parMois: Record<string, { montant: number; count: number }> = {};

      commandes.forEach(c => {
        if (!c.dateCommande) return;
        const date = new Date(c.dateCommande);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!parMois[key]) {
          parMois[key] = { montant: 0, count: 0 };
        }
        parMois[key].montant += c.montantTTC || 0;
        parMois[key].count += 1;
      });

      // Convertir en tableau et trier
      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      return Object.entries(parMois)
        .map(([key, value]) => {
          const [annee, mois] = key.split('-');
          return {
            mois: moisNoms[parseInt(mois) - 1],
            annee: parseInt(annee),
            montant: value.montant,
            nombreCommandes: value.count,
          };
        })
        .sort((a, b) => {
          if (a.annee !== b.annee) return a.annee - b.annee;
          return moisNoms.indexOf(a.mois) - moisNoms.indexOf(b.mois);
        })
        .slice(-12);
    } catch {
      return [];
    }
  },

  /**
   * Récupérer les ventes par pays
   */
  async getVentesParPays(): Promise<VentesParPays[]> {
    try {
      const result = await commandeService.getAll({ size: 1000 }).catch(() => ({ commandes: [] }));
      const commandes = result.commandes || [];

      const parPays: Record<PaysLivraison, number> = {
        CM: 0,
        FR: 0,
        US: 0,
        NG: 0,
      };

      let total = 0;
      commandes.forEach(c => {
        if (c.paysLivraison && parPays[c.paysLivraison] !== undefined) {
          parPays[c.paysLivraison] += c.montantTTC || 0;
          total += c.montantTTC || 0;
        }
      });

      return Object.entries(parPays).map(([pays, montant]) => ({
        pays: pays as PaysLivraison,
        montant,
        pourcentage: total > 0 ? Math.round((montant / total) * 100) : 0,
      }));
    } catch {
      return [
        { pays: 'CM', montant: 0, pourcentage: 0 },
        { pays: 'FR', montant: 0, pourcentage: 0 },
        { pays: 'US', montant: 0, pourcentage: 0 },
        { pays: 'NG', montant: 0, pourcentage: 0 },
      ];
    }
  },

  /**
   * Récupérer les véhicules les plus vendus
   */
  async getVehiculesPopulaires(limit: number = 5): Promise<VehiculePopulaire[]> {
    try {
      const [commandeResult, vehicules] = await Promise.all([
        commandeService.getAll({ size: 1000 }).catch(() => ({ commandes: [] })),
        vehiculeService.getAllCustom().catch(() => []),
      ]);
      const commandes = commandeResult.commandes || [];

      if (commandes.length === 0 || vehicules.length === 0) return [];

      // Compter les ventes par véhicule
      const ventesParVehicule: Record<number, { quantite: number; ca: number }> = {};

      commandes.forEach(c => {
        c.lignes?.forEach(ligne => {
          const vehiculeId = ligne.vehicule?.idVehicule;
          if (vehiculeId) {
            if (!ventesParVehicule[vehiculeId]) {
              ventesParVehicule[vehiculeId] = { quantite: 0, ca: 0 };
            }
            ventesParVehicule[vehiculeId].quantite += ligne.quantite || 0;
            ventesParVehicule[vehiculeId].ca += (ligne.prixUnitaireHT || 0) * (ligne.quantite || 0);
          }
        });
      });

      // Mapper avec les véhicules et trier
      return Object.entries(ventesParVehicule)
        .map(([id, ventes]) => {
          const vehicule = vehicules.find(v => v.idVehicule === parseInt(id));
          return {
            vehicule: vehicule!,
            quantiteVendue: ventes.quantite,
            chiffreAffaires: ventes.ca,
          };
        })
        .filter(v => v.vehicule)
        .sort((a, b) => b.quantiteVendue - a.quantiteVendue)
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Récupérer les alertes de stock
   */
  async getAlertesStock(seuil: number = 3): Promise<AlerteStock[]> {
    try {
      const inventaire = await stockService.getInventaire().catch(() => []);
      if (inventaire.length === 0) return [];

      return inventaire
        .filter(v => v.stockQuantite <= seuil)
        .map(v => ({
          vehicule: v,
          quantiteActuelle: v.stockQuantite,
          seuilAlerte: seuil,
        }))
        .sort((a, b) => a.quantiteActuelle - b.quantiteActuelle);
    } catch {
      return [];
    }
  },

  /**
   * Récupérer le dashboard complet
   */
  async getDashboardComplet(): Promise<DashboardComplet> {
    const [
      stats,
      ventesParMois,
      ventesParPays,
      vehiculesPopulaires,
      alertesStock,
      dernieresCommandes,
    ] = await Promise.all([
      this.getStats(),
      this.getVentesParMois(),
      this.getVentesParPays(),
      this.getVehiculesPopulaires(5),
      this.getAlertesStock(3),
      commandeService.getRecentes(5).catch(() => []),
    ]);

    return {
      stats,
      ventesParMois,
      ventesParPays,
      vehiculesPopulaires,
      alertesStock,
      dernieresCommandes,
    };
  },
};

export default dashboardService;
