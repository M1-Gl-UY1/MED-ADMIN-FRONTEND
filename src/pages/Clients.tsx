import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination } from '../components/ui';
import {
  clients,
  societes,
  commandes,
  formatDate,
  formatPrice,
  type Client,
  type Societe,
} from '../data/mockData';

type TabType = 'clients' | 'societes';

export default function Clients() {
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredClients = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSocietes = societes.filter(
    (s) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only keep parent societies (not filiales)
  const parentSocietes = filteredSocietes.filter((s) => !s.societeMereId);

  // Reset page when filters/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Pagination for clients
  const totalPagesClients = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for societes
  const totalPagesSocietes = Math.ceil(parentSocietes.length / itemsPerPage);
  const paginatedSocietes = parentSocietes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getClientCommandes = (userId: number) => {
    return commandes.filter((c) => c.utilisateurId === userId);
  };

  const getClientTotalSpent = (userId: number) => {
    return getClientCommandes(userId).reduce((acc, c) => acc + c.montantTTC, 0);
  };

  return (
    <div>
      <Header title="Clients" subtitle="Gérez vos clients et sociétés" />

      <div className="p-4 sm:p-6">
        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'clients'
                ? 'bg-primary text-white'
                : 'bg-background-card text-text-light hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">Particuliers</span>
            <span className="xs:hidden">Clients</span>
            <span className="hidden sm:inline">({clients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('societes')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'societes'
                ? 'bg-primary text-white'
                : 'bg-background-card text-text-light hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Sociétés
            <span className="hidden sm:inline">({societes.length})</span>
          </button>
        </div>

        {/* Search and actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'clients' ? 'un client' : 'une société'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 text-sm sm:text-base"
            />
          </div>
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="sm:hidden">Ajouter</span>
            <span className="hidden sm:inline">Ajouter {activeTab === 'clients' ? 'un client' : 'une société'}</span>
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'clients' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  commandesCount={getClientCommandes(client.id).length}
                  totalSpent={getClientTotalSpent(client.id)}
                />
              ))}
              {filteredClients.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <User className="w-12 h-12 text-text-light mx-auto mb-4" />
                  <p className="text-text-light">Aucun client trouvé</p>
                </div>
              )}
            </div>
            {filteredClients.length > 0 && (
              <div className="mt-6 bg-background-card rounded-xl border border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesClients}
                  totalItems={filteredClients.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[6, 12, 18, 30]}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedSocietes.map((societe) => (
                <SocieteCard
                  key={societe.id}
                  societe={societe}
                  filiales={societes.filter((s) => s.societeMereId === societe.id)}
                  commandesCount={getClientCommandes(societe.id).length}
                  totalSpent={getClientTotalSpent(societe.id)}
                />
              ))}
              {parentSocietes.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-text-light mx-auto mb-4" />
                  <p className="text-text-light">Aucune société trouvée</p>
                </div>
              )}
            </div>
            {parentSocietes.length > 0 && (
              <div className="mt-6 bg-background-card rounded-xl border border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesSocietes}
                  totalItems={parentSocietes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[6, 12, 18, 30]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ClientCard({
  client,
  commandesCount,
  totalSpent,
}: {
  client: Client;
  commandesCount: number;
  totalSpent: number;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card hover>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-secondary">
                {client.prenom[0]}{client.nom[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-primary">{client.prenom} {client.nom}</h3>
              <Badge variant={client.genre === 'M' ? 'info' : 'premium'}>
                {client.genre === 'M' ? 'Homme' : 'Femme'}
              </Badge>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-text-light" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Voir
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Mail className="w-4 h-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Phone className="w-4 h-4" />
            <span>{client.telephone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Calendar className="w-4 h-4" />
            <span>Inscrit le {formatDate(client.dateInscription)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-light">Commandes</p>
            <p className="text-lg font-semibold text-primary">{commandesCount}</p>
          </div>
          <div>
            <p className="text-xs text-text-light">Total dépensé</p>
            <p className="text-lg font-semibold text-secondary">{formatPrice(totalSpent)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SocieteCard({
  societe,
  filiales,
  commandesCount,
  totalSpent,
}: {
  societe: Societe;
  filiales: Societe[];
  commandesCount: number;
  totalSpent: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-lg">{societe.nom}</h3>
              <p className="text-sm text-text-light">N° Fiscal: {societe.numeroFiscal}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-text-light">Commandes</p>
              <p className="text-xl font-semibold text-primary">{commandesCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-light">CA Total</p>
              <p className="text-xl font-semibold text-secondary">{formatPrice(totalSpent)}</p>
            </div>
            {filiales.length > 0 && (
              <div className="text-center">
                <p className="text-xs text-text-light">Filiales</p>
                <p className="text-xl font-semibold text-primary">{filiales.length}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" /> Voir
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-text-light">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {societe.email}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {societe.telephone}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Inscrit le {formatDate(societe.dateInscription)}
          </div>
        </div>

        {/* Filiales */}
        {filiales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              {filiales.length} filiale(s)
            </button>

            {expanded && (
              <div className="mt-3 space-y-2 pl-6">
                {filiales.map((filiale) => (
                  <div
                    key={filiale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="font-medium text-text">{filiale.nom}</p>
                        <p className="text-xs text-text-light">{filiale.email}</p>
                      </div>
                    </div>
                    <Badge variant="info">Filiale</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
