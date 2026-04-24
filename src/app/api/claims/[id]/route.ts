import { ClaimStatus, ItemStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateClaimStatusSchema } from "@/lib/validations/claim"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = updateClaimStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid status update", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { item: true, user: true },
    })

    if (!claim) {
      return NextResponse.json({ message: "Claim not found" }, { status: 404 })
    }

    if (claim.status !== ClaimStatus.Pending) {
      return NextResponse.json({ message: "Only pending claims can be updated" }, { status: 400 })
    }

    const nextStatus = parsed.data.status === "Approved" ? ClaimStatus.Approved : ClaimStatus.Rejected

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.claim.update({
        where: { id },
        data: { status: nextStatus },
      })

      if (nextStatus === ClaimStatus.Approved) {
        await tx.item.update({
          where: { id: claim.itemId },
          data: { status: ItemStatus.Claimed },
        })

        // Reject other pending claims for the same item
        await tx.claim.updateMany({
          where: { itemId: claim.itemId, status: ClaimStatus.Pending, NOT: { id } },
          data: { status: ClaimStatus.Rejected },
        })

        await tx.notification.create({
          data: {
            userId: claim.userId,
            message: `Your claim for "${claim.item.itemName}" was approved.`,
          },
        })
      } else {
        await tx.notification.create({
          data: {
            userId: claim.userId,
            message: `Your claim for "${claim.item.itemName}" was rejected.`,
          },
        })
      }

      return updated
    })

    return NextResponse.json({ message: "Claim updated", claim: result })
  } catch {
    return NextResponse.json({ message: "Could not update claim." }, { status: 500 })
  }
}
