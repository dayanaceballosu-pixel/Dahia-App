import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet no-scrollbar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet__grip" />
            {title && <div className="sheet__title">{title}</div>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
