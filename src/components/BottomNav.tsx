import { NavLink, useLocation } from 'react-router-dom'
import './BottomNav.css'

const ITEMS = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/movimientos', icon: '📜', label: 'Movimientos' },
  { to: '/cuentas', icon: '💳', label: 'Cuentas' },
  { to: '/ajustes', icon: '⚙️', label: 'Ajustes' },
]

interface BottomNavProps {
  onAdd: () => void
  addOpen?: boolean
}

export default function BottomNav({ onAdd, addOpen = false }: BottomNavProps) {
  const loc = useLocation()
  return (
    <nav className="bottomnav">
      <div className="bottomnav__bar">
        <NavItem item={ITEMS[0]} active={loc.pathname === '/'} />
        <NavItem item={ITEMS[1]} active={loc.pathname.startsWith('/movimientos')} />

        <button
          className={`fab ${addOpen ? 'fab--open' : ''}`}
          onClick={onAdd}
          aria-label="Registrar movimiento"
        >
          <span className="fab__plus">+</span>
        </button>

        <NavItem item={ITEMS[2]} active={loc.pathname.startsWith('/cuentas')} />
        <NavItem item={ITEMS[3]} active={loc.pathname.startsWith('/ajustes')} />
      </div>
    </nav>
  )
}

function NavItem({
  item,
  active,
}: {
  item: { to: string; icon: string; label: string }
  active: boolean
}) {
  return (
    <NavLink to={item.to} className={`navitem ${active ? 'navitem--active' : ''}`}>
      <span className="navitem__icon">{item.icon}</span>
      <span className="navitem__label">{item.label}</span>
    </NavLink>
  )
}
