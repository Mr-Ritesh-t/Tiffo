import { Link } from 'react-router-dom'

/**
 * @param {{ variant?: 'primary'|'secondary'|'ghost'|'cancel', size?: 'sm'|'md'|'lg', icon?: string, to?: string, loading?: boolean, className?: string, children: React.ReactNode } & React.ButtonHTMLAttributes} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  to,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}) {
  const cls = `ui-btn ui-btn-${variant} ui-btn-${size} ${className}`.trim()

  const content = (
    <>
      {loading ? (
        <span className="icon" style={{ fontSize: '16px', animation: 'spin 0.8s linear infinite' }}>progress_activity</span>
      ) : icon ? (
        <span className="icon" style={{ fontSize: '17px' }}>{icon}</span>
      ) : null}
      {children}
    </>
  )

  if (to) {
    return <Link to={to} className={cls} {...rest}>{content}</Link>
  }

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
