import { ClaimStatus, ItemStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClaimSchema } from "@/lib/validations/claim"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get("status")

    const status =
      statusParam === ClaimStatus.Pending ||
      statusParam === ClaimStatus.Approved ||
      statusParam === ClaimStatus.Rejected
        ? statusParam
        : undefined

    const claims = await prisma.claim.findMany({
      where: status ? { status } : undefined,
      include: {
        item: {
          include: { category: true },
        },
        user: {
          select: { id: true, fullName: true, email: true, studentId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ claims })
  } catch {
    return NextResponse.json({ message: "Could not load claims." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createClaimSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid claim data", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { itemId, message } = parsed.data

    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 })
    }

    if (item.status !== ItemStatus.Found) {
      return NextResponse.json({ message: "Only found items can be claimed" }, { status: 400 })
    }

    const existingPending = await prisma.claim.findFirst({
      where: {
        itemId,
        userId: user.id,
        status: ClaimStatus.Pending,
      },
    })

    if (existingPending) {
      return NextResponse.json({ message: "You already have a pending claim for this item." }, { status: 409 })
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        userId: user.id,
        message,
        status: ClaimStatus.Pending,
      },
    })

    return NextResponse.json({ message: "Claim submitted", claim }, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Could not submit claim." }, { status: 500 })
  }
}
