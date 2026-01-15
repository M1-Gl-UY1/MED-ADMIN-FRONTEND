// Types
export type TypeMoteur = 'ESSENCE' | 'ELECTRIQUE';
export type TypeVehicule = 'AUTOMOBILE' | 'SCOOTER';
export type StatutCommande = 'EN_COURS' | 'VALIDEE' | 'LIVREE';
export type PaysLivraison = 'CM' | 'FR' | 'US' | 'NG';
export type TypeDocument = 'DEMANDE_IMMATRICULATION' | 'CERTIFICAT_CESSION' | 'BON_COMMANDE';
export type MethodePaiement = 'CARTE_BANCAIRE' | 'PAYPAL' | 'COMPTANT' | 'CREDIT';

export interface Option {
  id: number;
  nom: string;
  description: string;
  prix: number;
  incompatibilites: number[];
}

export interface Stock {
  id: number;
  quantite: number;
  dateEntree: string;
}

export interface Vehicule {
  id: number;
  nom: string;
  modele: string;
  marque: string;
  annee: number;
  typeMoteur: TypeMoteur;
  typeVehicule: TypeVehicule;
  prixBase: number;
  image: string;
  stock: Stock;
  options: number[];
}

export interface Client {
  id: number;
  type: 'CLIENT';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  genre: 'M' | 'F';
  dateInscription: string;
}

export interface Societe {
  id: number;
  type: 'SOCIETE';
  nom: string;
  email: string;
  telephone: string;
  numeroFiscal: string;
  societeMereId: number | null;
  dateInscription: string;
}

export type Utilisateur = Client | Societe;

export interface LigneCommande {
  id: number;
  vehiculeId: number;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  optionsSelectionnees: number[];
}

export interface Document {
  id: number;
  type: TypeDocument;
  format: 'PDF' | 'HTML';
  url: string;
  dateCreation: string;
}

export interface Commande {
  id: number;
  reference: string;
  utilisateurId: number;
  statut: StatutCommande;
  paysLivraison: PaysLivraison;
  methodePaiement: MethodePaiement;
  montantHT: number;
  taxes: number;
  montantTTC: number;
  dateCommande: string;
  dateLivraison: string | null;
  lignes: LigneCommande[];
  documents: Document[];
}

// Données mockées (Prix en Franc CFA)

export const options: Option[] = [
  { id: 1, nom: 'Sièges cuir', description: 'Sièges en cuir véritable', prix: 1640000, incompatibilites: [2] },
  { id: 2, nom: 'Sièges sportifs', description: 'Sièges sport avec maintien latéral', prix: 1180000, incompatibilites: [1] },
  { id: 3, nom: 'Toit ouvrant', description: 'Toit ouvrant panoramique', prix: 985000, incompatibilites: [] },
  { id: 4, nom: 'GPS intégré', description: 'Système de navigation intégré', prix: 525000, incompatibilites: [] },
  { id: 5, nom: 'Caméra 360°', description: 'Caméra de recul 360 degrés', prix: 787000, incompatibilites: [] },
  { id: 6, nom: 'Pack Sport', description: 'Jantes alu + suspension sport', prix: 2295000, incompatibilites: [7] },
  { id: 7, nom: 'Pack Confort', description: 'Suspension confort + insonorisation', prix: 1835000, incompatibilites: [6] },
  { id: 8, nom: 'Peinture métallisée', description: 'Peinture métallisée premium', prix: 590000, incompatibilites: [] },
  { id: 9, nom: 'Alarme', description: 'Système alarme anti-vol', prix: 395000, incompatibilites: [] },
  { id: 10, nom: 'Charge rapide', description: 'Chargeur rapide embarqué (électrique)', prix: 985000, incompatibilites: [] },
];

