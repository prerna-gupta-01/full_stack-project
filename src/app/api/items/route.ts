import { ItemStatus, Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { itemSchema } from "@/lib/validations/item"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get("status")
    const search = searchParams.get("search")
    const categoryName = searchParams.get("category")

    const status =
      statusParam === ItemStatus.Lost ||
      statusParam === ItemStatus.Found ||
      statusParam === ItemStatus.Claimed
        ? statusParam
        : undefined

    const where: Prisma.ItemWhereInput = {
      ...(status ? { status } : {}),
      ...(categoryName ? { category: { name: categoryName } } : {}),
      ...(search
        ? {
            OR: [
              { itemName: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      {
        message: "Could not load items. Check database configuration.",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = itemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid form data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { itemName, category: categoryName, description, location, date, contactInfo, status } = parsed.data

    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        icon: "box",
      },
    })
    
    const userId = session.user.id;

    const item = await prisma.item.create({
      data: {
        itemName,
        description,
        location,
        date: new Date(date),
        status: status === "Found" ? ItemStatus.Found : ItemStatus.Lost,
        contactInfo,
        categoryId: category.id,
        userId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(
      {
        message: "Item reported successfully",
        item,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      {
        message: "Could not create item report. Check database configuration.",
      },
      { status: 500 }
    )
  }
}
