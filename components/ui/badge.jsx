export function Badge({ children, className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center rounded-full font-medium'
  const variants = {
    default: 'bg-purple-600 text-white px-3 py-1',
    secondary: 'bg-gray-200 text-gray-800 px-3 py-1 dark:bg-gray-700 dark:text-gray-100'
  }
  const classes = [base, variants[variant] || variants.default, className].join(' ')
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export default Badge