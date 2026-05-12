# 📖 Guide complet NAFISSATOU — Installation, Utilisation et Fonctionnement

---

## 📋 Table des matières

1. [Prérequis](#1--prérequis)
2. [Installation du Backend (Node.js / Fastify)](#2--installation-du-backend-nodejs--fastify)
3. [Installation du Frontend (React)](#3--installation-du-frontend-react)
4. [Lancer le projet](#4--lancer-le-projet)
5. [Comptes de test (après import SQL)](#5--comptes-de-test-après-import-sql)
6. [Architecture du projet](#6--architecture-du-projet)
7. [Workflow de réservation (le cœur du système)](#7--workflow-de-réservation)
8. [Guide par rôle (comment utiliser l'application)](#8--guide-par-rôle)
9. [Structure des fichiers importants](#9--structure-des-fichiers-importants)
10. [Commandes utiles pour le développeur](#10--commandes-utiles)
11. [Modifier le code — par où commencer ?](#11--modifier-le-code)
12. [FAQ et dépannage](#12--faq-et-dépannage)
13. [CI, tests automatiques et Sonar (GitHub Actions)](#13--ci-tests-automatiques-et-sonar-github-actions)

---

## 1 — Prérequis

Avant de commencer, vous devez avoir installé sur votre machine :

| Logiciel | Version minimum | Vérifier avec |
|----------|----------------|---------------|
| **Node.js** | 20 LTS recommandé (18+ possible) | `node -v` |
| **npm** | 9+ | `npm -v` |
| **PostgreSQL** | 14+ recommandé | `psql --version` |

Un éditeur de texte (VS Code / Cursor) et Git pour cloner ou pousser vers GitHub sont utiles.

### 💡 Base de données postgress

Installez [PostgreSQL](https://www.postgresql.org/download/) ou utilisez Docker. Créez une base vide nommée `nafissa` et notez utilisateur et mot de passe pour `DATABASE_URL`.

---

## 2 — Installation du Backend (Node.js / Fastify)

```powershell
# 1. Aller dans l'API Node
cd C:\Users\HP\Downloads\nafissatou\backend-node

# 2. Installer les dépendances
npm install

# 3. Copier l'environnement
copy .env.example .env
```

### ⚙️ Configurer PostgreSQL dans `.env`

Ouvrez `backend-node\.env` et adaptez la ligne **`DATABASE_URL`** :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@127.0.0.1:5432/nafissa?schema=public"
PORT=3001
APP_URL=http://127.0.0.1:3001
FRONTEND_URL=http://localhost:5173
```

Créez la base si besoin :

```powershell
psql -U postgres -c "CREATE DATABASE nafissa;"
```

### 🏗️ Schéma et données initiales

**Migrations puis import du dump projet (`nafissa.sql`) :**

```powershell
cd C:\Users\HP\Downloads\nafissatou\backend-node
npx prisma migrate deploy
node scripts/import-nafissa.mjs
```

Ou, sans jeu complet de migrations : `npx prisma db push` puis le même script d’import.

> **⚠️** Le backend historique Laravel (`backend/` PHP) a été retiré du dépôt ; l’API à utiliser est **`backend-node/`**.

---

## 3 — Installation du Frontend (React)

```powershell
# 1. Aller dans le dossier frontend
cd C:\Users\HP\Downloads\nafissatou\frontend

# 2. Installer les dépendances JavaScript
npm install
```

C'est tout ! Le frontend est prêt.

---

## 4 — Lancer le projet

**Deux terminaux :**

### Terminal 1 — Backend Node (API)

```powershell
cd C:\Users\HP\Downloads\nafissatou\backend-node
npm run dev
```

→ API sur **`http://127.0.0.1:3001`** (ou le `PORT` défini dans `.env`).

### Terminal 2 — Frontend React

```powershell
cd C:\Users\HP\Downloads\nafissatou\frontend
npm run dev
```

→ Application sur **`http://localhost:5173`**

### 🌐 Accès

Ouvrez **http://localhost:5173** dans le navigateur.

> **Proxy Vite** : les requêtes `/api` et `/storage` sont proxifiées vers `http://127.0.0.1:3001` (voir `frontend/vite.config.js`). Les deux processus doivent tourner en parallèle.

---

## 5 — Comptes de test (après import SQL)

Après `node scripts/import-nafissa.mjs` (ou équivalent) avec le fichier `nafissa.sql`, les comptes ci-dessous sont en principe disponibles (comme avec l’ancien seed Laravel) :

| Rôle | Email | Mot de passe | Nom |
|------|-------|-------------|-----|
| **Admin** | `admin@nafissa.com` | `password` | Admin NAFISSATOU |
| **Maman (cliente)** | `fatima@nafissa.com` | `password` | Fatima Ba |
| **Maman (cliente)** | `aminata@nafissa.com` | `password` | Aminata Ndiaye |
| **Étudiant (prestataire)** | `oumar@nafissa.com` | `password` | Oumar Sy |
| **Étudiant (prestataire)** | `ibrahima@nafissa.com` | `password` | Ibrahima Diop |
| **Artisan (prestataire)** | `aissata@nafissa.com` | `password` | Aissata Diallo |
| **Artisan (prestataire)** | `mariama@nafissa.com` | `password` | Mariama Sow |
| **En attente (non validé)** | `moussa@nafissa.com` | `password` | Moussa Fall |

> **Monnaie** : Tous les prix sont en **FCFA** (Franc CFA).
> **Localisation** : Quartiers de **Dakar**, Sénégal.

---

## 6 — Architecture du projet

```
nafissatou/
├── backend-node/            ← API Node (Fastify + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── index.js, server.js
│   │   ├── routes/          ← auth, bookings, services, payments, admin…
│   │   ├── middleware/
│   │   └── lib/             ← utilitaires (pagination, sérialisation API…)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── scripts/             ← import SQL, sync séquences PostgreSQL
│   └── .env
│
├── frontend/                ← Interface React (Vite)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── test/            ← tests Vitest
│   └── vite.config.js
│
├── .github/workflows/       ← CI (tests + SonarQube)
├── sonar-project.properties
├── nafissa.sql              ← dump MySQL importable vers PostgreSQL
├── GUIDE_UTILISATION.md     ← ce fichier
└── GUIDE_SONARQUBE.md       ← qualité de code & Sonar
```

---

## 7 — Workflow de réservation

Le cœur du système NAFISSATOU est le **workflow de réservation en 6 étapes** :

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DE RÉSERVATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ÉTAPE 1 : La cliente (maman) fait une DEMANDE                     │
│  ├─ Elle choisit un service                                        │
│  ├─ Elle indique date, heure, localisation, description du besoin  │
│  └─ Statut → "en_attente_admin"                                    │
│                                                                     │
│  ÉTAPE 2 : L'ADMIN reçoit la demande                               │
│  ├─ Il voit la demande dans l'onglet "Demandes"                    │
│  ├─ Il voit les prestataires disponibles pour la catégorie         │
│  ├─ Il ATTRIBUE un prestataire                                     │
│  └─ Statut → "en_attente_prestataire"                              │
│                                                                     │
│  ÉTAPE 3 : Le PRESTATAIRE reçoit la demande                        │
│  ├─ Il voit les détails dans ses réservations                      │
│  ├─ Il peut ACCEPTER ou REFUSER                                    │
│  ├─ S'il accepte → Statut → "acceptee"                            │
│  └─ S'il refuse → Statut → "refusee" (l'admin cherche un autre)   │
│                                                                     │
│  ÉTAPE 4 : La CLIENTE paie (si accepté)                            │
│  ├─ Elle choisit un moyen de paiement (Wave, Orange Money, etc.)   │
│  ├─ Le paiement est sécurisé en ESCROW (retenu)                   │
│  └─ Statut → "payee"                                               │
│                                                                     │
│  ÉTAPE 5 : Le PRESTATAIRE effectue le service                      │
│  ├─ Il clique "Démarrer le service" → Statut → "en_cours"         │
│  ├─ Il effectue le travail                                         │
│  └─ Il clique "Marquer comme terminée" → Statut → "terminee"      │
│                                                                     │
│  ÉTAPE 6 : La CLIENTE confirme et LIBÈRE le paiement              │
│  ├─ Elle vérifie que le travail est bien fait                      │
│  ├─ Elle clique "Confirmer et libérer le paiement"                │
│  └─ Le prestataire reçoit son argent (moins la commission 10%)     │
│                                                                     │
│  ÉTAPE 7 : La CLIENTE NOTE le prestataire ⭐                       │
│  ├─ Après la libération du paiement                                │
│  ├─ Elle donne une note de 1 à 5 étoiles                          │
│  ├─ Elle peut laisser un commentaire                               │
│  └─ La note moyenne du prestataire est mise à jour automatiquement │
│                                                                     │
│  ⚠️ ANNULATION : La cliente peut annuler tant que le statut est    │
│     "en_attente_admin"                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Les 8 statuts possibles :

| Statut | Signification | Qui agit ensuite ? |
|--------|--------------|-------------------|
| `en_attente_admin` | Demande envoyée, en attente d'attribution | **Admin** |
| `en_attente_prestataire` | Prestataire attribué, en attente de réponse | **Prestataire** |
| `acceptee` | Prestataire a accepté, en attente de paiement | **Cliente** |
| `refusee` | Prestataire a refusé | **Admin** (cherche un autre) |
| `payee` | Paiement effectué, en attente du début du service | **Prestataire** |
| `en_cours` | Service en cours d'exécution | **Prestataire** |
| `terminee` | Service terminé, en attente de confirmation | **Cliente** |
| `annulee` | Demande annulée par la cliente | Personne |

---

## 8 — Guide par rôle

### 👩 Rôle : Maman (cliente)

1. **S'inscrire** : Page d'inscription avec nom, email, téléphone, adresse, mot de passe, rôle "Maman"
2. **Parcourir les services** : Menu → Services → Voir tous les services avec les **prix** et les **notes** des prestataires
3. **Comparer les prestataires** : Plusieurs prestataires peuvent proposer le même type de service avec des prix et notes différents
4. **Faire une demande** : Cliquer sur un service → Remplir date, heure, localisation, description → "Envoyer la demande"
5. **Suivre sa demande** : Menu → Réservations → Voir le statut et la progression
6. **Payer** : Quand le prestataire a accepté → Choisir Wave/Orange Money/etc. → Confirmer
7. **Confirmer** : Quand le service est terminé → "Confirmer et libérer le paiement"
8. **Noter le prestataire** ⭐ : Après la libération du paiement → Cliquer "Évaluer le prestataire" → Donner 1 à 5 étoiles + commentaire
9. **Modifier son profil** : Menu → Mon profil → Modifier nom, téléphone, adresse, bio

### 🎓 Rôle : Prestataire (étudiant ou artisan)

1. **S'inscrire** : Choisir le rôle "Étudiant" ou "Artisan" → Fournir sa **pièce d'identité** (recto + verso) → Attendre la validation de l'admin
2. **Page Services** : Le prestataire ne voit que **ses propres services** (pas ceux des autres)
3. **Ajouter des services** : Bouton "Nouveau service" → Catégorie, titre, description, prix (FCFA), localisation
4. **Modifier/Supprimer un service** : Boutons Modifier/Supprimer sur chacun de ses services
4. **Recevoir des demandes** : Quand l'admin attribue une demande → Notification → Accepter ou Refuser
5. **Effectuer le service** : Après le paiement → "Démarrer le service" → faire le travail → "Marquer comme terminée"
6. **Recevoir le paiement** : Après confirmation de la cliente, le paiement est libéré (moins 10% commission)

### 🛡️ Rôle : Administrateur

1. **Se connecter** : `admin@nafissa.com` / `password`
2. **Tableau de bord** : Vue d'ensemble (utilisateurs, réservations, revenus en FCFA)
3. **Gérer les demandes** : Onglet "Demandes" → Voir les demandes en attente → Cliquer "Attribuer un prestataire" → Choisir parmi les suggestions → Cliquer "Attribuer"
4. **Gérer les comptes** : Onglet "Comptes" → Voir la **pièce d'identité** (recto/verso) du prestataire → Valider ou refuser
5. **Voir tous les utilisateurs** : Onglet "Utilisateurs" → Suspendre un compte si nécessaire

---

## 9 — Structure des fichiers importants

### Backend — Où modifier quoi ?

| Je veux... | Emplacement principal |
|-----------|----------------------|
| Schéma / tables | `backend-node/prisma/schema.prisma` + `prisma migrate dev` |
| Routes HTTP | `backend-node/src/routes/*.js` |
| Middleware (auth, admin) | `backend-node/src/middleware/` |
| Logique commune (pagination JSON, sanitisation) | `backend-node/src/lib/` |
| Point d’entrée serveur | `backend-node/src/server.js`, `index.js` |
| Import données depuis `nafissa.sql` | `backend-node/scripts/import-nafissa.mjs` |

### Frontend — Où modifier quoi ?

| Je veux... | Fichier à modifier |
|-----------|-------------------|
| Modifier les appels API | `src/api/services.js` |
| Modifier l'authentification | `src/contexts/AuthContext.jsx` |
| Modifier le menu / la navigation | `src/components/Layout.jsx` |
| Modifier les routes (pages) | `src/App.jsx` |
| Modifier une page spécifique | `src/pages/[NomDeLaPage].jsx` |
| Modifier les styles globaux | `src/index.css` (Tailwind CSS) |

---

## 10 — Commandes utiles

### Backend Node (`backend-node/`)

```powershell
cd backend-node

# Développement (rechargement auto)
npm run dev

# Production
npm start

# Prisma
npx prisma migrate dev      # développe une nouvelle migration
npx prisma migrate deploy    # applique les migrations (CI / prod)
npx prisma generate
npx prisma db push           # synchro rapide sans migration nommée

# Données
node scripts/import-nafissa.mjs

# Tests
npm test
npm run test:coverage
```

### Frontend (`frontend/`)

```powershell
cd frontend

npm run dev
npm run build
npm run lint
npm test
npm run test:coverage
```

## 11 — Modifier le code

### Exemple 1 — Ajouter un champ utilisateur

1. Éditer `backend-node/prisma/schema.prisma` (modèle `User` ou `Profile`).
2. `npx prisma migrate dev --name ajout_mon_champ` (crée la migration SQL).
3. Adapter la route ou le serializer concerné sous `backend-node/src/routes/` et `src/lib/`.
4. Mettre à jour le formulaire côté `frontend/src/pages/Register.jsx` ou `Profile.jsx` selon le cas.

### Exemple 2 — Données de démo

Modifier `nafissa.sql` puis ré-importer :

```powershell
cd backend-node
node scripts/import-nafissa.mjs
```

(adaptez si vous utilisez une autre procédure de reset de base.)

### Exemple 3 — Nouvelle page React

Créer `frontend/src/pages/MaPage.jsx`, déclarer la route dans `App.jsx`, puis éventuellement un lien dans `Layout.jsx`.

## 12 — FAQ et dépannage

### ❌ `P1001: Can't reach database server`
PostgreSQL n’est pas démarré, ou **`DATABASE_URL`** dans `backend-node/.env` est incorrect (hôte, port, utilisateur, mot de passe).

### ❌ Tables absentes ou erreurs Prisma sur les modèles
Exécutez `npx prisma migrate deploy` (ou `npx prisma db push` en développement expéditif).

### ❌ Échec de `scripts/import-nafissa.mjs`
Vérifiez la présence de `nafissa.sql` à la racine du dépôt, que la base existe, et les droits sur PostgreSQL.

### ❌ Erreurs réseau côté navigateur (`/api/...`)
L’API doit tourner (`npm run dev` dans `backend-node`), port **3001** par défaut. Contrôlez aussi le proxy dans `frontend/vite.config.js`.

### ❌ « npm ERR! code ENOENT »
Vérifiez d’être dans `frontend/` ou `backend-node/` avant `npm …`.

### ❌ Changer le port du frontend
Modifiez `server.port` dans `frontend/vite.config.js`.

---

## 13 — CI, tests automatiques et Sonar (GitHub Actions)

Le dépôt contient `.github/workflows/ci.yml`. À chaque **push** ou **pull request** sur `main` / `master` :

1. **Frontend** — `npm ci`, `eslint`, build Vite, **Vitest avec couverture** ; **`frontend/coverage/lcov.info`** est archivé.
2. **Backend Node** — `npm ci`, `prisma generate`, **Vitest avec couverture** ; **`backend-node/coverage/lcov.info`** est archivé.
3. **Sonar** — normalisation des chemins LCov, puis **`SonarSource/sonarqube-scan-action@v6`** selon **`sonar-project.properties`** (clé **`NAFISSA-Platform`** par défaut).

Secrets (**Settings → Secrets and variables → Actions**) :

| Secret | Rôle |
|--------|------|
| **`SONAR_TOKEN`** | Jeton SonarQube ou SonarCloud (*Mon compte* → *Sécurité*). |
| **`SONAR_HOST_URL`** | **SonarQube Server uniquement**, avec une URL **joignable depuis Internet**. Ne pas utiliser **`http://localhost:9000`** pour les runners GitHub : pour eux, `localhost` est leur machine, pas votre PC. Pour **SonarCloud**, retirez ce secret et ajoutez `sonar.organization` + `sonar.host.url` dans **`sonar-project.properties`** (voir **`GUIDE_SONARQUBE.md`**). |

Pour Sonar **local** (`localhost`), lancez **`sonar-scanner`** sur votre ordinateur après les tests avec couverture.

Référence technique : **`GUIDE_SONARQUBE.md`**.  
Support pédagogique : **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.md`**.

**Pousser vers votre dépôt privé** [`https://github.com/SySamba/nafissa.git`](https://github.com/SySamba/nafissa.git) :

```powershell
cd C:\Users\HP\Downloads\nafissatou
git remote add origin https://github.com/SySamba/nafissa.git
# si déjà défini : git remote set-url origin https://github.com/SySamba/nafissa.git
git branch -M main
git push -u origin main
```

---

## 🎯 Résumé rapide pour démarrer

```powershell
# Une fois : PostgreSQL + base nafissa + .env dans backend-node

# Terminal 1 — API Node
cd C:\Users\HP\Downloads\nafissatou\backend-node
npm install
npx prisma migrate deploy
node scripts/import-nafissa.mjs   # données de démo depuis nafissa.sql
npm run dev

# Terminal 2 — Frontend
cd C:\Users\HP\Downloads\nafissatou\frontend
npm install
npm run dev

# Navigateur → http://localhost:5173
```

---

*Guide NAFISSATOU — Plateforme de services à domicile (Dakar, Sénégal).*
