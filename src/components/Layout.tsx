import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutGroup } from 'framer-motion'
import BottomNav from './BottomNav'
import AddSheet from './AddSheet'
import BuddyCat from './BuddyCat'
import { SheetsContext } from './SheetsContext'
import type { Movement } from '../data/types'

export default function Layout() {
  const [addOpen, setAddOpen] = useState(false)
  const [edit, setEdit] = useState<Movement | null>(null)

  const openAdd = useCallback((m?: Movement | null) => {
    setEdit(m ?? null)
    setAddOpen(true)
  }, [])

  const value = useMemo(() => ({ openAdd }), [openAdd])

  return (
    <SheetsContext.Provider value={value}>
      <LayoutGroup>
        <div className="app">
          <Outlet />
          <BuddyCat />
          <BottomNav onAdd={() => openAdd(null)} addOpen={addOpen} />
          <AddSheet
            open={addOpen}
            edit={edit}
            onClose={() => {
              setAddOpen(false)
              setEdit(null)
            }}
          />
        </div>
      </LayoutGroup>
    </SheetsContext.Provider>
  )
}
