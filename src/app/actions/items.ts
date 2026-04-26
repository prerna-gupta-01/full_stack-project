"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ItemStatus } from "@prisma/client"

export async function submitLostItem(formData: FormData) {
  const itemName = formData.get("itemName") as string
  const categoryName = formData.get("category") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const dateStr = formData.get("date") as string
  const contactInfo = formData.get("contactInfo") as string

  // Simple validation
  if (!itemName || !description || !location || !dateStr) {
    throw new Error("Missing required fields")
  }

  // Get or Create Category
  const category = await prisma.category.upsert({
    where: { name: categoryName || 'Others' },
    update: {},
    create: {
      name: categoryName || 'Others',
      icon: 'box'
    }
  })

  // Mock User Creation (since Auth isn't fully wired yet)
  const user = await prisma.user.upsert({
    where: { email: 'prerna@campus.com' },
    update: {},
    create: {
      fullName: 'Prerna',
      email: 'prerna@campus.com',
      studentId: 'STU001',
      password: 'password123',
    }
  })

  // Create the actual Item in Postgres!
  await prisma.item.create({
    data: {
      itemName,
      description,
      location,
      date: new Date(dateStr),
      status: ItemStatus.Lost,
      contactInfo,
      categoryId: category.id,
      userId: user.id
    }
  })

  revalidatePath("/")
  redirect("/")
}
