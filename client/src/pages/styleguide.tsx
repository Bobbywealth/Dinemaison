import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { 
  Spinner, 
  ChefSpinner, 
  PulsingDots, 
  GradientProgress, 
  SkeletonCard,
  LoadingScreen,
  InlineLoader,
  SuccessCheck
} from "@/components/ui/loading";
import { 
  ChefHat, 
  Sparkles, 
  Star, 
  Heart, 
  Mail, 
  Lock,
  User,
  Search
} from "lucide-react";
import { useState } from "react";

export default function StyleGuidePage() {
  const [progress, setProgress] = useState(65);
  const [showLoading, setShowLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Design System</span>
            </div>
            <h1 className="heading-xl mb-4">
              Dine Maison <span className="text-gradient-luxury">Style Guide</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              A comprehensive showcase of all UI components, design tokens, and patterns used in the Dine Maison platform.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-border/50 shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Colors",
                    "Typography",
                    "Buttons",
                    "Forms",
                    "Loading States",
                    "Cards",
                    "Badges",
                    "Animations"
                  ].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                      className="p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium text-center"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Colors */}
          <Section id="colors" title="Color Palette" delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Colors */}
              <ColorCard title="Primary Colors">
                <ColorSwatch color="hsl(var(--primary))" name="Primary" />
                <ColorSwatch color="hsl(var(--primary-foreground))" name="Primary Foreground" />
                <ColorSwatch color="hsl(30 55% 45%)" name="Primary Variant" />
                <ColorSwatch color="hsl(38 100% 50%)" name="Accent Gold" />
              </ColorCard>

              {/* Background Colors */}
              <ColorCard title="Background & Surface">
                <ColorSwatch color="hsl(var(--background))" name="Background" />
                <ColorSwatch color="hsl(var(--card))" name="Card" />
                <ColorSwatch color="hsl(var(--muted))" name="Muted" />
                <ColorSwatch color="hsl(var(--accent))" name="Accent" />
              </ColorCard>

              {/* Text Colors */}
              <ColorCard title="Text Colors">
                <ColorSwatch color="hsl(var(--foreground))" name="Foreground" />
                <ColorSwatch color="hsl(var(--muted-foreground))" name="Muted Foreground" />
              </ColorCard>

              {/* Semantic Colors */}
              <ColorCard title="Semantic Colors">
                <ColorSwatch color="hsl(var(--destructive))" name="Destructive" />
                <ColorSwatch color="rgb(34 197 94)" name="Success" />
                <ColorSwatch color="rgb(245 158 11)" name="Warning" />
                <ColorSwatch color="rgb(59 130 246)" name="Info" />
              </ColorCard>
            </div>
          </Section>

          {/* Typography */}
          <Section id="typography" title="Typography" delay={0.3}>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Display & Headings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h1 className="text-display">Display Text - Extra Large</h1>
                    <code className="text-xs text-muted-foreground">.text-display</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h2 className="heading-xl">Heading XL - Page Titles</h2>
                    <code className="text-xs text-muted-foreground">.heading-xl</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h3 className="heading-lg">Heading Large - Section Titles</h3>
                    <code className="text-xs text-muted-foreground">.heading-lg</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h4 className="heading-md">Heading Medium - Subsections</h4>
                    <code className="text-xs text-muted-foreground">.heading-md</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Body Text</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <p className="body-lg">Large body text for important content and descriptions.</p>
                    <code className="text-xs text-muted-foreground">.body-lg</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <p className="body-md">Medium body text for general content.</p>
                    <code className="text-xs text-muted-foreground">.body-md</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Gradient Text</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h2 className="heading-xl text-gradient-luxury">Animated Luxury Gradient</h2>
                    <code className="text-xs text-muted-foreground">.text-gradient-luxury</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <h2 className="heading-xl text-gradient">Static Primary Gradient</h2>
                    <code className="text-xs text-muted-foreground">.text-gradient</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Special Text Styles</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <p className="text-label">Premium Label Text</p>
                    <code className="text-xs text-muted-foreground">.text-label</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <p className="text-luxury">Luxury Uppercase</p>
                    <code className="text-xs text-muted-foreground">.text-luxury</code>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/50">
                    <p className="text-quote">"This is a styled quote text with elegant serif font and italics."</p>
                    <code className="text-xs text-muted-foreground">.text-quote</code>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Buttons */}
          <Section id="buttons" title="Buttons" delay={0.4}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="gradient">Gradient</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <ChefHat className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="gradient">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Premium Action
                  </Button>
                  <Button variant="outline">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Find a Chef
                  </Button>
                  <Button variant="ghost">
                    Continue
                    <Star className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled</Button>
                  <Button variant="gradient" disabled>Disabled Gradient</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                </div>
              </div>
            </div>
          </Section>

          {/* Forms */}
          <Section id="forms" title="Form Components" delay={0.5}>
            <div className="max-w-2xl space-y-6">
              <EnhancedInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                hint="We'll never share your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                showValidation
                isValid={email.includes("@")}
              />

              <EnhancedInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                hint="Must be at least 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <EnhancedInput
                label="With Error"
                type="text"
                error="This field is required"
                icon={<User className="h-4 w-4" />}
              />

              <EnhancedInput
                label="With Success"
                type="text"
                success="Looks good!"
                defaultValue="John Doe"
                icon={<User className="h-4 w-4" />}
                showValidation
                isValid
              />

              <EnhancedTextarea
                label="Description"
                placeholder="Tell us about your experience..."
                rows={4}
                showCharCount
                maxCharCount={500}
                hint="Be as detailed as you'd like"
              />

              <EnhancedTextarea
                label="With Character Limit"
                placeholder="Maximum 100 characters"
                rows={3}
                showCharCount
                maxCharCount={100}
              />
            </div>
          </Section>

          {/* Loading States */}
          <Section id="loading-states" title="Loading States" delay={0.6}>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Spinners</h3>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size="sm" />
                    <code className="text-xs">Small</code>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size="md" />
                    <code className="text-xs">Medium</code>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size="lg" />
                    <code className="text-xs">Large</code>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ChefSpinner />
                    <code className="text-xs">Chef Icon</code>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <PulsingDots />
                    <code className="text-xs">Dots</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Progress Bar</h3>
                <div className="space-y-4">
                  <GradientProgress progress={progress} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
                    <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Inline Loader</h3>
                <InlineLoader text="Processing your request" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Success Checkmark</h3>
                <SuccessCheck />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Skeleton Card</h3>
                <SkeletonCard />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Full Page Loader</h3>
                <Button onClick={() => setShowLoading(true)}>
                  Show Loading Screen
                </Button>
                {showLoading && (
                  <LoadingScreen message="Preparing your experience..." />
                )}
                {showLoading && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowLoading(false)}
                  >
                    Close Loading Screen
                  </Button>
                )}
              </div>
            </div>
          </Section>

          {/* Cards */}
          <Section id="cards" title="Cards" delay={0.7}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Basic card with header and content
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-xl shadow-primary/10">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card with enhanced shadow
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Glassmorphism</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card with glass effect
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 card-lift">
                <CardHeader>
                  <CardTitle>Hover Lift Effect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover over this card
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-amber-500/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Gradient Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card with gradient background
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gradient">
                <CardHeader>
                  <CardTitle>Gradient Border</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card with gradient border
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Badges */}
          <Section id="badges" title="Badges" delay={0.8}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-gradient-to-r from-primary to-amber-600 border-0">Gradient</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-gradient-to-r from-primary to-amber-600 border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                  <Badge variant="outline">
                    <Heart className="h-3 w-3 mr-1" />
                    Favorite
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="text-xs px-2 py-0.5">Small</Badge>
                  <Badge>Default</Badge>
                  <Badge className="text-sm px-3 py-1">Large</Badge>
                </div>
              </div>
            </div>
          </Section>

          {/* Animations */}
          <Section id="animations" title="Animations & Effects" delay={0.9}>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fade In Animations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="fade-in p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Fade In</p>
                    <code className="text-xs text-muted-foreground">.fade-in</code>
                  </div>
                  <div className="fade-in-up p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Fade In Up</p>
                    <code className="text-xs text-muted-foreground">.fade-in-up</code>
                  </div>
                  <div className="fade-in-down p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Fade In Down</p>
                    <code className="text-xs text-muted-foreground">.fade-in-down</code>
                  </div>
                  <div className="fade-in-left p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Fade In Left</p>
                    <code className="text-xs text-muted-foreground">.fade-in-left</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Hover Effects</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="hover-glow p-6 bg-card rounded-lg border border-border/50 text-center cursor-pointer">
                    <p className="text-sm">Hover Glow</p>
                    <code className="text-xs text-muted-foreground">.hover-glow</code>
                  </div>
                  <div className="shine p-6 bg-card rounded-lg border border-border/50 text-center cursor-pointer">
                    <p className="text-sm">Shine Effect</p>
                    <code className="text-xs text-muted-foreground">.shine</code>
                  </div>
                  <div className="card-lift p-6 bg-card rounded-lg border border-border/50 text-center cursor-pointer">
                    <p className="text-sm">Card Lift</p>
                    <code className="text-xs text-muted-foreground">.card-lift</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Continuous Animations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="pulse-soft p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Pulse Soft</p>
                    <code className="text-xs text-muted-foreground">.pulse-soft</code>
                  </div>
                  <div className="float p-6 bg-card rounded-lg border border-border/50 text-center">
                    <p className="text-sm">Float</p>
                    <code className="text-xs text-muted-foreground">.float</code>
                  </div>
                  <div className="spin-slow p-6 bg-card rounded-lg border border-border/50 text-center">
                    <ChefHat className="h-8 w-8 mx-auto mb-2" />
                    <code className="text-xs text-muted-foreground">.spin-slow</code>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Helper Components
function Section({ 
  id, 
  title, 
  children, 
  delay = 0 
}: { 
  id: string; 
  title: string; 
  children: React.ReactNode; 
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      className="mb-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="mb-8">
        <h2 className="heading-lg mb-2">{title}</h2>
        <div className="divider-luxury" />
      </div>
      {children}
    </motion.section>
  );
}

function ColorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border border-border/50 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <code className="text-xs text-muted-foreground">{color}</code>
      </div>
    </div>
  );
}



