import { Link } from 'react-router-dom'
import { 
  Heart,
  ExternalLink, 
  Code2, 
  BookOpen, 
  FileText, 
  Layers,
  GitBranch,
  Globe,
  ArrowUpRight,
  Mail
} from 'lucide-react'

const resourceLinks = [
  {
    category: 'Docs',
    links: [
      { 
        label: 'React', 
        url: 'https://react.dev',
        icon: BookOpen,
        description: 'UI library'
      },
      { 
        label: 'Next.js', 
        url: 'https://nextjs.org/docs',
        icon: Layers,
        description: 'React framework'
      },
      { 
        label: 'TypeScript', 
        url: 'https://typescriptlang.org',
        icon: FileText,
        description: 'Typed JavaScript'
      },
      { 
        label: 'Node.js', 
        url: 'https://nodejs.org/docs',
        icon: Code2,
        description: 'Runtime environment'
      },
    ]
  },
  {
    category: 'Dev',
    links: [
      { 
        label: 'MDN Web Docs', 
        url: 'https://developer.mozilla.org',
        icon: Globe,
        description: 'Web reference'
      },
      { 
        label: 'Stack Overflow', 
        url: 'https://stackoverflow.com',
        icon: ArrowUpRight,
        description: 'Q&A community'
      },
      { 
        label: 'GitHub', 
        url: 'https://github.com',
        icon: GitBranch,
        description: 'Code hosting'
      },
      { 
        label: 'Dev.to', 
        url: 'https://dev.to',
        icon: Heart,
        description: 'Developer blogs'
      },
    ]
  }
]

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  DevHub
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Discover • Bookmark • Learn
                </span>
              </div>
            </Link>
            
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              A modern React application for discovering and bookmarking GitHub repositories.
            </p>

            {/* Quick Links - Removed */}
          </div>

          {/* Resources - 2 columns on mobile, 4 on desktop */}
          <div className="col-span-1 md:col-span-1 lg:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
            {resourceLinks.map((section) => (
              <div key={section.category} className="space-y-2 md:space-y-3">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const Icon = link.icon
                    return (
                      <li key={link.label}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Icon className="w-3 h-3 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="flex items-center gap-1">
                            {link.label}
                            <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Connect Section */}
          <div className="lg:col-span-2 space-y-2 md:space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://awaisaltaf5.github.io/Portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span>Portfolio</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/awaisaltaf5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <GitBranch className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:businessawaisaltaf@gmail.com"
                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <span>© {currentYear} DevHub.</span>
              <span> by </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Muhammad Awais Altaf
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer