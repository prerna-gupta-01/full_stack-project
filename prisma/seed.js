require("dotenv/config")

const { PrismaPg } = require("@prisma/adapter-pg")
const { PrismaClient } = require("@prisma/client")
const { Pool } = require("pg")

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")
  

  // Categories
  const categories = [
    { name: "Electronics", icon: "smartphone" },
    { name: "Accessories", icon: "watch" },
    { name: "Books", icon: "book" },
    { name: "ID Cards", icon: "badge" },
    { name: "Bags", icon: "briefcase" },
    { name: "Others", icon: "box" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Categories seeded.")
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
