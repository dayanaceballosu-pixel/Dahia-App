import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import Cat, { type CatMood } from '../components/Cat/Cat'
import CatStage from '../components/Cat/CatStage'
import Money from '../components/Money'
import MovementRow from '../components/MovementRow'
import { useSheets } from '../components/SheetsContext'
import { totalBalance, sortedDesc } from '../data/selectors'
import { localDayKey } from '../lib/date'
import './Home.css'

export default function Home() {
  const { profile, accounts, movements, gamification, claimDaily, updateProfile } = useApp()
  const { openAdd } = useSheets()
  const navigate = useNavigate()
  const [mood, setMood] = useState<CatMood>('idle')
  const [toast, setToast] = useState<string | null>(null)

  const total = useMemo(() => totalBalance(accounts, movements), [accounts, movements])
  const recent = useMemo(() => sortedDesc(movements).slice(0, 4), [movements])
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
    flashToast(`🎁 +${r.reward} Michi-coins · racha de ${r.streak} 🔥`)
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
        <button className="coinpill tap" title="Ir a la tienda" onClick={() => navigate('/tienda')}>
          🪙 <b>{gamification.coins}</b>
        </button>
      </header>

      {/* Tarjeta de saldo + gato */}
      <section className="balancecard">
        <div className="balancecard__cat">
          <CatStage background={gamification.background} size={168}>
            <Cat
              size={132}
              mood={mood}
              equipped={gamification.equipped}
              skin={gamification.skin}
            />
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
          <Money value={total} hidden={profile.hideBalance} />
        </div>
        <p className="balancecard__sub">
          {accounts.filter((a) => !a.archived).length} cuenta
          {accounts.filter((a) => !a.archived).length === 1 ? '' : 's'} activa
          {accounts.filter((a) => !a.archived).length === 1 ? '' : 's'}
        </p>
      </section>

      {/* Racha diaria */}
      {!claimedToday && (
        <button className="dailycard" onClick={onClaim}>
          <span className="dailycard__flame">🔥</span>
          <span className="grow">
            <b>¡Entra y gana!</b>
            <span className="dailycard__sub">Reclama tus Michi-coins de hoy</span>
          </span>
          <span className="dailycard__cta">Reclamar</span>
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
