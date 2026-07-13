export default function Badge({ text }) {
  if (!text) return null

  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 dark:bg-gray-900/95 text-primary dark:text-primary-light shadow-lg backdrop-blur-sm">
      {text}
    </span>
  )
}