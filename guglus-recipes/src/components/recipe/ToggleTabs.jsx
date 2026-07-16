export default function ToggleTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'instructions', label: 'Instructions' },
    { id: 'ingredients', label: 'Ingredients' }
  ]

  return (
    <div className="relative flex bg-border/50 dark:bg-dark-border/50 rounded-2xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? 'text-white dark:text-dark-background'
              : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
          }`}
        >
          {activeTab === tab.id && (
            <span className="absolute inset-0 bg-primary dark:bg-dark-primary rounded-xl shadow-md" />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}