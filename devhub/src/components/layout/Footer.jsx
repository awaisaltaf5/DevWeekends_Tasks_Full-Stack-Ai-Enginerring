import { Github, Heart } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using React & Tailwind
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  )
}

export default Footer