import { useCallback, useEffect, useRef, useState } from 'react'
import './cat.css'

export type CatMood = 'idle' | 'happy' | 'sad' | 'celebrate' | 'sleep'
export type CatContext = 'home' | 'accounts' | 'movements' | 'stats' | 'shop' | 'settings'

interface SkinColors {
  body: string
  shade: string
  ear: string
  earIn: string
  belly: string
}

const SKINS: Record<string, SkinColors> = {
  pink:  { body: '#ffc7e0', shade: '#ffb0d4', ear: '#ff9ec7', earIn: '#ff7fb3', belly: '#fff4fa' },
  cream: { body: '#ffe9c9', shade: '#ffd9a6', ear: '#ffc987', earIn: '#ffb066', belly: '#fff8ec' },
  gray:  { body: '#d8d8e8', shade: '#c2c2d6', ear: '#b6b6cc', earIn: '#9a9ab2', belly: '#f3f3fb' },
  black: { body: '#6e6680', shade: '#5b5468', ear: '#4d4659', earIn: '#3c3647', belly: '#ada6bd' },
}

type Expression = 'open' | 'happy' | 'teary' | 'closed' | 'wide'

/* ---- Reacciones al TOQUE (estilo Clippy: variadas y al azar) ---- */
interface Reaction {
  anim: string // clase -> cat--r-<anim>
  expr?: Expression
  fx: string[]
  phrase: string
  ms: number
}
const REACTIONS: Reaction[] = [
  { anim: 'pounce',    expr: 'happy', fx: ['💗', '💕', '✨'], phrase: '¡miau! 🐾', ms: 700 },
  { anim: 'spin',      expr: 'happy', fx: ['✨', '💫', '⭐'], phrase: '¡weee!', ms: 800 },
  { anim: 'wiggle',    expr: 'happy', fx: ['🎵', '✨', '💗'], phrase: '♪ ~', ms: 900 },
  { anim: 'surprised', expr: 'wide',  fx: ['❗'],             phrase: '¿¡!? ', ms: 700 },
  { anim: 'purr',      expr: 'happy', fx: ['💗', '💗'],       phrase: 'rrronron~ 😻', ms: 1000 },
  { anim: 'think',     expr: 'open',  fx: ['💡'],             phrase: 'mmm… 🤔', ms: 1000 },
  { anim: 'flip',      expr: 'happy', fx: ['⭐', '✨'],       phrase: '¡ta-da! 🤸', ms: 800 },
  { anim: 'hearts',    expr: 'happy', fx: ['💖', '💗', '💕', '💞'], phrase: 'te quiero 💗', ms: 1000 },
  { anim: 'shy',       expr: 'closed', fx: ['💕'],            phrase: 'ay… 😳', ms: 1000 },
  { anim: 'jump',      expr: 'wide',  fx: ['‼️', '✨'],        phrase: '¡hola! 👋', ms: 700 },
]

/* ---- Travesuras ociosas (rotan solas) ---- */
const IDLE_ACTIONS = ['none', 'none', 'sleep', 'stretch', 'chase', 'yarn', 'peek', 'look'] as const
type IdleAction = (typeof IDLE_ACTIONS)[number]

/* ---- Decoración contextual por pantalla ---- */
const CONTEXT_DECOR: Record<CatContext, string | null> = {
  home: null,
  accounts: '🐷',
  movements: '📋',
  stats: '📊',
  shop: '🛍️',
  settings: '🔧',
}

interface CatProps {
  size?: number
  mood?: CatMood
  equipped?: string[]
  skin?: string
  speech?: string | null
  onTap?: () => void
  alive?: boolean
  context?: CatContext
}

interface Fx {
  id: number
  emoji: string
  dx: number
  dy: number
}

