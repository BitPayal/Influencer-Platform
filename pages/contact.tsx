import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

const Contact: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Contact Us - Cehpoint Influence Partners</title>
        <meta name="description" content="Contact Cehpoint Influence Partners for support, partnerships, or inquiries" />
        <link rel="canonical" href="https://cehpoint-influence.repl.co/contact" />
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Have questions? We're here to help you succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-gray-600 text-sm mb-2">For general inquiries and support</p>
                    <a href="mailto:support@cehpoint.com" className="text-orange-600 hover:text-orange-700 font-medium">
                      support@cehpoint.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Influencer Support</h3>
                    <p className="text-gray-600 text-sm mb-2">Help with tasks, videos, and payments</p>
                    <a href="mailto:influencers@cehpoint.com" className="text-blue-600 hover:text-blue-700 font-medium">
                      influencers@cehpoint.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Partnerships</h3>
                    <p className="text-gray-600 text-sm mb-2">Collaborate with us</p>
                    <a href="mailto:partnerships@cehpoint.com" className="text-green-600 hover:text-green-700 font-medium">
                      partnerships@cehpoint.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600 text-sm">
                      Kolkata, West Bengal, India<br />
                      Serving influencers across India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Response Time</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We typically respond to all inquiries within <strong>24 hours</strong> during business days (Monday-Saturday).
              </p>
              <p className="text-sm text-gray-600">
                Business Hours: 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I get started as an influencer?</h3>
                <p className="text-gray-600 text-sm">
                  Click "Join Free" on our homepage, complete the registration form with your social media handles and ID proof. We'll review your application within 24-48 hours.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How much can I earn?</h3>
                <p className="text-gray-600 text-sm">
                  Your rate (₹2,000-₹10,000 per video) is assigned after we analyze your first video submission quality, engagement, and profile. Plus 5% revenue share on all leads you generate. With 2 tasks per month, that's ₹4,000-₹20,000 minimum.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When do I receive payments?</h3>
                <p className="text-gray-600 text-sm">
                  Fixed video payouts are processed within 7 days of submitting proof of posting. Revenue share is calculated and paid monthly via UPI.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if my video is rejected?</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive detailed feedback and can resubmit. We provide guidelines and sample scripts to help you create approvable content.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I promote my own products too?</h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! We only assign 2 tasks per month. Your other content is entirely up to you. We don't restrict your creative freedom.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What documents do I need?</h3>
                <p className="text-gray-600 text-sm">
                  Valid government ID (Aadhaar or PAN), active social media accounts, and a UPI ID for receiving payments.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a contract?</h3>
                <p className="text-gray-600 text-sm">
                  You agree to our <Link href="/terms" className="text-orange-600 hover:text-orange-700">Terms of Service</Link> when you register. There's no long-term commitment—you can leave anytime.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do I need to meet followers requirements?</h3>
                <p className="text-gray-600 text-sm">
                  No minimum! Even with less than 10,000 followers, you earn ₹2,000 per video. Higher follower counts earn more (up to ₹10,000).
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600 text-center">
                Still have questions? <a href="mailto:support@cehpoint.com" className="text-orange-600 hover:text-orange-700 font-medium">Email us</a> and we'll respond within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Join?</h2>
          <p className="text-xl text-white/95 mb-6">
            Start earning as a marketing partner today. No fees, no commitments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register/influencer" className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg">
              Join Free →
            </Link>
            <Link href="/login" className="inline-block bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-all shadow-lg">
              Login to Dashboard
            </Link>
          </div>
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

export default Contact;
