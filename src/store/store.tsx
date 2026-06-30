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
  DataSnapshot,
  Gamification,
  ID,
  Movement,
  MovementType,
  Profile,
} from '../data/types'
import { emptySnapshot } from '../data/seed'
import { FREE_DEFAULTS, type ShopItem } from '../data/shop'
import { uid } from '../lib/id'
import { localDayKey, daysBetween } from '../lib/date'

/* ---- Reglas de gamificación ---- */
const COINS_PER_MOVEMENT = 2
function dailyReward(streak: number) {
  return 10 + streak * 5
}

export interface NewMovementInput {
  type: MovementType
  amount: number
  accountId: ID
  toAccountId?: ID
  categoryId?: ID
  note?: string
  direction?: 'in' | 'out'
  date?: number
}

export interface ClaimResult {
  already: boolean
  reward: number
  streak: number
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
  addAccount: (data: { name: string; emoji: string; color: string }) => Account
  updateAccount: (account: Account) => void
  archiveAccount: (id: ID, archived: boolean) => void

  // categorías
  addCategory: (data: { name: string; emoji: string; color: string }) => Category
  updateCategory: (category: Category) => void
  deleteCategory: (id: ID) => void

  // movimientos
  addMovement: (input: NewMovementInput) => Movement
  updateMovement: (movement: Movement) => void
  deleteMovement: (id: ID) => void

  // gamificación
  claimDaily: () => ClaimResult
  saveGamification: (g: Gamification) => void
  buyItem: (item: ShopItem) => boolean
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
    (data: { name: string; emoji: string; color: string }) => {
      const account: Account = {
        id: uid('acc'),
        name: data.name.trim(),
        emoji: data.emoji || '💼',
        color: data.color || '',
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

  /* -------- gamificación interna -------- */
  const awardCoins = useCallback(
    (s: DataSnapshot, amount: number): Gamification => {
      const g = { ...s.gamification, coins: s.gamification.coins + amount }
      provider.saveGamification(g)
      return g
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
        categoryId: input.categoryId,
        note: input.note?.trim() || undefined,
        direction: input.direction,
        date: input.date ?? Date.now(),
        createdAt: Date.now(),
      }
      setSnap((s) => {
        provider.upsertMovement(movement)
        const gamification = awardCoins(s, COINS_PER_MOVEMENT)
        return { ...s, movements: [...s.movements, movement], gamification }
      })
      return movement
    },
    [provider, awardCoins],
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
      return { already: true, reward: 0, streak: g.streak }
    }
    let streak: number
    if (g.lastClaimDate && daysBetween(g.lastClaimDate, today) === 1) {
      streak = g.streak + 1 // día consecutivo
    } else {
      streak = 1 // primera vez o se rompió la racha
    }
    const reward = dailyReward(streak)
    const next: Gamification = {
      ...g,
      coins: g.coins + reward,
      streak,
      lastClaimDate: today,
    }
    setSnap((s) => {
      provider.saveGamification(next)
      return { ...s, gamification: next }
    })
    return { already: false, reward, streak }
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

  const buyItem = useCallback(
    (item: ShopItem): boolean => {
      const g = snap.gamification
      const owned = g.owned.includes(item.id) || FREE_DEFAULTS.includes(item.id)
      // si no es gratis ni desbloqueado y no alcanza → no compra
      const free = item.price === 0
      if (!owned && !free && g.coins < item.price) return false

      const newOwned = g.owned.includes(item.id) ? g.owned : [...g.owned, item.id]
      const coins = owned || free ? g.coins : g.coins - item.price
      let equipped = g.equipped
      let skin = g.skin
      let background = g.background
      if (item.kind === 'accessory' && !equipped.includes(item.id)) equipped = [...equipped, item.id]
      if (item.kind === 'skin') skin = item.id
      if (item.kind === 'background') background = item.id

      commitGamification({ ...g, owned: newOwned, coins, equipped, skin, background })
      return true
    },
    [snap.gamification, commitGamification],
  )

  const toggleEquip = useCallback(
    (id: string) => {
      const g = snap.gamification
      if (!g.owned.includes(id)) return
      const equipped = g.equipped.includes(id)
        ? g.equipped.filter((x) => x !== id)
        : [...g.equipped, id]
      commitGamification({ ...g, equipped })
    },
    [snap.gamification, commitGamification],
  )

  const selectSkin = useCallback(
    (id: string) => {
      const g = snap.gamification
      if (!g.owned.includes(id) && !FREE_DEFAULTS.includes(id)) return
      commitGamification({ ...g, skin: id })
    },
    [snap.gamification, commitGamification],
  )

  const selectBackground = useCallback(
    (id: string) => {
      const g = snap.gamification
      if (!g.owned.includes(id) && !FREE_DEFAULTS.includes(id)) return
      commitGamification({ ...g, background: id })
    },
    [snap.gamification, commitGamification],
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
      addCategory,
      updateCategory,
      deleteCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      claimDaily,
      saveGamification,
      buyItem,
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
      addCategory,
      updateCategory,
      deleteCategory,
      addMovement,
      updateMovement,
      deleteMovement,
      claimDaily,
      saveGamification,
      buyItem,
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
