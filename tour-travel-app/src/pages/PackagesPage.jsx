import PackageList from '../components/organisms/PackageList'
import packagesData from '../data/packages.json'

export default function PackagesPage() {
  return (
    <div>
      {/* Page Header - FIXED: Added pt-24 to push below fixed navbar */}
      <section className="bg-primary dark:bg-primary-dark pt-24 md:pt-32 pb-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tour Packages
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Handcrafted itineraries designed for unforgettable experiences. Choose your adventure and let us handle the rest.
          </p>
        </div>
      </section>

      {/* Packages List */}
      <PackageList
        packages={packagesData}
        title="Curated Experiences"
        subtitle="All-inclusive packages with expert guides, premium accommodations, and seamless logistics"
      />
    </div>
  )
}