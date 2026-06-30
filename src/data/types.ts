/* ===========================================================
   Modelos de dominio de Dahia App
   Los montos SIEMPRE se guardan en centavos (enteros) para
   evitar errores de redondeo con decimales.
   =========================================================== */

export type ID = string

export type ThemePref = 'light' | 'dark' | 'system'
export type CatPresence = 'full' | 'medium' | 'low'

export interface Profile {
  userName: string          // "Dahia"
  catName: string           // se elige en el onboarding
  theme: ThemePref
  catPresence: CatPresence
  hideBalance: boolean
  onboarded: boolean
  createdAt: number
}

export interface Account {
  id: ID
  name: string
  emoji: string             // emoji libre del teclado
  color: string             // hex de la paleta ('' = color por defecto)
  archived: boolean
  order: number
  createdAt: number
}

/** Categoría = bolsa COMPARTIDA (no atada a ingreso/gasto). */
export interface Category {
  id: ID
  name: string
  emoji: string
  color: string
  createdAt: number
}

export type MovementType = 'income' | 'expense' | 'transfer' | 'adjust'

export interface Movement {
  id: ID
  type: MovementType
  amount: number            // centavos, SIEMPRE positivo
  accountId: ID             // cuenta origen (en transfer = "desde")
  toAccountId?: ID          // transfer: cuenta destino
  categoryId?: ID           // income / expense (no aplica a transfer)
  note?: string
  /** dirección sólo para 'adjust': suma o resta del saldo (neutral en stats) */
  direction?: 'in' | 'out'
  date: number              // fecha + hora (timestamp)
  createdAt: number
}

export interface Gamification {
  coins: number
  streak: number
  lastClaimDate: string | null   // 'YYYY-MM-DD' local
  owned: string[]                // ids de ítems comprados
  equipped: string[]             // ids de ítems puestos (varios a la vez)
  skin: string                   // id del skin del gato
  background: string             // id del fondo
  unlocked: string[]             // ítems desbloqueados por logros
}

export interface DataSnapshot {
  profile: Profile
  accounts: Account[]
  categories: Category[]
  movements: Movement[]
  gamification: Gamification
}

/* ----- Efecto de cada movimiento sobre el saldo de una cuenta ----- */
export function accountDelta(m: Movement, accountId: ID): number {
  switch (m.type) {
    case 'income':
      return m.accountId === accountId ? m.amount : 0
    case 'expense':
      return m.accountId === accountId ? -m.amount : 0
    case 'adjust':
      if (m.accountId !== accountId) return 0
      return m.direction === 'out' ? -m.amount : m.amount
    case 'transfer':
      if (m.accountId === accountId) return -m.amount
      if (m.toAccountId === accountId) return m.amount
      return 0
  }
}

/** ¿Este movimiento cuenta en las estadísticas de ingreso/gasto? */
export function countsInStats(m: Movement): boolean {
  return m.type === 'income' || m.type === 'expense'
}
