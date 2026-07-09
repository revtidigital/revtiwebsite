import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const passwordHash = await hash("admin123", 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@revti.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@revti.com",
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Seed default site settings
  const defaultSettings = [
    { key: "site_name", value: JSON.stringify("Revti") },
    { key: "site_description", value: JSON.stringify("A modern CMS platform") },
    { key: "site_logo", value: JSON.stringify("") },
    { key: "site_favicon", value: JSON.stringify("") },
    { key: "seo_title", value: JSON.stringify("Revti - Modern CMS") },
    { key: "seo_description", value: JSON.stringify("A scalable, SaaS-grade CMS platform") },
    { key: "social_twitter", value: JSON.stringify("") },
    { key: "social_facebook", value: JSON.stringify("") },
    { key: "social_instagram", value: JSON.stringify("") },
    { key: "social_linkedin", value: JSON.stringify("") },
    { key: "footer_text", value: JSON.stringify("© 2026 Revti. All rights reserved.") },
    { key: "posts_per_page", value: JSON.stringify(12) },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log(`✅ Default settings seeded`);

  // Seed default navigation
  const mainNav = await prisma.navigation.upsert({
    where: { name: "main" },
    update: {},
    create: {
      name: "main",
      items: {
        create: [
          { label: "Home", url: "/", sortOrder: 0 },
          { label: "Blog", url: "/blog", sortOrder: 1 },
          { label: "About", url: "/about", sortOrder: 2 },
          { label: "Contact", url: "/contact", sortOrder: 3 },
        ],
      },
    },
  });

  const footerNav = await prisma.navigation.upsert({
    where: { name: "footer" },
    update: {},
    create: {
      name: "footer",
      items: {
        create: [
          { label: "Privacy Policy", url: "/privacy", sortOrder: 0 },
          { label: "Terms of Service", url: "/terms", sortOrder: 1 },
        ],
      },
    },
  });

  console.log(`✅ Navigation seeded: ${mainNav.name}, ${footerNav.name}`);

  // Seed default categories
  const categories = [
    { name: "General", slug: "general", description: "General posts" },
    { name: "Technology", slug: "technology", description: "Technology related posts" },
    { name: "News", slug: "news", description: "Latest news and updates" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ Categories seeded`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
