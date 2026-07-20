import { useState } from 'react'
import { 
  X, 
  FileJson, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Check, 
  FolderOpen,
  Layers,
  ListChecks
} from 'lucide-react'
import Button from './Button.jsx'

const exportFormats = [
  { id: 'json', label: 'JSON', icon: FileJson, description: 'Raw data format for developers' },
  { id: 'markdown', label: 'Markdown', icon: FileText, description: 'Readable list with links' },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet format for Excel' },
  { id: 'text', label: 'Plain Text', icon: FileText, description: 'Simple text list' },
]

const exportScopes = [
  { id: 'all', label: 'Export All', icon: Layers, description: 'All bookmarked repositories' },
  { id: 'selected', label: 'Export Selected', icon: ListChecks, description: 'Choose specific repositories' },
  { id: 'category', label: 'Export by Category', icon: FolderOpen, description: 'Filter by category or tag' },
]

function ExportModal({ isOpen, onClose, bookmarks, categories }) {
  const [step, setStep] = useState(1) // Step 1: Scope, Step 2: Format, Step 3: Select repos
  const [selectedScope, setSelectedScope] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [selectedRepos, setSelectedRepos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  // Get filtered bookmarks based on scope
  const getFilteredBookmarks = () => {
    switch (selectedScope) {
      case 'selected':
        return bookmarks.filter(b => selectedRepos.includes(b.id))
      case 'category':
        return bookmarks.filter(b => 
          selectedCategory === 'All' || 
          b.category === selectedCategory ||
          b.tags?.includes(selectedCategory)
        )
      default:
        return bookmarks
    }
  }

  const filteredBookmarks = getFilteredBookmarks()

  const toggleRepoSelection = (repoId) => {
    setSelectedRepos(prev => 
      prev.includes(repoId) 
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    )
  }

  const generateContent = () => {
    const data = filteredBookmarks
    
    switch (selectedFormat) {
      case 'json':
        return JSON.stringify(data, null, 2)
      
      case 'markdown':
        return `# DevHub Bookmarks Export\n\n` +
          `*Generated on ${new Date().toLocaleDateString()}*\n\n` +
          `---\n\n` +
          data.map(repo => (
            `## ${repo.full_name}\n\n` +
            `⭐ **Stars:** ${repo.stargazers_count?.toLocaleString() || 0} | ` +
            `🍴 **Forks:** ${repo.forks_count?.toLocaleString() || 0}\n\n` +
            `🔗 [View on GitHub](${repo.html_url})\n\n` +
            `📝 ${repo.description || 'No description available'}\n\n` +
            `${repo.language ? `💻 **Language:** ${repo.language}\n\n` : ''}` +
            `${repo.tags?.length ? `🏷️ **Tags:** ${repo.tags.join(', ')}\n\n` : ''}` +
            `${repo.notes ? `💭 **Notes:** ${repo.notes}\n\n` : ''}` +
            `---\n`
          )).join('\n')
      
      case 'csv':
        const headers = ['Name', 'Owner', 'Stars', 'Forks', 'Language', 'URL', 'Tags', 'Notes', 'Category']
        const rows = data.map(repo => [
          repo.name,
          repo.owner?.login,
          repo.stargazers_count,
          repo.forks_count,
          repo.language || '',
          repo.html_url,
          (repo.tags || []).join(';'),
          repo.notes || '',
          repo.category || 'All'
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        return [headers.join(','), ...rows].join('\n')
      
      case 'text':
        return `DevHub Bookmarks Export\n` +
          `Generated: ${new Date().toLocaleString()}\n` +
          `Total: ${data.length} repositories\n` +
          `===============================\n\n` +
          data.map((repo, index) => (
            `${index + 1}. ${repo.full_name}\n` +
            `   Stars: ${repo.stargazers_count?.toLocaleString() || 0}\n` +
            `   Forks: ${repo.forks_count?.toLocaleString() || 0}\n` +
            `   URL: ${repo.html_url}\n` +
            `   Description: ${repo.description || 'N/A'}\n` +
            `   Language: ${repo.language || 'N/A'}\n` +
            `   Tags: ${(repo.tags || []).join(', ') || 'None'}\n` +
            `   Notes: ${repo.notes || 'None'}\n` +
            `   Category: ${repo.category || 'All'}\n`
          )).join('\n')
      
      default:
        return ''
    }
  }

  const getFileExtension = () => {
    switch (selectedFormat) {
      case 'json': return 'json'
      case 'markdown': return 'md'
      case 'csv': return 'csv'
      case 'text': return 'txt'
      default: return 'txt'
    }
  }

  const getMimeType = () => {
    switch (selectedFormat) {
      case 'json': return 'application/json'
      case 'markdown': return 'text/markdown'
      case 'csv': return 'text/csv'
      case 'text': return 'text/plain'
      default: return 'text/plain'
    }
  }

  const handleExport = () => {
    if (filteredBookmarks.length === 0) {
      return
    }
    
    setIsExporting(true)
    
    const content = generateContent()
    const blob = new Blob([content], { type: getMimeType() })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devhub-bookmarks-${selectedScope}-${new Date().toISOString().split('T')[0]}.${getFileExtension()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
    onClose()
    // Reset state
    setStep(1)
    setSelectedScope('all')
    setSelectedRepos([])
    setSelectedCategory('All')
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) {
      if (selectedScope === 'selected') return selectedRepos.length > 0
      if (selectedScope === 'category') return true
      return true
    }
    return true
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else handleExport()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Bookmarks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Step {step} of 3 • {filteredBookmarks.length} repos selected
            </p>
          </div>
          <button
            onClick={() => { onClose(); setStep(1); setSelectedScope('all'); setSelectedRepos([]) }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Choose Scope */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                What would you like to export?
              </p>
              <div className="space-y-2">
                {exportScopes.map((scope) => {
                  const Icon = scope.icon
                  return (
                    <button
                      key={scope.id}
                      onClick={() => setSelectedScope(scope.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedScope === scope.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        selectedScope === scope.id
                          ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-medium ${
                          selectedScope === scope.id
                            ? 'text-blue-900 dark:text-blue-300'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {scope.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {scope.description}
                        </p>
                      </div>
                      {selectedScope === scope.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Repos or Category */}
          {step === 2 && selectedScope === 'selected' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select repositories to export:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookmarks.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => toggleRepoSelection(repo.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selectedRepos.includes(repo.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <img src={repo.owner?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {repo.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {repo.description || 'No description'}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedRepos.includes(repo.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedRepos.includes(repo.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {selectedRepos.length} of {bookmarks.length} selected
              </p>
            </div>
          )}

          {step === 2 && selectedScope === 'category' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose a category or tag to export:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {filteredBookmarks.length} repositories in "{selectedCategory}"
              </p>
            </div>
          )}

          {step === 2 && selectedScope === 'all' && (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-medium">Export All Bookmarks</p>
              <p className="text-sm text-gray-500 mt-1">
                {bookmarks.length} repositories will be exported
              </p>
            </div>
          )}

          {/* Step 3: Choose Format */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose export format:
              </p>
              <div className="space-y-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.id
                          ? 'bg-blue-100 dark:bg-blue-800 text-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-medium text-sm ${
                          selectedFormat === format.id
                            ? 'text-blue-900 dark:text-blue-300'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {format.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto font-mono">
                  {generateContent().substring(0, 300)}...
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack} className="flex-1">
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            isLoading={isExporting}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === 3 ? (
              <>
                <Download className="w-4 h-4" />
                Export {filteredBookmarks.length} repos
              </>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal