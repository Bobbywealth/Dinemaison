import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const inputIcon = join(import.meta.dirname, "../client/public/favicon.png");
const outputDir = join(import.meta.dirname, "../client/public");

const sizes = [
  { name: "pwa-64x64.png", size: 64 },
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "maskable-icon-512x512.png", size: 512 },
];

async function generateIcons() {
  console.log("Generating PWA icons...");
  
  for (const { name, size } of sizes) {
    const outputPath = join(outputDir, name);
    
    // For maskable icons, add padding (safe zone)
    if (name.includes("maskable")) {
      const paddedSize = Math.floor(size * 0.8); // 80% of size for safe zone
      const padding = Math.floor((size - paddedSize) / 2);
      
      await sharp(inputIcon)
        .resize(paddedSize, paddedSize, {
          fit: "contain",
          background: { r: 30, g: 58, b: 95, alpha: 1 }, // #1e3a5f
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 30, g: 58, b: 95, alpha: 1 },
        })
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size} with safe zone)`);
    } else {
      await sharp(inputIcon)
        .resize(size, size, {
          fit: "contain",
          background: { r: 30, g: 58, b: 95, alpha: 1 },
        })
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
  }
  
  console.log("\n✅ All PWA icons generated successfully!");
}

generateIcons().catch((error) => {
  console.error("Error generating icons:", error);
  process.exit(1);
});

