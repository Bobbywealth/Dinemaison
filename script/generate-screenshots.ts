import sharp from "sharp";
import { join } from "path";

const outputDir = join(import.meta.dirname, "../client/public");

// Create placeholder screenshots with branding
async function generateScreenshots() {
  console.log("Generating PWA screenshots...");
  
  // Mobile screenshot (390x844)
  await sharp({
    create: {
      width: 390,
      height: 844,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="390" height="844">
            <rect width="390" height="844" fill="#0a0a0a"/>
            <text x="50%" y="45%" text-anchor="middle" font-family="serif" font-size="40" fill="#d4af37" font-weight="500">DINE MAISON</text>
            <text x="50%" y="55%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#ffffff" opacity="0.8">The Art of Intimate Dining</text>
          </svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(join(outputDir, "screenshot-mobile.png"));
  
  console.log("✓ Generated screenshot-mobile.png (390x844)");
  
  // Desktop screenshot (1920x1080)
  await sharp({
    create: {
      width: 1920,
      height: 1080,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="1920" height="1080">
            <rect width="1920" height="1080" fill="#0a0a0a"/>
            <text x="50%" y="45%" text-anchor="middle" font-family="serif" font-size="80" fill="#d4af37" font-weight="500">DINE MAISON</text>
            <text x="50%" y="55%" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#ffffff" opacity="0.8">The Art of Intimate Dining</text>
          </svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(join(outputDir, "screenshot-desktop.png"));
  
  console.log("✓ Generated screenshot-desktop.png (1920x1080)");
  
  console.log("\n✅ All screenshots generated successfully!");
  console.log("Note: Replace these with actual app screenshots for better install experience.");
}

generateScreenshots().catch((error) => {
  console.error("Error generating screenshots:", error);
  process.exit(1);
});

