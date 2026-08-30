import { Lock, Eye, Share2, Trash2, Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface PolicySection {
  id: string;
  title: string;
  icon: any;
  content: string;
}

const privacySections: PolicySection[] = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: Shield,
    content: `Docly ("Company", "we", "our", or "us") operates the Docly platform (the "Service").

This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We use your data to provide and improve Service. By using Docly, you agree to the collection and use of information in accordance with this policy.`,
  },
  {
    id: 'collection',
    title: 'Information Collection',
    icon: Eye,
    content: `We collect several different types of information for various purposes to provide and improve our Service to you.

Types of Data Collected:
• Personal Data: Name, email address, phone number, medical history, and profile picture
• Usage Data: Browser type, IP address, pages visited, access times, and referrer
• Device Data: Device type, operating system, and unique identifiers
• Location Data: City, country, and GPS coordinates (when you consent)

All data is collected with your explicit consent and is used only for the purposes stated in this policy.`,
  },
  {
    id: 'use',
    title: 'Use of Data',
    icon: Share2,
    content: `Docly uses the collected data for various purposes:

• To provide and maintain our Service
• To notify you about changes to our Service
• To provide customer support
• To gather analysis or valuable information for improving our Service
• To monitor the usage of our Service
• To detect, prevent and address technical issues
• To provide you with news, special offers and general information

Your data is never shared with third parties without your explicit consent, except as required by law.`,
  },
  {
    id: 'security',
    title: 'Security of Data',
    icon: Lock,
    content: `The security of your data is important to us but remember that no method of transmission over the Internet is 100% secure.

Security Measures:
• End-to-end encryption for sensitive data
• Secure HTTPS connections for all communications
• Regular security audits and penetration testing
• Role-based access control for staff members
• Regular backups and disaster recovery plans
• Compliance with HIPAA and data protection regulations

However, we cannot guarantee absolute security. You use the Service at your own risk.`,
  },
  {
    id: 'rights',
    title: 'Your Rights',
    icon: AlertCircle,
    content: `You have the right to:

• Access all your personal data that we hold
• Correct inaccurate or incomplete data
• Request deletion of your data (right to be forgotten)
• Withdraw consent at any time
• Data portability - receive your data in a structured format
• Lodge a complaint with a supervisory authority

To exercise any of these rights, please contact us at fotools28@gmail.com with your request and proof of identity.`,
  },
  {
    id: 'retention',
    title: 'Data Retention',
    icon: Trash2,
    content: `Docly will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy.

Retention Periods:
• Account data: Retained until you delete your account
• Medical records: Retained for 10 years after last consultation (as per regulations)
• Usage logs: Retained for 6 months for security purposes
• Marketing data: Retained until you unsubscribe

You can request deletion of your data at any time, and we will comply within 30 days unless legal obligations require retention.`,
  },
];

export default function PrivacyPolicyPage() {
  const [expandedId, setExpandedId] = useState<string | null>('intro');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-bg to-background py-12">
        <div className="container-docly">
          <div className="flex items-center gap-3">
            <Lock className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="mt-2 text-lg text-muted">
                How we protect and manage your data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="border-b border-border bg-background-alt">
        <div className="container-docly py-4">
          <p className="text-sm text-muted">
            Last updated: August 27, 2026
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="container-docly py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 space-y-2 p-4">
              {privacySections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setExpandedId(section.id)}
                  className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                    expandedId === section.id
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-background-alt'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {privacySections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className={`card animate-fade-up p-8 transition-all ${
                    expandedId === section.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground">
                        {section.title}
                      </h2>
                      <div className="mt-4 space-y-3 text-muted leading-relaxed">
                        {section.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="whitespace-pre-wrap">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-background-alt py-12">
        <div className="container-docly">
          <div className="card bg-gradient-to-r from-primary-bg to-background p-8">
            <div className="mx-auto max-w-2xl text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Questions About Your Privacy?
              </h2>
              <p className="mt-2 text-muted">
                Contact our Privacy Officer for any questions or concerns about how we handle your data.
              </p>
              <a
                href="mailto:fotools28@gmail.com?subject=Privacy%20Policy%20Question&body=Hello%20Docly%20Privacy%20Team%2C%0A%0AI%20have%20a%20question%20about%20your%20privacy%20policy%3A%0A%0A%0AThank%20you"
                className="btn-primary mt-6 inline-flex gap-2 px-6 py-3"
              >
                <Lock className="h-5 w-5" />
                Contact Privacy Officer
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
