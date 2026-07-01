import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { DataProvider } from '../data/provider'
import { LocalProvider } from '../data/localProvider'
import type {
  Account,
  Category,
  Currency,
  DataSnapshot,
  Gamification,
  ID,
  Movement,
  MovementType,
  PaymentReminder,
  Profile,
  TokenEntry,
  WorkStats,
} from '../data/types'
import { emptySnapshot } from '../data/seed'
import { FREE_DEFAULTS, isUnlocked, itemById, inSeason, SHOP_ITEMS } from '../data/shop'
import { lockGoalsMet, goalsMet as computeGoalsMet } from '../data/tokens'
import { advanceDate } from '../data/reminders'
import { uid } from '../lib/id'
import { localDayKey, daysBetween } from '../lib/date'

export interface NewMovementInput {
  type: MovementType
  amount: number
  accountId: ID
  toAccountId?: ID
  amountTo?: number
  pending?: boolean
  categoryId?: ID
  note?: string
  direction?: 'in' | 'out'
  date?: number
}

export interface ClaimResult {
  already: boolean
  streak: number
  unlocked: string[] // nombres de ítems recién desbloqueados hoy
}

interface AppContextValue {
  loading: boolean
  profile: Profile
  accounts: Account[]
  categories: Category[]
  movements: Movement[]
  gamification: Gamification
  tokenEntries: TokenEntry[]
  workStats: WorkStats
  /** nº de metas semanales cumplidas (derivado) → desbloquea premios glam */
  goalsMet: number
  reminders: PaymentReminder[]

  // perfil / ajustes
  updateProfile: (patch: Partial<Profile>) => void

  // cuentas
  addAccount: (data: { name: string; emoji: string; color: string; currency?: Currency }) => Account
  updateAccount: (account: Account) => void
  archiveAccount: (id: ID, archived: boolean) => void
  deleteAccount: (id: ID) => void

  // categorías
  addCategory: (data: { name: string; emoji: string; color: string }) => Category
  updateCategory: (category: Category) => void
  deleteCategory: (id: ID) => void

  // movimientos
  addMovement: (input: NewMovementInput) => Movement
  updateMovement: (movement: Movement) => void
  deleteMovement: (id: ID) => void

  // tokens de trabajo + metas
  addTokenEntry: (data: { date: number; tokens: number; note?: string }) => TokenEntry
  updateTokenEntry: (entry: TokenEntry) => void
  deleteTokenEntry: (id: ID) => void
  setWeeklyGoal: (goal: number) => void

  // recordatorios de pago
  addReminder: (data: Omit<PaymentReminder, 'id' | 'createdAt'>) => PaymentReminder
  updateReminder: (reminder: PaymentReminder) => void
  deleteReminder: (id: ID) => void
  markReminderPaid: (id: ID) => void

  // gamificación (por racha)
  claimDaily: () => ClaimResult
  saveGamification: (g: Gamification) => void
  toggleEquip: (id: string) => void
  selectSkin: (id: string) => void
  selectBackground: (id: string) => void

  resetAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  dataProvider,
}: {
  children: ReactNode
  /** adaptador de datos; por defecto local. Se le pasa FirebaseProvider al iniciar sesión. */
  dataProvider?: DataProvider
}) {
  const providerRef = useRef<DataProvider>(dataProvider ?? new LocalProvider())
  const [loading, setLoading] = useState(true)
  const [snap, setSnap] = useState<DataSnapshot>(() => emptySnapshot())

  useEffect(() => {
    let alive = true
    providerRef.current.load().then((data) => {
      if (alive) {
        setSnap(data)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const provider = providerRef.current

  /* -------- perfil -------- */
  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setSnap((s) => {
        const profile = { ...s.profile, ...patch }
        provider.saveProfile(profile)
        return { ...s, profile }
      })
    },
    [provider],
  )

  /* -------- cuentas -------- */
  const addAccount = useCallback(
    (data: { name: string; emoji: string; color: string; currency?: Currency }) => {
      const account: Account = {
        id: uid('acc'),
        name: data.name.trim(),
        emoji: data.emoji || '💼',
        color: data.color || '',
        currency: data.currency ?? 'COP',
        archived: false,
        order: Date.now(),
        createdAt: Date.now(),
      }
      setSnap((s) => {
        provider.upsertAccount(account)
        return { ...s, accounts: [...s.accounts, account] }
      })
      return account
    },
    [provider],
  )

  const updateAccount = useCallback(
    (account: Account) => {
      setSnap((s) => {
        provider.upsertAccount(account)
        return {
          ...s,
          accounts: s.accounts.map((a) => (a.id === account.id ? account : a)),
        }
      })
    },
    [provider],
  )

  const archiveAccount = useCallback(
    (id: ID, archived: boolean) => {
      setSnap((s) => {
        const account = s.accounts.find((a) => a.id === id)
        if (account) provider.upsertAccount({ ...account, archived })
        return {
          ...s,
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, archived } : a)),
        }
      })
    },
    [provider],
  )

  const deleteAccount = useCallback(
    (id: ID) => {
      setSnap((s) => {
        provider.removeAccount(id)
        return { ...s, accounts: s.accounts.filter((a) => a.id !== id) }
      })
    },
    [provider],
  )

  /* -------- categorías -------- */
  const addCategory = useCallback(
    (data: { name: string; emoji: string; color: string }) => {
      const category: Category = {
        id: uid('cat'),
        name: data.name.trim(),
        emoji: data.emoji || '🏷️',
        color: data.color || '',
        createdAt: Date.now(),
      }
      setSnap((s) => {
        provider.upsertCategory(category)
        return { ...s, categories: [...s.categories, category] }
      })
      return category
    },
    [provider],
  )

  const updateCategory = useCallback(
    (category: Category) => {
      setSnap((s) => {
        provider.upsertCategory(category)
        return {
          ...s,
          categories: s.categories.map((c) => (c.id === category.id ? category : c)),
        }
      })
    },
    [provider],
  )

  const deleteCategory = useCallback(
    (id: ID) => {
      setSnap((s) => {
        provider.removeCategory(id)
        return { ...s, categories: s.categories.filter((c) => c.id !== id) }
      })
    },
    [provider],
  )

  /* -------- movimientos -------- */
  const addMovement = useCallback(
    (input: NewMovementInput) => {
      const movement: Movement = {
        id: uid('mov'),
        type: input.type,
        amount: Math.abs(Math.round(input.amount)),
        accountId: input.accountId,
        toAccountId: input.toAccountId,
        amountTo: input.amountTo !== undefined ? Math.abs(Math.round(input.amountTo)) : undefined,
        pending: input.pending || undefined,
        categoryId: input.categoryId,
        note: input.note?.trim() || undefined,
        direction: input.direction,
        date: input.date ?? Date.now(),
        createdAt: Date.now(),
      }
      setSnap((s) => {
        provider.upsertMovement(movement)
        return { ...s, movements: [...s.movements, movement] }
      })
      return movement
    },
    [provider],
  )

  const updateMovement = useCallback(
    (movement: Movement) => {
      setSnap((s) => {
        provider.upsertMovement(movement)
        return {
          ...s,
          movements: s.movements.map((m) => (m.id === movement.id ? movement : m)),
        }
      })
    },
    [provider],
  )

  const deleteMovement = useCallback(
    (id: ID) => {
      setSnap((s) => {
        provider.removeMovement(id)
        return { ...s, movements: s.movements.filter((m) => m.id !== id) }
      })
    },
    [provider],
  )

  /* -------- tokens de trabajo + metas semanales -------- */
  // Tras cambiar registros, "congela" las semanas recién cumplidas (premio ganado)
  // sin quitar candados viejos, y persiste workStats si cambió.
  const reconcileEntries = useCallback(
    (s: DataSnapshot, tokenEntries: TokenEntry[]): DataSnapshot => {
      const locked = lockGoalsMet(tokenEntries, s.workStats)
      if (locked) {
        const workStats = { ...s.workStats, weekGoals: locked }
        provider.saveWorkStats(workStats)
        return { ...s, tokenEntries, workStats }
      }
      return { ...s, tokenEntries }
    },
    [provider],
  )

  const addTokenEntry = useCallback(
    (data: { date: number; tokens: number; note?: string }) => {
      const entry: TokenEntry = {
        id: uid('tok'),
        date: data.date,
        tokens: Math.abs(Math.round(data.tokens)),
        note: data.note?.trim() || undefined,
        createdAt: Date.now(),
      }
      setSnap((s) => {
        provider.upsertTokenEntry(entry)
        return reconcileEntries(s, [...s.tokenEntries, entry])
      })
      return entry
    },
    [provider, reconcileEntries],
  )

  const updateTokenEntry = useCallback(
    (entry: TokenEntry) => {
      const clean = { ...entry, tokens: Math.abs(Math.round(entry.tokens)), note: entry.note?.trim() || undefined }
      setSnap((s) => {
        provider.upsertTokenEntry(clean)
        return reconcileEntries(s, s.tokenEntries.map((t) => (t.id === clean.id ? clean : t)))
      })
    },
    [provider, reconcileEntries],
  )

  const deleteTokenEntry = useCallback(
    (id: ID) => {
      setSnap((s) => {
        provider.removeTokenEntry(id)
        return { ...s, tokenEntries: s.tokenEntries.filter((t) => t.id !== id) }
      })
    },
    [provider],
  )

  const setWeeklyGoal = useCallback(
    (goal: number) => {
      setSnap((s) => {
        const base: WorkStats = { ...s.workStats, weeklyGoal: Math.max(0, Math.round(goal)) }
        const locked = lockGoalsMet(s.tokenEntries, base)
        const workStats = locked ? { ...base, weekGoals: locked } : base
        provider.saveWorkStats(workStats)
        return { ...s, workStats }
      })
    },
    [provider],
  )

  /* -------- recordatorios de pago -------- */
  const addReminder = useCallback(
    (data: Omit<PaymentReminder, 'id' | 'createdAt'>) => {
      const reminder: PaymentReminder = { ...data, id: uid('rem'), createdAt: Date.now() }
      setSnap((s) => {
        provider.upsertReminder(reminder)
        return { ...s, reminders: [...s.reminders, reminder] }
      })
      return reminder
    },
    [provider],
  )

  const updateReminder = useCallback(
    (reminder: PaymentReminder) => {
      setSnap((s) => {
        provider.upsertReminder(reminder)
        return { ...s, reminders: s.reminders.map((r) => (r.id === reminder.id ? reminder : r)) }
      })
    },
    [provider],
  )

  const deleteReminder = useCallback(
    (id: ID) => {
      setSnap((s) => {
        provider.removeReminder(id)
        return { ...s, reminders: s.reminders.filter((r) => r.id !== id) }
      })
    },
    [provider],
  )

  // "Ya lo pagué": periódico → salta a la próxima fecha; una vez → queda hecho.
  const markReminderPaid = useCallback(
    (id: ID) => {
      setSnap((s) => {
        const r = s.reminders.find((x) => x.id === id)
        if (!r) return s
        const updated: PaymentReminder =
          r.periodic && r.freq
            ? { ...r, nextDate: advanceDate(r.nextDate, r.freq) }
            : { ...r, done: true }
        provider.upsertReminder(updated)
        return { ...s, reminders: s.reminders.map((x) => (x.id === id ? updated : x)) }
      })
    },
    [provider],
  )

  /* -------- racha diaria -------- */
  const claimDaily = useCallback((): ClaimResult => {
    const today = localDayKey()
    const g = snap.gamification
    if (g.lastClaimDate === today) {
      return { already: true, streak: g.streak, unlocked: [] }
    }
    let streak: number
    if (g.lastClaimDate && daysBetween(g.lastClaimDate, today) === 1) {
      streak = g.streak + 1 // día consecutivo
    } else {
      streak = 1 // primera vez o se rompió la racha
    }
    const prevBest = g.bestStreak ?? 0
    const bestStreak = Math.max(prevBest, streak)
    const month = new Date().getMonth() + 1
    // ítems que se desbloquean justo al subir la racha máxima
    const unlocked = SHOP_ITEMS.filter(
      (it) => it.unlockStreak > prevBest && it.unlockStreak <= bestStreak && inSeason(it, month),
    ).map((it) => it.name)

    const next: Gamification = { ...g, streak, bestStreak, lastClaimDate: today }
    setSnap((s) => {
      provider.saveGamification(next)
      return { ...s, gamification: next }
    })
    return { already: false, streak, unlocked }
  }, [snap.gamification, provider])

  const saveGamification = useCallback(
    (g: Gamification) => {
      setSnap((s) => {
        provider.saveGamification(g)
        return { ...s, gamification: g }
      })
    },
    [provider],
  )

  const commitGamification = useCallback(
    (g: Gamification) => {
      setSnap((s) => {
        provider.saveGamification(g)
        return { ...s, gamification: g }
      })
    },
    [provider],
  )

  // ¿Se puede usar este ítem? = desbloqueado por la racha (o gratis por defecto).
  const isUsable = useCallback(
    (id: string): boolean => {
      if (FREE_DEFAULTS.includes(id)) return true
      const item = itemById(id)
      if (!item) return false
      const gm = computeGoalsMet(snap.tokenEntries, snap.workStats)
      return isUnlocked(item, snap.gamification, new Date().getMonth() + 1, undefined, gm)
    },
    [snap.gamification, snap.tokenEntries, snap.workStats],
  )

  const toggleEquip = useCallback(
    (id: string) => {
      if (!isUsable(id)) return
      const g = snap.gamification
      const equipped = g.equipped.includes(id)
        ? g.equipped.filter((x) => x !== id)
        : [...g.equipped, id]
      commitGamification({ ...g, equipped })
    },
    [snap.gamification, commitGamification, isUsable],
  )

  const selectSkin = useCallback(
    (id: string) => {
      if (!isUsable(id)) return
      commitGamification({ ...snap.gamification, skin: id })
    },
    [snap.gamification, commitGamification, isUsable],
  )

  const selectBackground = useCallback(
    (id: string) => {
      if (!isUsable(id)) return
      commitGamification({ ...snap.gamification, background: id })
    },
    [snap.gamification, commitGamification, isUsable],
  )

  const resetAll = useCallback(() => {
    provider.reset()
    setSnap(emptySnapshot())
  }, [provider])

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      profile: snap.profile,
      accounts: snap.accounts,
      categories: snap.categories,
      movements: snap.movements,
      gamification: snap.gamification,
      tokenEntries: snap.tokenEntries,
      workStats: snap.workStats,
      goalsMet: computeGoalsMet(snap.tokenEntries, snap.workStats),
      reminders: snap.reminders,
      updateProfile,
      addTokenEntry,
      updateTokenEntry,
      deleteTokenEntry,
      setWeeklyGoal,
      addReminder,
      updateReminder,
      deleteReminder,
      markReminderPaid,
      addAccount,
      updateAccount,
      archiveAccount,
      deleteAccount,
      addCategory,
      updateCategory,
      deleteCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      claimDaily,
      saveGamification,
      toggleEquip,
      selectSkin,
      selectBackground,
      resetAll,
    }),
    [
      loading,
      snap,
      updateProfile,
      addTokenEntry,
      updateTokenEntry,
      deleteTokenEntry,
      setWeeklyGoal,
      addReminder,
      updateReminder,
      deleteReminder,
      markReminderPaid,
      addAccount,
      updateAccount,
      archiveAccount,
      deleteAccount,
      addCategory,
      updateCategory,
      deleteCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      claimDaily,
      saveGamification,
      toggleEquip,
      selectSkin,
      selectBackground,
      resetAll,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
