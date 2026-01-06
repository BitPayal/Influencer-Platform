import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Privacy: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Privacy Policy - Cehpoint Influence Partners</title>
        <meta name="description" content="Privacy Policy for Cehpoint Influence Partners platform" />
        <link rel="canonical" href="https://cehpoint-influence.repl.co/privacy" />
      </Head>

      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-extrabold text-gray-900">
              <span className="text-orange-500">Cehpoint</span> Influence
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: October 31, 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Cehpoint Influence Partners ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our influencer marketing platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Name, email address, phone number</li>
              <li>Social media handles (Instagram, YouTube, etc.)</li>
              <li>Government ID proof (Aadhaar/PAN for verification)</li>
              <li>UPI ID for payment processing</li>
              <li>Location/district information</li>
              <li>Follower count and engagement metrics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Content Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Video submissions and marketing content</li>
              <li>Proof of posting (screenshots, links)</li>
              <li>Task completion data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Video Quality & Performance Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Video production quality assessments</li>
              <li>Engagement metrics and audience demographics</li>
              <li>Content quality scores and performance analysis</li>
              <li>Custom payment rate assignments based on quality</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.4 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Login timestamps and activity logs</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To create and manage your influencer account</li>
              <li>To verify your identity and prevent fraud</li>
              <li>To assign marketing tasks and campaigns</li>
              <li>To analyze video quality and assign custom payment rates (₹2K-₹10K per video based on quality)</li>
              <li>To process payments at your assigned rate + 5% revenue share</li>
              <li>To review and approve video submissions</li>
              <li>To track performance metrics, engagement, and earnings</li>
              <li>To communicate important updates and guidelines</li>
              <li>To improve our platform and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Partner Businesses:</strong> Your promotional content reaches our partner businesses you're marketing for</li>
              <li><strong>Payment Processors:</strong> To process UPI payments</li>
              <li><strong>Service Providers:</strong> Cloud hosting (Supabase, Vercel) for platform operations</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure database with row-level security (RLS)</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access to personal data</li>
              <li>Two-factor authentication options</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under Indian data protection laws, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@cehpoint.com" className="text-orange-600 hover:text-orange-700 font-medium">privacy@cehpoint.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>Legal compliance and tax purposes (up to 7 years)</li>
              <li>Fraud prevention and dispute resolution</li>
              <li>Financial records for payment history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>Remember your login session</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform may contain links to partner websites. We are not responsible for the privacy practices of these third-party sites. Please review their privacy policies independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform is intended for users 18 years and older. We do not knowingly collect information from minors. If you believe a minor has provided information, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the platform constitutes acceptance of changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related questions or concerns, contact:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mt-4">
              <p className="text-gray-900 font-semibold">Cehpoint Influence Partners</p>
              <p className="text-gray-700 mt-2">Email: <a href="mailto:privacy@cehpoint.com" className="text-orange-600 hover:text-orange-700">privacy@cehpoint.com</a></p>
              <p className="text-gray-700">Support: <a href="mailto:support@cehpoint.com" className="text-orange-600 hover:text-orange-700">support@cehpoint.com</a></p>
              <p className="text-gray-700 mt-2">Address: Kolkata, West Bengal, India</p>
            </div>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-500 italic">
              This Privacy Policy is governed by Indian law and complies with the Information Technology Act, 2000, and related privacy regulations.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2025 Cehpoint Influence Partners. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