export const vehicules: Vehicule[] = [
  {
    id: 1,
    nom: 'BMW X5',
    modele: 'xDrive40i',
    marque: 'BMW',
    annee: 2024,
    typeMoteur: 'ESSENCE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 49200000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    stock: { id: 1, quantite: 5, dateEntree: '2024-01-15' },
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    id: 2,
    nom: 'Mercedes EQS',
    modele: '580 4MATIC',
    marque: 'Mercedes',
    annee: 2024,
    typeMoteur: 'ELECTRIQUE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 82000000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
    stock: { id: 2, quantite: 3, dateEntree: '2024-02-10' },
    options: [1, 3, 4, 5, 7, 8, 9, 10],
  },
  {
    id: 3,
    nom: 'Audi A4',
    modele: '45 TFSI',
    marque: 'Audi',
    annee: 2024,
    typeMoteur: 'ESSENCE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 31500000,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
    stock: { id: 3, quantite: 8, dateEntree: '2024-01-20' },
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    id: 4,
    nom: 'Tesla Model 3',
    modele: 'Performance',
    marque: 'Tesla',
    annee: 2024,
    typeMoteur: 'ELECTRIQUE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 38000000,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
    stock: { id: 4, quantite: 12, dateEntree: '2024-03-01' },
    options: [1, 3, 4, 5, 8, 9, 10],
  },
  {
    id: 5,
    nom: 'Vespa Elettrica',
    modele: '70 km/h',
    marque: 'Vespa',
    annee: 2024,
    typeMoteur: 'ELECTRIQUE',
    typeVehicule: 'SCOOTER',
    prixBase: 4920000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    stock: { id: 5, quantite: 15, dateEntree: '2024-02-28' },
    options: [9],
  },
  {
    id: 6,
    nom: 'Honda PCX',
    modele: '125',
    marque: 'Honda',
    annee: 2024,
    typeMoteur: 'ESSENCE',
    typeVehicule: 'SCOOTER',
    prixBase: 2750000,
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400',
    stock: { id: 6, quantite: 20, dateEntree: '2024-01-05' },
    options: [9],
  },
  {
    id: 7,
    nom: 'Porsche Taycan',
    modele: 'Turbo S',
    marque: 'Porsche',
    annee: 2024,
    typeMoteur: 'ELECTRIQUE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 124600000,
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400',
    stock: { id: 7, quantite: 2, dateEntree: '2024-03-15' },
    options: [1, 2, 3, 4, 5, 6, 8, 9, 10],
  },
  {
    id: 8,
    nom: 'Range Rover',
    modele: 'Sport HSE',
    marque: 'Land Rover',
    annee: 2024,
    typeMoteur: 'ESSENCE',
    typeVehicule: 'AUTOMOBILE',
    prixBase: 64300000,
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400',
    stock: { id: 8, quantite: 4, dateEntree: '2024-02-20' },
    options: [1, 3, 4, 5, 7, 8, 9],
  },
];

export const clients: Client[] = [
  {
    id: 1,
    type: 'CLIENT',
    nom: 'Fotso',
    prenom: 'Jean',
    email: 'jean.fotso@email.com',
    telephone: '+237699123456',
    dateNaissance: '1985-03-15',
    genre: 'M',
    dateInscription: '2024-01-10',
  },
  {
    id: 2,
    type: 'CLIENT',
    nom: 'Ngo Nlend',
    prenom: 'Sophie',
    email: 'sophie.ngonlend@email.com',
    telephone: '+237677234567',
    dateNaissance: '1990-07-22',
    genre: 'F',
    dateInscription: '2024-01-15',
  },
  {
    id: 3,
    type: 'CLIENT',
    nom: 'Kamga',
    prenom: 'Paul',
    email: 'paul.kamga@email.com',
    telephone: '+237655345678',
    dateNaissance: '1988-11-08',
    genre: 'M',
    dateInscription: '2024-02-01',
  },
  {
    id: 4,
    type: 'CLIENT',
    nom: 'Mbarga',
    prenom: 'Marie',
    email: 'marie.mbarga@email.com',
    telephone: '+237690456789',
    dateNaissance: '1992-05-30',
    genre: 'F',
    dateInscription: '2024-02-10',
  },
];

