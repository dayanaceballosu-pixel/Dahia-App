import type { Gamification } from './types'

export type ItemKind = 'accessory' | 'skin' | 'background'

export interface Unlock {
  type: 'streak' | 'movements'
  value: number
  label: string
}

export interface ShopItem {
  id: string
  name: string
  emoji: string          // ícono para la tarjeta de la tienda
  price: number
  kind: ItemKind
  /** meses (1-12) en que está disponible; si falta = siempre */
  seasonal?: number[]
  /** se desbloquea por logro en vez de comprarse */
  unlock?: Unlock
}

/* Accesorios — coinciden con las capas que dibuja el componente Cat */
export const SHOP_ITEMS: ShopItem[] = [
  // Accesorios
  { id: 'bow', name: 'Moño', emoji: '🎀', price: 20, kind: 'accessory' },
  { id: 'flower', name: 'Flor', emoji: '🌸', price: 20, kind: 'accessory' },
  { id: 'glasses', name: 'Gafas', emoji: '👓', price: 35, kind: 'accessory' },
  { id: 'scarf', name: 'Bufanda', emoji: '🧣', price: 40, kind: 'accessory' },
  { id: 'hat', name: 'Gorrito', emoji: '🎉', price: 55, kind: 'accessory' },
  {
    id: 'crown',
    name: 'Corona',
    emoji: '👑',
    price: 0,
    kind: 'accessory',
    unlock: { type: 'streak', value: 7, label: 'Racha de 7 días' },
  },
  {
    id: 'santa',
    name: 'Gorro navideño',
    emoji: '🎅',
    price: 50,
    kind: 'accessory',
    seasonal: [12],
  },

  // Skins del gato
  { id: 'pink', name: 'Rosadita', emoji: '🐱', price: 0, kind: 'skin' },
  { id: 'cream', name: 'Cremita', emoji: '🐈', price: 60, kind: 'skin' },
  { id: 'gray', name: 'Gris', emoji: '🐈‍⬛', price: 80, kind: 'skin' },
  { id: 'black', name: 'Negrito', emoji: '🐈‍⬛', price: 100, kind: 'skin' },

  // Fondos
  { id: 'none', name: 'Sin fondo', emoji: '⬜', price: 0, kind: 'background' },
  { id: 'sky', name: 'Nubes', emoji: '☁️', price: 40, kind: 'background' },
  { id: 'hearts', name: 'Corazones', emoji: '💕', price: 50, kind: 'background' },
  { id: 'mint', name: 'Menta', emoji: '🌿', price: 60, kind: 'background' },
  { id: 'night', name: 'Noche', emoji: '🌙', price: 70, kind: 'background' },
]

export const FREE_DEFAULTS = ['pink', 'none']

export function itemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

/** ¿Cumplió el logro para desbloquear este ítem? */
export function isUnlocked(item: ShopItem, g: Gamification): boolean {
  if (!item.unlock) return true
  if (item.unlock.type === 'streak') return g.streak >= item.unlock.value
  return false
}

/** ¿Está disponible por temporada este mes? */
export function inSeason(item: ShopItem, month: number): boolean {
  if (!item.seasonal) return true
  return item.seasonal.includes(month)
}
