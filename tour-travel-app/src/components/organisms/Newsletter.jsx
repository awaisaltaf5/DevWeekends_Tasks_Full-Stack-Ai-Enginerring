import { useState } from 'react'
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react'
import Button from '../atoms/Button'
import Heading from '../atoms/Heading'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <section className="py-16 md:py-20 bg-primary dark:bg-primary-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white/30 mx-auto mb-4" />
          
          <Heading level={2} className="text-white mb-3 md:mb-4 text-2xl md:text-3xl">
            Get Travel Inspiration
          </Heading>
          
          <p className="text-sm md:text-base text-white/80 mb-6 md:mb-8 leading-relaxed px-4">
            Subscribe for exclusive deals, destination guides, and travel tips delivered to your inbox.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="medium"
                disabled={isLoading}
                className="whitespace-nowrap h-[46px]"
              >
                {isLoading ? (
                  <span className="animate-pulse text-sm">Subscribing...</span>
                ) : (
                  <>
                    <span className="text-sm">Subscribe</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl py-4 px-6 max-w-md mx-auto animate-fade-in">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-white font-medium text-sm md:text-base">
                Welcome aboard! Check your inbox for travel inspiration.
              </span>
            </div>
          )}

          <p className="text-xs text-white/40 mt-4">
            No spam, ever. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}