import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../store/store'
import Cat, { type CatMood } from '../components/Cat/Cat'
import CatStage from '../components/Cat/CatStage'
import { BUDDY_SPRING } from '../components/BuddyCat'
import Money from '../components/Money'
import MovementRow from '../components/MovementRow'
import { useSheets } from '../components/SheetsContext'
import { effectiveLook } from '../data/shop'
import { totalsByCurrency, pendingTransfers, sortedDesc } from '../data/selectors'
import { accountCurrency } from '../data/types'
import { localDayKey } from '../lib/date'
import './Home.css'

export default function Home() {
  const { profile, accounts, movements, gamification, claimDaily, updateProfile } = useApp()
  const { openAdd } = useSheets()
  const navigate = useNavigate()
  const [mood, setMood] = useState<CatMood>('idle')
  const [toast, setToast] = useState<string | null>(null)

  const totals = useMemo(() => totalsByCurrency(accounts, movements), [accounts, movements])
  const hasUSD = useMemo(
    () => accounts.some((a) => !a.archived && accountCurrency(a) === 'USD'),
    [accounts],
  )
  const pendings = useMemo(() => pendingTransfers(movements), [movements])
  const recent = useMemo(() => sortedDesc(movements).slice(0, 4), [movements])
  const look = useMemo(() => effectiveLook(gamification, new Date().getMonth() + 1), [gamification])
  const claimedToday = gamification.lastClaimDate === localDayKey()

  function flashToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function onClaim() {
    const r = claimDaily()
    if (r.already) {
      flashToast('Ya entraste hoy 💕')
      return
    }
    setMood('celebrate')
    if (r.unlocked.length) {
      flashToast(`🔥 ¡Racha de ${r.streak}! Desbloqueaste: ${r.unlocked.join(', ')} 🎉`)
    } else {
      flashToast(`🔥 ¡Racha de ${r.streak} ${r.streak === 1 ? 'día' : 'días'}!`)
    }
    window.setTimeout(() => setMood('idle'), 1800)
  }

  return (
    <main className="screen home">
      {/* Saludo + monedas */}
      <header className="home__top">
        <div>
          <p className="home__hi">¡Hola, {profile.userName}! 🌸</p>
          <p className="screen-sub">Tus cuentas, bonitas y al día</p>
        </div>
        <button className="streakpill tap" title="Tienda y racha" onClick={() => navigate('/tienda')}>
          🔥 <b>{gamification.streak}</b>
        </button>
      </header>

      {/* Tarjeta de saldo + gato */}
      <section className="balancecard">
        <div className="balancecard__cat">
          <CatStage background={look.background} size={168}>
            <motion.div
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={BUDDY_SPRING}
            >
              <Cat size={132} mood={mood} equipped={look.equipped} skin={look.skin} />
            </motion.div>
          </CatStage>
        </div>
        <div className="balancecard__label">
          <span>Saldo total</span>
          <button
            className="eyebtn"
            onClick={() => updateProfile({ hideBalance: !profile.hideBalance })}
            aria-label="Ocultar saldo"
          >
            {profile.hideBalance ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="balancecard__amount">
          <Money value={totals.COP} currency="COP" hidden={profile.hideBalance} />
        </div>
        {hasUSD && (
          <div className="balancecard__amount2">
            <Money value={totals.USD} currency="USD" hidden={profile.hideBalance} />
          </div>
        )}
        <p className="balancecard__sub">
          {accounts.filter((a) => !a.archived).length} cuenta
          {accounts.filter((a) => !a.archived).length === 1 ? '' : 's'} activa
          {accounts.filter((a) => !a.archived).length === 1 ? '' : 's'}
          {hasUSD ? ' · pesos y dólares por separado' : ''}
        </p>
      </section>

      {/* Transferencias en camino (pendientes de confirmar) */}
      {pendings.length > 0 && (
        <button className="pendingcard" onClick={() => navigate('/movimientos')}>
          <span className="pendingcard__ic">⏳</span>
          <span className="grow">
            <b>
              {pendings.length} {pendings.length === 1 ? 'transferencia en camino' : 'transferencias en camino'}
            </b>
            <span className="dailycard__sub">Confírmalas cuando el dinero llegue de verdad 💸</span>
          </span>
          <span className="pendingcard__cta">Ver</span>
        </button>
      )}

      {/* Racha diaria */}
      {!claimedToday && (
        <button className="dailycard" onClick={onClaim}>
          <span className="dailycard__flame">🔥</span>
          <span className="grow">
            <b>¡Entra y suma!</b>
            <span className="dailycard__sub">Mantén tu racha y desbloquea cosas 🔥</span>
          </span>
          <span className="dailycard__cta">Sumar</span>
        </button>
      )}

      {/* Movimientos recientes */}
      <section className="stack">
        <div className="spread">
          <h2 className="t-title">Recientes</h2>
          {movements.length > 0 && (
            <Link to="/movimientos" className="home__link">
              Ver todo ›
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="card empty">
            <h3>Todo empieza aquí ✨</h3>
            <p>
              Toca el botón <b>＋</b> de abajo para registrar tu primer movimiento.
              {accounts.length === 0 && (
                <>
                  {' '}
                  Primero crea una cuenta en <Link to="/cuentas" className="home__link">Cuentas</Link>.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="list">
            {recent.map((m) => (
              <MovementRow key={m.id} movement={m} onClick={openAdd} />
            ))}
          </div>
        )}
      </section>

      {toast && <div className="toast-pop">{toast}</div>}
    </main>
  )
}