export const societes: Societe[] = [
  {
    id: 101,
    type: 'SOCIETE',
    nom: 'AutoFleet Cameroun SA',
    email: 'contact@autofleet-cm.com',
    telephone: '+237233456789',
    numeroFiscal: 'CM12345678901',
    societeMereId: null,
    dateInscription: '2024-01-05',
  },
  {
    id: 102,
    type: 'SOCIETE',
    nom: 'AutoFleet Douala',
    email: 'douala@autofleet-cm.com',
    telephone: '+237233567890',
    numeroFiscal: 'CM98765432101',
    societeMereId: 101,
    dateInscription: '2024-01-20',
  },
  {
    id: 103,
    type: 'SOCIETE',
    nom: 'Transport Express Sarl',
    email: 'info@transport-express.cm',
    telephone: '+237222678901',
    numeroFiscal: 'CM45678901234',
    societeMereId: null,
    dateInscription: '2024-02-15',
  },
];

export const commandes: Commande[] = [
  {
    id: 1,
    reference: 'CMD-2024-001',
    utilisateurId: 1,
    statut: 'LIVREE',
    paysLivraison: 'CM',
    methodePaiement: 'CARTE_BANCAIRE',
    montantHT: 52000000,
    taxes: 9880000,
    montantTTC: 61880000,
    dateCommande: '2024-01-20',
    dateLivraison: '2024-02-15',
    lignes: [
      { id: 1, vehiculeId: 1, quantite: 1, prixUnitaireHT: 49200000, tauxTVA: 19, optionsSelectionnees: [1, 4, 5] },
    ],
    documents: [
      { id: 1, type: 'BON_COMMANDE', format: 'PDF', url: '/docs/cmd-001-bon.pdf', dateCreation: '2024-01-20' },
      { id: 2, type: 'CERTIFICAT_CESSION', format: 'PDF', url: '/docs/cmd-001-cession.pdf', dateCreation: '2024-02-15' },
      { id: 3, type: 'DEMANDE_IMMATRICULATION', format: 'PDF', url: '/docs/cmd-001-immat.pdf', dateCreation: '2024-02-15' },
    ],
  },
  {
    id: 2,
    reference: 'CMD-2024-002',
    utilisateurId: 2,
    statut: 'VALIDEE',
    paysLivraison: 'CM',
    methodePaiement: 'CREDIT',
    montantHT: 85600000,
    taxes: 16264000,
    montantTTC: 101864000,
    dateCommande: '2024-02-10',
    dateLivraison: null,
    lignes: [
      { id: 2, vehiculeId: 2, quantite: 1, prixUnitaireHT: 82000000, tauxTVA: 19, optionsSelectionnees: [1, 3, 10] },
    ],
    documents: [
      { id: 4, type: 'BON_COMMANDE', format: 'PDF', url: '/docs/cmd-002-bon.pdf', dateCreation: '2024-02-10' },
    ],
  },
  {
    id: 3,
    reference: 'CMD-2024-003',
    utilisateurId: 3,
    statut: 'EN_COURS',
    paysLivraison: 'CM',
    methodePaiement: 'PAYPAL',
    montantHT: 34600000,
    taxes: 6574000,
    montantTTC: 41174000,
    dateCommande: '2024-03-01',
    dateLivraison: null,
    lignes: [
      { id: 3, vehiculeId: 3, quantite: 1, prixUnitaireHT: 31500000, tauxTVA: 19, optionsSelectionnees: [2, 4, 8] },
    ],
    documents: [
      { id: 5, type: 'BON_COMMANDE', format: 'HTML', url: '/docs/cmd-003-bon.html', dateCreation: '2024-03-01' },
    ],
  },
  {
    id: 4,
    reference: 'CMD-2024-004',
    utilisateurId: 101,
    statut: 'VALIDEE',
    paysLivraison: 'CM',
    methodePaiement: 'COMPTANT',
    montantHT: 155940000,
    taxes: 29628600,
    montantTTC: 185568600,
    dateCommande: '2024-03-05',
    dateLivraison: null,
    lignes: [
      { id: 4, vehiculeId: 4, quantite: 4, prixUnitaireHT: 38000000, tauxTVA: 19, optionsSelectionnees: [10] },
    ],
    documents: [
      { id: 6, type: 'BON_COMMANDE', format: 'PDF', url: '/docs/cmd-004-bon.pdf', dateCreation: '2024-03-05' },
    ],
  },
  {
    id: 5,
    reference: 'CMD-2024-005',
    utilisateurId: 4,
    statut: 'LIVREE',
    paysLivraison: 'CM',
    methodePaiement: 'CARTE_BANCAIRE',
    montantHT: 5315000,
    taxes: 1009850,
    montantTTC: 6324850,
    dateCommande: '2024-02-28',
    dateLivraison: '2024-03-10',
    lignes: [
      { id: 5, vehiculeId: 5, quantite: 1, prixUnitaireHT: 4920000, tauxTVA: 19, optionsSelectionnees: [9] },
    ],
    documents: [
      { id: 7, type: 'BON_COMMANDE', format: 'PDF', url: '/docs/cmd-005-bon.pdf', dateCreation: '2024-02-28' },
      { id: 8, type: 'CERTIFICAT_CESSION', format: 'PDF', url: '/docs/cmd-005-cession.pdf', dateCreation: '2024-03-10' },
    ],
  },
];

