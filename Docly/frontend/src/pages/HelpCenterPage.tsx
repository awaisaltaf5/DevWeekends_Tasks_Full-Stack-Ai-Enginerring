import { Mail, MessageCircle, Phone, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'Booking',
    question: 'How do I book an appointment?',
    answer:
      'Navigate to "Find Doctors", search for a specialist, view their profile, and click "Book Appointment". Select your preferred time slot and consultation type (in-person or video).',
  },
  {
    id: 2,
    category: 'Booking',
    question: 'Can I reschedule my appointment?',
    answer:
      'Yes, go to "My Appointments", select the appointment you want to change, and click "Reschedule". Choose a new available slot.',
  },
  {
    id: 3,
    category: 'Account',
    question: 'How do I update my profile?',
    answer:
      'Click on your profile icon in the navbar, select "Edit Profile", and update your information. Remember to save changes.',
  },
  {
    id: 4,
    category: 'Video',
    question: 'How do video consultations work?',
    answer:
      'When your appointment time arrives, click "Join Video Consultation" in your appointments. A video room will open automatically.',
  },
  {
    id: 5,
    category: 'Payment',
    question: 'What payment methods are accepted?',
    answer:
      'Docly accepts all major credit/debit cards, digital wallets, and bank transfers. Payments are processed securely.',
  },
  {
    id: 6,
    category: 'Account',
    question: 'How do I reset my password?',
    answer:
      'On the login page, click "Forgot Password", enter your email, and follow the reset instructions sent to your inbox.',
  },
  {
    id: 7,
    category: 'Records',
    question: 'How do I access my medical records?',
    answer:
      'Go to "My Records" from the navigation menu to view and download all your medical documents and prescriptions.',
  },
  {
    id: 8,
    category: 'Doctors',
    question: 'How can doctors join Docly?',
    answer:
      'Click "Join as Doctor" during registration, submit your credentials and verification documents. Our team will review within 24-48 hours.',
  },
];

export default function HelpCenterPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(faqs.map((f) => f.category))];

  const filteredFAQs =
    selectedCategory === 'All' ? faqs : faqs.filter((f) => f.category === selectedCategory);

  const handleEmailSupport = () => {
    window.location.href = 'mailto:fotools28@gmail.com?subject=Docly%20Support%20Request&body=Hello%20Docly%20Support%2C%0A%0AI%20need%20help%20with%3A%0A%0A%0AThank%20you';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-bg to-background py-12">
        <div className="container-docly">
          <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
          <p className="mt-2 text-lg text-muted">
            Find answers to common questions about Docly
          </p>
        </div>
      </section>

      {/* Support Channels */}
      <section className="container-docly py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Mail,
              title: 'Email Support',
              description: 'Send us an email',
              action: () => handleEmailSupport(),
            },
            {
              icon: Phone,
              title: 'Phone Support',
              description: '+1 (555) 123-4567',
              action: () => window.location.href = 'tel:+15551234567',
            },
            {
              icon: MessageCircle,
              title: 'Live Chat',
              description: 'Chat with our team',
              action: () => alert('Live chat coming soon!'),
            },
            {
              icon: Clock,
              title: 'Response Time',
              description: '24 hours average',
              action: () => {},
            },
          ].map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <button
                key={idx}
                onClick={channel.action}
                className="card card-hover p-6 text-center transition-all"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-bg text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">{channel.title}</h3>
                <p className="mt-1 text-sm text-muted">{channel.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background-alt py-12">
        <div className="container-docly">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-card text-foreground hover:bg-background-alt border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between px-6 py-4 hover:bg-background-alt"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="rounded-full bg-primary-bg px-3 py-1 text-xs font-semibold text-primary">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  </div>
                  <span
                    className={`text-primary transition-transform ${
                      expandedId === faq.id ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {expandedId === faq.id && (
                  <div className="border-t border-border bg-background px-6 py-4">
                    <p className="text-muted leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help? */}
      <section className="container-docly py-12">
        <div className="card bg-gradient-to-r from-primary-bg to-background-alt p-8">
          <div className="mx-auto max-w-2xl text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Didn't find what you're looking for?</h2>
            <p className="mt-2 text-muted">
              Our support team is here to help. Contact us directly and we'll get back to you as soon as possible.
            </p>
            <button
              onClick={handleEmailSupport}
              className="btn-primary mt-6 px-6 py-3"
            >
              <Mail className="h-5 w-5" />
              Email Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
