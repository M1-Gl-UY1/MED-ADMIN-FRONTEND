import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination, Alert } from '../components/ui';
import { commandeService } from '../services';
import type { Commande } from '../services/types';

type StatutCommande = 'EN_COURS' | 'ACTIF' | 'VALIDEE' | 'CONVERTI' | 'LIVREE' | 'ANNULEE';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price || 0) + ' FCFA';
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
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
    ACTIF: 'Active',
    VALIDEE: 'Validée',
    CONVERTI: 'Convertie',
    LIVREE: 'Livrée',
    ANNULEE: 'Annulée',
  };
  return labels[statut] || statut;
};

const getStatutColor = (statut: string): string => {
  const colors: Record<string, string> = {
    EN_COURS: 'warning',
    ACTIF: 'warning',
    VALIDEE: 'info',
    CONVERTI: 'success',
    LIVREE: 'success',
    ANNULEE: 'danger',
  };
  return colors[statut] || 'default';
};

const getPaysLabel = (pays: string): string => {
  const labels: Record<string, string> = {
    SENEGAL: 'Sénégal',
    FRANCE: 'France',
    BELGIQUE: 'Belgique',
    SUISSE: 'Suisse',
    CANADA: 'Canada',
    COTE_IVOIRE: "Côte d'Ivoire",
    MAROC: 'Maroc',
  };
  return labels[pays] || pays || 'N/A';
};

export default function Commandes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutCommande | 'ALL'>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API states
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await commandeService.getAll();
      setCommandes(result.commandes);
    } catch (err: any) {
      console.error('Erreur lors du chargement des commandes:', err);
      setError(err.message || 'Impossible de charger les commandes depuis le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderCommande = async (id: number) => {
    try {
      const updated = await commandeService.executer(id);
      setCommandes(prev => prev.map(c => c.idCommande === id || c.id === id ? updated : c));
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation de la commande');
    }
  };

  const handleMarquerLivree = async (id: number) => {
    try {
      const updated = await commandeService.marquerLivree(id);
      setCommandes(prev => prev.map(c => c.idCommande === id || c.id === id ? updated : c));
    } catch (err) {
      console.error('Erreur lors du marquage:', err);
      alert('Erreur lors du marquage de la commande comme livrée');
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const filteredCommandes = commandes.filter((c) => {
    const reference = c.reference || `CMD-${c.idCommande || c.id}`;
    const matchSearch = reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'ALL' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatut]);

  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);
  const paginatedCommandes = filteredCommandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const stats = {
    enCours: commandes.filter((c) => c.statut === 'EN_COURS' || c.statut === 'ACTIF').length,
    validees: commandes.filter((c) => c.statut === 'VALIDEE').length,
    livrees: commandes.filter((c) => c.statut === 'LIVREE' || c.statut === 'CONVERTI').length,
    total: commandes.reduce((acc, c) => acc + (c.total || c.montantTTC || 0), 0),
  };

  if (loading) {
    return (
      <div>
        <Header title="Commandes" subtitle="Gérez les commandes clients" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-text-light">Chargement des commandes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Commandes" subtitle="Gérez les commandes clients" />
        <div className="p-4 sm:p-6">
          <Alert variant="error" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </Alert>
          <Button onClick={fetchCommandes} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Commandes" subtitle="Gérez les commandes clients" />

      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">En cours</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.enCours}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Validées</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.validees}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Livrées</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.livrees}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-secondary/20 rounded-lg flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">CA Total</p>
                <p className="text-base sm:text-xl font-bold text-secondary truncate">{formatPrice(stats.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
              <input
                type="text"
                placeholder="Rechercher par référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as StatutCommande | 'ALL')}
              className="input w-auto"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actives</option>
              <option value="VALIDEE">Validées</option>
              <option value="CONVERTI">Converties</option>
            </select>
          </CardContent>
        </Card>

        {/* Orders list */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="table-header">Référence</th>
                    <th className="table-header">Pays</th>
                    <th className="table-header">Montant</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCommandes.map((commande) => (
                    <OrderRow
                      key={commande.idCommande || commande.id}
                      commande={commande}
                      isExpanded={expandedOrder === (commande.idCommande || commande.id)}
                      onToggle={() => setExpandedOrder(expandedOrder === (commande.idCommande || commande.id) ? null : (commande.idCommande || commande.id))}
                      onValider={() => handleValiderCommande(commande.idCommande || commande.id)}
                      onMarquerLivree={() => handleMarquerLivree(commande.idCommande || commande.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCommandes.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-text-light mx-auto mb-4" />
                <p className="text-text-light">Aucune commande trouvée</p>
              </div>
            )}

            {/* Pagination */}
            {filteredCommandes.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCommandes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderRow({
  commande,
  isExpanded,
  onToggle,
  onValider,
  onMarquerLivree,
}: {
  commande: Commande;
  isExpanded: boolean;
  onToggle: () => void;
  onValider: () => void;
  onMarquerLivree: () => void;
}) {
  const reference = commande.reference || `CMD-${commande.idCommande || commande.id}`;
  const montant = commande.total || commande.montantTTC || 0;
  const date = commande.date || commande.dateCommande;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="table-cell font-medium text-primary">{reference}</td>
        <td className="table-cell">{getPaysLabel(commande.paysLivraison)}</td>
        <td className="table-cell font-semibold text-secondary">{formatPrice(montant)}</td>
        <td className="table-cell">
          <Badge variant={getStatutColor(commande.statut) as any}>
            {getStatutLabel(commande.statut)}
          </Badge>
        </td>
        <td className="table-cell text-text-light">{formatDate(date)}</td>
        <td className="table-cell">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-light" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-light" />
              )}
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye className="w-4 h-4 text-text-light" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded details */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order info */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Détails de la commande</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-light">ID Commande</span>
                    <span className="font-medium">#{commande.idCommande || commande.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Pays de livraison</span>
                    <span className="font-medium">{getPaysLabel(commande.paysLivraison)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Type</span>
                    <span className="font-medium">{commande.type || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-secondary">{formatPrice(montant)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Actions</h4>
                <div className="space-y-2">
                  {(commande.statut === 'ACTIF' || commande.statut === 'EN_COURS') && (
                    <Button variant="primary" size="sm" className="w-full justify-center" onClick={onValider}>
                      Valider la commande
                    </Button>
                  )}
                  {commande.statut === 'VALIDEE' && (
                    <Button variant="primary" size="sm" className="w-full justify-center" onClick={onMarquerLivree}>
                      Marquer comme livrée
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer facture
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger récapitulatif
                  </Button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
