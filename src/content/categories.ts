import type { CategoryId } from '../types/domain'

export interface GiftCategory {
  id: CategoryId
  label: string
  shortLabel: string
  emoji: string
  color: string
  keywords: string[]
  steps: string[]
}

export const GIFT_CATEGORIES: GiftCategory[] = [
  {
    id: 'electronique', label: 'Électronique / console', shortLabel: 'Électronique', emoji: '🎮', color: '#4f6fa8',
    keywords: ['console', 'switch', 'ps5', 'playstation', 'xbox', 'tablette', 'ordinateur', 'casque', 'ecouteurs', 'jeu video', 'camera'],
    steps: ['Plans techniques', 'Assemblage des circuits', 'Installation des jeux', 'Test par les lutins-testeurs', 'Emballage antichoc', 'Chargement dans le traîneau'],
  },
  {
    id: 'peluche', label: 'Peluche', shortLabel: 'Peluche', emoji: '🧸', color: '#b87858',
    keywords: ['doudou', 'peluche', 'nounours', 'ours en peluche'],
    steps: ['Choix du tissu le plus doux', 'Découpe des formes', 'Couture et rembourrage', 'Test des câlins', 'Pose du ruban', 'Chargement dans le traîneau'],
  },
  {
    id: 'livre', label: 'Livre', shortLabel: 'Livre', emoji: '📚', color: '#8c4f52',
    keywords: ['livre', 'roman', 'bd', 'bande dessinee', 'manga', 'album', 'encyclopedie', 'conte'],
    steps: ['Choix du beau papier', 'Impression des pages', 'Assemblage des cahiers', 'Reliure de la couverture', 'Relecture par les lutins', 'Chargement dans le traîneau'],
  },
  {
    id: 'vehicule', label: 'Véhicule', shortLabel: 'Véhicule', emoji: '🛴', color: '#3d7c75',
    keywords: ['velo', 'trottinette', 'voiture', 'camion', 'tracteur', 'kart', 'skate', 'draisienne', 'vehicule'],
    steps: ['Préparation du châssis', 'Montage des roues', 'Réglage de la direction', 'Essai sur la piste enneigée', 'Polissage et ruban', 'Chargement dans le traîneau'],
  },
  {
    id: 'construction', label: 'Construction', shortLabel: 'Construction', emoji: '🧱', color: '#c17c27',
    keywords: ['brique', 'briques', 'construction', 'bloc', 'blocs', 'maquette', 'cabane a construire'],
    steps: ['Lecture des plans', 'Moulage des pièces', 'Tri des couleurs', 'Construction du modèle test', 'Comptage minutieux', 'Chargement dans le traîneau'],
  },
  {
    id: 'jeu-societe', label: 'Jeu de société', shortLabel: 'Jeu de société', emoji: '🎲', color: '#6b5d9e',
    keywords: ['jeu de societe', 'jeu de cartes', 'jeu de plateau', 'puzzle', 'echecs', 'dames', 'dominos'],
    steps: ['Invention des règles', 'Fabrication du plateau', 'Création des cartes et pions', 'Grande partie de test', 'Rangement dans la boîte', 'Chargement dans le traîneau'],
  },
  {
    id: 'poupee-figurine', label: 'Poupée / figurine', shortLabel: 'Poupée', emoji: '🪆', color: '#a84f78',
    keywords: ['poupee', 'figurine', 'personnage', 'maison de poupee', 'miniature'],
    steps: ['Esquisse du personnage', 'Modelage des détails', 'Mise en couleurs', 'Création des accessoires', 'Contrôle des articulations', 'Chargement dans le traîneau'],
  },
  {
    id: 'vetement-accessoire', label: 'Vêtement / accessoire', shortLabel: 'Vêtement', emoji: '🧣', color: '#9b5f45',
    keywords: ['vetement', 'robe', 'pull', 'pyjama', 'bonnet', 'echarpe', 'chaussure', 'baskets', 'sac', 'montre', 'bijou'],
    steps: ['Choix des matières', 'Prise des mesures magiques', 'Coupe et assemblage', 'Couture des finitions', 'Essayage sur mannequin', 'Chargement dans le traîneau'],
  },
  {
    id: 'sport', label: 'Sport', shortLabel: 'Sport', emoji: '⚽', color: '#3d7950',
    keywords: ['ballon', 'raquette', 'but de foot', 'panier de basket', 'sport', 'roller', 'skis', 'surf', 'trampoline'],
    steps: ['Préparation du matériel', 'Assemblage sportif', 'Réglage et équilibrage', 'Essai par l’équipe des lutins', 'Nettoyage et contrôle', 'Chargement dans le traîneau'],
  },
  {
    id: 'loisirs-creatifs', label: 'Loisirs créatifs', shortLabel: 'Créatif', emoji: '🎨', color: '#a05443',
    keywords: ['peinture', 'feutre', 'crayon', 'dessin', 'pate a modeler', 'perles', 'bricolage', 'origami', 'creation', 'creatif'],
    steps: ['Sélection des couleurs', 'Préparation du matériel', 'Assemblage du coffret', 'Test des créations', 'Ajout des idées surprises', 'Chargement dans le traîneau'],
  },
  {
    id: 'mystere', label: 'Mystère', shortLabel: 'Mystère', emoji: '✨', color: '#7a6650', keywords: [],
    steps: ['Étude des plans secrets', 'Préparation des matériaux surprises', 'Fabrication spéciale', 'Vérification derrière le rideau', 'Emballage ultra-secret', 'Chargement dans le traîneau'],
  },
]

export function getCategory(categoryId: CategoryId): GiftCategory {
  return GIFT_CATEGORIES.find((category) => category.id === categoryId) ?? GIFT_CATEGORIES.at(-1)!
}
