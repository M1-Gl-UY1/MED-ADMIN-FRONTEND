import { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Package,
  TrendingUp,
  Edit,
  Plus,
  Minus,
  Calendar,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination } from '../components/ui';
import { vehicules, formatPrice, formatDate, type Vehicule } from '../data/mockData';

type StockFilter = 'all' | 'low' | 'ok' | 'high';

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getStockStatus = (qty: number) => {
    if (qty <= 3) return 'low';
    if (qty <= 10) return 'ok';
    return 'high';
  };

  const filteredVehicules = vehicules.filter((v) => {
    const matchSearch =
      v.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marque.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchSearch;
    return matchSearch && getStockStatus(v.stock.quantite) === filter;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const totalPages = Math.ceil(filteredVehicules.length / itemsPerPage);
  const paginatedVehicules = filteredVehicules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const stats = {
    total: vehicules.reduce((acc, v) => acc + v.stock.quantite, 0),
    lowStock: vehicules.filter((v) => v.stock.quantite <= 3).length,
    valueTotal: vehicules.reduce((acc, v) => acc + v.prixBase * v.stock.quantite, 0),
  };

  return (
    <div>
      <Header title="Gestion du Stock" subtitle="Suivez et gérez votre inventaire" />

      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-3 bg-secondary/10 rounded-lg flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Total en stock</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.total} <span className="text-sm hidden sm:inline">unités</span></p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-3 bg-error/10 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-error" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Stock faible</p>
                <p className="text-lg sm:text-2xl font-bold text-error">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-3 bg-success/10 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Valeur</p>
                <p className="text-base sm:text-xl font-bold text-success truncate">{formatPrice(stats.valueTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-3 bg-info/10 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-light">Références</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{vehicules.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low stock alert */}
        {stats.lowStock > 0 && (
          <Card className="mb-4 sm:mb-6 border-error/30 bg-error/5">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-error flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-sm sm:text-base">Alerte stock faible</p>
                <p className="text-xs sm:text-sm text-text-light">
                  {stats.lowStock} véhicule(s) ont un stock ≤ 3 unités
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFilter('low')} className="w-full sm:w-auto">
                Voir les alertes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'low', 'ok', 'high'] as StockFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-background-card text-text-light hover:bg-gray-100'
                }`}
              >
                {f === 'all' && 'Tous'}
                {f === 'low' && 'Faible'}
                {f === 'ok' && 'Normal'}
                {f === 'high' && 'Élevé'}
              </button>
            ))}
          </div>
        </div>

        {/* Stock table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="table-header">Véhicule</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Prix unitaire</th>
                    <th className="table-header">Quantité</th>
                    <th className="table-header">Valeur stock</th>
                    <th className="table-header">Date entrée</th>
                    <th className="table-header">Statut</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedVehicules.map((vehicule) => (
                    <StockRow
                      key={vehicule.id}
                      vehicule={vehicule}
                      isEditing={editingStock === vehicule.id}
                      onEdit={() => setEditingStock(editingStock === vehicule.id ? null : vehicule.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVehicules.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-text-light mx-auto mb-4" />
                <p className="text-text-light">Aucun véhicule trouvé</p>
              </div>
            )}

            {/* Pagination */}
            {filteredVehicules.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredVehicules.length}
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

function StockRow({
  vehicule,
  isEditing,
  onEdit,
}: {
  vehicule: Vehicule;
  isEditing: boolean;
  onEdit: () => void;
}) {
  const [quantity, setQuantity] = useState(vehicule.stock.quantite);

  const getStockBadge = (qty: number) => {
    if (qty <= 3) return <Badge variant="error">Stock faible</Badge>;
    if (qty <= 10) return <Badge variant="warning">Stock normal</Badge>;
    return <Badge variant="success">Stock élevé</Badge>;
  };

  const stockValue = vehicule.prixBase * vehicule.stock.quantite;

  return (
    <tr className="hover:bg-gray-50">
      <td className="table-cell">
        <div className="flex items-center gap-3">
          <img
            src={vehicule.image}
            alt={vehicule.nom}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-primary">{vehicule.nom}</p>
            <p className="text-xs text-text-light">{vehicule.marque} - {vehicule.modele}</p>
          </div>
        </div>
      </td>
      <td className="table-cell">
        <div className="flex flex-col gap-1">
          <Badge variant={vehicule.typeVehicule === 'AUTOMOBILE' ? 'info' : 'default'}>
            {vehicule.typeVehicule}
          </Badge>
          <Badge variant={vehicule.typeMoteur === 'ELECTRIQUE' ? 'success' : 'default'}>
            {vehicule.typeMoteur}
          </Badge>
        </div>
      </td>
      <td className="table-cell font-medium text-text">{formatPrice(vehicule.prixBase)}</td>
      <td className="table-cell">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center border border-gray-200 rounded px-2 py-1"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className={`text-lg font-bold ${vehicule.stock.quantite <= 3 ? 'text-error' : 'text-primary'}`}>
            {vehicule.stock.quantite}
          </span>
        )}
      </td>
      <td className="table-cell font-semibold text-secondary">{formatPrice(stockValue)}</td>
      <td className="table-cell text-text-light">{formatDate(vehicule.stock.dateEntree)}</td>
      <td className="table-cell">{getStockBadge(vehicule.stock.quantite)}</td>
      <td className="table-cell">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="primary" size="sm" onClick={onEdit}>
                Sauver
              </Button>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Annuler
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