// Statistiques pour le dashboard
export const dashboardStats = {
  totalVentes: 396811450,
  commandesEnCours: 1,
  commandesValidees: 2,
  commandesLivrees: 2,
  totalClients: 4,
  totalSocietes: 3,
  vehiculesEnStock: 69,
  vehiculesFaibleStock: 2,
  ventesParMois: [
    { mois: 'Jan', montant: 61880000 },
    { mois: 'Fév', montant: 108188850 },
    { mois: 'Mar', montant: 226742600 },
    { mois: 'Avr', montant: 0 },
    { mois: 'Mai', montant: 0 },
    { mois: 'Juin', montant: 0 },
  ],
  ventesParPays: [
    { pays: 'Cameroun', code: 'CM', montant: 396811450, pourcentage: 100 },
    { pays: 'France', code: 'FR', montant: 0, pourcentage: 0 },
    { pays: 'USA', code: 'US', montant: 0, pourcentage: 0 },
    { pays: 'Nigeria', code: 'NG', montant: 0, pourcentage: 0 },
  ],
  topVehicules: [
    { vehiculeId: 4, nom: 'Tesla Model 3', ventes: 4, montant: 155940000 },
    { vehiculeId: 2, nom: 'Mercedes EQS', ventes: 1, montant: 85600000 },
    { vehiculeId: 1, nom: 'BMW X5', ventes: 1, montant: 52000000 },
    { vehiculeId: 3, nom: 'Audi A4', ventes: 1, montant: 34600000 },
  ],
};

// Helper functions
export const getVehiculeById = (id: number): Vehicule | undefined =>
  vehicules.find(v => v.id === id);

export const getOptionById = (id: number): Option | undefined =>
  options.find(o => o.id === id);

export const getClientById = (id: number): Client | undefined =>
  clients.find(c => c.id === id);

export const getSocieteById = (id: number): Societe | undefined =>
  societes.find(s => s.id === id);

export const getUtilisateurById = (id: number): Utilisateur | undefined =>
  getClientById(id) || getSocieteById(id);

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const getPaysLabel = (code: PaysLivraison): string => {
  const labels: Record<PaysLivraison, string> = {
    CM: 'Cameroun',
    FR: 'France',
    US: 'États-Unis',
    NG: 'Nigeria',
  };
  return labels[code];
};

export const getStatutLabel = (statut: StatutCommande): string => {
  const labels: Record<StatutCommande, string> = {
    EN_COURS: 'En cours',
    VALIDEE: 'Validée',
    LIVREE: 'Livrée',
  };
  return labels[statut];
};

export const getStatutColor = (statut: StatutCommande): string => {
  const colors: Record<StatutCommande, string> = {
    EN_COURS: 'warning',
    VALIDEE: 'info',
    LIVREE: 'success',
  };
  return colors[statut];
};
