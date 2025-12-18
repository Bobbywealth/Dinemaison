import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, ChefHat, Users, CreditCard, Calendar } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about Dine Maison
            </p>
          </div>

          {/* Customer FAQs */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">For Customers</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  How does Dine Maison work?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    Dine Maison is a marketplace connecting you with professional private chefs.
                    Here's how it works:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Browse chef profiles and read reviews from previous customers</li>
                    <li>Select a chef and choose your preferred date, time, and guest count</li>
                    <li>Customize your experience with optional add-ons (wine pairing, cocktails, etc.)</li>
                    <li>Submit your booking request with event details</li>
                    <li>The chef accepts your request and confirms the booking</li>
                    <li>Payment is processed securely through our platform</li>
                    <li>Your chef arrives at your location and prepares an amazing meal!</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What's included in the price?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">The price you see includes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Chef's service fee:</strong> The chef's time and expertise for your event</li>
                    <li><strong>Menu planning:</strong> Custom menu creation based on your preferences</li>
                    <li><strong>Ingredients:</strong> All food and groceries needed for your meal</li>
                    <li><strong>Cooking:</strong> Preparation and cooking at your location</li>
                    <li><strong>Plating:</strong> Professional presentation of dishes</li>
                    <li><strong>Kitchen cleanup:</strong> Cleaning of all cooking areas and equipment used</li>
                    <li><strong>Platform service fee:</strong> 15% fee to maintain the platform</li>
                  </ul>
                  <p className="mt-4">
                    Note: Tableware, dining area cleanup, and alcohol (unless specifically included) are
                    typically not included but can be arranged with your chef.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  How far in advance should I book?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We recommend booking <strong>at least 1-2 weeks in advance</strong> for best
                    availability, especially for weekend dates or special occasions. However, many chefs
                    can accommodate last-minute bookings (48 hours notice) depending on their schedule.
                  </p>
                  <p className="mt-4">
                    For holiday events (Thanksgiving, Christmas, New Year's Eve), we recommend booking
                    4-6 weeks in advance as these are popular dates.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  What if I have dietary restrictions or allergies?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    Our chefs are experienced in accommodating various dietary needs:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Vegetarian, vegan, and plant-based diets</li>
                    <li>Gluten-free, dairy-free, nut-free requirements</li>
                    <li>Keto, paleo, and low-carb preferences</li>
                    <li>Religious dietary laws (kosher, halal)</li>
                    <li>Specific food allergies</li>
                  </ul>
                  <p className="mt-4">
                    When booking, clearly specify all dietary restrictions and allergies in the special
                    requests section. Your chef will design a custom menu to meet your needs.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What do I need to provide?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">For a successful experience, please provide:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Kitchen access:</strong> A clean kitchen with basic appliances (stove, oven, refrigerator)</li>
                    <li><strong>Workspace:</strong> Counter space for food preparation</li>
                    <li><strong>Tableware:</strong> Plates, utensils, glasses for your guests</li>
                    <li><strong>Parking:</strong> Parking space or guest pass if in a secured building</li>
                  </ul>
                  <p className="mt-4">
                    Your chef will bring all cooking equipment, tools, and ingredients. If you have specific
                    equipment preferences or limitations, discuss with your chef beforehand.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  What's the cancellation policy?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">Our cancellation policy is:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>48+ hours before event:</strong> Full refund (minus service fee)</li>
                    <li><strong>24-48 hours before event:</strong> 50% refund</li>
                    <li><strong>Less than 24 hours:</strong> No refund</li>
                  </ul>
                  <p className="mt-4">
                    Refunds are processed to your original payment method within 5-10 business days.
                    If your chef cancels, you'll receive a 100% refund regardless of timing.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Can I request a specific menu?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Absolutely! After booking, your chef will contact you to discuss menu preferences.
                    You can request specific dishes, cuisines, or let the chef design a custom menu based
                    on your tastes and the occasion. Most chefs are flexible and love creating personalized
                    experiences.
                  </p>
                  <p className="mt-4">
                    You can also view each chef's signature dishes and specialties on their profile page
                    to get an idea of their style.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Chef FAQs */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ChefHat className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">For Chefs</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="chef-1">
                <AccordionTrigger className="text-left">
                  How do I become a chef on Dine Maison?
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Click "Become a Chef" and complete the application form</li>
                    <li>Provide proof of culinary credentials or professional experience</li>
                    <li>Submit to identity verification and background check</li>
                    <li>Set up your profile with photos, bio, and specialties</li>
                    <li>Connect your bank account via Stripe for payments</li>
                    <li>Get approved and start receiving booking requests!</li>
                  </ol>
                  <p className="mt-4">
                    The approval process typically takes 3-5 business days. We verify all credentials
                    to maintain quality and trust on our platform.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chef-2">
                <AccordionTrigger className="text-left">
                  How much do chefs earn?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">Chef earnings depend on several factors:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Your hourly rate:</strong> You set your own rates (typically $150-$300/hour)</li>
                    <li><strong>Event duration:</strong> Most events are 3-5 hours</li>
                    <li><strong>Guest count:</strong> Larger parties often command higher rates</li>
                    <li><strong>Add-on services:</strong> Wine pairing, cocktails, cooking classes increase earnings</li>
                  </ul>
                  <p className="mt-4">
                    Platform commission is 15% of the booking subtotal. You receive 85% of what customers
                    pay (minus the platform service fee). Payouts are processed within 7 days of
                    completed bookings.
                  </p>
                  <p className="mt-4">
                    Example: $500 booking → You earn $425 (85% of $500)
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chef-3">
                <AccordionTrigger className="text-left">
                  What insurance or licenses do I need?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">Requirements vary by location, but typically include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Food Handler's Certificate:</strong> Required in most jurisdictions</li>
                    <li><strong>Business License:</strong> May be required for independent contractors</li>
                    <li><strong>Liability Insurance:</strong> Strongly recommended (protects you and customers)</li>
                    <li><strong>Health Permit:</strong> Check local requirements</li>
                  </ul>
                  <p className="mt-4">
                    We recommend consulting with a local attorney or your state's food service regulatory
                    agency to ensure full compliance.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chef-4">
                <AccordionTrigger className="text-left">
                  Can I decline booking requests?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Yes, you have full control over which bookings you accept. You can decline requests
                    if you're unavailable, if the request doesn't match your specialties, or for any
                    other reason.
                  </p>
                  <p className="mt-4">
                    However, we recommend maintaining a high acceptance rate (aim for 80%+) as this
                    affects your profile visibility and ranking. If you need to be unavailable for
                    specific dates, use the calendar settings to block those days.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="chef-5">
                <AccordionTrigger className="text-left">
                  How does payment work for chefs?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">Our payment process ensures security and reliability:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Customer pays through our platform when booking is confirmed</li>
                    <li>Funds are held securely until the event is completed</li>
                    <li>After the event, customer has 24 hours to report any issues</li>
                    <li>Payout is automatically processed to your bank account within 7 days</li>
                  </ol>
                  <p className="mt-4">
                    All payments are processed through Stripe. You'll need to complete Stripe Connect
                    onboarding to receive payments (includes identity verification and bank account
                    connection).
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Payment & Booking FAQs */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Payment & Booking</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="payment-1">
                <AccordionTrigger className="text-left">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We accept all major credit and debit cards (Visa, Mastercard, American Express,
                    Discover) through our secure payment processor, Stripe. We do not accept cash,
                    checks, or direct bank transfers.
                  </p>
                  <p className="mt-4">
                    All payment information is encrypted and PCI-DSS compliant. We never store your
                    credit card details on our servers.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-2">
                <AccordionTrigger className="text-left">
                  When am I charged?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    You're charged immediately when the chef accepts your booking request. This
                    secures your date and allows the chef to begin planning your menu and purchasing
                    ingredients.
                  </p>
                  <p className="mt-4">
                    The charge appears as "Dine Maison" on your credit card statement.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-3">
                <AccordionTrigger className="text-left">
                  Is tipping expected?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Tipping is optional but appreciated. While the chef's fee is already included in
                    your booking price, many customers choose to tip 10-20% for exceptional service,
                    similar to fine dining restaurants.
                  </p>
                  <p className="mt-4">
                    Tips can be given directly to your chef in cash, or you can add a tip through the
                    platform after your event.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-4">
                <AccordionTrigger className="text-left">
                  What if something goes wrong with my booking?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    We're committed to ensuring every experience exceeds expectations. If issues arise:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Contact your chef directly to resolve minor issues</li>
                    <li>For serious concerns, contact our support team immediately: support@dinemaison.com</li>
                    <li>We'll mediate disputes and work toward a fair resolution</li>
                    <li>In cases of chef no-shows or major service failures, full refunds are provided</li>
                  </ol>
                  <p className="mt-4">
                    Our support team is available 24/7 during events to handle urgent issues.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Contact Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:support@dinemaison.com">Email Us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
