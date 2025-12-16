import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
              Dine <span className="text-primary">Maison</span>
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              The Art of Intimate Dining. Experience luxury private chef services tailored to your taste.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">For Guests</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/chefs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse Chefs
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">For Chefs</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/become-chef" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Become a Chef
                </Link>
              </li>
              <li>
                <Link href="/chef-resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/chef-support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Chef Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Dine Maison. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="https://www.facebook.com/profile.php?id=61582537387080" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-facebook"
              >
                Facebook
              </a>
              <a 
                href="https://instagram.com/dinemaison" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-instagram"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
