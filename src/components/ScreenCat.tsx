import { useApp } from '../store/store'
import Cat, { type CatContext } from './Cat/Cat'

/** Gatito travieso que vive por ENCIMA de la barra inferior en las pantallas
 *  secundarias: camina de lado a lado, se asoma y se esconde (estilo Clippy).
 *  Respeta el ajuste de presencia:
 *   - Mucho  → camina/se escapa (travieso)
 *   - Medio  → quieto en la esquina
 *   - Poco   → no aparece
 */
export default function ScreenCat({ context }: { context: CatContext }) {
  const { profile, gamification } = useApp()
  if (profile.catPresence === 'low') return null
  const wander = profile.catPresence === 'full'
  return (
    <div className={`screencat ${wander ? 'screencat--wander' : ''}`}>
      <Cat
        size={68}
        equipped={gamification.equipped}
        skin={gamification.skin}
        context={context}
        alive
      />
    </div>
  )
}
