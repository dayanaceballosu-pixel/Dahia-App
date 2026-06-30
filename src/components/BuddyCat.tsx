import { motion } from 'framer-motion'
import { useApp } from '../store/store'
import Cat, { type CatContext } from './Cat/Cat'

/** Gatito de la barra: aparece deslizándose desde el costado (derecha) y se
 *  esconde por el mismo lado al salir. La visibilidad la decide <Layout> con
 *  <AnimatePresence>. */
export const BUDDY_SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const

export const ROUTE_CONTEXT: Record<string, CatContext> = {
  '/movimientos': 'movements',
  '/cuentas': 'accounts',
  '/estadisticas': 'stats',
  '/ajustes': 'settings',
}

export default function BuddyCat({ context }: { context: CatContext }) {
  const { profile, gamification } = useApp()
  const wander = profile.catPresence === 'full'
  return (
    <motion.div
      className="screencat"
      initial={{ x: 110, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 110, opacity: 0 }}
      transition={BUDDY_SPRING}
    >
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
