export function Input({ className = '', ...props }) {
  const base = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700'
  const classes = [base, className].join(' ')
  return <input className={classes} {...props} />
}

export default Input