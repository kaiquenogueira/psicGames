export function Card({ children, className = '', ...props }) {
  const base = 'rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700'
  const classes = [base, className].join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  const base = 'p-6'
  const classes = [base, className].join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  const base = 'text-lg font-semibold'
  const classes = [base, className].join(' ')
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  const base = 'text-sm text-gray-500 dark:text-gray-400'
  const classes = [base, className].join(' ')
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  const base = 'p-6'
  const classes = [base, className].join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card