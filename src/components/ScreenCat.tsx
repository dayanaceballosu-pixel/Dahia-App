import { useApp } from '../store/store'
import Cat, { type CatContext } from './Cat/Cat'

/** Gatito pequeño que se asoma en una esquina de las pantallas secundarias
 *  (estilo Clippy). Respeta el ajuste de presencia del gato. */
export default function ScreenCat({ context }: { context: CatContext }) {
  const { profile, gamification } = useApp()
  if (profile.catPresence === 'low') return null
  return (
    <div className="screencat" aria-hidden="false">
      <Cat
        size={70}
        equipped={gamification.equipped}
        skin={gamification.skin}
        context={context}
        alive
      />
    </div>
  )
}
