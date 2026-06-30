import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/store'
import Cat from '../components/Cat/Cat'
import CatStage from '../components/Cat/CatStage'
import Sheet from '../components/ui/Sheet'
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
  const { gamification, toggleEquip, selectSkin, selectBackground } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ItemKind>('accessory')
  const [preview, setPreview] = useState<ShopItem | null>(null)
  const month = new Date().getMonth() + 1
  const best = gamification.bestStreak ?? 0

  const items = useMemo(() => SHOP_ITEMS.filter((i) => i.kind === tab), [tab])

  function unlocked(item: ShopItem) {
    return isUnlocked(item, gamification, month)
  }
  function active(item: ShopItem) {
    if (item.kind === 'accessory') return gamification.equipped.includes(item.id)
    if (item.kind === 'skin') return gamification.skin === item.id
    return gamification.background === item.id
  }

  function statusLabel(item: ShopItem): { text: string; cls: string } {
    if (!inSeason(item, month)) return { text: `🎄 ${MES[item.seasonal![0]]}`, cls: 'locked' }
    if (!unlocked(item)) return { text: `🔒 ${item.unlockStreak} días`, cls: 'locked' }
    if (active(item)) return { text: '✓ puesto', cls: 'on' }
    return { text: 'tocar', cls: 'have' }
  }

  return (
    <main className="screen shop">
      <div className="screen-head">
        <button className="iconbtn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <div style={{ flex: 1 }}>
          <h1>Tienda 🛍️</h1>
          <p className="screen-sub">Desbloquea entrando cada día 🔥</p>
        </div>
        <span className="streakpill" title="Racha máxima">
          🔥 <b>{best}</b>
        </span>
      </div>

      {/* Vista previa del outfit actual */}
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
            <button key={item.id} className={`shopitem shopitem--${st.cls}`} onClick={() => setPreview(item)}>
              <span className="shopitem__emoji">{item.emoji}</span>
              <span className="shopitem__name">{item.name}</span>
              <span className={`shopitem__status status--${st.cls}`}>{st.text}</span>
            </button>
          )
        })}
      </div>

      <p className="shop-foot">
        Cada día que entras sube tu racha 🔥 y desbloqueas cosas nuevas para tu michi.
        ¡Y quedan tuyas para siempre!
      </p>

      <PreviewSheet
        item={preview}
        gamification={gamification}
        month={month}
        onClose={() => setPreview(null)}
        onToggleAccessory={(id) => toggleEquip(id)}
        onSelectSkin={(id) => selectSkin(id)}
        onSelectBackground={(id) => selectBackground(id)}
      />
    </main>
  )
}

/* ---------- Hoja de vista previa + confirmación ---------- */
function PreviewSheet({
  item,
  gamification,
  month,
  onClose,
  onToggleAccessory,
  onSelectSkin,
  onSelectBackground,
}: {
  item: ShopItem | null
  gamification: ReturnType<typeof useApp>['gamification']
  month: number
  onClose: () => void
  onToggleAccessory: (id: string) => void
  onSelectSkin: (id: string) => void
  onSelectBackground: (id: string) => void
}) {
  const open = !!item
  const unlocked = item
    ? FREE_DEFAULTS.includes(item.id) || isUnlocked(item, gamification, month)
    : false
  const best = gamification.bestStreak ?? 0

  // outfit de la vista previa (con el ítem puesto, para que se vea cómo queda)
  const equipped = item
    ? item.kind === 'accessory'
      ? Array.from(new Set([...gamification.equipped, item.id]))
      : gamification.equipped
    : gamification.equipped
  const skin = item && item.kind === 'skin' ? item.id : gamification.skin
  const background = item && item.kind === 'background' ? item.id : gamification.background

  const isActive =
    item &&
    (item.kind === 'accessory'
      ? gamification.equipped.includes(item.id)
      : item.kind === 'skin'
        ? gamification.skin === item.id
        : gamification.background === item.id)

  function action() {
    if (!item) return
    if (item.kind === 'accessory') onToggleAccessory(item.id)
    else if (item.kind === 'skin') onSelectSkin(item.id)
    else onSelectBackground(item.id)
  }

  return (
    <Sheet open={open} onClose={onClose} title={item ? `${item.emoji} ${item.name}` : undefined}>
      {item && (
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
          <CatStage background={unlocked ? background : gamification.background} size={188}>
            <Cat
              size={150}
              equipped={unlocked ? equipped : gamification.equipped}
              skin={unlocked ? skin : gamification.skin}
              alive
            />
          </CatStage>

          {unlocked ? (
            <>
              <p className="screen-sub">Así se le ve a tu michi 🐱</p>
              <button
                className={`btn ${isActive ? 'btn--ghost' : 'btn--primary'} btn--block`}
                onClick={() => {
                  action()
                  if (!isActive && item.kind !== 'accessory') onClose()
                }}
              >
                {item.kind === 'accessory'
                  ? isActive
                    ? 'Quitar'
                    : 'Ponérselo'
                  : isActive
                    ? '✓ En uso'
                    : 'Usar este'}
              </button>
            </>
          ) : (
            <div className="preview-locked">
              <div className="preview-locked__big">🔒</div>
              <p>
                Se desbloquea con una racha de <b>{item.unlockStreak} días</b> 🔥
              </p>
              <p className="screen-sub">
                Tu mejor racha es de <b>{best}</b> {best === 1 ? 'día' : 'días'}. ¡Te faltan{' '}
                <b>{Math.max(0, item.unlockStreak - best)}</b>! Entra cada día para lograrlo 💪
              </p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}
