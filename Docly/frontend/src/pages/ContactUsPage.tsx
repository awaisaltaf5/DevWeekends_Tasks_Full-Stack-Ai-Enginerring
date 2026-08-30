import { Mail, Phone, MapPin, Clock, Send, Loader } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create mailto link with form data
    const mailtoLink = `mailto:fotools28@gmail.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    window.location.href = mailtoLink;

    setSubmitted(true);
    setLoading(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-bg to-background py-12">
        <div className="container-docly">
          <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-2 text-lg text-muted">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="container-docly py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Mail,
              label: 'Email',
              value: 'fotools28@gmail.com',
              action: () =>
                (window.location.href = 'mailto:fotools28@gmail.com'),
            },
            {
              icon: Phone,
              label: 'Phone',
              value: '+1 (555) 123-4567',
              action: () =>
                (window.location.href = 'tel:+15551234567'),
            },
            {
              icon: MapPin,
              label: 'Office',
              value: 'New York, USA',
              action: () => {},
            },
            {
              icon: Clock,
              label: 'Response Time',
              value: '24 hours',
              action: () => {},
            },
          ].map((contact, idx) => {
            const Icon = contact.icon;
            return (
              <button
                key={idx}
                onClick={contact.action}
                className="card card-hover p-6 text-center transition-all"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-bg text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted">{contact.label}</p>
                <p className="mt-1 font-semibold text-foreground">
                  {contact.value}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-background-alt py-12">
        <div className="container-docly">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="card p-8">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Send us a Message
              </h2>

              {submitted && (
                <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
                  <p className="font-medium">✓ Message submitted successfully!</p>
                  <p className="text-sm">
                    Your email client is opening. If it doesn't, please send the email manually.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input mt-1"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input mt-1"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input mt-1"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input mt-1 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Contact */}
            <div className="space-y-6">
              <div className="card p-6">
                <Mail className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-bold text-foreground">Email Us</h3>
                <p className="text-sm text-muted mb-4">
                  Send us an email at your convenience. We typically respond within 24 hours.
                </p>
                <a
                  href="mailto:fotools28@gmail.com"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors"
                >
                  fotools28@gmail.com
                  <Send className="h-4 w-4" />
                </a>
              </div>

              <div className="card p-6">
                <Phone className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-bold text-foreground">Call Us</h3>
                <p className="text-sm text-muted mb-4">
                  Need urgent assistance? Call us during business hours (Mon-Fri, 9AM-6PM EST).
                </p>
                <a
                  href="tel:+15551234567"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors"
                >
                  +1 (555) 123-4567
                  <Phone className="h-4 w-4" />
                </a>
              </div>

              <div className="card p-6">
                <MapPin className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-bold text-foreground">Visit Us</h3>
                <p className="text-sm text-muted mb-4">
                  Docly Headquarters
                  <br />
                  123 Medical Avenue
                  <br />
                  New York, NY 10001
                </p>
              </div>

              <div className="card bg-gradient-to-br from-primary-bg to-background-alt p-6">
                <Clock className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-bold text-foreground">Business Hours</h3>
                <ul className="text-sm text-muted space-y-1">
                  <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</li>
                  <li><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</li>
                  <li><strong>Sunday:</strong> Closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="container-docly py-12">
        <div className="card bg-gradient-to-r from-primary-bg to-background-alt p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Can't find what you're looking for?
            </h2>
            <p className="mt-2 text-muted">
              Check our Help Center for frequently asked questions and support documentation.
            </p>
            <a
              href="/help"
              className="btn-primary mt-6 inline-flex gap-2 px-6 py-3"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
