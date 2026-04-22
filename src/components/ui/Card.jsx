/**
 * @param {{ padding?: 'sm'|'md'|'lg', hover?: boolean, className?: string, children: React.ReactNode } & React.HTMLAttributes} props
 */
export default function Card({ padding = 'md', hover = false, className = '', children, ...rest }) {
  const cls = `ui-card ui-card-${padding} ${hover ? 'ui-card-hover' : ''} ${className}`.trim()
  return <div className={cls} {...rest}>{children}</div>
}
