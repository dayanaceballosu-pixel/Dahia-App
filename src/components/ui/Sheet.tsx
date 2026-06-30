import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect, useState, type FocusEvent, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  const controls = useDragControls()
  const [kb, setKb] = useState(0) // alto del teclado (px) en iOS

  // Bloquear scroll de fondo mientras está abierta
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Detectar el teclado con visualViewport y levantar la hoja por encima de él
  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKb(inset)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      setKb(0)
    }
  }, [open])

  // Centrar el campo enfocado (cuando aparece el teclado)
  function handleFocus(e: FocusEvent) {
    const el = e.target as HTMLElement
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      window.setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 280)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-backdrop"
          style={{ paddingBottom: kb }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet no-scrollbar"
            style={{ maxHeight: kb ? `calc(100dvh - ${kb + 12}px)` : undefined }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
            onClick={(e) => e.stopPropagation()}
            onFocusCapture={handleFocus}
          >
            {/* solo el manija inicia el "deslizar para cerrar" → el cuerpo hace scroll normal */}
            <div
              className="sheet__grip-zone"
              onPointerDown={(e) => controls.start(e)}
              style={{ touchAction: 'none' }}
            >
              <div className="sheet__grip" />
            </div>
            {title && <div className="sheet__title">{title}</div>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
