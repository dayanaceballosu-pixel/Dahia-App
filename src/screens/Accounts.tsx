import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../store/store'
import Money from '../components/Money'
import Sheet from '../components/ui/Sheet'
import { allBalances } from '../data/selectors'
import { PALETTE } from '../data/seed'
import { lastEmoji } from '../lib/emoji'
import { parseAmountToCents } from '../lib/money'
import type { Account } from '../data/types'
import './Accounts.css'

const EMOJI_SUGGEST = ['💵', '🏦', '🐷', '💳', '📱', '💖', '✨', '🪙', '👛', '🎀']

export default function Accounts() {
  const { accounts, movements, addAccount, updateAccount, archiveAccount, addMovement } = useApp()
  const balances = useMemo(() => allBalances(movements), [movements])

  const active = accounts.filter((a) => !a.archived).sort((a, b) => a.order - b.order)
  const archived = accounts.filter((a) => a.archived)

  const [editing, setEditing] = useState<Account | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <main className="screen">
      <div className="screen-head">
        <div>
          <h1>Cuentas 💳</h1>
          <p className="screen-sub">Dónde tienes tu plata</p>
        </div>
        <button className="iconbtn" onClick={() => setCreating(true)} aria-label="Nueva cuenta">
          ＋
        </button>
      </div>

      {active.length === 0 ? (
        <div className="card empty">
          <h3>Aún no tienes cuentas 🐱</h3>
          <p>Crea tu primera cuenta: Nequi, Efectivo, Bancolombia… la que uses.</p>
          <button className="btn btn--primary btn--block" style={{ marginTop: 14 }} onClick={() => setCreating(true)}>
            Crear cuenta
          </button>
        </div>
      ) : (
        <div className="list">
          {active.map((a) => {
            const bal = balances.get(a.id) ?? 0
            return (
              <button key={a.id} className="row" onClick={() => setEditing(a)} style={{ textAlign: 'left', width: '100%' }}>
                <span
                  className="row__icon"
                  style={{ background: a.color ? hexTint(a.color) : 'var(--primary-tint)' }}
                >
                  {a.emoji}
                </span>
                <span className="row__main">
                  <span className="row__title">{a.name}</span>
                  <span className="row__sub">Toca para editar</span>
                </span>
                <span className="row__right" style={{ color: bal < 0 ? 'var(--expense)' : undefined }}>
                  <Money value={bal} />
                </span>
              </button>
            )
          })}
        </div>
      )}

      {archived.length > 0 && (
        <details className="archived">
          <summary>Archivadas ({archived.length})</summary>
          <div className="list" style={{ marginTop: 10 }}>
            {archived.map((a) => (
              <div key={a.id} className="row" style={{ opacity: 0.7 }}>
                <span className="row__icon">{a.emoji}</span>
                <span className="row__main">
                  <span className="row__title">{a.name}</span>
                  <span className="row__sub">Archivada</span>
                </span>
                <button className="btn btn--sm btn--ghost" onClick={() => archiveAccount(a.id, false)}>
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      <AccountEditor
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(data) => {
          const acc = addAccount({ name: data.name, emoji: data.emoji, color: data.color })
          if (data.initialCents !== 0) {
            addMovement({
              type: 'adjust',
              amount: Math.abs(data.initialCents),
              accountId: acc.id,
              direction: data.initialCents < 0 ? 'out' : 'in',
              note: 'Saldo inicial',
            })
          }
          setCreating(false)
        }}
      />

      <AccountEditor
        open={!!editing}
        account={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSave={(data) => {
          if (editing)
            updateAccount({ ...editing, name: data.name, emoji: data.emoji, color: data.color })
          setEditing(null)
        }}
        onArchive={
          editing
            ? () => {
                archiveAccount(editing.id, true)
                setEditing(null)
              }
            : undefined
        }
      />
    </main>
  )
}

function AccountEditor({
  open,
  account,
  onClose,
  onSave,
  onArchive,
}: {
  open: boolean
  account?: Account
  onClose: () => void
  onSave: (data: { name: string; emoji: string; color: string; initialCents: number }) => void
  onArchive?: () => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💵')
  const [color, setColor] = useState('')
  const [balRaw, setBalRaw] = useState('')

  useEffect(() => {
    if (open) {
      setName(account?.name ?? '')
      setEmoji(account?.emoji ?? EMOJI_SUGGEST[Math.floor(Math.random() * EMOJI_SUGGEST.length)])
      // sugerir un color si no tiene
      setColor(account?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)])
      setBalRaw('')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const initialCents = parseAmountToCents(balRaw)
  const missingBalance = !account && balRaw.trim() === ''

  return (
    <Sheet open={open} onClose={onClose} title={account ? 'Editar cuenta' : 'Nueva cuenta'}>
      <div className="stack">
        <div className="acc-preview">
          <span className="acc-preview__icon" style={{ background: color ? hexTint(color) : 'var(--primary-tint)' }}>
            {emoji || '💼'}
          </span>
          <span className="acc-preview__name">{name || 'Nombre de la cuenta'}</span>
        </div>

        <div className="field">
          <label>Nombre</label>
          <input className="input" placeholder="Ej: Nequi" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div className="field">
          <label>Emoji</label>
          <div className="rowflex">
            <input
              className="input emoji-input"
              value={emoji}
              onChange={(e) => setEmoji(lastEmoji(e.target.value))}
              placeholder="😺"
              aria-label="Emoji de la cuenta"
            />
            <div className="chips-scroll no-scrollbar">
              {EMOJI_SUGGEST.map((e) => (
                <button key={e} className={`emoji-chip ${emoji === e ? 'emoji-chip--on' : ''}`} onClick={() => setEmoji(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <p className="screen-sub" style={{ paddingLeft: 2 }}>
            Toca el cuadro y abre el teclado de emojis 😺 — el que quieras. Los de la derecha son atajos.
          </p>
        </div>

        <div className="field">
          <label>Color</label>
          <div className="swatches">
            <button
              className={`swatch swatch--none ${!color ? 'swatch--on' : ''}`}
              onClick={() => setColor('')}
              title="Sin color"
            >
              ∅
            </button>
            {PALETTE.map((c) => (
              <button
                key={c}
                className={`swatch ${color === c ? 'swatch--on' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {!account && (
          <div className="field">
            <label>Saldo inicial</label>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0"
              value={balRaw}
              onChange={(e) => setBalRaw(e.target.value)}
            />
            <p className="screen-sub" style={{ paddingLeft: 2 }}>
              ¿Cuánto hay en esta cuenta ahora? Si está vacía, escribe <b>0</b>.{' '}
              {initialCents !== 0 && (
                <>
                  Empezará con <Money value={initialCents} />.
                </>
              )}
              <br />
              No cuenta como ingreso en tus estadísticas.
            </p>
          </div>
        )}

        <button
          className="btn btn--primary btn--block"
          disabled={!name.trim() || missingBalance}
          onClick={() => onSave({ name, emoji, color, initialCents })}
        >
          {account ? 'Guardar cambios' : 'Crear cuenta'}
        </button>

        {onArchive && (
          <button className="btn btn--ghost btn--block" onClick={onArchive}>
            Archivar cuenta
          </button>
        )}
      </div>
    </Sheet>
  )
}

function hexTint(hex: string): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return 'var(--primary-tint)'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.18)`
}
