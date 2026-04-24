"use client"

import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, itemSchema, type ItemFormInput } from "@/lib/validations/item"

export default function ReportLostPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema),
  })

  const onSubmit = async (data: ItemFormInput) => {
    setSubmitError(null)
    try {
      await axios.post("/api/items", { ...data, status: "Lost" })
      reset()
      router.push("/")
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string } | undefined)?.message ||
          "Could not submit report. Please try again."
        setSubmitError(msg)
        return
      }
      setSubmitError("Could not submit report. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="overflow-hidden rounded-2xl border-none shadow-xl">
          <div className="flex h-32 flex-col justify-end bg-gradient-to-r from-blue-500 to-cyan-400 p-8">
            <h1 className="flex items-center text-3xl font-bold text-white">
              <AlertCircle className="mr-3 h-8 w-8 opacity-80" />
              Report Lost Item
            </h1>
          </div>
          <CardContent className="p-8">
            <p className="mb-8 text-gray-500">
              Fill out the details below to broadcast your lost item to the campus network.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" placeholder="e.g., iPhone 14 Pro" className="h-12" {...register("itemName")} />
                {errors.itemName ? <p className="text-sm text-red-600">{errors.itemName.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("category")}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category ? <p className="text-sm text-red-600">{errors.category.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brand, color, identifiable marks, etc."
                  className="min-h-[120px] resize-none"
                  {...register("description")}
                />
                {errors.description ? <p className="text-sm text-red-600">{errors.description.message}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Last Seen Location</Label>
                  <Input id="location" placeholder="e.g., Main Library" className="h-12" {...register("location")} />
                  {errors.location ? <p className="text-sm text-red-600">{errors.location.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Lost</Label>
                  <Input id="date" type="date" className="h-12" {...register("date")} />
                  {errors.date ? <p className="text-sm text-red-600">{errors.date.message}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input id="contactInfo" placeholder="Phone number or Email" className="h-12" {...register("contactInfo")} />
                {errors.contactInfo ? <p className="text-sm text-red-600">{errors.contactInfo.message}</p> : null}
              </div>

              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-blue-600 font-bold text-white shadow-lg transition-all hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
