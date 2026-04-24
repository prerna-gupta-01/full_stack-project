import { z } from "zod"

export const createClaimSchema = z.object({
  itemId: z.string().min(1, "Missing item id"),
  message: z.string().trim().min(10, "Please add details to prove ownership"),
})

export type CreateClaimInput = z.infer<typeof createClaimSchema>

export const updateClaimStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
})

export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>
