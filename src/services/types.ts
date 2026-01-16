// Types correspondants aux entités backend Spring Boot - Admin

// Enums
export type TypeMoteur = 'ESSENCE' | 'ELECTRIQUE';
export type TypeVehicule = 'AUTOMOBILE' | 'SCOOTER';
export type StatutCommande = 'ACTIF' | 'CONVERTI' | 'VALIDEE' | 'REFUSEE';
export type PaysLivraison = 'CM' | 'FR' | 'US' | 'NG';
export type TypeDocument = 'DEMANDE_IMMATRICULATION' | 'CERTIFICAT_CESSION' | 'BON_COMMANDE';
export type TypeMethodePaiement = 'CARTE_BANCAIRE' | 'PAYPAL' | 'COMPTANT' | 'CREDIT';
export type StatutPanier = 'ACTIF' | 'CONVERTI' | 'VALIDEE' | 'REFUSEE';
export type TypeUtilisateur = 'CLIENT' | 'SOCIETE' | 'ADMIN';
export type CategorieOption = 'INTERIEUR' | 'EXTERIEUR' | 'PERFORMANCE' | 'TECHNOLOGIE' | 'SECURITE' | 'CONFORT';

// Entités Backend
export interface Option {
  idOption: number;
  nom: string;
  description: string;
  prix: number;
  categorie: CategorieOption;
  optionsIncompatible?: Option[];
}

export interface ImageVehicule {
  idImage: number;
  url: string;
  ordreAffichage: number;
  estPrincipale: boolean;
}

export interface Stock {
  idStock: number;
  quantite: number;
  dateEntre: string;
  vehicule?: Vehicule;
}

export interface Vehicule {
  idVehicule: number;
  nom: string;
  model: string;
  marque: string;
  annee: number;
  engine: TypeMoteur;
  type: TypeVehicule;
  prixBase: number;
  description?: string;
  // Caractéristiques techniques (champs directs dans le backend)
  puissance?: string;
  transmission?: string;
  carburant?: string;
  consommation?: string;
  acceleration?: string;
  vitesseMax?: string;
  // Couleurs disponibles
  couleurs?: string[];
  // Images
  images: ImageVehicule[];
  imageUrl?: string;
  // Stock et options
  stock?: Stock;
  options?: Option[];
  // Statuts
  solde: boolean;
  facteurReduction?: number;
  nouveau?: boolean;
  // Decorator pattern (prix modifié par le backend)
  prixOriginal?: number;
  decorated?: boolean;
}

export interface Client {
  idUtilisateur: number;
  type?: 'CLIENT';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance?: string;
  sexe?: 'M' | 'F';
  adresse?: string;
  ville?: string;
  pays?: string;
}

export interface Societe {
  idUtilisateur: number;
  type?: 'SOCIETE';
  nom: string;
  email: string;
  telephone: string;
  numeroTaxe: string;
  adresse?: string;
  ville?: string;
  pays?: string;
}

export interface Utilisateur {
  idUtilisateur: number;
  email: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  type: TypeUtilisateur;
  dateInscription?: string;
}

export type UtilisateurComplet = Client | Societe;

export interface LigneCommande {
  idLigneCommande: number;
  vehicule: Vehicule;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  optionsAchetees: Option[];
  couleur?: string;
}

export interface Document {
  idDocument: number;
  type: TypeDocument;
  format: 'PDF' | 'HTML';
  url: string;
  dateCreation: string;
}

export interface Commande {
  idCommande: number;
  reference: string;
  utilisateur: Utilisateur;
  statut: StatutCommande | string;
  paysLivraison: PaysLivraison;
  adresseLivraison: string;
  typePaiement: TypeMethodePaiement;
  total: number;
  taxe: number;
  date: string;
  lignesCommandes: LigneCommande[];
  liasseDocuments?: {
    idLiasse: number;
    documents: Document[];
  };
  type?: string;
}

// DTOs Admin
export interface CreateVehiculeDTO {
  // Type (pour Abstract Factory backend)
  energie: string;  // ESSENCE ou ELECTRIQUE
  type: string;     // AUTOMOBILE ou SCOOTER

  // Informations de base
  nom: string;
  model: string;
  marque: string;
  annee: number;
  prixBase: number;
  description?: string;

  // Caractéristiques techniques
  puissance?: string;
  transmission?: string;
  carburant?: string;
  consommation?: string;
  acceleration?: string;
  vitesseMax?: string;

  // Couleurs disponibles
  couleurs?: string[];

  // Options (IDs)
  optionIds?: number[];

  // Stock
  quantiteStock?: number;

  // Statuts
  nouveau?: boolean;
  solde?: boolean;
  facteurReduction?: number;

  // Images (URLs)
  imageUrls?: string[];
}

export interface UpdateVehiculeDTO extends Partial<CreateVehiculeDTO> {
  idVehicule: number;
}

export interface UpdateStockDTO {
  vehiculeId: number;
  quantite: number;
}

export interface UpdateCommandeStatutDTO {
  statut: StatutCommande;
}

// Réponses paginées (Spring Data REST)
export interface HalLinks {
  self: { href: string };
  first?: { href: string };
  last?: { href: string };
  next?: { href: string };
  prev?: { href: string };
  profile?: { href: string };
}

export interface PageInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface HalResponse<T> {
  _embedded: {
    [key: string]: T[];
  };
  _links: HalLinks;
  page: PageInfo;
}

// Statistiques Dashboard Admin
export interface DashboardStats {
  totalVentes: number;
  nombreCommandes: number;
  commandesEnCours: number;
  commandesValidees: number;
  commandesLivrees: number;
  nombreClients: number;
  nombreVehicules: number;
  stockTotal: number;
}

export interface VentesParMois {
  mois: string;
  annee: number;
  montant: number;
  nombreCommandes: number;
}

export interface VentesParPays {
  pays: PaysLivraison;
  montant: number;
  pourcentage: number;
}

export interface VehiculePopulaire {
  vehicule: Vehicule;
  quantiteVendue: number;
  chiffreAffaires: number;
}

export interface AlerteStock {
  vehicule: Vehicule;
  quantiteActuelle: number;
  seuilAlerte: number;
}

export interface DashboardComplet {
  stats: DashboardStats;
  ventesParMois: VentesParMois[];
  ventesParPays: VentesParPays[];
  vehiculesPopulaires: VehiculePopulaire[];
  alertesStock: AlerteStock[];
  dernieresCommandes: Commande[];
}

// Filtres Admin
export interface VehiculeFilters {
  search?: string;
  type?: TypeVehicule;
  engine?: TypeMoteur;
  marque?: string;
  prixMin?: number;
  prixMax?: number;
  solde?: boolean;
  stockFaible?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CommandeFilters {
  search?: string;
  statut?: StatutCommande;
  paysLivraison?: PaysLivraison;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ClientFilters {
  search?: string;
  type?: 'CLIENT' | 'SOCIETE';
  pays?: PaysLivraison;
  page?: number;
  size?: number;
  sort?: string;
}
