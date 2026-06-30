import type { Gamification } from './types'

export type ItemKind = 'accessory' | 'skin' | 'background'

export interface ShopItem {
  id: string
  name: string
  emoji: string // ícono para la tarjeta
  /** días de racha necesarios para desbloquearlo (0 = gratis desde el inicio) */
  unlockStreak: number
  kind: ItemKind
  /** meses (1-12) en que está disponible; si falta = siempre */
  seasonal?: number[]
}

/* Progresión por RACHA: entre más días seguidos entrando, más cosas se
   desbloquean. Una vez alcanzada la racha, queda desbloqueado PARA SIEMPRE
   (se usa bestStreak, no la racha actual). */
export const SHOP_ITEMS: ShopItem[] = [
  // Accesorios
  { id: 'bow', name: 'Moño', emoji: '🎀', unlockStreak: 2, kind: 'accessory' },
  { id: 'flower', name: 'Flor', emoji: '🌸', unlockStreak: 4, kind: 'accessory' },
  { id: 'glasses', name: 'Gafas', emoji: '👓', unlockStreak: 7, kind: 'accessory' },
  { id: 'scarf', name: 'Bufanda', emoji: '🧣', unlockStreak: 10, kind: 'accessory' },
  { id: 'hat', name: 'Gorrito', emoji: '🎉', unlockStreak: 14, kind: 'accessory' },
  { id: 'crown', name: 'Corona', emoji: '👑', unlockStreak: 21, kind: 'accessory' },
  { id: 'strawhat', name: 'Sombrero de Luffy', emoji: '👒', unlockStreak: 30, kind: 'accessory' },
  { id: 'santa', name: 'Gorro navideño', emoji: '🎅', unlockStreak: 3, kind: 'accessory', seasonal: [12] },

  // Skins del gato
  { id: 'pink', name: 'Rosadita', emoji: '🐱', unlockStreak: 0, kind: 'skin' },
  { id: 'cream', name: 'Cremita', emoji: '🐈', unlockStreak: 12, kind: 'skin' },
  { id: 'gray', name: 'Gris', emoji: '🐈‍⬛', unlockStreak: 20, kind: 'skin' },
  { id: 'black', name: 'Negrito', emoji: '🐈‍⬛', unlockStreak: 30, kind: 'skin' },

  // Fondos
  { id: 'none', name: 'Sin fondo', emoji: '⬜', unlockStreak: 0, kind: 'background' },
  { id: 'sky', name: 'Nubes', emoji: '☁️', unlockStreak: 5, kind: 'background' },
  { id: 'hearts', name: 'Corazones', emoji: '💕', unlockStreak: 8, kind: 'background' },
  { id: 'mint', name: 'Menta', emoji: '🌿', unlockStreak: 12, kind: 'background' },
  { id: 'night', name: 'Noche', emoji: '🌙', unlockStreak: 18, kind: 'background' },
]

export const FREE_DEFAULTS = ['pink', 'none']

export function itemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

/** ¿Está disponible por temporada este mes? */
export function inSeason(item: ShopItem, month: number): boolean {
  if (!item.seasonal) return true
  return item.seasonal.includes(month)
}

/** ¿Está desbloqueado? = racha máxima alcanzada >= la requerida (y en temporada). */
export function isUnlocked(item: ShopItem, g: Gamification, month: number): boolean {
  if (!inSeason(item, month)) return false
  return (g.bestStreak ?? 0) >= item.unlockStreak
}

function usable(id: string, g: Gamification, month: number): boolean {
  if (FREE_DEFAULTS.includes(id)) return true
  const it = itemById(id)
  return !!it && isUnlocked(it, g, month)
}

/** "Look" del gato filtrado a SOLO lo desbloqueado (lo bloqueado no se muestra).
 *  Útil para limpiar accesorios que quedaron puestos de la tienda anterior. */
export function effectiveLook(
  g: Gamification,
  month: number,
): { equipped: string[]; skin: string; background: string } {
  return {
    equipped: (g.equipped ?? []).filter((id) => usable(id, g, month)),
    skin: usable(g.skin, g, month) ? g.skin : 'pink',
    background: usable(g.background, g, month) ? g.background : 'none',
  }
}
