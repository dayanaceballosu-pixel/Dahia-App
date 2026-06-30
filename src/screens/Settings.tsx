import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import type { ThemePref } from '../data/types'

const THEMES: { value: ThemePref; label: string; emoji: string }[] = [
  { value: 'light', label: 'Claro', emoji: '☀️' },
  { value: 'dark', label: 'Oscuro', emoji: '🌙' },
  { value: 'system', label: 'Auto', emoji: '🪄' },
]

export default function Settings() {
  const { profile, updateProfile, gamification, resetAll } = useApp()
  const navigate = useNavigate()

  return (
    <main className="screen">
      <div className="screen-head">
        <div>
          <h1>Ajustes ⚙️</h1>
          <p className="screen-sub">Tu app, a tu manera</p>
        </div>
      </div>

      {/* Accesos */}
      <div className="list">
        <button className="row" onClick={() => navigate('/tienda')} style={{ width: '100%', textAlign: 'left' }}>
          <span className="row__icon">🛍️</span>
          <span className="row__main">
            <span className="row__title">Tienda del michi</span>
            <span className="row__sub">Desbloquea con tu racha 🔥</span>
          </span>
          <span className="streakpill">🔥 <b>{gamification.bestStreak ?? 0}</b></span>
        </button>
        <button className="row" onClick={() => navigate('/estadisticas')} style={{ width: '100%', textAlign: 'left' }}>
          <span className="row__icon">📊</span>
          <span className="row__main">
            <span className="row__title">Estadísticas</span>
            <span className="row__sub">En qué entra y sale tu plata</span>
          </span>
          <span className="row__right">›</span>
        </button>
      </div>

      {/* Tema */}
      <section className="card stack">
        <p className="t-label">Apariencia</p>
        <div className="rowflex" style={{ gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`chip ${profile.theme === t.value ? 'chip--active' : ''}`}
              onClick={() => updateProfile({ theme: t.value })}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gato */}
      <section className="card stack">
        <p className="t-label">Tu gatito 🐱</p>
        <div className="field">
          <label>Nombre del gato</label>
          <input
            className="input"
            value={profile.catName}
            onChange={(e) => updateProfile({ catName: e.target.value })}
            placeholder="Michi"
          />
        </div>
        <div className="spread">
          <span className="grow">
            <b style={{ fontSize: 14 }}>Presencia</b>
            <p className="screen-sub">Qué tanto aparece haciendo cositas</p>
          </span>
          <div className="rowflex" style={{ gap: 6 }}>
            {(['full', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                className={`chip ${profile.catPresence === p ? 'chip--active' : ''}`}
                onClick={() => updateProfile({ catPresence: p })}
              >
                {p === 'full' ? 'Mucho' : p === 'medium' ? 'Medio' : 'Poco'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Racha */}
      <section className="card spread">
        <span className="grow">
          <b style={{ fontSize: 14 }}>Tu racha 🔥</b>
          <p className="screen-sub">
            Actual: {gamification.streak} {gamification.streak === 1 ? 'día' : 'días'} · récord:{' '}
            {gamification.bestStreak ?? 0}
          </p>
        </span>
        <span className="streakpill">🔥 <b>{gamification.streak}</b></span>
      </section>

      {/* Datos */}
      <section className="card stack">
        <p className="t-label">Datos</p>
        <p className="screen-sub" style={{ marginBottom: 4 }}>
          Por ahora tus datos viven en este dispositivo. Cuando conectemos la nube, se
          sincronizarán solos.
        </p>
        <button
          className="btn btn--ghost btn--block"
          onClick={() => {
            if (confirm('¿Seguro? Esto borra TODOS los datos de prueba de este dispositivo.')) {
              resetAll()
            }
          }}
        >
          🗑️ Borrar todo y empezar de cero
        </button>
      </section>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
        Dahia App · hecha con 💗
      </p>
    </main>
  )
}