export default function Cat({
  size = 180,
  mood = 'idle',
  equipped = [],
  skin = 'pink',
  speech = null,
  onTap,
  alive = true,
  context,
}: CatProps) {
  const c = SKINS[skin] ?? SKINS.pink
  const [reaction, setReaction] = useState<Reaction | null>(null)
  const [idle, setIdle] = useState<IdleAction>('none')
  const [fx, setFx] = useState<Fx[]>([])
  const [bubble, setBubble] = useState<string | null>(null)
  const fxId = useRef(0)
  const bubbleTimer = useRef<number | undefined>(undefined)
  const reactTimer = useRef<number | undefined>(undefined)

  /* rotación de travesuras ociosas */
  useEffect(() => {
    if (!alive || mood !== 'idle') {
      setIdle('none')
      return
    }
    let t: number
    const loop = () => {
      const next = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)]
      setIdle(next)
      const dur = next === 'sleep' ? 5200 : next === 'none' ? 4200 : 2400
      t = window.setTimeout(loop, dur)
    }
    t = window.setTimeout(loop, 3500)
    return () => window.clearTimeout(t)
  }, [alive, mood])

  /* celebrar/feliz lanzan partículas */
  useEffect(() => {
    if (mood === 'celebrate') spawn(['⭐', '🎉', '💖', '✨'])
    if (mood === 'happy') spawn(['💚', '🪙', '✨'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood])

  const spawn = useCallback((emojis: string[]) => {
    const items = emojis.map((emoji, i) => ({
      id: fxId.current++,
      emoji,
      dx: Math.round((i - (emojis.length - 1) / 2) * 26 + (Math.random() - 0.5) * 16),
      dy: Math.round((Math.random() - 0.5) * 16),
    }))
    setFx((f) => [...f, ...items])
    items.forEach((it) => {
      window.setTimeout(() => setFx((f) => f.filter((x) => x.id !== it.id)), 1150)
    })
  }, [])

  const handleTap = useCallback(() => {
    const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
    setReaction(r)
    spawn(r.fx)
    window.clearTimeout(reactTimer.current)
    reactTimer.current = window.setTimeout(() => setReaction(null), r.ms)
    if (!speech) {
      setBubble(r.phrase)
      window.clearTimeout(bubbleTimer.current)
      bubbleTimer.current = window.setTimeout(() => setBubble(null), 1600)
    }
    onTap?.()
  }, [onTap, spawn, speech])

  const sleeping = mood === 'sleep' || idle === 'sleep'
  const expression: Expression = reaction?.expr
    ? reaction.expr
    : mood === 'happy' || mood === 'celebrate'
      ? 'happy'
      : mood === 'sad'
        ? 'teary'
        : sleeping
          ? 'closed'
          : 'open'

  const cls = [
    'cat',
    reaction && `cat--r-${reaction.anim}`,
    mood === 'celebrate' && 'cat--r-hearts',
    !reaction && idle !== 'none' && idle !== 'look' && `cat--i-${idle}`,
  ]
    .filter(Boolean)
    .join(' ')

  const shownBubble = speech ?? bubble
  const decor = context ? CONTEXT_DECOR[context] : null

  return (
    <button type="button" className={cls} style={{ width: size }} onClick={handleTap} aria-label="Gatito">
      {shownBubble && <span className="cat__bubble">{shownBubble}</span>}

      {fx.map((f) => (
        <span key={f.id} className="cat__fx" style={{ left: `calc(50% + ${f.dx}px)`, top: `${28 + f.dy}%` }}>
          {f.emoji}
        </span>
      ))}

      {/* decoración contextual (alcancía, gráfica, etc.) */}
      {decor && <span className="cat__decor">{decor}</span>}
      {/* bolita de estambre (idle) */}
      {idle === 'yarn' && !reaction && <span className="cat__yarn">🧶</span>}
      {/* bombillo (reacción pensar) */}
      {reaction?.anim === 'think' && <span className="cat__bulb">💡</span>}

      <svg viewBox="0 0 240 240" width={size} xmlns="http://www.w3.org/2000/svg">
        <g className="cat__body">
          {/* colita */}
          <path
            className="cat__tail"
            d="M168 178 q44 6 40 -40 q-3 -22 -20 -22 q14 6 12 24 q-2 26 -34 24 z"
            fill={c.shade}
          />
          {/* cuerpo */}
          <ellipse cx="120" cy="180" rx="62" ry="48" fill={c.body} />
          <ellipse cx="120" cy="192" rx="40" ry="28" fill={c.belly} opacity="0.7" />
          <ellipse cx="96" cy="214" rx="17" ry="12" fill={c.shade} />
          <ellipse cx="144" cy="214" rx="17" ry="12" fill={c.shade} />

          {/* bufanda (detrás de la cabeza) */}
          {equipped.includes('scarf') && (
            <g className="cat__acc">
              <path d="M74 150 q46 30 92 0 l0 16 q-46 30 -92 0 Z" fill="#56c596" />
              <path d="M150 162 l16 4 l-4 22 l-14 -6 z" fill="#3fae82" />
            </g>
          )}

          {/* orejas */}
          <path className="cat__earL" d="M74 92 L86 50 L116 78 Z" fill={c.ear} />
          <path d="M166 92 L154 50 L124 78 Z" fill={c.ear} />
          <path d="M83 84 L90 62 L106 78 Z" fill={c.earIn} />
          <path d="M157 84 L150 62 L134 78 Z" fill={c.earIn} />

          {/* cabeza */}
          <circle cx="120" cy="112" r="56" fill={c.body} />

          {/* cachetes */}
          <ellipse cx="84" cy="124" rx="13" ry="8" fill="#ff7aa8" opacity="0.5" />
          <ellipse cx="156" cy="124" rx="13" ry="8" fill="#ff7aa8" opacity="0.5" />

          {/* ojos */}
          {expression === 'open' && (
            <g className="cat__eyes">
              <ellipse cx="98" cy="112" rx="9" ry="12" fill="#4a3b46" />
              <ellipse cx="142" cy="112" rx="9" ry="12" fill="#4a3b46" />
              <circle cx="101" cy="108" r="3" fill="#fff" />
              <circle cx="145" cy="108" r="3" fill="#fff" />
            </g>
          )}
          {expression === 'wide' && (
            <g>
              <circle cx="98" cy="112" r="13" fill="#fff" stroke="#4a3b46" strokeWidth="2.5" />
              <circle cx="142" cy="112" r="13" fill="#fff" stroke="#4a3b46" strokeWidth="2.5" />
              <circle cx="98" cy="113" r="7" fill="#4a3b46" />
              <circle cx="142" cy="113" r="7" fill="#4a3b46" />
              <circle cx="100" cy="110" r="2.5" fill="#fff" />
              <circle cx="144" cy="110" r="2.5" fill="#fff" />
            </g>
          )}
          {expression === 'happy' && (
            <g fill="none" stroke="#4a3b46" strokeWidth="4" strokeLinecap="round">
              <path d="M88 114 q10 -12 20 0" />
              <path d="M132 114 q10 -12 20 0" />
            </g>
          )}
          {expression === 'teary' && (
            <>
              <g fill="none" stroke="#4a3b46" strokeWidth="4" strokeLinecap="round">
                <path d="M88 110 q10 -10 20 0" />
                <path d="M132 110 q10 -10 20 0" />
              </g>
              <ellipse className="cat__tear" cx="96" cy="124" rx="4" ry="6" fill="#7fc8ff" />
            </>
          )}
          {expression === 'closed' && (
            <g fill="none" stroke="#4a3b46" strokeWidth="3.5" strokeLinecap="round">
              <path d="M89 114 q9 8 19 0" />
              <path d="M133 114 q9 8 19 0" />
            </g>
          )}

          {/* nariz + boca */}
          <path d="M116 126 h8 l-4 5 z" fill={c.earIn} />
          {expression === 'teary' ? (
            <path d="M108 140 q12 -8 24 0" fill="none" stroke="#4a3b46" strokeWidth="2.6" strokeLinecap="round" />
          ) : (
            <path
              d="M120 131 q-7 8 -14 2 M120 131 q7 8 14 2"
              fill="none"
              stroke="#4a3b46"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )}

          {/* bigotes */}
          <g stroke="#4a3b46" strokeWidth="1.6" strokeLinecap="round" opacity="0.45">
            <line x1="64" y1="120" x2="84" y2="122" />
            <line x1="64" y1="130" x2="84" y2="129" />
            <line x1="176" y1="120" x2="156" y2="122" />
            <line x1="176" y1="130" x2="156" y2="129" />
          </g>

          {/* gafas */}
          {equipped.includes('glasses') && (
            <g className="cat__acc">
              <circle cx="98" cy="112" r="16" fill="rgba(255,255,255,.22)" stroke="#4a3b46" strokeWidth="3" />
              <circle cx="142" cy="112" r="16" fill="rgba(255,255,255,.22)" stroke="#4a3b46" strokeWidth="3" />
              <line x1="114" y1="110" x2="126" y2="110" stroke="#4a3b46" strokeWidth="3" />
            </g>
          )}

          {/* moño */}
          {equipped.includes('bow') && (
            <g className="cat__acc">
              <path d="M90 56 q-18 -12 -18 4 q0 14 18 6 z" fill="#ff5fa0" />
              <path d="M90 56 q18 -12 18 4 q0 14 -18 6 z" fill="#ff5fa0" />
              <circle cx="90" cy="62" r="6" fill="#e3327f" />
            </g>
          )}

          {/* flor */}
          {equipped.includes('flower') && (
            <g className="cat__acc" transform="translate(150,56)" fill="#ff8fc4">
              <circle cx="0" cy="-7" r="6" />
              <circle cx="7" cy="-2" r="6" />
              <circle cx="4" cy="6" r="6" />
              <circle cx="-4" cy="6" r="6" />
              <circle cx="-7" cy="-2" r="6" />
              <circle cx="0" cy="0" r="4.5" fill="#ffb43d" />
            </g>
          )}

          {/* gorrito */}
          {equipped.includes('hat') && (
            <g className="cat__acc">
              <path d="M120 22 L100 64 L140 64 Z" fill="#ff5fa0" />
              <path d="M120 22 L110 64 L120 64 Z" fill="#e3327f" opacity="0.5" />
              <circle cx="120" cy="20" r="6" fill="#ffb43d" />
            </g>
          )}

          {/* gorro navideño */}
          {equipped.includes('santa') && (
            <g className="cat__acc">
              <path d="M78 64 Q120 18 160 50 Q150 28 120 26 Q90 30 78 64 Z" fill="#e8455e" />
              <rect x="72" y="58" width="96" height="15" rx="7.5" fill="#fff" />
              <circle cx="162" cy="48" r="10" fill="#fff" />
            </g>
          )}

          {/* corona */}
          {equipped.includes('crown') && (
            <g className="cat__acc">
              <path
                d="M92 60 L100 40 L112 56 L120 36 L128 56 L140 40 L148 60 Z"
                fill="#ffc24b"
                stroke="#e89a18"
                strokeWidth="1.5"
              />
              <circle cx="120" cy="50" r="3" fill="#ff5fa0" />
            </g>
          )}

          {/* sombrero de paja (Luffy) */}
          {equipped.includes('strawhat') && (
            <g className="cat__acc">
              {/* ala */}
              <ellipse cx="120" cy="62" rx="66" ry="15" fill="#e8c873" stroke="#c9a64e" strokeWidth="2" />
              <path d="M58 62 q62 11 124 0" fill="none" stroke="#caa84f" strokeWidth="1.5" opacity="0.6" />
              {/* copa */}
              <path d="M88 63 Q90 28 120 26 Q150 28 152 63 Z" fill="#f1d588" stroke="#c9a64e" strokeWidth="1.5" />
              {/* banda roja */}
              <path d="M88 57 Q120 49 152 57 L150 64 Q120 56 90 64 Z" fill="#d8463f" />
            </g>
          )}
        </g>

        {/* zzz al dormir */}
        {sleeping && (
          <text className="cat__zzz" x="168" y="96" fontSize="20" fill={c.earIn} fontWeight="800">
            z
          </text>
        )}
      </svg>
    </button>
  )
}
