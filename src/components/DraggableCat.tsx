import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'

/**
 * Envuelve al gatito para poder ARRASTRARLO por la pantalla. Mientras lo
 * sostienes se agranda y se menea contento; al soltarlo vuelve solito a su
 * lugar (el centro en Inicio, o su rincón sobre la barra) con un rebotecito.
 * El toque simple (sin arrastrar) sigue disparando las reacciones del gato.
 */
export default function DraggableCat({
  children,
  className,
  onDraggingChange,
}: {
  children: ReactNode
  className?: string
  onDraggingChange?: (dragging: boolean) => void
}) {
  const [dragging, setDragging] = useState(false)

  return (
    <motion.div
      className={className}
      drag
      dragSnapToOrigin // al soltar, regresa a donde estaba
      dragElastic={0.7}
      dragMomentum={false}
      whileDrag={{ scale: 1.15 }}
      onDragStart={() => {
        setDragging(true)
        onDraggingChange?.(true)
      }}
      onDragEnd={() => {
        setDragging(false)
        onDraggingChange?.(false)
      }}
      // el rebote de regreso a su sitio
      dragTransition={{ bounceStiffness: 320, bounceDamping: 18 }}
      style={{
        display: 'inline-block',
        position: 'relative',
        zIndex: dragging ? 60 : undefined,
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none', // en móvil, arrastrar el gato no hace scroll
      }}
    >
      {/* meneo alegre mientras lo sostienes (independiente del arrastre) */}
      <motion.div
        animate={dragging ? { rotate: [0, -8, 8, -8, 8, 0] } : { rotate: 0 }}
        transition={
          dragging
            ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 300, damping: 20 }
        }
        style={{ display: 'inline-block' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
