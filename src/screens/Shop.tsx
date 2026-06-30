import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import Cat from '../components/Cat/Cat'
import CatStage from '../components/Cat/CatStage'
import {
  SHOP_ITEMS,
  FREE_DEFAULTS,
  isUnlocked,
  inSeason,
  type ItemKind,
  type ShopItem,
} from '../data/shop'
import './Shop.css'

const TABS: { kind: ItemKind; label: string; emoji: string }[] = [
  { kind: 'accessory', label: 'Accesorios', emoji: '🎀' },
  { kind: 'skin', label: 'Skins', emoji: '🐱' },
  { kind: 'background', label: 'Fondos', emoji: '🖼️' },
]

const MES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default function Shop() {
  const { gamification, buyItem, toggleEquip, selectSkin, selectBackground } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ItemKind>('accessory')
  const [toast, setToast] = useState<string | null>(null)
  const month = new Date().getMonth() + 1

  const items = useMemo(
    () => SHOP_ITEMS.filter((i) => i.kind === tab),
    [tab],
  )

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1900)
  }

  function owned(id: string) {
    return gamification.owned.includes(id) || FREE_DEFAULTS.includes(id)
  }

  function onTap(item: ShopItem) {
    const unlocked = isUnlocked(item, gamification)
    const seasonOk = inSeason(item, month)

    if (!seasonOk) {
      flash(`Disponible en ${MES[item.seasonal![0]]} 🎄`)
      return
    }
    if (!unlocked) {
      flash(`🔒 ${item.unlock!.label}`)
      return
    }

    // ya lo tiene
    if (owned(item.id)) {
      if (item.kind === 'accessory') {
        toggleEquip(item.id)
      } else if (item.kind === 'skin') {
        selectSkin(item.id)
        flash('¡Skin aplicado! 🐱')
      } else {
        selectBackground(item.id)
        flash('¡Fondo aplicado! 🖼️')
      }
      return
    }

    // comprar
    const ok = buyItem(item)
    if (!ok) flash('Te faltan Michi-coins 🥲')
    else flash(`¡Compraste ${item.name}! 🎉`)
  }

  function statusLabel(item: ShopItem): { text: string; cls: string } {
    if (!inSeason(item, month)) return { text: `🎄 ${MES[item.seasonal![0]]}`, cls: 'locked' }
    if (!isUnlocked(item, gamification)) return { text: `🔒 ${item.unlock!.value} días`, cls: 'locked' }
    if (owned(item.id)) {
      if (item.kind === 'accessory') {
        return gamification.equipped.includes(item.id)
          ? { text: '✓ puesto', cls: 'on' }
          : { text: 'guardado', cls: 'have' }
      }
      const active = item.kind === 'skin' ? gamification.skin === item.id : gamification.background === item.id
      return active ? { text: '✓ activo', cls: 'on' } : { text: 'usar', cls: 'have' }
    }
    return { text: `🪙 ${item.price}`, cls: 'price' }
  }

  return (
    <main className="screen shop">
      <div className="screen-head">
        <button className="iconbtn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <div style={{ flex: 1 }}>
          <h1>Tienda 🛍️</h1>
          <p className="screen-sub">Viste a tu michi</p>
        </div>
        <span className="coinpill">🪙 <b>{gamification.coins}</b></span>
      </div>

      {/* Vista previa */}
      <div className="shop-preview">
        <CatStage background={gamification.background} size={190}>
          <Cat size={150} equipped={gamification.equipped} skin={gamification.skin} alive />
        </CatStage>
      </div>

      {/* Pestañas */}
      <div className="rowflex" style={{ gap: 8, justifyContent: 'center' }}>
        {TABS.map((t) => (
          <button
            key={t.kind}
            className={`chip ${tab === t.kind ? 'chip--active' : ''}`}
            onClick={() => setTab(t.kind)}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Grid de ítems */}
      <div className="shopgrid">
        {items.map((item) => {
          const st = statusLabel(item)
          return (
            <button key={item.id} className={`shopitem shopitem--${st.cls}`} onClick={() => onTap(item)}>
              <span className="shopitem__emoji">{item.emoji}</span>
              <span className="shopitem__name">{item.name}</span>
              <span className={`shopitem__status status--${st.cls}`}>{st.text}</span>
            </button>
          )
        })}
      </div>

      <p className="shop-foot">
        Gana Michi-coins entrando cada día 🔥 y registrando tus movimientos.
      </p>

      {toast && <div className="toast-pop">{toast}</div>}
    </main>
  )
}
