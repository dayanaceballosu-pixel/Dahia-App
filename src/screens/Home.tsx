import { useEffect, useMemo, useState } from 'react'
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
import { totalsByCurrency, pendingTransfers, sortedDesc, debtSummary } from '../data/selectors'
import { accountCurrency, isPersonAccount } from '../data/types'
import { weekProgress } from '../data/tokens'
import { pendingCount, duePopupReminders } from '../data/reminders'
import { localDayKey } from '../lib/date'
import PaymentsDuePopup from '../components/PaymentsDuePopup'
import './Home.css'

/** Una vez por sesión (se reinicia al recargar la app): que el popup de
 *  pagos pendientes se asome solo la primera vez que se llega a Inicio. */
let duePopupShownThisSession = false

export default function Home() {
  const { profile, accounts, movements, gamification, goalsMet, tokenEntries, workStats, reminders, notes, claimDaily, updateProfile } = useApp()
  const { openAdd } = useSheets()
  const navigate = useNavigate()
  const [mood, setMood] = useState<CatMood>('idle')
  const [toast, setToast] = useState<string | null>(null)
  const [showDuePopup, setShowDuePopup] = useState(false)

  const totals = useMemo(() => totalsByCurrency(accounts, movements), [accounts, movements])
  const hasUSD = useMemo(
    () => accounts.some((a) => !a.archived && accountCurrency(a) === 'USD'),
    [accounts],
  )
  const pendings = useMemo(() => pendingTransfers(movements), [movements])
  const realCount = useMemo(
    () => accounts.filter((a) => !a.archived && !a.deleted && !isPersonAccount(a)).length,
    [accounts],
  )
  const debts = useMemo(() => debtSummary(accounts, movements), [accounts, movements])
  const tokWeek = useMemo(() => weekProgress(tokenEntries, workStats, 0), [tokenEntries, workStats])
  const remPending = useMemo(() => pendingCount(reminders), [reminders])
  const dueNow = useMemo(() => duePopupReminders(reminders).length, [reminders])
  const recent = useMemo(() => sortedDesc(movements).slice(0, 4), [movements])
  const look = useMemo(
    () => effectiveLook(gamification, new Date().getMonth() + 1, goalsMet),
    [gamification, goalsMet],
  )
  const claimedToday = gamification.lastClaimDate === localDayKey()

  // Al llegar a Inicio por primera vez en la sesión, si hay pagos atrasados,
  // de hoy o de mañana, asomamos el popup una sola vez.
  useEffect(() => {
    if (!duePopupShownThisSession && dueNow > 0) {
      duePopupShownThisSession = true
      setShowDuePopup(true)
    }
  }, [dueNow])

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
          {realCount} cuenta{realCount === 1 ? '' : 's'} activa{realCount === 1 ? '' : 's'}
          {hasUSD ? ' · pesos y dólares por separado' : ''}
        </p>
      </section>

      {/* Deudas y préstamos (personas) — no cuentan en el Saldo total */}
      {(debts.owed > 0 || debts.debt > 0) && (
        <button className="pendingcard" onClick={() => navigate('/cuentas')}>
          <span className="pendingcard__ic">🤝</span>
          <span className="grow">
            <b>Deudas y préstamos</b>
            <span className="dailycard__sub">
              {debts.owed > 0 && <>Te deben <Money value={debts.owed} /></>}
              {debts.owed > 0 && debts.debt > 0 && ' · '}
              {debts.debt > 0 && <>Debes <Money value={debts.debt} /></>}
            </span>
          </span>
          <span className="pendingcard__cta">Ver</span>
        </button>
      )}

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

      {/* Recordatorios de pago pendientes */}
      {remPending > 0 && (
        <button className="pendingcard" onClick={() => navigate('/cuentas')}>
          <span className="pendingcard__ic">🔔</span>
          <span className="grow">
            <b>{remPending} {remPending === 1 ? 'pago por hacer' : 'pagos por hacer'}</b>
            <span className="dailycard__sub">Revisa tus recordatorios en Cuentas 🗓️</span>
          </span>
          <span className="pendingcard__cta">Ver</span>
        </button>
      )}

      {/* Acceso a Mis Tokens (registro de trabajo + metas) */}
      <button className="tokentile" onClick={() => navigate('/tokens')}>
        <span className="tokentile__ic">✨</span>
        <span className="grow">
          <b>Mis Tokens</b>
          {workStats.weeklyGoal > 0 ? (
            <>
              <span className="tokentile__sub">
                Semana: {Math.round(tokWeek.total).toLocaleString('es-CO')} / {Math.round(tokWeek.goal).toLocaleString('es-CO')} 🪙
              </span>
              <span className="tokentile__bar">
                <span className="tokentile__fill" style={{ width: `${tokWeek.pct}%` }} />
              </span>
            </>
          ) : (
            <span className="tokentile__sub">Lleva tu registro y ponte metas 🎯</span>
          )}
        </span>
        <span className="tokentile__cta">›</span>
      </button>

      {/* Acceso a Notitas */}
      <button className="tokentile notestile" onClick={() => navigate('/notas')}>
        <span className="tokentile__ic">🎀</span>
        <span className="grow">
          <b>Notitas</b>
          <span className="tokentile__sub">
            {notes.length > 0
              ? `${notes.length} ${notes.length === 1 ? 'notita guardada' : 'notitas guardadas'} 💭`
              : 'Anota ideas, listas y recados 💭'}
          </span>
        </span>
        <span className="tokentile__cta">›</span>
      </button>

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

      <PaymentsDuePopup open={showDuePopup} onClose={() => setShowDuePopup(false)} />
    </main>
  )
}
