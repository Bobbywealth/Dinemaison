import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last Updated: December 17, 2025
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Dine Maison ("Service"), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                Dine Maison reserves the right to modify these terms at any time. We will notify users of any material
                changes via email or through the platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Dine Maison is a marketplace platform that connects customers with professional private chefs for
                in-home dining experiences. We facilitate bookings, payments, and communications between customers and chefs.
              </p>
              <p>
                <strong>Important:</strong> Dine Maison acts as a platform facilitator only. We do not employ chefs
                and are not responsible for the quality, safety, or legality of the culinary services provided.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>

              <h3 className="font-semibold mt-4">3.2 Account Types</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Customers:</strong> Users who book chef services</li>
                <li><strong>Chefs:</strong> Verified culinary professionals who provide services</li>
                <li><strong>Administrators:</strong> Platform moderators and support staff</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Booking and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">4.1 Booking Process</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customers submit booking requests through the platform</li>
                <li>Chefs have 48 hours to accept or decline requests</li>
                <li>Payment is processed upon chef acceptance of the booking</li>
                <li>Bookings are confirmed once payment is successfully processed</li>
              </ul>

              <h3 className="font-semibold mt-4">4.2 Pricing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chefs set their own hourly rates and minimum spend requirements</li>
                <li>Platform service fee (15% of booking subtotal) is added at checkout</li>
                <li>All prices are displayed in USD</li>
                <li>Final price includes chef fee, service fee, and any optional add-ons</li>
              </ul>

              <h3 className="font-semibold mt-4">4.3 Payment Processing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed securely through Stripe</li>
                <li>We accept credit and debit cards</li>
                <li>Payment information is encrypted and never stored on our servers</li>
                <li>Chef payouts are processed within 7 days of completed bookings</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Cancellation and Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">5.1 Customer Cancellations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>48+ hours before event:</strong> 100% refund (minus service fee)</li>
                <li><strong>24-48 hours before event:</strong> 50% refund</li>
                <li><strong>Less than 24 hours:</strong> No refund</li>
              </ul>

              <h3 className="font-semibold mt-4">5.2 Chef Cancellations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chefs who cancel confirmed bookings must provide 48 hours notice</li>
                <li>Customers receive 100% refund for chef-initiated cancellations</li>
                <li>Repeated cancellations may result in chef account suspension</li>
              </ul>

              <h3 className="font-semibold mt-4">5.3 Refund Processing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refunds are processed to the original payment method</li>
                <li>Allow 5-10 business days for refunds to appear</li>
                <li>Service fees are non-refundable except in cases of chef cancellation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Chef Requirements and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">6.1 Verification</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chefs must complete identity verification</li>
                <li>Proof of culinary credentials or experience may be required</li>
                <li>Food handler's certificate (where required by local law)</li>
                <li>Liability insurance (recommended, may be required)</li>
              </ul>

              <h3 className="font-semibold mt-4">6.2 Service Standards</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide services as described in profile and booking details</li>
                <li>Maintain professional conduct and appearance</li>
                <li>Follow food safety and hygiene best practices</li>
                <li>Communicate clearly with customers about menu, timing, and requirements</li>
                <li>Arrive on time and fully prepared with all necessary equipment/ingredients</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Customer Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate booking information (date, time, guest count, location)</li>
                <li>Communicate dietary restrictions and allergies clearly</li>
                <li>Ensure kitchen facilities and workspace are available and clean</li>
                <li>Treat chefs with respect and professionalism</li>
                <li>Pay for services as agreed</li>
                <li>Provide honest, constructive feedback through reviews</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. Prohibited Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Users may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bypass the platform to complete bookings privately (circumvention)</li>
                <li>Provide false information or impersonate others</li>
                <li>Harass, threaten, or discriminate against other users</li>
                <li>Use the platform for illegal activities</li>
                <li>Post fraudulent or misleading content</li>
                <li>Scrape or collect user data without permission</li>
                <li>Interfere with platform operations or security</li>
              </ul>
              <p className="mt-4">
                <strong>Violation may result in immediate account termination and legal action.</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>9. Liability and Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">9.1 Platform Liability</h3>
              <p>
                Dine Maison provides a marketplace platform only. We do not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Guarantee the quality, safety, or legality of services provided by chefs</li>
                <li>Assume liability for food-borne illness, allergic reactions, or injuries</li>
                <li>Control or supervise chef conduct during bookings</li>
                <li>Warrant that the platform will be error-free or uninterrupted</li>
              </ul>

              <h3 className="font-semibold mt-4">9.2 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Dine Maison shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
                directly or indirectly.
              </p>

              <h3 className="font-semibold mt-4">9.3 Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless Dine Maison from any claims, damages, or expenses arising
                from your use of the platform or violation of these terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>10. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Dine Maison owns all platform content, logos, and trademarks</li>
                <li>Users retain ownership of content they upload (photos, descriptions, reviews)</li>
                <li>By uploading content, you grant us license to use, display, and distribute it on the platform</li>
                <li>You may not copy, reproduce, or distribute platform content without permission</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>11. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">11.1 Customer-Chef Disputes</h3>
              <p>
                We encourage direct communication to resolve issues. If a dispute cannot be resolved, contact our
                support team at support@dinemaison.com for mediation assistance.
              </p>

              <h3 className="font-semibold mt-4">11.2 Arbitration</h3>
              <p>
                Any disputes arising from these terms shall be resolved through binding arbitration rather than in
                court, except where prohibited by law.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>12. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms. Users may close their
                accounts at any time through account settings or by contacting support.
              </p>
              <p>
                Upon termination, you will no longer have access to your account, but obligations related to completed
                bookings remain in effect.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>13. Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                These terms shall be governed by the laws of [Your State/Country], without regard to conflict of law
                principles. Any legal action must be brought in the courts located in [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>For questions about these Terms of Service, please contact us:</p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> legal@dinemaison.com</li>
                <li><strong>Support:</strong> support@dinemaison.com</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is a template Terms of Service. Before launching your platform, you should
              have this document reviewed by a qualified attorney to ensure compliance with applicable laws and
              regulations in your jurisdiction.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

