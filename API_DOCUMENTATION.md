# Plant API Documentation

## 🌱 Vue d'ensemble

API REST moderne construite avec NestJS pour la gestion d'une application de plantes avec authentification complète.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
pnpm install

# Démarrage du serveur de développement
chmod +x start-dev.sh
./start-dev.sh

# Ou directement avec pnpm
pnpm run start:dev
```

L'API sera disponible sur `http://localhost:3001`

## 📋 Fonctionnalités

### ✅ Authentification
- ✅ Inscription utilisateur avec validation
- ✅ Connexion avec email ou nom d'utilisateur
- ✅ JWT tokens avec refresh
- ✅ Protection des routes avec guards
- ✅ Validation des mots de passe sécurisés

### ✅ Base de données
- ✅ Support multi-base de données (SQLite, MySQL, PostgreSQL)
- ✅ TypeORM avec migrations automatiques
- ✅ Entités User avec relations
- ✅ Hachage automatique des mots de passe

### ✅ Sécurité
- ✅ CORS configuré pour l'intégration frontend
- ✅ Validation globale des données
- ✅ Guards JWT globaux avec exceptions publiques
- ✅ Sanitisation des réponses (pas de mots de passe)

## 🔗 Endpoints

### Authentification (`/api/v1/auth`)

#### POST `/auth/register`
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2023-..."
    },
    "access_token": "jwt-token"
  },
  "timestamp": "2023-..."
}
```

#### POST `/auth/login`
Connexion utilisateur.

**Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Même format que register

#### GET `/auth/profile` 🔒
Récupération du profil utilisateur (nécessite JWT).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### POST `/auth/refresh` 🔒
Renouvellement du token JWT.

### Utilisateurs (`/api/v1/users`)

#### GET `/users/profile` 🔒
Profil détaillé de l'utilisateur connecté.

#### GET `/users/:id` 🔒
Récupération d'un utilisateur par ID.

#### PATCH `/users/:id/activate` 🔒
Activation d'un utilisateur.

#### PATCH `/users/:id/deactivate` 🔒
Désactivation d'un utilisateur.

### Système

#### GET `/api/v1/health`
Vérification de l'état de l'API.

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Base de données
DATABASE_TYPE=sqlite          # sqlite | mysql | postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=plant_user
DATABASE_PASSWORD=plant_password
DATABASE_NAME=plant_db
DATABASE_URL=./database.sqlite

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:4200
```

### Changement de base de données

Pour changer de SQLite vers PostgreSQL :

1. Modifier `DATABASE_TYPE=postgres` dans `.env`
2. Configurer les variables de connexion PostgreSQL
3. Redémarrer l'application

Pour MySQL :
1. Modifier `DATABASE_TYPE=mysql` dans `.env`
2. Changer `DATABASE_PORT=3306`
3. Configurer les variables MySQL

## 🏗️ Architecture

```
src/
├── auth/                 # Module d'authentification
│   ├── decorators/       # Décorateurs (Public, etc.)
│   ├── dto/             # DTOs de validation
│   ├── guards/          # Guards JWT et Local
│   ├── strategies/      # Stratégies Passport
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Module utilisateurs
│   ├── entities/        # Entités TypeORM
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/              # Éléments partagés
│   ├── interfaces/      # Interfaces TypeScript
│   └── dto/            # DTOs communs
├── config/              # Configuration
│   └── database.config.ts
├── app.module.ts        # Module principal
└── main.ts             # Point d'entrée
```

## 🔐 Sécurité

### Validation des mots de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial

### JWT
- Tokens sécurisés avec expiration
- Refresh tokens disponibles
- Guards globaux avec exceptions publiques

### Validation des données
- Validation automatique avec class-validator
- Sanitisation des entrées
- Protection contre les injections

## 🧪 Tests

```bash
# Tests unitaires
pnpm run test

# Tests e2e
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

## 🚀 Production

```bash
# Build
pnpm run build

# Start production
pnpm run start:prod
```

## 🔗 Intégration Frontend

L'API est configurée pour s'intégrer facilement avec votre frontend Angular :

```typescript
// Service Angular exemple
@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/v1';

  login(credentials: LoginDto) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  register(userData: RegisterDto) {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }
}
```

## 📝 Format des réponses

Toutes les réponses suivent le format standardisé :

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": string,
  "timestamp": string
}
```
