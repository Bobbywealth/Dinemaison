import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

const defaultMeta = {
  title: 'Dine Maison - Private Chef Experiences',
  description: 'Book exclusive private chef experiences for your home. From intimate dinners to celebrations, our curated chefs bring restaurant-quality dining to your table.',
  keywords: ['private chef', 'home dining', 'personal chef', 'dinner party', 'catering', 'culinary experience', 'chef booking'],
  image: '/gourmet_food_plating_4976e510.jpg',
  url: 'https://dinemaison.com',
};

export function SEO({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | Dine Maison` : defaultMeta.title;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Dine Maison" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional SEO */}
      <link rel="canonical" href={url} />
      <meta name="author" content="Dine Maison" />
      <meta name="theme-color" content="#8B5CF6" />
    </Helmet>
  );
}

// Pre-configured SEO for common pages
export function HomeSEO() {
  return (
    <SEO
      description="Transform your home into a private restaurant. Book verified private chefs for intimate dinners, celebrations, and culinary experiences tailored to your taste."
      keywords={['private chef booking', 'home dining experience', 'personal chef service', 'luxury dining', 'chef for hire']}
    />
  );
}

export function ChefsSEO() {
  return (
    <SEO
      title="Browse Private Chefs"
      description="Discover our curated selection of verified private chefs. Filter by cuisine, price, and availability to find your perfect culinary match."
      keywords={['private chefs', 'personal chefs near me', 'hire a chef', 'professional chefs', 'chef directory']}
      url="https://dinemaison.com/chefs"
    />
  );
}

export function ChefProfileSEO({ chefName, cuisines, bio }: { chefName: string; cuisines: string[]; bio: string }) {
  return (
    <SEO
      title={chefName}
      description={bio.substring(0, 160)}
      keywords={['private chef', chefName, ...cuisines]}
      type="profile"
      url={`https://dinemaison.com/chefs/${encodeURIComponent(chefName.toLowerCase().replace(/\s+/g, '-'))}`}
    />
  );
}

export function BookingSEO() {
  return (
    <SEO
      title="Book Your Experience"
      description="Complete your private chef booking. Choose your date, guest count, and preferences for an unforgettable dining experience."
      keywords={['book private chef', 'chef reservation', 'private dining booking']}
      url="https://dinemaison.com/booking"
      noIndex // Don't index booking pages
    />
  );
}

export function DashboardSEO() {
  return (
    <SEO
      title="Dashboard"
      description="Manage your Dine Maison bookings, profile, and preferences."
      noIndex // Don't index dashboard
    />
  );
}

export function BecomeChefSEO() {
  return (
    <SEO
      title="Become a Chef"
      description="Join Dine Maison as a private chef. Set your own rates, choose your clients, and grow your culinary business with our platform."
      keywords={['become private chef', 'chef jobs', 'private chef career', 'culinary jobs', 'chef platform']}
      url="https://dinemaison.com/become-chef"
    />
  );
}

