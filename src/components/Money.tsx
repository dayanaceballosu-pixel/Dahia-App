import { splitMoney } from '../lib/money'

interface MoneyProps {
  /** valor en centavos */
  value: number
  /** mostrar el signo + en positivos */
  showPlus?: boolean
  /** pintar según signo (verde/rojo) */
  colored?: boolean
  /** ocultar con ••••• */
  hidden?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Money({
  value,
  showPlus = false,
  colored = false,
  hidden = false,
  className = '',
  style,
}: MoneyProps) {
  if (hidden) {
    return (
      <span className={`money ${className}`} style={style}>
        $ ••••••
      </span>
    )
  }

  const { neg, intStr, decStr } = splitMoney(value)
  const sign = neg ? '−' : showPlus ? '+' : ''
  const color = colored
    ? value > 0
      ? 'var(--income)'
      : value < 0
        ? 'var(--expense)'
        : undefined
    : undefined

  return (
    <span className={`money ${className}`} style={{ color, ...style }}>
      {sign}${intStr}
      <span className="dec">,{decStr}</span>
    </span>
  )
}
