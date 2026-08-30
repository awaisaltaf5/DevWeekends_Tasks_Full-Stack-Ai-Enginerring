import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  Copy,
  Check,
  Heart,
} from 'lucide-react';
import logo from '../../assets/logo.svg';

export default function Footer() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://docly.com';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Docly - Book Doctors Online',
          text: 'Find and book appointments with top doctors on Docly. Simple, secure, and accessible healthcare.',
          url: currentUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      'Check out Docly - an amazing platform to book doctors and consult online! 📱'
    );
    window.open(`https://wa.me/?text=${text}%20${currentUrl}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <footer className="border-t border-border bg-background-alt">
      {/* Main footer content */}
      <div className="container-docly py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex transition-opacity hover:opacity-80" aria-label="Docly home">
              <img src={logo} alt="Docly" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Making healthcare accessible, affordable, and simple for everyone.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Heart className="h-4 w-4 text-red-500" />
              Built with care for better health outcomes
            </div>
          </div>

          {/* Platform section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="text-muted hover:text-primary transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/appointments"
                  className="text-muted hover:text-primary transition-colors"
                >
                  My Appointments
                </Link>
              </li>
              <li>
                <Link
                  to="/register?role=doctor"
                  className="text-muted hover:text-primary transition-colors"
                >
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link
                  to="/records"
                  className="text-muted hover:text-primary transition-colors"
                >
                  Medical Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Support section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support & Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/help" className="text-muted hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Connect section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Share & Connect</h3>
            <p className="text-sm text-muted">Tell your friends about Docly</p>
            <div className="space-y-2">
              <button
                onClick={handleShare}
                className="btn-primary w-full justify-center px-4 py-2.5 text-sm"
              >
                <Share2 className="h-4 w-4" />
                Share Docly
              </button>

              {/* Share menu dropdown */}
              {showShareMenu && (
                <div className="space-y-2 rounded-lg border border-border bg-white p-3 animate-fade-up">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-background-alt hover:text-foreground transition-colors"
                  >
                    <span className="text-lg">💬</span>
                    WhatsApp
                  </button>
                  <button
                    onClick={shareViaFacebook}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-background-alt hover:text-foreground transition-colors"
                  >
                    <span className="text-lg">👍</span>
                    Facebook
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-background-alt hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Alternative for non-native share */}
              {!navigator.share && !showShareMenu && (
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary w-full justify-center px-4 py-2.5 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-background">
        <div className="container-docly flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Docly. All rights reserved.</span>
          <span>Reimagining Healthcare, One Appointment at a Time</span>
        </div>
      </div>
    </footer>
  );
}