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
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination, Alert } from '../components/ui';
import { clientService, societeService } from '../services';
import type { Client, Societe } from '../services/types';

type TabType = 'clients' | 'societes';

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export default function Clients() {
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // API states
  const [clients, setClients] = useState<Client[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddSocieteModal, setShowAddSocieteModal] = useState(false);

  // Charger les données depuis l'API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [clientsData, societesData] = await Promise.all([
        clientService.getAll(),
        societeService.getAll(),
      ]);
      setClients(clientsData);
      setSocietes(societesData);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message || 'Impossible de charger les données depuis le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      (c.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSocietes = societes.filter(
    (s) =>
      (s.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <div>
        <Header title="Clients" subtitle="Gérez vos clients et sociétés" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-text-light">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Clients" subtitle="Gérez vos clients et sociétés" />
        <div className="p-4 sm:p-6">
          <Alert variant="error" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </Alert>
          <Button onClick={fetchData} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => activeTab === 'clients' ? setShowAddClientModal(true) : setShowAddSocieteModal(true)}
          >
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
                  key={client.idClient || client.id}
                  client={client}
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
                  key={societe.idSociete || societe.id}
                  societe={societe}
                  filiales={societes.filter((s) => s.societeMereId === (societe.idSociete || societe.id))}
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

      {/* Modals */}
      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onSuccess={(newClient) => {
            setClients(prev => [...prev, newClient]);
            setShowAddClientModal(false);
          }}
        />
      )}

      {showAddSocieteModal && (
        <AddSocieteModal
          onClose={() => setShowAddSocieteModal(false)}
          onSuccess={(newSociete) => {
            setSocietes(prev => [...prev, newSociete]);
            setShowAddSocieteModal(false);
          }}
        />
      )}
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card hover>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-secondary">
                {(client.prenom || 'C')[0]}{(client.nom || 'L')[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-primary">{client.prenom} {client.nom}</h3>
              {client.genre && (
                <Badge variant={client.genre === 'M' ? 'info' : 'premium'}>
                  {client.genre === 'M' ? 'Homme' : 'Femme'}
                </Badge>
              )}
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
            <span>{client.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Phone className="w-4 h-4" />
            <span>{client.telephone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Calendar className="w-4 h-4" />
            <span>Inscrit le {formatDate(client.dateInscription)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-text-light">ID Client</p>
          <p className="text-sm font-medium text-primary">#{client.idClient || client.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SocieteCard({
  societe,
  filiales,
}: {
  societe: Societe;
  filiales: Societe[];
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
              <p className="text-sm text-text-light">N° Fiscal: {societe.numeroFiscal || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
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
            {societe.email || 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {societe.telephone || 'N/A'}
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
                    key={filiale.idSociete || filiale.id}
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

// Modal pour ajouter un client
function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (c: Client) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newClient = await clientService.create({
        ...formData,
        type: 'CLIENT',
      } as any);
      onSuccess(newClient);
    } catch (err) {
      console.error('Erreur lors de la création', err);
      alert('Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-primary">Ajouter un client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                className="input"
                value={formData.nom}
                onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input
                type="text"
                className="input"
                value={formData.prenom}
                onChange={e => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe *</label>
            <input
              type="password"
              className="input"
              value={formData.motDePasse}
              onChange={e => setFormData(prev => ({ ...prev, motDePasse: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <select
                className="input"
                value={formData.sexe}
                onChange={e => setFormData(prev => ({ ...prev, sexe: e.target.value as 'M' | 'F' }))}
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input
                type="date"
                className="input"
                value={formData.dateNaissance}
                onChange={e => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Créer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour ajouter une société
function AddSocieteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (s: Societe) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    numeroFiscal: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSociete = await societeService.create({
        ...formData,
        type: 'SOCIETE',
      } as any);
      onSuccess(newSociete);
    } catch (err) {
      console.error('Erreur lors de la création', err);
      alert('Erreur lors de la création de la société');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-primary">Ajouter une société</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la société *</label>
            <input
              type="text"
              className="input"
              value={formData.nom}
              onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe *</label>
            <input
              type="password"
              className="input"
              value={formData.motDePasse}
              onChange={e => setFormData(prev => ({ ...prev, motDePasse: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Numéro fiscal *</label>
            <input
              type="text"
              className="input"
              value={formData.numeroFiscal}
              onChange={e => setFormData(prev => ({ ...prev, numeroFiscal: e.target.value }))}
              placeholder="Ex: FR12345678901"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Créer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
