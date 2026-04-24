import { z } from "zod"

export const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Books",
  "ID Cards",
  "Bags",
  "Others",
] as const

function isValidDateOnly(value: string) {
  // Expect yyyy-mm-dd (from <input type="date" />)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(d.getTime())
}

export const itemSchema = z.object({
  itemName: z.string().trim().min(2, "Item name is required"),
  category: z.enum(CATEGORIES, { message: "Please select a valid category" }),
  description: z.string().trim().min(10, "Please add more item details"),
  location: z.string().trim().min(2, "Location is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(isValidDateOnly, "Please enter a valid date"),
  contactInfo: z
    .string()
    .trim()
    .min(5, "Contact information is required")
    .refine(
      (v) => /@/.test(v) || v.replace(/\D/g, "").length >= 8,
      "Enter a valid email or phone number"
    ),
  status: z.enum(["Lost", "Found"]).optional(),
})

export type ItemFormInput = z.infer<typeof itemSchema>
