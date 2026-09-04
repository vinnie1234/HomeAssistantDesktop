interface Props {
  path: string
  size?: number
  color?: string
  className?: string
}

export default function HaIcon({ path, size = 20, color = 'currentColor', className }: Props): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ color, fill: 'currentColor', flexShrink: 0 }}
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
