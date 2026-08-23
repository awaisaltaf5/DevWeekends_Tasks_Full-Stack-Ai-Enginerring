import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Leaf, Users, Headphones, ArrowRight, Globe, Award, Heart } from 'lucide-react'
import Heading from '../components/atoms/Heading'
import Button from '../components/atoms/Button'
import aboutData from '../data/aboutData.json'

const iconMap = {
  Compass,
  Leaf,
  Users,
  Headphones,
}

export default function AboutPage() {
  const [hoveredStat, setHoveredStat] = useState(null)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=800&fit=crop&q=80"
            alt="Travel adventure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl">
            <Heading level={1} className="text-white mb-4">
              Our Story &{' '}
              <span className="text-primary-light">Mission</span>
            </Heading>
            <p className="text-lg text-white/85 leading-relaxed">
              Founded in 2011, SnapTrips began with a simple belief: travel should transform, not just transport. 
              We're a team of explorers, storytellers, and dreamers dedicated to crafting journeys that leave lasting impressions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary dark:bg-primary-dark">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {aboutData.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={`text-4xl md:text-5xl font-bold text-white mb-2 transition-transform duration-300 ${hoveredStat === index ? 'scale-110' : ''}`}>
                  {stat.number}
                </div>
                <div className="text-sm text-white/80 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <Heading level={2} className="mb-4">
              Why Choose SnapTrips
            </Heading>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're not just a travel company. We're your partners in discovery, committed to exceptional experiences.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
              <div className="w-3 h-1 bg-secondary rounded-full" />
              <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.values.map((value) => {
              const IconComponent = iconMap[value.icon] || Compass
              return (
                <div
                  key={value.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary-bg dark:bg-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary dark:group-hover:bg-primary-light transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-primary dark:text-primary-light group-hover:text-white dark:group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <Heading level={2} className="mb-4">
              Meet Our Team
            </Heading>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Passionate experts who live and breathe travel, dedicated to making your journey unforgettable.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
              <div className="w-3 h-1 bg-secondary rounded-full" />
              <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.team.map((member) => (
              <div
                key={member.name}
                className="group bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary dark:text-primary-light font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="bg-primary dark:bg-primary-dark rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <Globe className="w-16 h-16 text-white/30 mx-auto mb-6" />
              <Heading level={2} className="text-white mb-4">
                Ready to Start Your Journey?
              </Heading>
              <p className="text-lg text-white/85 max-w-xl mx-auto mb-8">
                Join 50,000+ travelers who have discovered the world with SnapTrips. Your adventure awaits.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/destinations">
                  <Button variant="secondary" size="large">
                    Explore Destinations
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/packages">
                  <Button variant="outline" size="large" className="border-white text-white hover:bg-white hover:text-primary">
                    View Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Award className="w-10 h-10 text-primary dark:text-primary-light mb-3" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Award Winning</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Travel+Leisure World's Best 2024</p>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-10 h-10 text-primary dark:text-primary-light mb-3" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Loved by Travelers</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">4.9/5 average from 10,000+ reviews</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-10 h-10 text-primary dark:text-primary-light mb-3" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Global Coverage</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">120+ destinations across 6 continents</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}