export function Button({ children, className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  }
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
  }
  const classes = [base, sizes[size] || sizes.md, variants[variant] || variants.default, className].join(' ')
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button