import PackageCard from '../molecules/PackageCard'
import Heading from '../atoms/Heading'

export default function PackageList({ packages, title, subtitle }) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            {title}
          </Heading>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
            <div className="w-3 h-1 bg-secondary rounded-full" />
            <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}