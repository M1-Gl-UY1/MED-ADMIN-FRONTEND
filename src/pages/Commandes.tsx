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
  const value = price || 0;
  // Format compact pour gros montants
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} Mrd`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} M XAF`;
  }
  return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
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
    CM: 'Cameroun',
    FR: 'France',
    US: 'États-Unis',
    NG: 'Nigeria',
  };
  return labels[pays] || pays || 'N/A';
};

const getMethodePaiementLabel = (methode: string): string => {
  const labels: Record<string, string> = {
    CARTE_BANCAIRE: 'Carte bancaire',
    PAYPAL: 'PayPal',
    COMPTANT: 'Comptant',
    CREDIT: 'Crédit',
  };
  return labels[methode] || methode || 'N/A';
};

// Helper pour obtenir les lignes de commande (gère les deux noms possibles)
const getLignesCommande = (commande: any): any[] => {
  return commande.lignes || commande.lignesCommandes || [];
};

// Helper pour obtenir les options (gère les deux noms possibles)
const getOptions = (ligne: any): any[] => {
  return ligne.optionsSelectionnees || ligne.optionsAchetees || [];
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
      setCommandes(prev => prev.map(c => c.idCommande === id ? updated : c));
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation de la commande');
    }
  };

  const handleMarquerLivree = async (id: number) => {
    try {
      const updated = await commandeService.marquerLivree(id);
      setCommandes(prev => prev.map(c => c.idCommande === id ? updated : c));
    } catch (err) {
      console.error('Erreur lors du marquage:', err);
      alert('Erreur lors du marquage de la commande comme livrée');
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const filteredCommandes = commandes.filter((c) => {
    const reference = c.reference || `CMD-${c.idCommande}`;
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
    enCours: commandes.filter((c) => c.statut === 'ACTIF').length,
    validees: commandes.filter((c) => c.statut === 'VALIDEE').length,
    livrees: commandes.filter((c) => c.statut === 'CONVERTI').length,
    total: commandes.reduce((acc, c) => acc + (c.total || 0), 0),
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
                      key={commande.idCommande}
                      commande={commande}
                      isExpanded={expandedOrder === commande.idCommande}
                      onToggle={() => setExpandedOrder(expandedOrder === commande.idCommande ? null : commande.idCommande)}
                      onValider={() => handleValiderCommande(commande.idCommande)}
                      onMarquerLivree={() => handleMarquerLivree(commande.idCommande)}
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
  const reference = commande.reference || `CMD-${commande.idCommande}`;
  const montant = commande.total || 0;
  const date = commande.date;

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
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voir les détails"
            >
              <Eye className="w-4 h-4 text-text-light" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded details */}
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Véhicules commandés */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-primary mb-3">Véhicules commandés</h4>
                <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100">
                  {getLignesCommande(commande).length > 0 ? (
                    getLignesCommande(commande).map((ligne: any, index: number) => {
                      const vehicule = ligne.vehicule;
                      const imageUrl = vehicule?.imageUrl
                        || vehicule?.images?.[0]?.url
                        || '/placeholder-car.jpg';
                      const vehiculeNom = vehicule
                        ? `${vehicule.marque || ''} ${vehicule.nom || vehicule.model || ''}`.trim()
                        : 'Véhicule non disponible';

                      return (
                        <div key={ligne.idLigneCommande || index} className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                          <img
                            src={imageUrl}
                            alt={vehiculeNom}
                            className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary text-sm sm:text-base truncate">
                              {vehiculeNom}
                            </p>
                            <p className="text-xs sm:text-sm text-text-light">
                              {vehicule?.model || ''} {vehicule?.annee ? `(${vehicule.annee})` : ''} • Couleur: {ligne.couleur || 'Standard'}
                            </p>
                            <p className="text-xs text-text-light">
                              Qté: {ligne.quantite || 1} × {formatPrice(ligne.prixUnitaireHT || vehicule?.prixBase || 0)}
                            </p>
                            {getOptions(ligne).length > 0 && (
                              <p className="text-xs text-text-light mt-1">
                                Options: {getOptions(ligne).map((o: any) => o.nom).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-secondary text-sm sm:text-base">
                              {formatPrice((ligne.prixUnitaireHT || vehicule?.prixBase || 0) * (ligne.quantite || 1))}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-text-light text-sm">
                      Aucun véhicule dans cette commande
                    </div>
                  )}
                </div>

                {/* Détails commande */}
                <div className="mt-4 bg-white rounded-lg p-3 sm:p-4 border border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-text-light">Client</span>
                      <p className="font-medium">
                        {commande.utilisateur
                          ? commande.utilisateur.prenom
                            ? `${commande.utilisateur.prenom} ${commande.utilisateur.nom}`
                            : commande.utilisateur.nom
                          : 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light">Email</span>
                      <p className="font-medium truncate">{commande.utilisateur?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Téléphone</span>
                      <p className="font-medium">{commande.utilisateur?.telephone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Mode paiement</span>
                      <p className="font-medium">
                        {getMethodePaiementLabel(commande.typePaiement)}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light">Pays livraison</span>
                      <p className="font-medium">{getPaysLabel(commande.paysLivraison)}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Adresse livraison</span>
                      <p className="font-medium">{commande.adresseLivraison || 'Non renseignée'}</p>
                    </div>
                  </div>

                  {/* Récapitulatif financier */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-light">Sous-total HT</span>
                      <span>{formatPrice(montant / 1.1925)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-light">TVA ({commande.paysLivraison === 'FR' ? '20%' : '19.25%'})</span>
                      <span>{formatPrice((commande as any).taxe || montant - (montant / 1.1925))}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-semibold">Total TTC</span>
                      <span className="font-bold text-secondary text-lg">{formatPrice(montant)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold text-primary mb-3">Actions</h4>
                <div className="space-y-2">
                  {(commande.statut === 'ACTIF' || commande.statut === 'EN_COURS') && (
                    <Button variant="primary" size="sm" className="w-full justify-center" onClick={onValider}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider la commande
                    </Button>
                  )}
                  {commande.statut === 'VALIDEE' && (
                    <Button variant="primary" size="sm" className="w-full justify-center" onClick={onMarquerLivree}>
                      <Truck className="w-4 h-4 mr-2" />
                      Marquer comme livrée
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => generateFacturePDF(commande)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Télécharger facture
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => generateBonCommandePDF(commande)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bon de commande
                  </Button>
                </div>

                {/* Historique */}
                <div className="mt-4">
                  <h4 className="font-semibold text-primary mb-2 text-sm">Historique</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Commande créée le {formatDate(date)}</span>
                    </div>
                    {commande.statut !== 'ACTIF' && commande.statut !== 'EN_COURS' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Commande validée</span>
                      </div>
                    )}
                    {(commande.statut === 'LIVREE' || commande.statut === 'CONVERTI') && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        <span>Commande livrée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Fonction pour générer la facture PDF
function generateFacturePDF(commande: Commande) {
  const { jsPDF } = (window as any).jspdf || {};

  if (!jsPDF) {
    // Charger jsPDF dynamiquement
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => generateFacturePDFContent(commande);
    document.head.appendChild(script);
  } else {
    generateFacturePDFContent(commande);
  }
}

function generateFacturePDFContent(commande: Commande) {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();

  const reference = commande.reference || `CMD-${commande.idCommande}`;
  const montant = commande.total || 0;
  const date = commande.date || new Date().toISOString();
  const lignes = getLignesCommande(commande);

  // En-tête
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(201, 162, 39);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MED Auto', 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("L'Excellence Automobile", 20, 28);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 20, 36);
  doc.setFontSize(9);
  doc.text(`N° ${reference}`, 190, 36, { align: 'right' });

  // Informations
  let y = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // Client
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 20, y);
  doc.setFont('helvetica', 'normal');
  const clientNom = commande.utilisateur
    ? (commande.utilisateur.prenom ? `${commande.utilisateur.prenom} ${commande.utilisateur.nom}` : commande.utilisateur.nom)
    : 'Non renseigné';
  doc.text(clientNom, 45, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(commande.utilisateur?.email || 'N/A', 45, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(date), 45, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Pays:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(getPaysLabel(commande.paysLivraison), 45, y);

  // Tableau des articles
  y += 15;
  doc.setFillColor(26, 26, 46);
  doc.rect(20, y, 170, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, y + 7);
  doc.text('Qté', 120, y + 7);
  doc.text('Prix Unit.', 140, y + 7);
  doc.text('Total', 170, y + 7);

  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let subtotal = 0;
  lignes.forEach((ligne: any) => {
    const vehicule = ligne.vehicule;
    const nom = vehicule ? `${vehicule.marque || ''} ${vehicule.nom || vehicule.model || ''}`.trim() : 'Véhicule';
    const prix = ligne.prixUnitaireHT || vehicule?.prixBase || 0;
    const qte = ligne.quantite || 1;
    const total = prix * qte;
    subtotal += total;

    y += 8;
    doc.text(nom.substring(0, 40), 25, y);
    doc.text(qte.toString(), 125, y);
    doc.text(formatPrice(prix), 140, y);
    doc.text(formatPrice(total), 170, y);
  });

  // Totaux
  y += 15;
  const taxe = (commande as any).taxe || (montant - subtotal);

  doc.setFillColor(248, 249, 250);
  doc.rect(120, y, 70, 8, 'F');
  doc.text('Sous-total HT', 125, y + 6);
  doc.text(formatPrice(subtotal), 185, y + 6, { align: 'right' });

  y += 8;
  doc.rect(120, y, 70, 8, 'F');
  doc.text('TVA', 125, y + 6);
  doc.text(formatPrice(taxe), 185, y + 6, { align: 'right' });

  y += 8;
  doc.setFillColor(201, 162, 39);
  doc.rect(120, y, 70, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC', 125, y + 7);
  doc.text(formatPrice(montant), 185, y + 7, { align: 'right' });

  // Pied de page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.text('MED Auto - 123 Avenue de l\'Indépendance, Douala, Cameroun', 105, 280, { align: 'center' });
  doc.text('+237 699 000 000 | contact@med-auto.cm', 105, 285, { align: 'center' });

  doc.save(`Facture_${reference}.pdf`);
}

// Fonction pour générer le bon de commande PDF
function generateBonCommandePDF(commande: Commande) {
  const { jsPDF } = (window as any).jspdf || {};

  if (!jsPDF) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => generateBonCommandePDFContent(commande);
    document.head.appendChild(script);
  } else {
    generateBonCommandePDFContent(commande);
  }
}

function generateBonCommandePDFContent(commande: Commande) {
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();

  const reference = commande.reference || `CMD-${commande.idCommande}`;
  const montant = commande.total || 0;
  const date = commande.date || new Date().toISOString();
  const lignes = getLignesCommande(commande);

  // En-tête
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(201, 162, 39);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MED Auto', 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("L'Excellence Automobile", 20, 28);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE COMMANDE', 20, 36);
  doc.setFontSize(9);
  doc.text(`N° ${reference}`, 190, 36, { align: 'right' });

  // Informations client
  let y = 55;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations client', 20, y);

  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const clientNom = commande.utilisateur
    ? (commande.utilisateur.prenom ? `${commande.utilisateur.prenom} ${commande.utilisateur.nom}` : commande.utilisateur.nom)
    : 'Non renseigné';
  doc.text(`Nom: ${clientNom}`, 20, y);
  y += 6;
  doc.text(`Email: ${commande.utilisateur?.email || 'N/A'}`, 20, y);
  y += 6;
  doc.text(`Téléphone: ${commande.utilisateur?.telephone || 'N/A'}`, 20, y);
  y += 6;
  doc.text(`Date commande: ${formatDate(date)}`, 20, y);
  y += 6;
  doc.text(`Livraison: ${getPaysLabel(commande.paysLivraison)}`, 20, y);
  y += 6;
  doc.text(`Adresse: ${commande.adresseLivraison || 'Non renseignée'}`, 20, y);
  y += 6;
  doc.text(`Mode de paiement: ${getMethodePaiementLabel(commande.typePaiement)}`, 20, y);

  // Véhicules
  y += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Véhicules commandés', 20, y);

  y += 8;
  doc.setFillColor(26, 26, 46);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Véhicule', 25, y + 6);
  doc.text('Qté', 130, y + 6);
  doc.text('Prix', 150, y + 6);
  doc.text('Total', 175, y + 6);

  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let subtotal = 0;
  lignes.forEach((ligne: any) => {
    const vehicule = ligne.vehicule;
    const nom = vehicule ? `${vehicule.marque || ''} ${vehicule.nom || vehicule.model || ''}`.trim() : 'Véhicule';
    const prix = ligne.prixUnitaireHT || vehicule?.prixBase || 0;
    const qte = ligne.quantite || 1;
    const total = prix * qte;
    subtotal += total;

    y += 7;
    doc.text(nom.substring(0, 50), 25, y);
    doc.text(qte.toString(), 135, y);
    doc.text(formatPrice(prix), 150, y);
    doc.text(formatPrice(total), 175, y);

    // Options
    const options = getOptions(ligne);
    if (options.length > 0) {
      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(108, 117, 125);
      doc.text(`  Options: ${options.map((o: any) => o.nom).join(', ')}`, 25, y);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
    }
  });

  // Totaux
  y += 15;
  const taxe = (commande as any).taxe || (montant - subtotal);

  doc.setFillColor(248, 249, 250);
  doc.rect(120, y, 70, 7, 'F');
  doc.text('Sous-total HT', 125, y + 5);
  doc.text(formatPrice(subtotal), 185, y + 5, { align: 'right' });

  y += 7;
  doc.rect(120, y, 70, 7, 'F');
  doc.text(`TVA (${commande.paysLivraison === 'FR' ? '20%' : '19.25%'})`, 125, y + 5);
  doc.text(formatPrice(taxe), 185, y + 5, { align: 'right' });

  y += 7;
  doc.setFillColor(201, 162, 39);
  doc.rect(120, y, 70, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC', 125, y + 7);
  doc.text(formatPrice(montant), 185, y + 7, { align: 'right' });

  // Conditions
  y += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.text('Conditions:', 20, y);
  y += 5;
  doc.text('- Ce bon de commande constitue un engagement ferme après signature.', 20, y);
  y += 4;
  doc.text('- Un acompte de 30% est requis à la commande.', 20, y);
  y += 4;
  doc.text('- Délai de livraison estimé: 2 à 6 semaines selon disponibilité.', 20, y);

  // Pied de page
  doc.setFontSize(8);
  doc.text('MED Auto - 123 Avenue de l\'Indépendance, Douala, Cameroun', 105, 280, { align: 'center' });
  doc.text('+237 699 000 000 | contact@med-auto.cm', 105, 285, { align: 'center' });

  doc.save(`BonCommande_${reference}.pdf`);
}
