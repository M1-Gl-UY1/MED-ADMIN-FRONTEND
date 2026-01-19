# MED Admin - Panneau d'Administration

Interface d'administration pour MED Motors - Gestion des vehicules, commandes, clients et statistiques.

## Technologies

- **React 19** avec TypeScript
- **Vite** pour le bundling et le dev server
- **Tailwind CSS 4** pour le styling
- **React Router DOM** pour la navigation
- **Axios** pour les requetes HTTP
- **Lucide React** pour les icones
- **Recharts** pour les graphiques

## Fonctionnalites

### Dashboard
- Statistiques de ventes
- Graphiques de performance
- Commandes recentes
- Alertes stock bas

### Gestion des Vehicules
- Liste des vehicules avec pagination
- Ajout/Modification/Suppression
- Gestion des images
- Configuration des options

### Gestion des Commandes
- Liste des commandes
- Suivi des statuts (ACTIF, CONVERTI, VALIDEE, REFUSEE)
- Details et documents

### Gestion des Clients
- Liste des clients (Particuliers et Societes)
- Details des comptes
- Historique des commandes par client

### Gestion du Stock
- Suivi des quantites
- Alertes de rupture
- Historique des mouvements

### Parametres
- Configuration de l'application

## Authentification JWT

### Acces Administrateur

L'acces au panneau d'administration requiert un compte administrateur.

**Compte par defaut :**
- Email : `admin-med@gmail.com`
- Mot de passe : `12345678`

### Flux d'authentification

1. L'utilisateur accede a `/login`
2. Saisie des identifiants admin
3. Appel a `/api/auth/admin/login`
4. Stockage du token JWT dans localStorage
5. Redirection vers le dashboard
6. Token valide automatiquement au rechargement

### Protection des routes

Toutes les routes (sauf `/login`) sont protegees par le composant `ProtectedRoute` :
- Verifie la presence d'un token valide
- Redirige vers `/login` si non authentifie
- Affiche un loader pendant la verification

### Deconnexion

Le bouton de deconnexion dans le header :
- Supprime le token du localStorage
- Redirige vers la page de login

## Structure du projet

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx       # Layout principal avec sidebar
│   │   └── Header.tsx       # Header avec logout
│   ├── ui/
│   │   └── index.tsx        # Composants UI (Card, Button, Input...)
│   └── ProtectedRoute.tsx   # Garde de route
├── context/
│   └── AuthContext.tsx      # Contexte d'authentification admin
├── hooks/                   # Hooks personnalises
├── lib/
│   └── utils.ts             # Utilitaires
├── pages/
│   ├── Dashboard.tsx        # Tableau de bord
│   ├── Vehicules.tsx        # Gestion vehicules
│   ├── Commandes.tsx        # Gestion commandes
│   ├── Clients.tsx          # Gestion clients
│   ├── Stock.tsx            # Gestion stock
│   ├── Parametres.tsx       # Parametres
│   ├── Login.tsx            # Page de connexion
│   └── index.ts             # Exports
├── services/
│   ├── api.ts               # Configuration Axios + token
│   ├── auth.service.ts      # Service authentification admin
│   ├── vehicule.service.ts
│   ├── commande.service.ts
│   ├── client.service.ts
│   ├── societe.service.ts
│   ├── stock.service.ts
│   ├── dashboard.service.ts
│   └── types.ts             # Types TypeScript
├── App.tsx                  # Routes et providers
└── main.tsx                 # Point d'entree
```

## Configuration

### Variables d'environnement

Creer un fichier `.env` a la racine :

```env
# Production (VPS Contabo - HTTPS)
VITE_API_BASE_URL=https://med-backend.duckdns.org
VITE_API_TIMEOUT=30000

# Render (backup)
# VITE_API_BASE_URL=https://med-backend-zk8z.onrender.com

# Developpement local
# VITE_API_BASE_URL=http://localhost:8085
```

### Cle de stockage

Le token admin est stocke separement du token client :
- Admin : `med_admin_auth_token`
- Client : `med_auth_token`

Cela permet d'avoir des sessions separees.

## Installation

```bash
# Installer les dependances
npm install

