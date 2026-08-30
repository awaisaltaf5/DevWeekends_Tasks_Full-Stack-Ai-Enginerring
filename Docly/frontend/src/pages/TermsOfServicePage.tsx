import { FileText, AlertTriangle, Users, Zap, DollarSign, Gavel } from 'lucide-react';
import { useState } from 'react';

interface TermsSection {
  id: string;
  title: string;
  icon: any;
  content: string;
}

const termsSections: TermsSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: FileText,
    content: `By accessing and using Docly, you accept and agree to be bound by the terms and provision of this agreement.

If you do not agree to abide by the above, please do not use this service. Docly reserves the right to make changes to these Terms of Service at any time without notice. Your continued use of this platform following the posting of revised Terms of Service means that you accept and agree to the changes.`,
  },
  {
    id: 'use',
    title: 'Use License',
    icon: Zap,
    content: `Permission is granted to temporarily download one copy of the materials (information or software) on Docly for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display
• Attempt to decompile or reverse engineer any software contained on Docly
• Remove any copyright or other proprietary notations from the materials
• Transfer the materials to another person or "mirror" the materials on any other server
• Violate any applicable laws or regulations

This license shall automatically terminate if you violate any of these restrictions and may be terminated by Docly at any time.`,
  },
  {
    id: 'medical',
    title: 'Medical Disclaimer',
    icon: AlertTriangle,
    content: `Docly provides a platform for connecting patients with healthcare professionals. However:

• Docly is not a substitute for professional medical advice
• Information on Docly should not be used for self-diagnosis
• Consultations do not constitute a physician-patient relationship until confirmed
• Prescriptions issued through Docly must comply with applicable laws
• Emergency situations require immediate hospital/emergency services, not Docly
• Users assume all responsibility for any medical decisions made based on Docly

All medical professionals on Docly must be properly licensed and verified. However, Docly does not provide medical advice and cannot guarantee outcomes.`,
  },
  {
    id: 'liability',
    title: 'Limitations of Liability',
    icon: AlertTriangle,
    content: `In no event shall Docly or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Docly.

The materials on Docly's web site are provided "as is". Docly makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

Further, Docly does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.`,
  },
  {
    id: 'limitations',
    title: 'Limitations',
    icon: Gavel,
    content: `Docly and its suppliers will not be held liable for any damages arising out of or in connection with the use of Docly, whether the damages are incurred by:

• You or third parties
• Direct, indirect, incidental, special, consequential or punitive damages
• Loss of income, data, business opportunities, or goodwill
• System failure or data loss, even if advised of the possibility

Some jurisdictions do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, so these limitations may not apply to you.`,
  },
  {
    id: 'accounts',
    title: 'User Accounts',
    icon: Users,
    content: `When you create a Docly account, you must provide accurate, complete, and current information. You agree to:

• Keep your password confidential and secure
• Accept responsibility for all activity under your account
• Notify us immediately of unauthorized access
• Not use the service for illegal or unauthorized purposes
• Comply with all applicable laws and regulations
• Not impersonate others or provide false information

Docly reserves the right to suspend or terminate accounts that violate these terms, contain false information, or are used inappropriately.`,
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    icon: DollarSign,
    content: `By booking an appointment through Docly, you authorize payment for consultation fees to the respective healthcare provider.

Payment Terms:
• Payments are non-refundable except where required by law
• Consultation fees are set by individual doctors
• Docly processes payments securely but is not responsible for payment disputes
• You must maintain valid payment information
• Failed payments may result in appointment cancellation

For cancellations and refunds, refer to the individual doctor's cancellation policy.`,
  },
];

export default function TermsOfServicePage() {
  const [expandedId, setExpandedId] = useState<string | null>('acceptance');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-bg to-background py-12">
        <div className="container-docly">
          <div className="flex items-center gap-3">
            <Gavel className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
              <p className="mt-2 text-lg text-muted">
                Please read these terms carefully before using Docly
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

      {/* Terms Sections */}
      <section className="container-docly py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20 space-y-2 p-4">
              {termsSections.map((section) => (
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
            {termsSections.map((section) => {
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

      {/* Acceptance Confirmation */}
      <section className="bg-background-alt py-12">
        <div className="container-docly">
          <div className="card bg-gradient-to-r from-primary-bg to-background p-8">
            <div className="mx-auto max-w-2xl text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                By using Docly, you agree to these Terms
              </h2>
              <p className="mt-2 text-muted">
                Please contact us if you have any questions about our Terms of Service.
              </p>
              <a
                href="mailto:fotools28@gmail.com?subject=Terms%20of%20Service%20Question&body=Hello%20Docly%20Legal%20Team%2C%0A%0AI%20have%20a%20question%20about%20your%20Terms%20of%20Service%3A%0A%0A%0AThank%20you"
                className="btn-primary mt-6 inline-flex gap-2 px-6 py-3"
              >
                <FileText className="h-5 w-5" />
                Contact Legal Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
