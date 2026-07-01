import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import Cat, { type CatMood } from '../components/Cat/Cat'
import CatStage from '../components/Cat/CatStage'
import Sheet from '../components/ui/Sheet'
import { effectiveLook, itemById } from '../data/shop'
import {
  weekProgress,
  workStreak,
  bestDay,
  rangeFor,
  tokensInRange,
  bestDayInRange,
  daysWithEntriesInRange,
  totalsByDay,
  weekKeyOf,
  effectiveGoal,
  type Unit,
} from '../data/tokens'
import { localDayKey, relativeDay } from '../lib/date'
import type { TokenEntry } from '../data/types'
import './Tokens.css'

const fmt = (n: number) => Math.round(n).toLocaleString('es-CO')
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/** 'YYYY-MM-DD' → timestamp local (mediodía, para evitar líos de zona horaria). */
function dayKeyToTs(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).getTime()
}

export default function Tokens() {
  const { tokenEntries, workStats, goalsMet, gamification, addTokenEntry, updateTokenEntry, deleteTokenEntry, setWeeklyGoal } = useApp()
  const navigate = useNavigate()

  const [mood, setMood] = useState<CatMood>('idle')
  const [toast, setToast] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<TokenEntry | null>(null)
  const [goalOpen, setGoalOpen] = useState(false)

  const [unit, setUnit] = useState<Unit>('week')
  const [offset, setOffset] = useState(0)

  const look = useMemo(
    () => effectiveLook(gamification, new Date().getMonth() + 1, goalsMet),
    [gamification, goalsMet],
  )

  const week = useMemo(() => weekProgress(tokenEntries, workStats, 0), [tokenEntries, workStats])
  const streak = useMemo(() => workStreak(tokenEntries), [tokenEntries])
  const record = useMemo(() => bestDay(tokenEntries), [tokenEntries])

  // Periodo de estadísticas (día/semana/mes)
  const range = useMemo(() => rangeFor(unit, offset), [unit, offset])
  const prevRange = useMemo(() => rangeFor(unit, offset - 1), [unit, offset])
  const periodTotal = useMemo(() => tokensInRange(tokenEntries, range.start, range.end), [tokenEntries, range])
  const prevTotal = useMemo(() => tokensInRange(tokenEntries, prevRange.start, prevRange.end), [tokenEntries, prevRange])
  const periodBestDay = useMemo(() => bestDayInRange(tokenEntries, range.start, range.end), [tokenEntries, range])
  const activeDays = useMemo(() => daysWithEntriesInRange(tokenEntries, range.start, range.end), [tokenEntries, range])
  const avg = activeDays > 0 ? periodTotal / activeDays : 0
  const diffPct = prevTotal > 0 ? Math.round(((periodTotal - prevTotal) / prevTotal) * 100) : periodTotal > 0 ? 100 : 0

  // Barras del periodo
  const bars = useMemo(() => buildBars(tokenEntries, unit, range), [tokenEntries, unit, range])
  const maxBar = Math.max(1, ...bars.map((b) => b.value))

  // Registros del periodo (para editar/borrar), más nuevo primero
  const periodEntries = useMemo(
    () =>
      tokenEntries
        .filter((e) => e.date >= range.start && e.date <= range.end)
        .sort((a, b) => b.date - a.date || b.createdAt - a.createdAt),
    [tokenEntries, range],
  )

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }

  function onSaveEntry(data: { date: number; tokens: number; note?: string }) {
    // ¿esta semana pasó de NO cumplida a cumplida? → celebrar + premio
    const wk = weekKeyOf(data.date)
    const before = tokensInRange(tokenEntries, ...weekBounds(data.date))
    const goal = effectiveGoal(wk, workStats) || workStats.weeklyGoal
    addTokenEntry(data)
    const after = before + Math.abs(Math.round(data.tokens))
    if (goal > 0 && before < goal && after >= goal) {
      const prize = itemById(prizeIdForGoal(goalsMet + 1))
      setMood('celebrate')
      flash(prize ? `🎉 ¡Meta cumplida! Desbloqueaste: ${prize.name} 💋` : '🎉 ¡Meta cumplida!')
      window.setTimeout(() => setMood('idle'), 2200)
    } else {
      setMood('happy')
      window.setTimeout(() => setMood('idle'), 1200)
    }
  }

  return (
    <main className="screen tokens">
      <div className="screen-head">
        <button className="iconbtn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <div style={{ flex: 1 }}>
          <h1>Mis Tokens ✨</h1>
          <p className="screen-sub">Tu trabajo y tus metas 💖</p>
        </div>
      </div>

      {/* Meta semanal + gatito */}
      <section className="tok-goal">
        <div className="tok-goal__cat">
          <CatStage background={look.background} size={128}>
            <Cat size={104} mood={mood} equipped={look.equipped} skin={look.skin} />
          </CatStage>
        </div>

        {workStats.weeklyGoal <= 0 ? (
          <div className="tok-goal__empty">
            <b>Ponte una meta semanal 🎯</b>
            <p className="screen-sub">Elige cuántos tokens quieres hacer esta semana.</p>
            <button className="btn btn--primary btn--block" onClick={() => setGoalOpen(true)}>
              Poner meta
            </button>
          </div>
        ) : (
          <>
            <div className="tok-goal__head">
              <span className="tok-goal__label">Meta de la semana</span>
              <button className="tok-goal__edit" onClick={() => setGoalOpen(true)}>
                editar
              </button>
            </div>
            <div className="tok-goal__nums">
              <b>{fmt(week.total)}</b> <span>/ {fmt(week.goal)} 🪙</span>
            </div>
            <div className="tok-bar">
              <div className="tok-bar__fill" style={{ width: `${week.pct}%` }} />
            </div>
            <p className="tok-goal__msg">
              {week.met ? (
                <>🎉 ¡Meta cumplida! Vas increíble 💖</>
              ) : (
                <>Te faltan <b>{fmt(week.remaining)}</b> · ¡tú puedes! 💪</>
              )}
            </p>
          </>
        )}

        <button className="btn btn--income btn--block tok-add" onClick={() => setAddOpen(true)}>
          ＋ Registrar tokens
        </button>
      </section>

      {/* Pills: racha, récord, metas */}
      <div className="tok-pills">
        <div className="tok-pill">
          <span className="tok-pill__ic">🔥</span>
          <b>{streak}</b>
          <span>racha</span>
        </div>
        <div className="tok-pill">
          <span className="tok-pill__ic">🏆</span>
          <b>{fmt(record)}</b>
          <span>récord/día</span>
        </div>
        <button className="tok-pill tok-pill--tap" onClick={() => navigate('/tienda')}>
          <span className="tok-pill__ic">💋</span>
          <b>{goalsMet}</b>
          <span>metas · premios</span>
        </button>
      </div>

      {/* Estadísticas */}
      <section className="stack" style={{ gap: 10 }}>
        <div className="rowflex" style={{ gap: 8, justifyContent: 'center' }}>
          {(['day', 'week', 'month'] as Unit[]).map((u) => (
            <button
              key={u}
              className={`chip ${unit === u ? 'chip--active' : ''}`}
              onClick={() => {
                setUnit(u)
                setOffset(0)
              }}
            >
              {u === 'day' ? 'Día' : u === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        <div className="period">
          <button className="iconbtn" onClick={() => setOffset((o) => o - 1)}>
            ‹
          </button>
          <span className="period__label">{range.label}</span>
          <button className="iconbtn" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}>
            ›
          </button>
        </div>

        {/* Resumen del periodo */}
        <div className="tok-summary">
          <div className="tok-summary__total">
            <span className="tok-summary__lbl">Total</span>
            <b>{fmt(periodTotal)} 🪙</b>
          </div>
          <div className={`tok-summary__cmp ${diffPct >= 0 ? 'up' : 'down'}`}>
            {diffPct >= 0 ? '▲' : '▼'} {Math.abs(diffPct)}%
            <span className="tok-summary__cmpsub">vs {unit === 'day' ? 'día' : unit === 'week' ? 'semana' : 'mes'} anterior</span>
          </div>
        </div>

        {/* Gráfica de barras (día muestra la lista abajo) */}
        {unit !== 'day' && (
          <div className="tok-chart">
            {bars.map((b, i) => (
              <div key={i} className="tok-chart__col" title={`${b.label}: ${fmt(b.value)}`}>
                <div className="tok-chart__barwrap">
                  <div
                    className="tok-chart__bar"
                    style={{ height: `${Math.round((b.value / maxBar) * 100)}%` }}
                  />
                </div>
                <span className="tok-chart__lbl">{b.label}</span>
              </div>
            ))}
          </div>
        )}

        {periodTotal > 0 && (
          <p className="tok-hint">
            {activeDays > 0 && <>Promedio <b>{fmt(avg)}</b>/día activo. </>}
            {periodBestDay && (
              <>Tu mejor día: <b>{relativeDay(dayKeyToTs(periodBestDay.day))}</b> con {fmt(periodBestDay.tokens)} 🪙.</>
            )}
          </p>
        )}
      </section>

      {/* Registros del periodo */}
      <section className="stack" style={{ gap: 8 }}>
        <p className="t-label" style={{ paddingLeft: 4 }}>
          Registros {unit === 'day' ? 'del día' : unit === 'week' ? 'de la semana' : 'del mes'}
        </p>
        {periodEntries.length === 0 ? (
          <div className="card empty">
            <h3>Nada aún ✨</h3>
            <p>Toca “Registrar tokens” para empezar.</p>
          </div>
        ) : (
          <div className="list">
            {periodEntries.map((e) => (
              <button key={e.id} className="row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setEditEntry(e)}>
                <span className="row__icon">🪙</span>
                <span className="row__main">
                  <span className="row__title">{fmt(e.tokens)} tokens</span>
                  <span className="row__sub">
                    {relativeDay(e.date)}
                    {e.note ? ` · ${e.note}` : ''}
                  </span>
                </span>
                <span className="row__right" style={{ color: 'var(--income)' }}>+{fmt(e.tokens)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Hojas */}
      <EntrySheet
        open={addOpen || !!editEntry}
        entry={editEntry}
        onClose={() => {
          setAddOpen(false)
          setEditEntry(null)
        }}
        onSave={(data) => {
          if (editEntry) updateTokenEntry({ ...editEntry, ...data })
          else onSaveEntry(data)
          setAddOpen(false)
          setEditEntry(null)
        }}
        onDelete={
          editEntry
            ? () => {
                deleteTokenEntry(editEntry.id)
                setEditEntry(null)
              }
            : undefined
        }
      />

      <GoalSheet
        open={goalOpen}
        current={workStats.weeklyGoal}
        onClose={() => setGoalOpen(false)}
        onSave={(g) => {
          setWeeklyGoal(g)
          setGoalOpen(false)
        }}
      />

      {toast && <div className="toast-pop">{toast}</div>}
    </main>
  )
}

/* ---------- Hoja: registrar / editar tokens ---------- */
function EntrySheet({
  open,
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean
  entry: TokenEntry | null
  onClose: () => void
  onSave: (data: { date: number; tokens: number; note?: string }) => void
  onDelete?: () => void
}) {
  const [tokensRaw, setTokensRaw] = useState('')
  const [dayKey, setDayKey] = useState(localDayKey())
  const [note, setNote] = useState('')

  // sincroniza al abrir
  useEffect(() => {
    if (open) {
      setTokensRaw(entry ? String(entry.tokens) : '')
      setDayKey(entry ? localDayKey(entry.date) : localDayKey())
      setNote(entry?.note ?? '')
    }
  }, [open, entry])

  const tokens = Math.max(0, Math.round(Number(tokensRaw.replace(/[^\d]/g, '')) || 0))
  const canSave = tokens > 0 && !!dayKey

  return (
    <Sheet open={open} onClose={onClose} title={entry ? 'Editar registro' : 'Registrar tokens 🪙'}>
      <div className="stack">
        <div className="amount amount--income">
          <span className="amount__cur">🪙</span>
          <input
            className="amount__big"
            inputMode="numeric"
            placeholder="0"
            value={tokensRaw}
            onChange={(e) => setTokensRaw(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label>Día</label>
          <input className="input" type="date" value={dayKey} max={localDayKey()} onChange={(e) => setDayKey(e.target.value)} />
        </div>

        <div className="field">
          <label>Nota (opcional)</label>
          <input className="input" placeholder="Ej: turno de la tarde…" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <button
          className="btn btn--income btn--block"
          disabled={!canSave}
          onClick={() => onSave({ date: dayKeyToTs(dayKey), tokens, note })}
        >
          {entry ? 'Guardar cambios' : 'Registrar'}
        </button>

        {onDelete && (
          <button
            className="btn btn--ghost btn--block"
            onClick={() => {
              if (confirm('¿Borrar este registro? Se recalcula todo.')) onDelete()
            }}
          >
            🗑️ Borrar registro
          </button>
        )}
      </div>
    </Sheet>
  )
}

/* ---------- Hoja: poner / editar meta semanal ---------- */
function GoalSheet({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean
  current: number
  onClose: () => void
  onSave: (goal: number) => void
}) {
  const [raw, setRaw] = useState('')
  useEffect(() => {
    if (open) setRaw(current > 0 ? String(current) : '')
  }, [open, current])
  const goal = Math.max(0, Math.round(Number(raw.replace(/[^\d]/g, '')) || 0))

  return (
    <Sheet open={open} onClose={onClose} title="Meta semanal 🎯">
      <div className="stack">
        <p className="screen-sub">¿Cuántos tokens quieres hacer cada semana?</p>
        <div className="amount amount--transfer">
          <span className="amount__cur">🪙</span>
          <input
            className="amount__big"
            inputMode="numeric"
            placeholder="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            autoFocus
          />
        </div>
        <p className="screen-sub" style={{ paddingLeft: 2 }}>
          Cada semana que la cumplas, desbloqueas un premio glam 💋. Puedes cambiarla cuando
          quieras (no te quita premios ya ganados).
        </p>
        <button className="btn btn--primary btn--block" disabled={goal <= 0} onClick={() => onSave(goal)}>
          Guardar meta
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- Helpers ---------- */
function weekBounds(ts: number): [number, number] {
  const [y, m, d] = weekKeyOf(ts).split('-').map(Number) // lunes de esa semana
  const start = new Date(y, m - 1, d).getTime()
  return [start, start + 7 * 86400000 - 1]
}

function prizeIdForGoal(n: number): string {
  const order = ['rubi', 'gl_makeup', 'gl_choker', 'midnight', 'gl_earrings', 'gl_lacebow', 'gold', 'gl_boa', 'gl_mask', 'velvet']
  return order[n - 1] ?? ''
}

interface Bar {
  label: string
  value: number
}
function buildBars(entries: TokenEntry[], unit: Unit, range: { start: number; end: number }): Bar[] {
  const byDay = totalsByDay(entries)
  const bars: Bar[] = []
  if (unit === 'week') {
    for (let i = 0; i < 7; i++) {
      const d = new Date(range.start)
      d.setDate(d.getDate() + i)
      bars.push({ label: DOW[i], value: byDay.get(localDayKey(d.getTime())) ?? 0 })
    }
  } else if (unit === 'month') {
    const d = new Date(range.start)
    while (d.getTime() <= range.end) {
      const day = d.getDate()
      bars.push({ label: day % 5 === 0 || day === 1 ? String(day) : '', value: byDay.get(localDayKey(d.getTime())) ?? 0 })
      d.setDate(d.getDate() + 1)
    }
  }
  return bars
}
