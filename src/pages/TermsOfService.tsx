import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p>
              By using our application, VerifyFlow, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the application. We may modify these terms at any time, and such modifications shall be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Use of the Application</h2>
            <p>
              VerifyFlow grants you a limited, non-exclusive, non-transferable, revocable license to use the application for your personal and professional purposes, in accordance with these Terms. You agree not to misuse the application or help anyone else to do so.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>
              You are responsible for safeguarding your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to comply with this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Content and Data</h2>
            <p>
              You are responsible for the data you upload to the service. You retain all ownership rights to your data. We will not use your data for any purpose other than providing the service to you. We will use industry-standard security measures to protect your data.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Disclaimer of Warranties</h2>
            <p>
              The application is provided "as is." We make no warranty or representation that the application will meet your requirements, be uninterrupted, timely, secure, or error-free.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall VerifyFlow be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the province of Ontario, Canada, without respect to its conflict of laws principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: [Your Contact Email/Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 