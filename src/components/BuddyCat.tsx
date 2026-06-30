import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useApp } from '../store/store'
import Cat, { type CatContext } from './Cat/Cat'

/** El gato "compartido": en Inicio vive grande en la tarjeta del saldo, y en
 *  las pantallas secundarias se encoge y se va a la esquina, sobre la barra.
 *  La transición la hace framer-motion vía layoutId="catbuddy" (el mismo gato
 *  de Inicio lleva ese layoutId). */
const ROUTE_CONTEXT: Record<string, CatContext> = {
  '/movimientos': 'movements',
  '/cuentas': 'accounts',
  '/estadisticas': 'stats',
  '/ajustes': 'settings',
}

export const BUDDY_SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const

export default function BuddyCat() {
  const { profile, gamification } = useApp()
  const loc = useLocation()
  const context = ROUTE_CONTEXT[loc.pathname]

  // Solo en pantallas secundarias (en Inicio el gato grande lleva el layoutId).
  if (!context || profile.catPresence === 'low') return null
  const wander = profile.catPresence === 'full'

  return (
    <motion.div layoutId="catbuddy" className="screencat" transition={BUDDY_SPRING}>
      <div className={`screencat__walk ${wander ? 'screencat__walk--on' : ''}`}>
        <Cat
          size={68}
          equipped={gamification.equipped}
          skin={gamification.skin}
          context={context}
          alive
        />
      </div>
    </motion.div>
  )
}
