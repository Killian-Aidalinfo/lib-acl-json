# CheckerHabilitations

**CheckerHabilitations** est une bibliothèque TypeScript permettant de gérer et vérifier les habilitations (permissions) des utilisateurs en fonction de leur rôle. Cette classe prend en charge des configurations d'habilitation basées sur un fichier JSON et peut être utilisée dans des environnements Node.js et Bun.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Exemple JSON d'habilitations](#exemple-json-dhabilitations)
- [Contribuer](#contribuer)
- [License](#license)

## Fonctionnalités

- **Chargement des habilitations depuis un fichier JSON** : Initialise les permissions de chaque rôle via un fichier `acl.json`.
- **Vérification des permissions par rôle** : La méthode `checkPermission` permet de vérifier si un rôle possède une habilitation spécifique.
- **Héritage des permissions** : Les rôles peuvent hériter des habilitations d'un rôle parent.
- **Compatibilité avec Node.js et Bun** : Utilise `fs` pour Node.js et `Bun.file` pour Bun pour gérer les fichiers.

## Installation

Pour utiliser **CheckerHabilitations** dans votre projet, installez-le via npm :

```bash
npm install lib-acl-json
```

Assurez-vous d'avoir un fichier `acl.json` dans le répertoire spécifié (par défaut, dans le dossier `src` ou à la racine de votre projet).

## Configuration

1. **Nom du fichier d'habilitations** : Par défaut, la classe cherche un fichier nommé `acl.json`. Vous pouvez changer ce nom en définissant une variable d'environnement `HABILITATION_FILENAME`.
2. **Emplacement du fichier** : Le fichier JSON d'habilitations est recherché dans les dossiers suivants :
   - `src/acl.json`
   - `acl.json` (racine du projet)

## Utilisation

### Importation de la classe

```typescript
import verif from 'lib-acl-json';
```

### Initialisation de la classe

Une fois importée, utilisez simplement `verif` pour vérifier les habilitations :

```typescript
// Vérification des permissions
const hasAccess = verif.checkPermission("USER", "login");

if (hasAccess) {
  console.log("L'utilisateur USER peut se connecter.");
} else {
  console.log("L'utilisateur USER n'a pas accès.");
}
```

### Méthode `checkPermission`

Utilisez `checkPermission` pour vérifier si un rôle donné possède une habilitation spécifique. Cette méthode gère l'héritage des permissions, si un rôle a un rôle parent.

## Exemple JSON d'habilitations

Voici un exemple de structure JSON pour le fichier `acl.json` :

```json
{
  "ADMIN": {
    "parentOf": "USER",
    "habilitations": ["forgotPassword", "manageUsers"]
  },
  "USER": {
    "parentOf": null,
    "habilitations": ["login", "viewProfile"]
  }
}
```

### Structure JSON attendue

- **parentOf** : Le rôle parent dont ce rôle hérite des habilitations, ou `null` si aucun parent.
- **habilitations** : Liste des habilitations spécifiques à ce rôle.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage (pull request) avec vos améliorations ou corrections.