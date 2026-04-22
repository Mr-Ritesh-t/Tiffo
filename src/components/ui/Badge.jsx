/**
 * @param {{ variant?: 'success'|'warning'|'primary'|'neutral'|'info', icon?: string, className?: string, children: React.ReactNode }} props
 */
export default function Badge({ variant = 'neutral', icon, className = '', children }) {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`.trim()}>
      {icon && <span className="icon" style={{ fontSize: '12px' }}>{icon}</span>}
      {children}
    </span>
  )
}
