import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge } from '../components/ui';
import {
  dashboardStats,
  commandes,
  getUtilisateurById,
  formatPrice,
  formatDate,
  getStatutLabel,
  getStatutColor,
} from '../data/mockData';

export default function Dashboard() {
  const recentCommandes = commandes.slice(0, 5);

  return (
    <div>
      <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />

      <div className="p-4 sm:p-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Chiffre d'affaires"
            value={formatPrice(dashboardStats.totalVentes)}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Commandes en cours"
            value={dashboardStats.commandesEnCours + dashboardStats.commandesValidees}
            icon={ShoppingCart}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Clients"
            value={dashboardStats.totalClients + dashboardStats.totalSocietes}
            icon={Users}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Véhicules en stock"
            value={dashboardStats.vehiculesEnStock}
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
                {dashboardStats.ventesParMois.map((item, index) => {
                  const maxValue = Math.max(...dashboardStats.ventesParMois.map(v => v.montant));
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
                {dashboardStats.ventesParPays.map((item) => (
                  <div key={item.code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">{item.pays}</span>
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
                    {recentCommandes.map((commande) => {
                      const utilisateur = getUtilisateurById(commande.utilisateurId);
                      const clientName = utilisateur
                        ? utilisateur.type === 'CLIENT'
                          ? `${utilisateur.prenom} ${utilisateur.nom}`
                          : utilisateur.nom
                        : 'Inconnu';

                      return (
                        <tr key={commande.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-primary">{commande.reference}</td>
                          <td className="py-3 text-sm text-text">{clientName}</td>
                          <td className="py-3 text-sm font-semibold text-secondary">{formatPrice(commande.montantTTC)}</td>
                          <td className="py-3">
                            <Badge variant={getStatutColor(commande.statut) as any}>
                              {getStatutLabel(commande.statut)}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-text-light">{formatDate(commande.dateCommande)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Top véhicules vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.topVehicules.map((item, index) => {
                  return (
                    <div key={item.vehiculeId} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-secondary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{item.nom}</p>
                        <p className="text-xs text-text-light">{item.ventes} vente(s)</p>
                      </div>
                      <p className="text-sm font-semibold text-secondary">{formatPrice(item.montant)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low stock alert */}
        {dashboardStats.vehiculesFaibleStock > 0 && (
          <Card className="mt-6 border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-warning/20 rounded-lg">
                <Package className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-primary">Alerte stock faible</p>
                <p className="text-sm text-text-light">
                  {dashboardStats.vehiculesFaibleStock} véhicule(s) ont un stock faible (≤ 3 unités)
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
