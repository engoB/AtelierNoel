# L’Atelier du Père Noël

PWA mobile-first en français pour les familles pendant la période de Noël. Cette première version couvre les parcours enfant et parent, du dépôt des souhaits jusqu’aux expériences des 24 et 25 décembre.

L’interface adopte une direction premium et cinématographique : scènes réalistes originales, grands contrôles tactiles, navigation directe, contraste renforcé et animations respectueuses de `prefers-reduced-motion`.

La navigation enfant est construite comme une aventure : carte du monde, quête principale, missions, niveaux, éclats d’étoile et révélations interactives. Ces récompenses restent purement narratives et ne changent jamais la date réelle de fabrication.

## Prérequis

- Node.js 24
- npm 11 ou version compatible

## Installation

```bash
npm install
npm run dev
```

## Vérification de production

```bash
npm run build
npm run preview
```

La sortie statique est créée dans `dist/`. Le service worker et le manifeste sont générés par `vite-plugin-pwa`.

Pour produire une version de démonstration en un seul fichier HTML :

```bash
npm run build:html
```

Le fichier `atelier-du-pere-noel.html` peut être ouvert directement par double-clic dans un navigateur. Cette version autonome n’installe pas de service worker, mais conserve les données dans le stockage local du navigateur.

## Déploiement sur GitHub Pages

1. Dans **Settings → Pages**, choisir **GitHub Actions** comme source.
2. Le workflow `.github/workflows/deploy.yml` construit et publie automatiquement l’application à chaque push sur `main`.

La valeur `base: './'` dans `vite.config.ts` permet au site de fonctionner sous le sous-chemin de n’importe quel dépôt. Le `HashRouter` conserve la navigation après un rechargement de page sans configuration serveur.

## Organisation du code

- `src/components/` : écrans et composants de l’interface.
- `src/content/` : avatars, catégories, lutins et mots-clés éditoriaux.
- `src/hooks/` : état React et persistance locale.
- `src/lib/` : détection de catégorie, création des bons et stockage local.
- `src/types/` : modèles de données partagés.
- `src/styles/` : thème Tailwind et styles globaux.
- `public/` : icônes et ressources locales.

Les illustrations originales optimisées sont stockées dans `src/assets/` et embarquées dans le build ; l’application ne charge aucun média distant.

## Fonctionnalités disponibles

- Création de plusieurs profils enfants avec prénom, âge, avatar illustré ou photo personnelle recadrée automatiquement.
- Choix d’un « pouvoir de Noël » qui personnalise le rôle de l’enfant dans l’histoire.
- Message cinématographique personnalisé du Père Noël, adapté au prénom, à l’âge, aux souhaits et aux bonnes actions de l’enfant.
- Message interactif avec choix narratif et cinq étincelles à retrouver dans la scène.
- Monde de l’atelier navigable, journal de quête, niveaux et missions positives.
- Sélection d’un profil ; les souhaits restent séparés par enfant.
- Ajout d’un souhait avec détection automatique de sa catégorie.
- Confirmation ou correction manuelle parmi les 11 catégories.
- Assistant de souhait en deux étapes avec suggestions visuelles et détection tolérant pluriels et formulations proches.
- Révélation interactive du lutin, de sa première mission et du bon de fabrication.
- Bon de fabrication avec numéro fantaisie, date et lutin attitré.
- Progression calculée entre le début de fabrication et le 23 décembre au soir.
- Six étapes propres à chaque catégorie.
- Anecdote quotidienne déterministe, sans répétition, et carnet consultable.
- Mode parent protégé par un code PIN à 4 chiffres : maintenir le paquet cadeau de l’écran des profils pendant environ une seconde pour l’ouvrir.
- Gestion des cadeaux « en réflexion », surprises à date de révélation, liste d’achats, budgets et messages personnalisés.
- Mode test permettant de simuler n’importe quelle date de décembre.
- Gentillomètre positif avec verdict parent secret et récompenses cosmétiques liées aux bonnes actions.
- Chargement du traîneau, carte illustrée et compte à rebours le 24 décembre.
- Messages de remerciement aux lutins le 25 décembre.
- Export et import JSON des données familiales.
- Sauvegarde automatique dans `localStorage` sur l’appareil.

## Ajouter des anecdotes

Les banques se trouvent dans `src/content/anecdotes.ts`. Chaque catégorie possède au moins 15 anecdotes. Les textes acceptent les variables `{lutin}`, `{prenom}` et `{cadeau}`. Il suffit d’ajouter une phrase au tableau concerné ; le moteur la distribuera de façon déterministe sans modifier les composants React.

## Confidentialité

L’application n’effectue aucun appel réseau applicatif et n’intègre aucun outil de suivi. Les profils, souhaits et photos restent stockés sur l’appareil. Les photos sont redimensionnées avant leur enregistrement local et ne sont envoyées vers aucun service.
