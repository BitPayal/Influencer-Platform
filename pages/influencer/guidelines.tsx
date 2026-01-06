import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Head from 'next/head';

const InfluencerGuidelines: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Guidelines - Cehpoint Marketing Partners</title>
      </Head>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Promotion Guidelines
        </h1>

        <div className="space-y-6">
          <Card title="Content Creation Guidelines">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Follow these guidelines to create effective promotional content
                that aligns with our brand standards.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Do's
              </h3>
              <ul className="space-y-2 mb-6">
                <li>✓ Follow the approved script and caption templates</li>
                <li>✓ Clearly mention the brand name and product features</li>
                <li>✓ Include local contact information or service links if provided</li>
                <li>✓ Use high-quality video and audio</li>
                <li>✓ Be authentic and engaging with your audience</li>
                <li>✓ Post during peak engagement hours for your audience</li>
                <li>✓ Respond to comments and questions about the product</li>
                <li>✓ Tag our official social media handles</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                Don'ts
              </h3>
              <ul className="space-y-2 mb-6">
                <li>✗ Don't include political or religious content</li>
                <li>✗ Don't make false or exaggerated claims</li>
                <li>✗ Don't use offensive language or inappropriate content</li>
                <li>✗ Don't delete posts within 30 days (No Delete Policy)</li>
                <li>✗ Don't modify approved content without permission</li>
                <li>✗ Don't promote competing brands in the same content</li>
                <li>✗ Don't use copyrighted music without proper licensing</li>
              </ul>
            </div>
          </Card>

          <Card title="Video Submission Process">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Create Your Video
                  </h4>
                  <p className="text-gray-600">
                    Follow our guidelines and create engaging promotional content
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Submit for Approval
                  </h4>
                  <p className="text-gray-600">
                    Upload your video or provide a link for review before posting publicly
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">Wait for Review</h4>
                  <p className="text-gray-600">
                    Our team will review within 24-48 hours
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  4
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Post & Submit Proof
                  </h4>
                  <p className="text-gray-600">
                    Once approved, post publicly and submit the link with a screenshot
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  5
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Receive Payment
                  </h4>
                  <p className="text-gray-600">
                    Payment will be processed via UPI after verification
                  </p>
                </div>
              </li>
            </ol>
          </Card>

          <Card title="Revenue Share Program">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Eligibility Requirements
                  </h4>
                  <p className="text-blue-800 text-sm">
                    To qualify for the 5% revenue share program, you must post at
                    least 2 approved videos per month. The revenue share is
                    calculated monthly based on leads or sales generated from your
                    district.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Fixed Payment:</strong> Earn a fixed amount per approved
                video based on your follower count and engagement tier.
              </p>
              <p>
                <strong>Revenue Share:</strong> Earn an additional 5% of the
                revenue generated from your region when you maintain consistent
                posting (2+ videos/month).
              </p>
            </div>
          </Card>

          <Card title="30-Day No Delete Policy">
            <p className="text-gray-700 mb-4">
              All promotional videos must remain public on your social media for a
              minimum of 30 days from the posting date. This ensures maximum
              visibility and reach for our campaigns.
            </p>
            <p className="text-gray-700">
              <strong>Note:</strong> Deleting content before 30 days may result in
              payment reversal and affect your eligibility for future
              collaborations.
            </p>
          </Card>

          <Card title="Need Help?">
            <p className="text-gray-700">
              If you have questions about the guidelines or need clarification,
              please contact our marketing team through the platform support.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InfluencerGuidelines;
