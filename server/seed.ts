import "dotenv/config";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { userRoles, chefProfiles } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * Seed script to create test accounts for development
 * 
 * Run with: npx tsx server/seed.ts
 * 
 * Test Accounts:
 * - Admin:    admin@dinemaison.com    / admin123
 * - Chef:     chef@dinemaison.com     / chef123
 * - Customer: customer@dinemaison.com / customer123
 */

const TEST_ACCOUNTS = [
  {
    email: "admin@dinemaison.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  {
    email: "chef@dinemaison.com",
    password: "chef123",
    firstName: "Marco",
    lastName: "Rossi",
    role: "chef",
    chefProfile: {
      displayName: "Chef Marco Rossi",
      bio: "Award-winning Italian chef with 15 years of experience in fine dining. Specializing in authentic Italian cuisine with a modern twist. From homemade pasta to exquisite seafood dishes, I bring the flavors of Italy to your table.",
      yearsExperience: 15,
      cuisines: ["Italian", "Mediterranean", "French"],
      dietarySpecialties: ["Gluten-Free", "Vegetarian", "Pescatarian"],
      servicesOffered: ["Private Dinner", "Cooking Class", "Event Catering", "Meal Prep"],
      minimumSpend: "350",
      minimumGuests: 2,
      maximumGuests: 12,
      hourlyRate: "150",
      verificationLevel: "certified",
      isCertified: true,
      isActive: true,
      commissionRate: "15",
      averageRating: "4.8",
      totalReviews: 24,
      completedBookings: 47,
    },
  },
  {
    email: "ameer.natson@dinemaison.com",
    password: "chef123",
    firstName: "Ameer",
    lastName: "Natson",
    role: "chef",
    chefProfile: {
      displayName: "Ameer Natson",
      bio: "Visionary culinary artist blending bold international flavors with refined technique. With a passion for innovation and a deep respect for tradition, Chef Ameer crafts unforgettable dining experiences that celebrate the art of food. From contemporary fusion to classic comfort with a twist, his dynamic approach transforms every meal into a memorable journey. Known for his creative plating, locally-sourced ingredients, and warm hospitality, Chef Ameer brings both expertise and soul to your table.",
      profileImageUrl: "https://freeimage.host/i/fl0CC0b",
      yearsExperience: 12,
      cuisines: ["Contemporary American", "Fusion", "Mediterranean", "Caribbean"],
      dietarySpecialties: ["Vegan", "Vegetarian", "Gluten-Free", "Paleo"],
      servicesOffered: ["Private Dinner", "Event Catering", "Meal Prep", "Cooking Class"],
      minimumSpend: "300",
      minimumGuests: 2,
      maximumGuests: 16,
      hourlyRate: "175",
      verificationLevel: "certified",
      isCertified: true,
      isActive: true,
      commissionRate: "15",
      averageRating: "4.9",
      totalReviews: 18,
      completedBookings: 32,
    },
  },
  {
    email: "customer@dinemaison.com",
    password: "customer123",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "customer",
  },
];

async function seed() {
  console.log("🌱 Starting seed process...\n");

  for (const account of TEST_ACCOUNTS) {
    try {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, account.email));

      if (existingUser) {
        console.log(`⏭️  User ${account.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: account.email,
          password: hashedPassword,
          firstName: account.firstName,
          lastName: account.lastName,
        })
        .returning();

      console.log(`✅ Created user: ${account.email}`);

      // Set user role - check if exists first
      const [existingRole] = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, newUser.id));

      if (existingRole) {
        await db
          .update(userRoles)
          .set({ role: account.role })
          .where(eq(userRoles.userId, newUser.id));
      } else {
        await db
          .insert(userRoles)
          .values({
            userId: newUser.id,
            role: account.role,
          });
      }

      console.log(`   └─ Assigned role: ${account.role}`);

      // Create chef profile if applicable
      if (account.role === "chef" && account.chefProfile) {
        await db
          .insert(chefProfiles)
          .values({
            userId: newUser.id,
            ...account.chefProfile,
          });

        console.log(`   └─ Created chef profile: ${account.chefProfile.displayName}`);
      }

      console.log("");
    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error);
    }
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  TEST ACCOUNTS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  👤 ADMIN");
  console.log("     Email:    admin@dinemaison.com");
  console.log("     Password: admin123");
  console.log("");
  console.log("  👨‍🍳 CHEF - Marco Rossi");
  console.log("     Email:    chef@dinemaison.com");
  console.log("     Password: chef123");
  console.log("");
  console.log("  👨‍🍳 CHEF - Ameer Natson");
  console.log("     Email:    ameer.natson@dinemaison.com");
  console.log("     Password: chef123");
  console.log("     Image:    https://freeimage.host/i/fl0CC0b");
  console.log("");
  console.log("  🧑 CUSTOMER");
  console.log("     Email:    customer@dinemaison.com");
  console.log("     Password: customer123");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

