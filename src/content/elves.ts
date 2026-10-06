export interface Elf {
  id: string
  name: string
  emoji: string
  trait: string
}

export const ELVES: Elf[] = [
  { id: 'pepin', name: 'Pépin', emoji: '🧝🏽', trait: 'le distrait au grand cœur' },
  { id: 'gaspard', name: 'Gaspard', emoji: '🧝🏻', trait: 'le perfectionniste' },
  { id: 'noisette', name: 'Noisette', emoji: '🧝🏾‍♀️', trait: 'la reine des bonnes idées' },
  { id: 'flocon', name: 'Flocon', emoji: '🧝🏼‍♂️', trait: 'le plus rapide de l’atelier' },
  { id: 'cannelle', name: 'Cannelle', emoji: '🧝🏽‍♀️', trait: 'la championne des rubans' },
  { id: 'sifflet', name: 'Sifflet', emoji: '🧝🏻‍♂️', trait: 'le joyeux siffloteur' },
  { id: 'praline', name: 'Praline', emoji: '🧝🏼‍♀️', trait: 'l’inventrice gourmande' },
  { id: 'mousse', name: 'Mousse', emoji: '🧝🏾', trait: 'le calme de l’équipe' },
  { id: 'lumi', name: 'Lumi', emoji: '🧝🏻‍♀️', trait: 'la spécialiste des étoiles' },
]

export function getElf(elfId: string): Elf {
  return ELVES.find((elf) => elf.id === elfId) ?? ELVES[0]
}
