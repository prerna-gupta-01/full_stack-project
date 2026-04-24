"use client"

import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClaimSchema, type CreateClaimInput } from "@/lib/validations/claim"

export default function ClaimItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const router = useRouter()
  const { itemId } = React.use(params)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClaimInput>({
    resolver: zodResolver(createClaimSchema),
    defaultValues: {
      itemId: itemId,
      message: "",
    },
  })

  const onSubmit = async (data: CreateClaimInput) => {
    setSubmitError(null)
    try {
      await axios.post("/api/claims", data)
      reset({ itemId: itemId, message: "" })
      router.push("/found")
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string } | undefined)?.message ||
          "Could not submit claim. Please try again."
        setSubmitError(msg)
        return
      }
      setSubmitError("Could not submit claim. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/found" className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Found Items
        </Link>

        <Card className="overflow-hidden rounded-2xl border-none shadow-xl">
          <div className="flex h-32 flex-col justify-end bg-gradient-to-r from-violet-600 to-indigo-500 p-8">
            <h1 className="flex items-center text-3xl font-bold text-white">
              <ShieldCheck className="mr-3 h-8 w-8 opacity-80" />
              Claim Item
            </h1>
          </div>
          <CardContent className="p-8">
            <p className="mb-8 text-gray-500">
              Add details that only the real owner would know (unique marks, contents, serial number, etc.).
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" value={itemId} {...register("itemId")} />

              <div className="space-y-2">
                <Label htmlFor="message">Claim Message</Label>
                <Textarea
                  id="message"
                  placeholder="Explain why this is yours..."
                  className="min-h-[140px] resize-none"
                  {...register("message")}
                />
                {errors.message ? <p className="text-sm text-red-600">{errors.message.message}</p> : null}
              </div>

              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

              <div className="pt-2">
                <Button type="submit" className="h-12 w-full rounded-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