# Lancer le serveur de developpement
npm run dev

# Build pour la production
npm run build

# Preview du build
npm run preview
```

## Demarrage

### Mode Production (Backend sur VPS)
Le backend est deploye sur VPS Contabo : `https://med-backend.duckdns.org`

1. **Lancer l'admin** : `npm run dev`
2. **Acceder** a `http://localhost:5174`
3. **Se connecter** avec `admin-med@gmail.com` / `12345678`

L'application se connecte automatiquement au backend en production.

### Mode Developpement Local
Pour utiliser un backend local :
1. Modifier `.env` : `VITE_API_BASE_URL=http://localhost:8085`
2. **Demarrer le backend** Spring Boot sur le port 8085
3. **Lancer l'admin** : `npm run dev`
4. **Acceder** a `http://localhost:5174`

> **Note** : Le port 5174 est configure dans `vite.config.ts` pour eviter les conflits avec le frontend client (port 5173).

### Gestion des erreurs
Si le backend n'est pas disponible, l'application affiche des messages d'erreur clairs avec un bouton "Reessayer" permettant de recharger les donnees.

## Routes

| Route | Page | Acces |
|-------|------|-------|
| `/login` | Connexion | Public |
| `/` | Dashboard | Admin |
| `/vehicules` | Gestion vehicules | Admin |
| `/commandes` | Gestion commandes | Admin |
| `/clients` | Gestion clients | Admin |
| `/stock` | Gestion stock | Admin |
| `/parametres` | Parametres | Admin |

## Composants UI

Les composants UI sont definis dans `src/components/ui/index.tsx` :

- **Card** - Cartes avec header et contenu
- **StatCard** - Carte de statistique avec icone et tendance
- **Button** - Boutons avec variantes (primary, secondary, outline, ghost, danger)
- **Input** - Champs de saisie avec label et erreur
- **Select** - Menu deroulant
- **Badge** - Badges de statut
- **Table** - Tableau avec Th et Td
- **Modal** - Fenetre modale
- **Pagination** - Pagination avec info items
- **Alert** - Alertes (info, success, warning, error)
- **EmptyState** - Etat vide avec icone et action

## API Endpoints utilises

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/admin/login` | Connexion admin |
| `GET /api/auth/me` | Validation token |
| `GET /api/vehicules` | Liste vehicules |
| `POST/PUT/DELETE /api/vehicules` | CRUD vehicules |
| `GET /api/commandes` | Liste commandes |
| `GET /api/clients` | Liste clients |
| `GET /api/societes` | Liste societes |
| `GET /api/stats` | Statistiques dashboard |

## Securite

- Les endpoints `/api/stats/**` et `/api/admin/**` requierent le role `ADMIN`
- Les operations d'ecriture sur `/api/vehicules/**` requierent le role `ADMIN`
- Le token expire apres 8 heures (configurable dans le backend)

## Alignement des types avec le backend

Les types TypeScript (`src/services/types.ts`) sont alignes avec les entites du backend Spring Boot :

### StatutCommande
```typescript
type StatutCommande = 'ACTIF' | 'CONVERTI' | 'VALIDEE' | 'REFUSEE';
```

### Mapping des proprietes
| Frontend | Backend | Description |
|----------|---------|-------------|
| `idUtilisateur` | `id_utilisateur` | ID utilisateur (Client/Societe) |
| `numeroTaxe` | `numero_taxe` | Numero fiscal (Societe) |
| `sexe` | `sexe` | Genre (M/F) |
| `date` | `date_commande` | Date de commande |
| `total` | `total` | Montant TTC |
| `taxe` | `taxe` | Montant taxes |
| `typePaiement` | `type_paiement` | Mode de paiement |
| `lignesCommandes` | `lignes_commandes` | Lignes de commande |
| `optionsIncompatible` | `options_incompatible` | Options incompatibles |
| `dateEntre` | `date_entre` | Date entree stock |
