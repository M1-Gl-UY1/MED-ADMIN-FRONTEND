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
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Check,
  ImageIcon,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, Badge, Button, Pagination, Alert } from '../components/ui';
import { vehiculeService } from '../services';
import type { Vehicule } from '../services/types';

type TypeMoteur = 'ESSENCE' | 'ELECTRIQUE';
type TypeVehicule = 'AUTOMOBILE' | 'SCOOTER';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

// Couleurs prédéfinies avec leurs codes hex
const PREDEFINED_COLORS = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Argent', hex: '#C0C0C0' },
  { name: 'Rouge', hex: '#DC2626' },
  { name: 'Bleu', hex: '#2563EB' },
  { name: 'Bleu Marine', hex: '#1E3A5F' },
  { name: 'Vert', hex: '#16A34A' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Marron', hex: '#78350F' },
  { name: 'Beige', hex: '#D4C4A8' },
  { name: 'Bordeaux', hex: '#7F1D1D' },
  { name: 'Or', hex: '#D4AF37' },
  { name: 'Bronze', hex: '#CD7F32' },
];

export default function Vehicules() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMoteur, setFilterMoteur] = useState<TypeMoteur | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TypeVehicule | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // États API
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal ajout véhicule
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal détails véhicule
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);

  // Modal édition véhicule
  const [editingVehicule, setEditingVehicule] = useState<Vehicule | null>(null);

  // Charger les véhicules depuis l'API
  const fetchVehicules = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await vehiculeService.getAllCustom();
      setVehicules(data);
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.message || 'Impossible de charger les véhicules depuis le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  // Filtrage (avec gestion des valeurs null/undefined)
  const filteredVehicules = vehicules.filter((v) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      (v.nom || '').toLowerCase().includes(searchLower) ||
      (v.marque || '').toLowerCase().includes(searchLower) ||
      (v.model || '').toLowerCase().includes(searchLower);
    const matchMoteur = filterMoteur === 'ALL' || v.engine === filterMoteur;
    const matchType = filterType === 'ALL' || v.type === filterType;
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

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      await vehiculeService.delete(id);
      setVehicules(prev => prev.filter(v => v.idVehicule !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression', err);
      alert('Erreur lors de la suppression du véhicule');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Véhicules" subtitle="Gérez votre catalogue de véhicules" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-text-light">Chargement des véhicules depuis le serveur...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Véhicules" subtitle="Gérez votre catalogue de véhicules" />
        <div className="p-4 sm:p-6">
          <Alert variant="error" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </Alert>
          <Button onClick={fetchVehicules} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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

            <Button variant="primary" className="w-full xs:w-auto" onClick={() => setShowAddModal(true)}>
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
              {vehicules.filter((v) => v.type === 'AUTOMOBILE').length}
            </p>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Scooters</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {vehicules.filter((v) => v.type === 'SCOOTER').length}
            </p>
          </div>
          <div className="bg-background-card rounded-lg p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-text-light">Électriques</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {vehicules.filter((v) => v.engine === 'ELECTRIQUE').length}
            </p>
          </div>
        </div>

        {/* Vehicles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {paginatedVehicules.map((vehicule) => (
            <VehiculeCard
              key={vehicule.idVehicule}
              vehicule={vehicule}
              onDelete={handleDelete}
              onView={() => setSelectedVehicule(vehicule)}
              onEdit={() => setEditingVehicule(vehicule)}
            />
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

      {/* Modal Ajout Véhicule */}
      {showAddModal && (
        <AddVehiculeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newVehicule) => {
            setVehicules(prev => [...prev, newVehicule]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Modal Détails Véhicule */}
      {selectedVehicule && (
        <VehiculeDetailModal
          vehicule={selectedVehicule}
          onClose={() => setSelectedVehicule(null)}
          onEdit={() => {
            setEditingVehicule(selectedVehicule);
            setSelectedVehicule(null);
          }}
        />
      )}

      {/* Modal Édition Véhicule */}
      {editingVehicule && (
        <EditVehiculeModal
          vehicule={editingVehicule}
          onClose={() => setEditingVehicule(null)}
          onSuccess={(updated) => {
            setVehicules(prev => prev.map(v => v.idVehicule === updated.idVehicule ? updated : v));
            setEditingVehicule(null);
          }}
        />
      )}
    </div>
  );
}

function VehiculeCard({
  vehicule,
  onDelete,
  onView,
  onEdit,
}: {
  vehicule: Vehicule;
  onDelete: (id: number) => void;
  onView: () => void;
  onEdit: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = vehicule.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image';
  const stockQuantite = vehicule.stock?.quantite || 0;

  return (
    <Card hover className="overflow-hidden p-0">
      {/* Image - Click to view */}
      <div
        className="relative h-48 bg-gray-100 cursor-pointer"
        onClick={onView}
      >
        <img
          src={imageUrl}
          alt={vehicule.nom}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={vehicule.engine === 'ELECTRIQUE' ? 'success' : 'default'}>
            {vehicule.engine === 'ELECTRIQUE' ? (
              <><Zap className="w-3 h-3 mr-1" /> Électrique</>
            ) : (
              <><Fuel className="w-3 h-3 mr-1" /> Essence</>
            )}
          </Badge>
        </div>
        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 bg-white/90 rounded-lg hover:bg-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4 text-primary" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 sm:w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button
                  onClick={() => { onView(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Voir
                </button>
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button
                  onClick={() => onDelete(vehicule.idVehicule)}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 flex items-center gap-2"
                >
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
            <p className="text-sm text-text-light">{vehicule.marque} - {vehicule.model}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-secondary">{formatPrice(vehicule.prixBase)}</p>
          <div className="text-right">
            <p className="text-xs text-text-light">En stock</p>
            <p className={`text-sm font-semibold ${stockQuantite <= 3 ? 'text-error' : 'text-success'}`}>
              {stockQuantite} unités
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-text-light mb-2">{vehicule.options?.length || 0} options disponibles</p>
          <div className="flex flex-wrap gap-1">
            {vehicule.options?.slice(0, 3).map((opt) => (
              <span key={opt.idOption} className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded">
                {opt.nom}
              </span>
            ))}
            {(vehicule.options?.length || 0) > 3 && (
              <span className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded">
                +{vehicule.options!.length - 3}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant input prix formaté
function PriceInput({
  value,
  onChange,
  error
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? new Intl.NumberFormat('fr-FR').format(value) : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '');
    const numericValue = parseInt(rawValue) || 0;

    onChange(numericValue);

    if (rawValue === '') {
      setDisplayValue('');
    } else {
      setDisplayValue(new Intl.NumberFormat('fr-FR').format(numericValue));
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        className={`input pr-16 ${error ? 'border-error' : ''}`}
        value={displayValue}
        onChange={handleChange}
        placeholder="0"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-light">
        FCFA
      </span>
    </div>
  );
}

// Composant sélecteur de couleurs
function ColorPicker({
  selectedColors,
  onColorToggle
}: {
  selectedColors: string[];
  onColorToggle: (colorName: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {PREDEFINED_COLORS.map((color) => {
        const isSelected = selectedColors.includes(color.name);
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onColorToggle(color.name)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-secondary bg-secondary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title={color.name}
          >
            <div
              className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-xs text-text-light truncate w-full text-center">
              {color.name}
            </span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

type Step = 'info' | 'specs' | 'images' | 'options';

function AddVehiculeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (v: Vehicule) => void }) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Images à uploader (fichiers)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Informations de base
    nom: '',
    model: '',
    marque: '',
    annee: new Date().getFullYear(),
    energie: 'ESSENCE' as 'ESSENCE' | 'ELECTRIQUE',
    type: 'AUTOMOBILE' as 'AUTOMOBILE' | 'SCOOTER',
    prixBase: 0,
    description: '',

    // Caractéristiques techniques
    puissance: '',
    transmission: '',
    carburant: '',
    consommation: '',
    acceleration: '',
    vitesseMax: '',

    // Couleurs disponibles
    couleurs: [] as string[],

    // Stock
    quantiteStock: 0,

    // Statuts
    nouveau: true,
    solde: false,
    facteurReduction: 0,

    // Images (URLs)
    imageUrls: [] as string[],
  });

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Informations', icon: <span className="text-sm font-bold">1</span> },
    { id: 'specs', label: 'Caractéristiques', icon: <span className="text-sm font-bold">2</span> },
    { id: 'images', label: 'Images', icon: <span className="text-sm font-bold">3</span> },
    { id: 'options', label: 'Options', icon: <span className="text-sm font-bold">4</span> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Validation par étape
  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'info') {
      if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
      if (!formData.model.trim()) newErrors.model = 'Le modèle est obligatoire';
      if (!formData.marque.trim()) newErrors.marque = 'La marque est obligatoire';
      if (!formData.annee || formData.annee < 1900) newErrors.annee = 'L\'année est obligatoire';
      if (!formData.prixBase || formData.prixBase <= 0) newErrors.prixBase = 'Le prix est obligatoire';
    }

    if (step === 'images') {
      if (imageFiles.length === 0 && formData.imageUrls.length === 0) {
        newErrors.images = 'Au moins une image est obligatoire';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: Step[] = ['info', 'specs', 'images', 'options'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const stepOrder: Step[] = ['info', 'specs', 'images', 'options'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Gérer l'ajout de fichiers images
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setErrors(prev => ({ ...prev, images: '' }));

      // Créer les previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Supprimer une image
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle couleur
  const toggleColor = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      couleurs: prev.couleurs.includes(colorName)
        ? prev.couleurs.filter(c => c !== colorName)
        : [...prev.couleurs, colorName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ne soumettre que si on est sur l'étape finale
    if (currentStep !== 'options') {
      console.log('Submit bloqué - pas sur étape options, étape actuelle:', currentStep);
      return;
    }

    // Valider toutes les étapes
    if (!validateStep('info') || !validateStep('images')) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Créer le véhicule avec les données de base
      const createData = {
        energie: formData.energie,
        type: formData.type,
        nom: formData.nom,
        model: formData.model,
        marque: formData.marque,
        annee: formData.annee,
        prixBase: formData.prixBase,
        description: formData.description,
        puissance: formData.puissance,
        transmission: formData.transmission,
        carburant: formData.carburant,
        consommation: formData.consommation,
        acceleration: formData.acceleration,
        vitesseMax: formData.vitesseMax,
        couleurs: formData.couleurs,
        quantiteStock: formData.quantiteStock,
        nouveau: formData.nouveau,
        solde: formData.solde,
        facteurReduction: formData.solde ? formData.facteurReduction : 0,
        imageUrls: formData.imageUrls,
      };

      const newVehicule = await vehiculeService.create(createData);
      setUploadProgress(30);

      // 2. Uploader les images fichiers si présentes
      if (imageFiles.length > 0) {
        const totalFiles = imageFiles.length;
        for (let i = 0; i < imageFiles.length; i++) {
          await vehiculeService.uploadImage(
            newVehicule.idVehicule,
            imageFiles[i],
            i === 0 // Première image = principale
          );
          setUploadProgress(30 + ((i + 1) / totalFiles) * 70);
        }

        // Récupérer le véhicule mis à jour avec les images
        const updatedVehicule = await vehiculeService.getById(newVehicule.idVehicule);
        onSuccess(updatedVehicule);
      } else {
        onSuccess(newVehicule);
      }
    } catch (err) {
      console.error('Erreur lors de la création', err);
      alert('Erreur lors de la création du véhicule');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-primary">Ajouter un véhicule</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  // Permettre de revenir en arrière seulement
                  if (index < currentStepIndex) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center gap-2 ${
                  index <= currentStepIndex ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    index < currentStepIndex
                      ? 'bg-success text-white'
                      : index === currentStepIndex
                      ? 'bg-secondary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    index === currentStepIndex ? 'text-secondary' : 'text-text-light'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-success' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Step 1: Informations de base */}
            {currentStep === 'info' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nom <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.nom ? 'border-error' : ''}`}
                      value={formData.nom}
                      onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="Ex: Tesla Model 3"
                    />
                    {errors.nom && <p className="text-xs text-error mt-1">{errors.nom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Modèle <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.model ? 'border-error' : ''}`}
                      value={formData.model}
                      onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ex: Model 3"
                    />
                    {errors.model && <p className="text-xs text-error mt-1">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Marque <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.marque ? 'border-error' : ''}`}
                      value={formData.marque}
                      onChange={e => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                      placeholder="Ex: Tesla"
                    />
                    {errors.marque && <p className="text-xs text-error mt-1">{errors.marque}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Année <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      className={`input ${errors.annee ? 'border-error' : ''}`}
                      value={formData.annee}
                      onChange={e => setFormData(prev => ({ ...prev, annee: parseInt(e.target.value) || new Date().getFullYear() }))}
                      min={2000}
                      max={2030}
                    />
                    {errors.annee && <p className="text-xs text-error mt-1">{errors.annee}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type de véhicule</label>
                    <select
                      className="input"
                      value={formData.type}
                      onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'AUTOMOBILE' | 'SCOOTER' }))}
                    >
                      <option value="AUTOMOBILE">Automobile</option>
                      <option value="SCOOTER">Scooter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motorisation</label>
                    <select
                      className="input"
                      value={formData.energie}
                      onChange={e => setFormData(prev => ({ ...prev, energie: e.target.value as 'ESSENCE' | 'ELECTRIQUE' }))}
                    >
                      <option value="ESSENCE">Essence</option>
                      <option value="ELECTRIQUE">Électrique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Prix de base (FCFA) <span className="text-error">*</span>
                    </label>
                    <PriceInput
                      value={formData.prixBase}
                      onChange={(value) => setFormData(prev => ({ ...prev, prixBase: value }))}
                      error={errors.prixBase}
                    />
                    {errors.prixBase && <p className="text-xs text-error mt-1">{errors.prixBase}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock initial</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.quantiteStock}
                      onChange={e => setFormData(prev => ({ ...prev, quantiteStock: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du véhicule..."
                  />
                </div>

                {/* Statuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nouveau}
                      onChange={e => setFormData(prev => ({ ...prev, nouveau: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">Marquer comme nouveau</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.solde}
                      onChange={e => setFormData(prev => ({ ...prev, solde: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">En promotion</span>
                  </label>
                </div>

                {formData.solde && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Réduction (%)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.facteurReduction}
                      onChange={e => setFormData(prev => ({ ...prev, facteurReduction: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </div>
                )}
              </>
            )}

            {/* Step 2: Caractéristiques techniques */}
            {currentStep === 'specs' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Puissance</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.puissance}
                      onChange={e => setFormData(prev => ({ ...prev, puissance: e.target.value }))}
                      placeholder="Ex: 340 ch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transmission</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.transmission}
                      onChange={e => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                      placeholder="Ex: Automatique 8 vitesses"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Carburant</label>
                    <select
                      className="input"
                      value={formData.carburant}
                      onChange={e => setFormData(prev => ({ ...prev, carburant: e.target.value }))}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Essence">Essence</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Électrique">Électrique</option>
                      <option value="Hybride">Hybride</option>
                      <option value="GPL">GPL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Consommation</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.consommation}
                      onChange={e => setFormData(prev => ({ ...prev, consommation: e.target.value }))}
                      placeholder="Ex: 9.5 L/100km"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Accélération (0-100 km/h)</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.acceleration}
                      onChange={e => setFormData(prev => ({ ...prev, acceleration: e.target.value }))}
                      placeholder="Ex: 5.5s"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vitesse max</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.vitesseMax}
                      onChange={e => setFormData(prev => ({ ...prev, vitesseMax: e.target.value }))}
                      placeholder="Ex: 243 km/h"
                    />
                  </div>
                </div>

                {/* Sélecteur de couleurs */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Couleurs disponibles
                    {formData.couleurs.length > 0 && (
                      <span className="ml-2 text-secondary">({formData.couleurs.length} sélectionnée{formData.couleurs.length > 1 ? 's' : ''})</span>
                    )}
                  </label>
                  <ColorPicker
                    selectedColors={formData.couleurs}
                    onColorToggle={toggleColor}
                  />
                  {formData.couleurs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.couleurs.map(color => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => toggleColor(color)}
                            className="p-0.5 hover:bg-secondary/20 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Images */}
            {currentStep === 'images' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ajouter des images <span className="text-error">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.images ? 'border-error bg-error/5' : 'border-gray-200'
                  }`}>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      multiple
                      onChange={handleImageFilesChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-text-light" />
                      </div>
                      <span className="text-sm font-medium text-text">
                        Cliquez ou glissez vos images ici
                      </span>
                      <span className="text-xs text-text-light">
                        PNG, JPG jusqu'à 10 MB (au moins une image requise)
                      </span>
                    </label>
                  </div>
                  {errors.images && <p className="text-xs text-error mt-2">{errors.images}</p>}
                </div>

                {/* Prévisualisation des images */}
                {imagePreviews.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Images sélectionnées ({imagePreviews.length})
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 text-xs bg-secondary text-white px-2 py-0.5 rounded">
                              Principale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-text-light bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <strong>Note:</strong> La première image sera définie comme image principale du véhicule.
                </div>
              </>
            )}

            {/* Step 4: Options */}
            {currentStep === 'options' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Prêt à créer le véhicule</h3>
                <p className="text-sm text-text-light max-w-md mx-auto">
                  Les options pourront être associées au véhicule après sa création.
                  Cliquez sur "Créer le véhicule" pour finaliser.
                </p>

                {/* Récapitulatif */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-sm mb-3">Récapitulatif</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-text-light">Nom:</div>
                    <div className="font-medium">{formData.nom}</div>
                    <div className="text-text-light">Marque / Modèle:</div>
                    <div className="font-medium">{formData.marque} {formData.model}</div>
                    <div className="text-text-light">Prix:</div>
                    <div className="font-medium">{formatPrice(formData.prixBase)}</div>
                    <div className="text-text-light">Images:</div>
                    <div className="font-medium">{imageFiles.length} fichier(s)</div>
                    <div className="text-text-light">Couleurs:</div>
                    <div className="font-medium">{formData.couleurs.length > 0 ? formData.couleurs.join(', ') : 'Non définies'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with navigation */}
          <div className="border-t p-4 bg-gray-50 shrink-0">
            {loading && uploadProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Création en cours...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
              )}

              <div className="flex-1" />

              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Annuler
              </Button>

              {currentStep !== 'options' ? (
                <Button type="button" variant="primary" onClick={handleNext} disabled={loading}>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Créer le véhicule
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Détails Véhicule
function VehiculeDetailModal({
  vehicule,
  onClose,
  onEdit,
}: {
  vehicule: Vehicule;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = vehicule.images || [];
  const currentImage = images[currentImageIndex]?.url || 'https://via.placeholder.com/600x400?text=No+Image';

  const getColorHex = (colorName: string) => {
    const color = PREDEFINED_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return color?.hex || '#808080';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-primary">{vehicule.nom}</h2>
            <p className="text-sm text-text-light">{vehicule.marque} - {vehicule.model}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={currentImage}
                  alt={vehicule.nom}
                  className="w-full h-full object-cover"
                />
                {vehicule.solde && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="warning">
                      -{vehicule.facteurReduction}% PROMO
                    </Badge>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={vehicule.engine === 'ELECTRIQUE' ? 'success' : 'default'}>
                    {vehicule.engine === 'ELECTRIQUE' ? (
                      <><Zap className="w-3 h-3 mr-1" /> Électrique</>
                    ) : (
                      <><Fuel className="w-3 h-3 mr-1" /> Essence</>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-secondary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Détails */}
            <div className="space-y-6">
              {/* Prix */}
              <div className="bg-secondary/5 rounded-lg p-4">
                <p className="text-sm text-text-light mb-1">Prix</p>
                {vehicule.solde && vehicule.prixOriginal ? (
                  <div>
                    <p className="text-2xl font-bold text-secondary">{formatPrice(vehicule.prixBase)}</p>
                    <p className="text-sm text-text-light line-through">{formatPrice(vehicule.prixOriginal)}</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-secondary">{formatPrice(vehicule.prixBase)}</p>
                )}
              </div>

              {/* Informations générales */}
              <div>
                <h3 className="font-semibold text-primary mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-text-light">Type</p>
                    <p className="font-medium">{vehicule.type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-text-light">Année</p>
                    <p className="font-medium">{vehicule.annee}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-text-light">Motorisation</p>
                    <p className="font-medium">{vehicule.engine}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-text-light">Stock</p>
                    <p className={`font-medium ${(vehicule.stock?.quantite || 0) <= 3 ? 'text-error' : 'text-success'}`}>
                      {vehicule.stock?.quantite || 0} unités
                    </p>
                  </div>
                </div>
              </div>

              {/* Caractéristiques techniques */}
              {(vehicule.puissance || vehicule.transmission || vehicule.carburant || vehicule.consommation) && (
                <div>
                  <h3 className="font-semibold text-primary mb-3">Caractéristiques techniques</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {vehicule.puissance && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">Puissance</p>
                        <p className="font-medium">{vehicule.puissance}</p>
                      </div>
                    )}
                    {vehicule.transmission && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">Transmission</p>
                        <p className="font-medium">{vehicule.transmission}</p>
                      </div>
                    )}
                    {vehicule.carburant && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">Carburant</p>
                        <p className="font-medium">{vehicule.carburant}</p>
                      </div>
                    )}
                    {vehicule.consommation && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">Consommation</p>
                        <p className="font-medium">{vehicule.consommation}</p>
                      </div>
                    )}
                    {vehicule.acceleration && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">0-100 km/h</p>
                        <p className="font-medium">{vehicule.acceleration}</p>
                      </div>
                    )}
                    {vehicule.vitesseMax && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-text-light">Vitesse max</p>
                        <p className="font-medium">{vehicule.vitesseMax}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Couleurs disponibles */}
              {vehicule.couleurs && vehicule.couleurs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary mb-3">Couleurs disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicule.couleurs.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: getColorHex(color) }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {vehicule.description && (
                <div>
                  <h3 className="font-semibold text-primary mb-3">Description</h3>
                  <p className="text-sm text-text-light">{vehicule.description}</p>
                </div>
              )}

              {/* Options */}
              {vehicule.options && vehicule.options.length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary mb-3">Options disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicule.options.map((opt) => (
                      <span
                        key={opt.idOption}
                        className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                      >
                        {opt.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 shrink-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="primary" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}

// Modal Édition Véhicule
function EditVehiculeModal({
  vehicule,
  onClose,
  onSuccess,
}: {
  vehicule: Vehicule;
  onClose: () => void;
  onSuccess: (updated: Vehicule) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: vehicule.nom || '',
    model: vehicule.model || '',
    marque: vehicule.marque || '',
    annee: vehicule.annee || new Date().getFullYear(),
    prixBase: vehicule.prixBase || 0,
    description: vehicule.description || '',
    puissance: vehicule.puissance || '',
    transmission: vehicule.transmission || '',
    carburant: vehicule.carburant || '',
    consommation: vehicule.consommation || '',
    acceleration: vehicule.acceleration || '',
    vitesseMax: vehicule.vitesseMax || '',
    couleurs: vehicule.couleurs || [],
    nouveau: vehicule.nouveau ?? true,
    solde: vehicule.solde || false,
    facteurReduction: vehicule.facteurReduction || 0,
  });

  const toggleColor = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      couleurs: prev.couleurs.includes(colorName)
        ? prev.couleurs.filter(c => c !== colorName)
        : [...prev.couleurs, colorName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updated = await vehiculeService.update(vehicule.idVehicule, {
        ...formData,
        facteurReduction: formData.solde ? formData.facteurReduction : 0,
      });
      onSuccess(updated);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour', err);
      setError(err.message || 'Erreur lors de la mise à jour du véhicule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-primary">Modifier le véhicule</h2>
            <p className="text-sm text-text-light">{vehicule.marque} {vehicule.nom}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Informations de base */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Informations de base
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">Modèle *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.model}
                    onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Marque *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.marque}
                    onChange={e => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Année *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.annee}
                    onChange={e => setFormData(prev => ({ ...prev, annee: parseInt(e.target.value) || new Date().getFullYear() }))}
                    min={2000}
                    max={2030}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix de base (FCFA) *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.prixBase}
                    onChange={e => setFormData(prev => ({ ...prev, prixBase: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Caractéristiques techniques */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Caractéristiques techniques
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Puissance</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.puissance}
                    onChange={e => setFormData(prev => ({ ...prev, puissance: e.target.value }))}
                    placeholder="Ex: 340 ch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transmission</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.transmission}
                    onChange={e => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                    placeholder="Ex: Automatique 8 vitesses"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carburant</label>
                  <select
                    className="input"
                    value={formData.carburant}
                    onChange={e => setFormData(prev => ({ ...prev, carburant: e.target.value }))}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Hybride">Hybride</option>
                    <option value="GPL">GPL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Consommation</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.consommation}
                    onChange={e => setFormData(prev => ({ ...prev, consommation: e.target.value }))}
                    placeholder="Ex: 9.5 L/100km"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Accélération (0-100)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.acceleration}
                    onChange={e => setFormData(prev => ({ ...prev, acceleration: e.target.value }))}
                    placeholder="Ex: 5.5s"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vitesse max</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.vitesseMax}
                    onChange={e => setFormData(prev => ({ ...prev, vitesseMax: e.target.value }))}
                    placeholder="Ex: 243 km/h"
                  />
                </div>
              </div>
            </div>

            {/* Couleurs disponibles */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Couleurs disponibles
                {formData.couleurs.length > 0 && (
                  <span className="ml-2 text-secondary font-normal">
                    ({formData.couleurs.length} sélectionnée{formData.couleurs.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {PREDEFINED_COLORS.map((color) => {
                  const isSelected = formData.couleurs.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-secondary bg-secondary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-text-light truncate w-full text-center">
                        {color.name}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statuts */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Statuts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nouveau}
                      onChange={e => setFormData(prev => ({ ...prev, nouveau: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">Marquer comme nouveau</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.solde}
                      onChange={e => setFormData(prev => ({ ...prev, solde: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">En promotion</span>
                  </label>
                </div>
                {formData.solde && (
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium mb-1">Réduction (%)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.facteurReduction}
                      onChange={e => setFormData(prev => ({ ...prev, facteurReduction: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Info non modifiables */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-text-light uppercase mb-2">
                Informations non modifiables ici
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-text-light">Type</p>
                  <p className="font-medium">{vehicule.type}</p>
                </div>
                <div>
                  <p className="text-text-light">Motorisation</p>
                  <p className="font-medium">{vehicule.engine}</p>
                </div>
                <div>
                  <p className="text-text-light">ID</p>
                  <p className="font-medium">#{vehicule.idVehicule}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-error text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 shrink-0 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
