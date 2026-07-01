import type {
  Account,
  Category,
  DataSnapshot,
  Gamification,
  ID,
  Movement,
  Profile,
  TokenEntry,
  WorkStats,
} from './types'

/* ===========================================================
   DataProvider — la "interfaz enchufable".
   HOY la implementa LocalProvider (localStorage).
   MAÑANA la implementará FirebaseProvider (Firestore + Auth),
   sin tocar el resto de la app.
   Métodos granulares para que el adaptador de Firebase pueda
   escribir documento por documento (sin derrochar lecturas).
   =========================================================== */
export interface DataProvider {
  /** Carga todo el estado (una sola vez al abrir). */
  load(): Promise<DataSnapshot>

  saveProfile(profile: Profile): Promise<void>

  upsertAccount(account: Account): Promise<void>
  removeAccount(id: ID): Promise<void>

  upsertCategory(category: Category): Promise<void>
  removeCategory(id: ID): Promise<void>

  upsertMovement(movement: Movement): Promise<void>
  removeMovement(id: ID): Promise<void>

  saveGamification(gamification: Gamification): Promise<void>

  upsertTokenEntry(entry: TokenEntry): Promise<void>
  removeTokenEntry(id: ID): Promise<void>
  saveWorkStats(workStats: WorkStats): Promise<void>

  /** Borra todo (útil para "empezar de cero" o pruebas). */
  reset(): Promise<void>
}
