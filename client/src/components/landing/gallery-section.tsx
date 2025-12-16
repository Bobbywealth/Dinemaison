import chefImage1 from "@assets/stock_images/professional_chef_co_799a5867.jpg";
import chefImage2 from "@assets/stock_images/professional_chef_co_4a55398b.jpg";
import foodImage1 from "@assets/stock_images/gourmet_food_plating_d2094bd5.jpg";
import foodImage2 from "@assets/stock_images/gourmet_food_plating_4976e510.jpg";
import diningImage from "@assets/stock_images/luxury_private_dinin_b1c27f12.jpg";

const images = [
  { src: chefImage1, alt: "Professional chef at work", span: "col-span-1 row-span-2" },
  { src: foodImage1, alt: "Gourmet food plating", span: "col-span-1 row-span-1" },
  { src: diningImage, alt: "Luxury private dining", span: "col-span-1 row-span-1" },
  { src: foodImage2, alt: "Elegant dish presentation", span: "col-span-1 row-span-1" },
  { src: chefImage2, alt: "Chef preparing cuisine", span: "col-span-1 row-span-1" },
];

export function GallerySection() {
  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Moments of Culinary Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A glimpse into the artistry and elegance that defines every Dine Maison experience.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index}
              className={`relative overflow-hidden rounded-md group ${index === 0 ? 'row-span-2' : ''}`}
              data-testid={`gallery-image-${index}`}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ minHeight: index === 0 ? '400px' : '200px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
