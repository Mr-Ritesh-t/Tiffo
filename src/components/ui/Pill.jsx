/**
 * @param {{ active?: boolean, icon?: string, className?: string, children: React.ReactNode } & React.ButtonHTMLAttributes} props
 */
export default function Pill({ active = false, icon, className = '', children, ...rest }) {
  return (
    <button className={`ui-pill ${active ? 'active' : ''} ${className}`.trim()} {...rest}>
      {icon && <span className="icon ui-pill-icon">{icon}</span>}
      {children}
    </button>
  )
}
