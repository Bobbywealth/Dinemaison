#!/usr/bin/env node
import webpush from "web-push";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

console.log("\n🔐 Generating VAPID Keys for Push Notifications\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("✅ VAPID keys generated successfully!\n");
console.log("📋 Add these to your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:support@dinemaison.com\n`);

// Check if .env file exists
const envPath = join(import.meta.dirname, "../.env");
const envExamplePath = join(import.meta.dirname, "../.env.example");

if (existsSync(envPath)) {
  console.log("⚠️  .env file already exists.");
  console.log("   Please manually add the keys above to your .env file.\n");
} else if (existsSync(envExamplePath)) {
  console.log("📝 Creating .env file from .env.example...");
  
  try {
    let envContent = readFileSync(envExamplePath, "utf-8");
    
    // Replace placeholder values
    envContent = envContent.replace(
      /VAPID_PUBLIC_KEY=.*/,
      `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`
    );
    envContent = envContent.replace(
      /VAPID_PRIVATE_KEY=.*/,
      `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`
    );
    
    writeFileSync(envPath, envContent);
    console.log("✅ .env file created with VAPID keys!\n");
    console.log("⚠️  Don't forget to set other environment variables in .env\n");
  } catch (error) {
    console.error("❌ Error creating .env file:", error);
    console.log("   Please manually create .env and add the keys above.\n");
  }
}

console.log("🚀 Next steps:");
console.log("   1. Ensure VAPID keys are in your .env file");
console.log("   2. Restart your development server");
console.log("   3. Test push notifications in the app\n");
