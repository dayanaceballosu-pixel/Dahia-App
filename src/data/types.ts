/* ===========================================================
   Modelos de dominio de Dahia App
   Los montos SIEMPRE se guardan en centavos (enteros) para
   evitar errores de redondeo con decimales.
   =========================================================== */

export type ID = string

export type ThemePref = 'light' | 'dark' | 'system'
export type CatPresence = 'full' | 'medium' | 'low'

/** Moneda de una cuenta. Si falta = pesos colombianos (cuentas viejas). */
export type Currency = 'COP' | 'USD'

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
  currency?: Currency       // moneda de la cuenta (falta = 'COP')
  archived: boolean
  order: number
  createdAt: number
}

/** Moneda efectiva de una cuenta (las viejas, sin campo, son COP). */
export function accountCurrency(a: Account): Currency {
  return a.currency ?? 'COP'
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
  amount: number            // centavos, SIEMPRE positivo (en la moneda de accountId)
  accountId: ID             // cuenta origen (en transfer = "desde")
  toAccountId?: ID          // transfer: cuenta destino
  /** transfer entre monedas distintas: cuánto LLEGA a la cuenta destino
   *  (centavos, en la moneda de toAccountId). Si falta = mismo monto que amount. */
  amountTo?: number
  /** transfer pendiente: ya salió del origen pero aún no llega al destino.
   *  Mientras esté pendiente, el destino NO se acredita. */
  pending?: boolean
  categoryId?: ID           // income / expense (no aplica a transfer)
  note?: string
  /** dirección sólo para 'adjust': suma o resta del saldo (neutral en stats) */
  direction?: 'in' | 'out'
  date: number              // fecha + hora (timestamp)
  createdAt: number
}

export interface Gamification {
  streak: number                 // racha actual (días seguidos entrando)
  bestStreak: number             // racha máxima alcanzada → desbloquea ítems para siempre
  lastClaimDate: string | null   // 'YYYY-MM-DD' local
  equipped: string[]             // accesorios puestos (varios a la vez)
  skin: string                   // id del skin del gato
  background: string             // id del fondo
  coins?: number                 // (obsoleto) se mantiene por compatibilidad
  owned?: string[]               // (obsoleto)
  unlocked?: string[]            // (obsoleto)
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
      // el destino solo recibe si NO está pendiente; y recibe amountTo (moneda destino)
      if (m.toAccountId === accountId) return m.pending ? 0 : m.amountTo ?? m.amount
      return 0
  }
}

/** Cuánto ENTRA a la cuenta destino de una transferencia (moneda destino). */
export function transferInAmount(m: Movement): number {
  return m.amountTo ?? m.amount
}

/** ¿Este movimiento cuenta en las estadísticas de ingreso/gasto? */
export function countsInStats(m: Movement): boolean {
  return m.type === 'income' || m.type === 'expense'
}
