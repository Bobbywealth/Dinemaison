import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last Updated: December 17, 2025
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                <li><strong>Profile Information:</strong> Profile photos, bio, culinary specialties (for chefs)</li>
                <li><strong>Booking Information:</strong> Event details, guest count, dietary restrictions, address</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely by Stripe)</li>
                <li><strong>Identity Verification:</strong> Government ID, certifications (for chef verification)</li>
                <li><strong>Communications:</strong> Messages, reviews, support requests</li>
              </ul>

              <h3 className="font-semibold mt-4">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Pages viewed, features used, search queries, booking history</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> IP address, general location (for market availability)</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Log Data:</strong> Access times, error logs, performance data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide Services:</strong> Facilitate bookings, process payments, enable communications</li>
                <li><strong>Account Management:</strong> Create and maintain your account, verify identity</li>
                <li><strong>Customer Support:</strong> Respond to inquiries, resolve disputes, provide assistance</li>
                <li><strong>Safety & Security:</strong> Detect fraud, prevent abuse, protect user safety</li>
                <li><strong>Personalization:</strong> Recommend chefs, customize experience, save preferences</li>
                <li><strong>Communications:</strong> Send booking confirmations, updates, promotional emails (opt-out available)</li>
                <li><strong>Analytics:</strong> Improve platform performance, understand user behavior, measure effectiveness</li>
                <li><strong>Legal Compliance:</strong> Comply with laws, enforce terms, respond to legal requests</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">3.1 With Other Users</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chefs see customer name, guest count, dietary restrictions, event address (for confirmed bookings)</li>
                <li>Customers see chef profile information, reviews, ratings, menu items</li>
                <li>Reviews and ratings are publicly visible</li>
              </ul>

              <h3 className="font-semibold mt-4">3.2 With Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (subject to Stripe Privacy Policy)</li>
                <li><strong>Cloud Hosting:</strong> Data storage and application hosting</li>
                <li><strong>Email Service:</strong> Transactional and promotional emails</li>
                <li><strong>Analytics:</strong> Usage analytics and performance monitoring</li>
              </ul>

              <h3 className="font-semibold mt-4">3.3 For Legal Reasons</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>To comply with legal obligations, court orders, or government requests</li>
                <li>To enforce our Terms of Service</li>
                <li>To protect rights, property, and safety of Dine Maison, users, or public</li>
                <li>In connection with business transfers (merger, acquisition, sale)</li>
              </ul>

              <h3 className="font-semibold mt-4">3.4 With Your Consent</h3>
              <p>We may share information with third parties when you explicitly consent to such sharing.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Accounts:</strong> We retain your information while your account is active</li>
                <li><strong>After Account Closure:</strong> Data retained for 90 days, then deleted (except as required by law)</li>
                <li><strong>Booking Records:</strong> Retained for 7 years for tax and legal purposes</li>
                <li><strong>Payment Data:</strong> Handled by Stripe, not stored on our servers</li>
                <li><strong>Reviews:</strong> May be retained after account closure as they benefit other users</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Depending on your location, you may have the following rights:</p>
              
              <h3 className="font-semibold">5.1 Access & Portability</h3>
              <p>Request a copy of your personal data in a machine-readable format</p>

              <h3 className="font-semibold mt-4">5.2 Correction</h3>
              <p>Update or correct inaccurate information through account settings or by contacting support</p>

              <h3 className="font-semibold mt-4">5.3 Deletion</h3>
              <p>Request deletion of your account and personal data (subject to legal retention requirements)</p>

              <h3 className="font-semibold mt-4">5.4 Opt-Out</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Marketing Emails:</strong> Unsubscribe link in every promotional email</li>
                <li><strong>Cookies:</strong> Adjust browser settings to refuse cookies</li>
                <li><strong>Analytics:</strong> Use browser "Do Not Track" settings</li>
              </ul>

              <h3 className="font-semibold mt-4">5.5 Object to Processing</h3>
              <p>Object to certain uses of your data, such as direct marketing</p>

              <h3 className="font-semibold mt-4">5.6 File a Complaint</h3>
              <p>Lodge a complaint with your local data protection authority if you believe we've violated your privacy rights</p>

              <p className="mt-4 font-semibold">
                To exercise these rights, contact us at privacy@dinemaison.com
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication, security, session management</li>
                <li><strong>Functional Cookies:</strong> Remember preferences, language, location</li>
                <li><strong>Analytics Cookies:</strong> Understand usage patterns, measure performance</li>
                <li><strong>Marketing Cookies:</strong> Deliver personalized ads (with your consent)</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect
                platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> HTTPS/TLS encryption for data in transit</li>
                <li><strong>Secure Storage:</strong> Encrypted database storage</li>
                <li><strong>Access Controls:</strong> Limited employee access on need-to-know basis</li>
                <li><strong>Payment Security:</strong> PCI-DSS compliant payment processing via Stripe</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> No system is 100% secure. We cannot guarantee absolute security, but we take
                reasonable precautions to protect your data.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Dine Maison is not intended for children under 18. We do not knowingly collect information from
                children. If you believe a child has provided us with personal information, please contact us at
                privacy@dinemaison.com and we will delete it.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place to protect your information in accordance with this Privacy Policy
                and applicable data protection laws.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>10. California Privacy Rights (CCPA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>California residents have additional rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to know what personal information is collected, used, and shared</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, email privacy@dinemaison.com with "California Privacy Rights" in the subject line.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>11. European Privacy Rights (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>European Union residents have rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right of access to your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p className="mt-4">
                Our legal basis for processing: consent, contract performance, legal obligation, legitimate interests.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>12. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes via email
                or prominent platform notice. Continued use of the platform after changes constitutes acceptance of the
                updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>For questions about this Privacy Policy or our privacy practices:</p>
              <ul className="space-y-2">
                <li><strong>Privacy Team:</strong> privacy@dinemaison.com</li>
                <li><strong>General Support:</strong> support@dinemaison.com</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                <li><strong>Mail:</strong> Dine Maison Privacy Team, [Your Address]</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is a template Privacy Policy. Before launching your platform, you should
              have this document reviewed by a qualified attorney to ensure compliance with GDPR, CCPA, and other
              applicable privacy laws in your jurisdiction.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

