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
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination } from '../components/ui';
import {
  commandes,
  getUtilisateurById,
  getVehiculeById,
  getOptionById,
  formatPrice,
  formatDate,
  getStatutLabel,
  getStatutColor,
  getPaysLabel,
  type StatutCommande,
  type Commande,
} from '../data/mockData';

export default function Commandes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutCommande | 'ALL'>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredCommandes = commandes.filter((c) => {
    const utilisateur = getUtilisateurById(c.utilisateurId);
    const clientName = utilisateur
      ? utilisateur.type === 'CLIENT'
        ? `${utilisateur.prenom} ${utilisateur.nom}`
        : utilisateur.nom
      : '';

    const matchSearch =
      c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
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
    enCours: commandes.filter((c) => c.statut === 'EN_COURS').length,
    validees: commandes.filter((c) => c.statut === 'VALIDEE').length,
    livrees: commandes.filter((c) => c.statut === 'LIVREE').length,
    total: commandes.reduce((acc, c) => acc + c.montantTTC, 0),
  };

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
                placeholder="Rechercher par référence ou client..."
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
              <option value="EN_COURS">En cours</option>
              <option value="VALIDEE">Validées</option>
              <option value="LIVREE">Livrées</option>
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
                    <th className="table-header">Client</th>
                    <th className="table-header">Pays</th>
                    <th className="table-header">Montant TTC</th>
                    <th className="table-header">Paiement</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCommandes.map((commande) => (
                    <OrderRow
                      key={commande.id}
                      commande={commande}
                      isExpanded={expandedOrder === commande.id}
                      onToggle={() => setExpandedOrder(expandedOrder === commande.id ? null : commande.id)}
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
}: {
  commande: Commande;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const utilisateur = getUtilisateurById(commande.utilisateurId);
  const clientName = utilisateur
    ? utilisateur.type === 'CLIENT'
      ? `${utilisateur.prenom} ${utilisateur.nom}`
      : utilisateur.nom
    : 'Inconnu';

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="table-cell font-medium text-primary">{commande.reference}</td>
        <td className="table-cell">
          <div>
            <p className="font-medium text-text">{clientName}</p>
            <p className="text-xs text-text-light">{utilisateur?.email}</p>
          </div>
        </td>
        <td className="table-cell">{getPaysLabel(commande.paysLivraison)}</td>
        <td className="table-cell font-semibold text-secondary">{formatPrice(commande.montantTTC)}</td>
        <td className="table-cell">
          <Badge variant="default">{commande.methodePaiement.replace('_', ' ')}</Badge>
        </td>
        <td className="table-cell">
          <Badge variant={getStatutColor(commande.statut) as any}>
            {getStatutLabel(commande.statut)}
          </Badge>
        </td>
        <td className="table-cell text-text-light">{formatDate(commande.dateCommande)}</td>
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
          <td colSpan={8} className="bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order lines */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Articles commandés</h4>
                <div className="space-y-3">
                  {commande.lignes.map((ligne) => {
                    const vehicule = getVehiculeById(ligne.vehiculeId);
                    return (
                      <div key={ligne.id} className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text">{vehicule?.nom}</p>
                            <p className="text-sm text-text-light">
                              {ligne.quantite}x {formatPrice(ligne.prixUnitaireHT)} HT
                            </p>
                          </div>
                          <p className="font-semibold text-secondary">
                            {formatPrice(ligne.prixUnitaireHT * ligne.quantite)}
                          </p>
                        </div>
                        {ligne.optionsSelectionnees.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {ligne.optionsSelectionnees.map((optId) => {
                              const opt = getOptionById(optId);
                              return opt ? (
                                <span key={optId} className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded">
                                  + {opt.nom}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-light">Sous-total HT</span>
                    <span>{formatPrice(commande.montantHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-light">Taxes</span>
                    <span>{formatPrice(commande.taxes)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-primary mt-2">
                    <span>Total TTC</span>
                    <span className="text-secondary">{formatPrice(commande.montantTTC)}</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Documents</h4>
                <div className="space-y-2">
                  {commande.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <FileText className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">
                            {doc.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-text-light">
                            {doc.format} - {formatDate(doc.dateCreation)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-text-light" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {commande.statut === 'EN_COURS' && (
                    <Button variant="primary" size="sm">
                      Valider la commande
                    </Button>
                  )}
                  {commande.statut === 'VALIDEE' && (
                    <Button variant="primary" size="sm">
                      Marquer comme livrée
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Voir détails
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
