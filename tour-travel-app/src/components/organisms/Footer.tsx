import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, MapPin, ArrowRight, CheckCircle, Heart, Compass } from 'lucide-react'

// Social icons as SVG components
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const footerLinks = {
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '#' },
    { name: 'Blog', path: '#' },
    { name: 'Press', path: '#' },
  ],
  support: [
    { name: 'Help Center', path: '#' },
    { name: 'Safety Information', path: '#' },
    { name: 'Cancellation Options', path: '#' },
    { name: 'Contact Us', path: '#' },
  ],
  legal: [
    { name: 'Terms of Service', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Cookie Policy', path: '#' },
  ],
}

const socialLinks = [
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 transition-colors duration-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Travel inspiration in your inbox
              </h3>
              <p className="text-gray-400 max-w-md">
                Subscribe for exclusive deals, destination guides, and travel tips from our experts.
              </p>
            </div>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-primary-light hover:bg-primary text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl py-4 px-6 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Thanks for subscribing!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Snap<span className="text-primary-light">Trips</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Discover the world with us. We make travel easy, affordable, and unforgettable with curated experiences and expert guidance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">hello@snaptrips.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">123 Travel Street, Adventure City</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-400 hover:text-primary-light transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary-light transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-400 hover:text-primary-light transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary-light transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-400 hover:text-primary-light transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-primary-light transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            © 2026 SnapTrips. All rights reserved. Made with 
            <Heart className="w-3.5 h-3.5 text-red-500 inline mx-0.5" /> 
            by Muhammad Awais Altaf
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}