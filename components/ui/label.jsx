export function Label({ children, className = '', ...props }) {
  const base = 'text-sm font-medium text-gray-700 dark:text-gray-300'
  const classes = [base, className].join(' ')
  return (
    <label className={classes} {...props}>
      {children}
    </label>
  )
}

export default Label