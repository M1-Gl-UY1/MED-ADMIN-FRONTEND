import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Car,
  Zap,
  Fuel,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination } from '../components/ui';
import { vehicules, options, formatPrice, type Vehicule, type TypeMoteur, type TypeVehicule } from '../data/mockData';

export default function Vehicules() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMoteur, setFilterMoteur] = useState<TypeMoteur | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TypeVehicule | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const filteredVehicules = vehicules.filter((v) => {
    const matchSearch =
      v.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modele.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMoteur = filterMoteur === 'ALL' || v.typeMoteur === filterMoteur;
    const matchType = filterType === 'ALL' || v.typeVehicule === filterType;
    return matchSearch && matchMoteur && matchType;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMoteur, filterType]);

  const totalPages = Math.ceil(filteredVehicules.length / itemsPerPage);
  const paginatedVehicules = filteredVehicules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div>
      <Header title="Véhicules" subtitle="Gérez votre catalogue de véhicules" />

      <div className="p-4 sm:p-6">
        {/* Actions bar */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search */}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterMoteur}
              onChange={(e) => setFilterMoteur(e.target.value as TypeMoteur | 'ALL')}
              className="input w-full xs:w-auto text-sm"
            >
              <option value="ALL">Tous moteurs</option>
              <option value="ESSENCE">Essence</option>
              <option value="ELECTRIQUE">Électrique</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TypeVehicule | 'ALL')}
              className="input w-full xs:w-auto text-sm"
            >
              <option value="ALL">Tous types</option>
              <option value="AUTOMOBILE">Automobile</option>
              <option value="SCOOTER">Scooter</option>
            </select>

            <Button variant="primary" className="w-full xs:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Total véhicules</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{vehicules.length}</p>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Automobiles</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {vehicules.filter((v) => v.typeVehicule === 'AUTOMOBILE').length}
            </p>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Scooters</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {vehicules.filter((v) => v.typeVehicule === 'SCOOTER').length}
            </p>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Électriques</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {vehicules.filter((v) => v.typeMoteur === 'ELECTRIQUE').length}
            </p>
          </div>
        </div>

        {/* Vehicles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {paginatedVehicules.map((vehicule) => (
            <VehiculeCard key={vehicule.id} vehicule={vehicule} />
          ))}
        </div>

        {filteredVehicules.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-text-light mx-auto mb-4" />
            <p className="text-text-light">Aucun véhicule trouvé</p>
          </div>
        )}

        {/* Pagination */}
        {filteredVehicules.length > 0 && (
          <div className="mt-6 bg-background-card rounded-xl border border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicules.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[4, 8, 12, 20]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VehiculeCard({ vehicule }: { vehicule: Vehicule }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card hover className="overflow-hidden p-0">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={vehicule.image}
          alt={vehicule.nom}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={vehicule.typeMoteur === 'ELECTRIQUE' ? 'success' : 'default'}>
            {vehicule.typeMoteur === 'ELECTRIQUE' ? (
              <><Zap className="w-3 h-3 mr-1" /> Électrique</>
            ) : (
              <><Fuel className="w-3 h-3 mr-1" /> Essence</>
            )}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-primary" />
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
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-primary">{vehicule.nom}</h3>
            <p className="text-sm text-text-light">{vehicule.marque} - {vehicule.modele}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-secondary">{formatPrice(vehicule.prixBase)}</p>
          <div className="text-right">
            <p className="text-xs text-text-light">En stock</p>
            <p className={`text-sm font-semibold ${vehicule.stock.quantite <= 3 ? 'text-error' : 'text-success'}`}>
              {vehicule.stock.quantite} unités
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-text-light mb-2">{vehicule.options.length} options disponibles</p>
          <div className="flex flex-wrap gap-1">
            {vehicule.options.slice(0, 3).map((optId) => {
              const opt = options.find((o) => o.id === optId);
              return opt ? (
                <span key={optId} className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded">
                  {opt.nom}
                </span>
              ) : null;
            })}
            {vehicule.options.length > 3 && (
              <span className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded">
                +{vehicule.options.length - 3}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
