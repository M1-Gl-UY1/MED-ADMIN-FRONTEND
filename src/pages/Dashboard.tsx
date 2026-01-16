import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Alert, Button } from '../components/ui';
import { dashboardService, commandeService } from '../services';
import type { DashboardStats, VentesParPays, Commande } from '../services/types';

// Fonctions utilitaires locales (sans dépendance aux mock data)
const formatPrice = (price: number): string => {
  // Format compact pour gros montants
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} Mrd`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} M`;
  }
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' XAF';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    EN_COURS: 'En cours',
    VALIDEE: 'Validée',
    LIVREE: 'Livrée',
    ANNULEE: 'Annulée',
  };
  return labels[statut] || statut;
};

const getStatutColor = (statut: string): string => {
  const colors: Record<string, string> = {
    EN_COURS: 'warning',
    VALIDEE: 'info',
    LIVREE: 'success',
    ANNULEE: 'danger',
  };
  return colors[statut] || 'default';
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ventesParMois, setVentesParMois] = useState<{ mois: string; montant: number }[]>([]);
  const [ventesParPays, setVentesParPays] = useState<VentesParPays[]>([]);
  const [recentCommandes, setRecentCommandes] = useState<Commande[]>([]);
  const [stockFaible, setStockFaible] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les données depuis l'API
      const [statsData, ventesParMoisData, ventesParPaysData, alertesData, commandesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getVentesParMois(),
        dashboardService.getVentesParPays(),
        dashboardService.getAlertesStock(3),
        commandeService.getRecentes(5),
      ]);

      setStats(statsData);
      setVentesParMois(ventesParMoisData.map(v => ({ mois: v.mois, montant: v.montant })));
      setVentesParPays(ventesParPaysData);
      setStockFaible(alertesData.length);
      setRecentCommandes(commandesData);
    } catch (err: any) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err.message || 'Impossible de charger les données depuis le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-text-light">Chargement du dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <p className="text-lg font-semibold text-primary mb-2">Erreur de connexion</p>
            <p className="text-text-light mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="flex items-center gap-2 mx-auto">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />

      <div className="p-4 sm:p-6">

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Chiffre d'affaires"
            value={formatPrice(stats?.totalVentes || 0)}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Commandes en cours"
            value={(stats?.commandesEnCours || 0) + (stats?.commandesValidees || 0)}
            icon={ShoppingCart}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Clients"
            value={stats?.nombreClients || 0}
            icon={Users}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Véhicules en stock"
            value={stats?.stockTotal || 0}
            icon={Package}
            trend={{ value: -5, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Sales chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ventes par mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {ventesParMois.map((item, index) => {
                  const maxValue = Math.max(...ventesParMois.map(v => v.montant));
                  const height = maxValue > 0 ? (item.montant / maxValue) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-secondary to-secondary-300 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-text-light">{item.mois}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sales by country */}
          <Card>
            <CardHeader>
              <CardTitle>Ventes par pays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ventesParPays.map((item) => (
                  <div key={item.pays}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">
                        {commandeService.getPaysLabel(item.pays)}
                      </span>
                      <span className="text-sm text-text-light">{item.pourcentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-secondary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${item.pourcentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-light mt-1">{formatPrice(item.montant)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dernières commandes</CardTitle>
              <a href="/commandes" className="text-sm text-secondary hover:text-secondary-300 font-medium">
                Voir tout →
              </a>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-xs font-semibold text-text-light uppercase">Référence</th>
                      <th className="text-left py-3 text-xs font-semibold text-text-light uppercase">Client</th>
                      <th className="text-left py-3 text-xs font-semibold text-text-light uppercase">Montant</th>
                      <th className="text-left py-3 text-xs font-semibold text-text-light uppercase">Statut</th>
                      <th className="text-left py-3 text-xs font-semibold text-text-light uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCommandes.map((commande: any) => {
                      // Récupérer le nom du client depuis les données API
                      const clientName = commande.utilisateur
                        ? commande.utilisateur.prenom
                          ? `${commande.utilisateur.prenom} ${commande.utilisateur.nom}`
                          : commande.utilisateur.nom
                        : 'Client';

                      const reference = commande.reference || `CMD-${commande.idCommande || commande.id}`;
                      const montant = commande.montantTTC || commande.total || 0;
                      const date = commande.dateCommande || commande.date;

                      return (
                        <tr key={commande.idCommande || commande.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-primary">{reference}</td>
                          <td className="py-3 text-sm text-text">{clientName}</td>
                          <td className="py-3 text-sm font-semibold text-secondary">{formatPrice(montant)}</td>
                          <td className="py-3">
                            <Badge variant={getStatutColor(commande.statut) as any}>
                              {getStatutLabel(commande.statut)}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-text-light">{formatDate(date)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/vehicules"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-primary">Gérer les véhicules</p>
                  <p className="text-sm text-text-light">Ajouter, modifier ou supprimer</p>
                </a>
                <a
                  href="/commandes"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-primary">Traiter les commandes</p>
                  <p className="text-sm text-text-light">Valider ou livrer les commandes</p>
                </a>
                <a
                  href="/stock"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-primary">Gérer le stock</p>
                  <p className="text-sm text-text-light">Mettre à jour les quantités</p>
                </a>
                <a
                  href="/clients"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-primary">Voir les clients</p>
                  <p className="text-sm text-text-light">Consulter les profils clients</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low stock alert */}
        {stockFaible > 0 && (
          <Card className="mt-6 border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-warning/20 rounded-lg">
                <Package className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-primary">Alerte stock faible</p>
                <p className="text-sm text-text-light">
                  {stockFaible} véhicule(s) ont un stock faible (≤ 3 unités)
                </p>
              </div>
              <a
                href="/stock"
                className="ml-auto text-sm font-medium text-secondary hover:text-secondary-300"
              >
                Voir le stock →
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
