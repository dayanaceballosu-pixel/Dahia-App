import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import MovementRow from '../components/MovementRow'
import { useSheets } from '../components/SheetsContext'
import { sortedDesc } from '../data/selectors'
import { relativeDay, localDayKey } from '../lib/date'
import type { Movement, MovementType } from '../data/types'

type Filter = 'all' | MovementType

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'income', label: 'Ingresos' },
  { key: 'expense', label: 'Gastos' },
  { key: 'transfer', label: 'Transfers' },
]

export default function Movements() {
  const { movements, accounts } = useApp()
  const { openAdd } = useSheets()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [accFilter, setAccFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = movements
    if (filter !== 'all') list = list.filter((m) => m.type === filter)
    if (accFilter !== 'all')
      list = list.filter((m) => m.accountId === accFilter || m.toAccountId === accFilter)
    return sortedDesc(list)
  }, [movements, filter, accFilter])

  const groups = useMemo(() => groupByDay(filtered), [filtered])
  const activeAccounts = accounts.filter((a) => !a.archived)

  return (
    <main className="screen">
      <div className="screen-head">
        <div>
          <h1>Movimientos 📜</h1>
          <p className="screen-sub">Todo tu historial</p>
        </div>
        <button className="chip" onClick={() => navigate('/estadisticas')}>
          📊 Estadísticas
        </button>
      </div>

      {/* Filtros por tipo */}
      <div className="chips-scroll no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtros por cuenta */}
      {activeAccounts.length > 1 && (
        <div className="chips-scroll no-scrollbar">
          <button
            className={`chip ${accFilter === 'all' ? 'chip--active' : ''}`}
            onClick={() => setAccFilter('all')}
          >
            Todas
          </button>
          {activeAccounts.map((a) => (
            <button
              key={a.id}
              className={`chip ${accFilter === a.id ? 'chip--active' : ''}`}
              onClick={() => setAccFilter(a.id)}
            >
              {a.emoji} {a.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card empty">
          <h3>Nada por aquí ✨</h3>
          <p>{movements.length === 0 ? 'Toca el botón ＋ para registrar el primero.' : 'No hay movimientos con ese filtro.'}</p>
        </div>
      ) : (
        <div className="stack">
          {groups.map((g) => (
            <section key={g.key} className="stack" style={{ gap: 8 }}>
              <p className="t-label" style={{ paddingLeft: 4 }}>
                {g.label}
              </p>
              <div className="list">
                {g.items.map((m) => (
                  <MovementRow key={m.id} movement={m} onClick={openAdd} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

function groupByDay(items: Movement[]) {
  const map = new Map<string, Movement[]>()
  for (const m of items) {
    const key = localDayKey(m.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: relativeDay(items[0].date),
    items,
  }))
}
