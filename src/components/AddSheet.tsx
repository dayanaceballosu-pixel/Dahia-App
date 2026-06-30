import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sheet from './ui/Sheet'
import Cat from './Cat/Cat'
import { useApp } from '../store/store'
import { parseAmountToCents } from '../lib/money'
import { PALETTE } from '../data/seed'
import type { Category, Movement, MovementType } from '../data/types'
import './AddSheet.css'

interface AddSheetProps {
  open: boolean
  edit?: Movement | null
  onClose: () => void
}

type Step = 'type' | 'form' | 'done'

const TYPE_META: Record<
  MovementType,
  { label: string; emoji: string; cls: string; verb: string }
> = {
  income: { label: 'Ingreso', emoji: '💚', cls: 'income', verb: 'Entró' },
  expense: { label: 'Gasto', emoji: '🛍️', cls: 'expense', verb: 'Salió' },
  transfer: { label: 'Transferencia', emoji: '🔁', cls: 'transfer', verb: 'Moviste' },
  adjust: { label: 'Ajuste de saldo', emoji: '⚖️', cls: 'adjust', verb: 'Ajuste' },
}

export default function AddSheet({ open, edit, onClose }: AddSheetProps) {
  const { accounts, categories, addMovement, updateMovement, deleteMovement, addCategory } = useApp()
  const navigate = useNavigate()
  const active = useMemo(() => accounts.filter((a) => !a.archived), [accounts])
  const isEdit = !!edit

  const [step, setStep] = useState<Step>('type')
  const [type, setType] = useState<MovementType>('expense')
  const [amountRaw, setAmountRaw] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    if (edit) {
      setStep('form')
      setType(edit.type)
      setAmountRaw(String(edit.amount / 100))
      setCategoryId(edit.categoryId ?? '')
      setNote(edit.note ?? '')
      setDirection(edit.direction ?? 'in')
      setAccountId(edit.accountId)
      setToAccountId(edit.toAccountId ?? active.find((a) => a.id !== edit.accountId)?.id ?? '')
    } else {
      setStep('type')
      setAmountRaw('')
      setCategoryId('')
      setNote('')
      setDirection('in')
      setAccountId(active[0]?.id ?? '')
      setToAccountId(active[1]?.id ?? '')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const cents = parseAmountToCents(amountRaw)
  const meta = TYPE_META[type]

  const canSave =
    cents > 0 &&
    !!accountId &&
    (type !== 'transfer' || (!!toAccountId && toAccountId !== accountId))

  function pickType(t: MovementType) {
    setType(t)
    setStep('form')
  }

  function save() {
    if (!canSave) return
    if (edit) {
      updateMovement({
        ...edit,
        type,
        amount: cents,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        categoryId: type === 'income' || type === 'expense' ? categoryId || undefined : undefined,
        direction: type === 'adjust' ? direction : undefined,
        note: note.trim() || undefined,
      })
      onClose()
      return
    }
    addMovement({
      type,
      amount: cents,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'income' || type === 'expense' ? categoryId || undefined : undefined,
      direction: type === 'adjust' ? direction : undefined,
      note,
    })
    setStep('done')
    window.setTimeout(() => {
      onClose()
    }, 1300)
  }

  function remove() {
    if (!edit) return
    if (confirm('¿Borrar este movimiento? Los saldos se recalculan solos.')) {
      deleteMovement(edit.id)
      onClose()
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar movimiento' : step === 'type' ? '¿Qué registramos?' : undefined}
    >
      {step === 'type' && (
        <div className="typegrid">
          <button className="typebtn typebtn--income" onClick={() => pickType('income')}>
            <span className="typebtn__emoji">💚</span>
            <span>Ingreso</span>
          </button>
          <button className="typebtn typebtn--expense" onClick={() => pickType('expense')}>
            <span className="typebtn__emoji">🛍️</span>
            <span>Gasto</span>
          </button>
          <button className="typebtn typebtn--transfer" onClick={() => pickType('transfer')}>
            <span className="typebtn__emoji">🔁</span>
            <span>Transferencia</span>
          </button>
          <button className="adjustlink" onClick={() => pickType('adjust')}>
            ⚖️ Ajuste de saldo
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className={`addform addform--${meta.cls}`}>
          <button className="addform__back" onClick={() => (isEdit ? onClose() : setStep('type'))}>
            ‹ {meta.emoji} {meta.label}
          </button>

          {active.length === 0 ? (
            <div className="empty" style={{ paddingBottom: 20 }}>
              <h3>Primero una cuenta 💳</h3>
              <p>Crea una cuenta (Nequi, Efectivo…) para empezar a registrar.</p>
              <button
                className="btn btn--primary btn--block"
                style={{ marginTop: 14 }}
                onClick={() => {
                  onClose()
                  navigate('/cuentas')
                }}
              >
                Crear mi primera cuenta
              </button>
            </div>
          ) : (
            <>
              {/* Monto — un solo número grande */}
              <div className={`amount amount--${meta.cls}`}>
                <span className="amount__cur">$</span>
                <input
                  className="amount__big"
                  inputMode="decimal"
                  placeholder="0"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Cuenta */}
              <div className="field">
                <label>{type === 'transfer' ? 'Desde' : 'Cuenta'}</label>
                <AccountChips
                  accounts={active}
                  value={accountId}
                  onChange={setAccountId}
                />
              </div>

              {/* Transfer destino */}
              {type === 'transfer' && (
                <div className="field">
                  <label>Hacia</label>
                  <AccountChips
                    accounts={active.filter((a) => a.id !== accountId)}
                    value={toAccountId}
                    onChange={setToAccountId}
                  />
                </div>
              )}

              {/* Categoría (ingreso/gasto) */}
              {(type === 'income' || type === 'expense') && (
                <div className="field">
                  <label>Categoría</label>
                  <CategoryPicker
                    categories={categories}
                    value={categoryId}
                    onSelect={setCategoryId}
                    onCreate={(name) => {
                      const cat = addCategory({
                        name,
                        emoji: '🏷️',
                        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
                      })
                      setCategoryId(cat.id)
                    }}
                  />
                </div>
              )}

              {/* Dirección (ajuste) */}
              {type === 'adjust' && (
                <div className="field">
                  <label>Tipo de ajuste</label>
                  <div className="rowflex">
                    <button
                      className={`chip ${direction === 'in' ? 'chip--active' : ''}`}
                      onClick={() => setDirection('in')}
                    >
                      ➕ Sumar
                    </button>
                    <button
                      className={`chip ${direction === 'out' ? 'chip--active' : ''}`}
                      onClick={() => setDirection('out')}
                    >
                      ➖ Restar
                    </button>
                  </div>
                  <p className="addform__hint">No cuenta como ingreso/gasto en tus estadísticas.</p>
                </div>
              )}

              {/* Nota */}
              <div className="field">
                <label>Nota (opcional)</label>
                <input
                  className="input"
                  placeholder="Ej: pago tatuaje brazo…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button
                className={`btn btn--${meta.cls} btn--block`}
                disabled={!canSave}
                onClick={save}
              >
                {isEdit ? 'Guardar cambios' : `Guardar ${meta.label.toLowerCase()}`}
              </button>

              {isEdit && (
                <button className="btn btn--ghost btn--block" onClick={remove}>
                  🗑️ Borrar movimiento
                </button>
              )}
            </>
          )}
        </div>
      )}

      {step === 'done' && (
        <div className="done">
          <Cat size={140} mood="celebrate" alive={false} />
          <h3>¡Guardado! 🎉</h3>
          <p className="t-soft">+2 Michi-coins 🪙</p>
        </div>
      )}
    </Sheet>
  )
}

/* --------- Selector de cuenta en chips --------- */
function AccountChips({
  accounts,
  value,
  onChange,
}: {
  accounts: { id: string; name: string; emoji: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="chips-scroll no-scrollbar">
      {accounts.map((a) => (
        <button
          key={a.id}
          className={`chip ${value === a.id ? 'chip--active' : ''}`}
          onClick={() => onChange(a.id)}
        >
          {a.emoji} {a.name}
        </button>
      ))}
    </div>
  )
}

/* --------- Selector de categoría con autocompletado --------- */
function CategoryPicker({
  categories,
  value,
  onSelect,
  onCreate,
}: {
  categories: Category[]
  value: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
}) {
  const [q, setQ] = useState('')
  const [openList, setOpenList] = useState(false)
  const selected = categories.find((c) => c.id === value)

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [categories],
  )
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return sorted
    return sorted.filter((c) => c.name.toLowerCase().includes(needle))
  }, [sorted, q])

  const exact = categories.some((c) => c.name.toLowerCase() === q.trim().toLowerCase())

  if (selected && !openList) {
    return (
      <button
        className="cat-selected"
        onClick={() => {
          setOpenList(true)
          setQ('')
        }}
      >
        <span className="cat-dot" style={{ background: selected.color }} />
        {selected.emoji} {selected.name}
        <span className="cat-selected__change">cambiar</span>
      </button>
    )
  }

  return (
    <div className="catpicker">
      <input
        className="input"
        placeholder="Busca o crea una categoría…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpenList(true)}
        autoFocus={openList}
      />
      <div className="catpicker__list no-scrollbar">
        {filtered.map((c) => (
          <button
            key={c.id}
            className="catpicker__opt"
            onClick={() => {
              onSelect(c.id)
              setOpenList(false)
            }}
          >
            <span className="cat-dot" style={{ background: c.color }} />
            {c.emoji} {c.name}
          </button>
        ))}
        {q.trim() && !exact && (
          <button
            className="catpicker__opt catpicker__create"
            onClick={() => {
              onCreate(q.trim())
              setOpenList(false)
            }}
          >
            ➕ Crear «{q.trim()}»
          </button>
        )}
      </div>
    </div>
  )
}
