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
  Profile,
} from '../data/types'
import { emptySnapshot } from '../data/seed'
import { FREE_DEFAULTS, isUnlocked, itemById, inSeason, SHOP_ITEMS } from '../data/shop'
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
      return isUnlocked(item, snap.gamification, new Date().getMonth() + 1)
    },
    [snap.gamification],
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
      updateProfile,
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
