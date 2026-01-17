import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination, Alert } from '../components/ui';
import { vehiculeService } from '../services';
import type { Option, CategorieOption } from '../services/types';

const CATEGORIES: { value: CategorieOption; label: string; color: string }[] = [
  { value: 'INTERIEUR', label: 'Intérieur', color: 'info' },
  { value: 'EXTERIEUR', label: 'Extérieur', color: 'success' },
  { value: 'PERFORMANCE', label: 'Performance', color: 'danger' },
  { value: 'TECHNOLOGIE', label: 'Technologie', color: 'warning' },
  { value: 'SECURITE', label: 'Sécurité', color: 'default' },
  { value: 'CONFORT', label: 'Confort', color: 'info' },
];

const getCategorieLabel = (categorie: CategorieOption): string => {
  const cat = CATEGORIES.find(c => c.value === categorie);
  return cat?.label || categorie;
};

const getCategorieColor = (categorie: CategorieOption): string => {
  const cat = CATEGORIES.find(c => c.value === categorie);
  return cat?.color || 'default';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF';
};

export default function Options() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState<CategorieOption | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API states
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: 0,
    categorie: 'INTERIEUR' as CategorieOption,
  });

  const fetchOptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await vehiculeService.getOptions();
      setOptions(result);
    } catch (err: any) {
      console.error('Erreur lors du chargement des options:', err);
      setError(err.message || 'Impossible de charger les options depuis le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleOpenCreate = () => {
    setEditingOption(null);
    setFormData({
      nom: '',
      description: '',
      prix: 0,
      categorie: 'INTERIEUR',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (option: Option) => {
    setEditingOption(option);
    setFormData({
      nom: option.nom,
      description: option.description,
      prix: option.prix,
      categorie: option.categorie,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nom.trim()) {
      alert('Le nom est requis');
      return;
    }

    setSaving(true);
    try {
      if (editingOption) {
        const updated = await vehiculeService.updateOption(editingOption.idOption, formData);
        setOptions(prev => prev.map(o => o.idOption === updated.idOption ? updated : o));
      } else {
        const created = await vehiculeService.createOption(formData);
        setOptions(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await vehiculeService.deleteOption(id);
      setOptions(prev => prev.filter(o => o.idOption !== id));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  // Filtering
  const filteredOptions = options.filter((o) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      (o.nom || '').toLowerCase().includes(searchLower) ||
      (o.description || '').toLowerCase().includes(searchLower);
    const matchCategorie = filterCategorie === 'ALL' || o.categorie === filterCategorie;
    return matchSearch && matchCategorie;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategorie]);

  // Pagination
  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const paginatedOptions = filteredOptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Stats
  const stats = {
    total: options.length,
    interieur: options.filter(o => o.categorie === 'INTERIEUR').length,
    exterieur: options.filter(o => o.categorie === 'EXTERIEUR').length,
    performance: options.filter(o => o.categorie === 'PERFORMANCE').length,
  };

  if (loading) {
    return (
      <div>
        <Header title="Options" subtitle="Gérez les options de véhicules" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-text-light">Chargement des options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Options" subtitle="Gérez les options de véhicules" />
        <div className="p-4 sm:p-6">
          <Alert variant="error" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </Alert>
          <Button onClick={fetchOptions} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Options" subtitle="Gérez les options de véhicules" />

      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Total options</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Intérieur</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.interieur}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Extérieur</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.exterieur}</p>
              </div>
            </div>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Performance</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.performance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
              <input
                type="text"
                placeholder="Rechercher une option..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value as CategorieOption | 'ALL')}
              className="input w-auto"
            >
              <option value="ALL">Toutes les catégories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button variant="primary" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </CardContent>
        </Card>

        {/* Options list */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="table-header">Nom</th>
                    <th className="table-header">Description</th>
                    <th className="table-header">Catégorie</th>
                    <th className="table-header">Prix</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOptions.map((option) => (
                    <tr key={option.idOption} className="hover:bg-gray-50">
                      <td className="table-cell font-medium text-primary">{option.nom}</td>
                      <td className="table-cell text-text-light text-sm max-w-xs truncate">
                        {option.description}
                      </td>
                      <td className="table-cell">
                        <Badge variant={getCategorieColor(option.categorie) as any}>
                          {getCategorieLabel(option.categorie)}
                        </Badge>
                      </td>
                      <td className="table-cell font-semibold text-secondary">
                        {formatPrice(option.prix)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(option)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4 text-text-light" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(option.idOption)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOptions.length === 0 && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-text-light mx-auto mb-4" />
                <p className="text-text-light">Aucune option trouvée</p>
              </div>
            )}

            {/* Pagination */}
            {filteredOptions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOptions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[5, 10, 20, 50]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-primary">
                {editingOption ? 'Modifier l\'option' : 'Nouvelle option'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="input"
                  placeholder="Ex: Jantes aluminium 19 pouces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Description détaillée de l'option..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value as CategorieOption })}
                  className="input"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Prix (XAF)</label>
                <input
                  type="number"
                  value={formData.prix || ''}
                  onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                  className="input"
                  placeholder="Ex: 500000"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingOption ? 'Enregistrer' : 'Créer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">Confirmer la suppression</h3>
            </div>
            <p className="text-text-light mb-6">
              Êtes-vous sûr de vouloir supprimer cette option ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
