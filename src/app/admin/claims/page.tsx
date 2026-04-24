"use client"

import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ClaimRow = {
  id: string
  message: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
  item: {
    id: string
    itemName: string
    location: string
    category: { name: string }
  }
  user: {
    id: string
    fullName: string
    email: string
    studentId: string
  }
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const pendingClaims = useMemo(() => claims.filter((c) => c.status === "Pending"), [claims])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<{ claims: ClaimRow[] }>("/api/claims?status=Pending")
      setClaims(res.data.claims)
    } catch {
      setError("Could not load claims.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
    setUpdatingId(id)
    setError(null)
    try {
      await axios.patch(`/api/claims/${id}`, { status })
      await load()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string } | undefined)?.message || "Could not update claim."
        setError(msg)
      } else {
        setError("Could not update claim.")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto w-full min-h-screen max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin: Claims</h1>
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-gray-500">Loading claims...</CardContent>
        </Card>
      ) : pendingClaims.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-gray-500">No pending claims.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingClaims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{claim.item.itemName}</span>
                      <Badge variant="warning">PENDING</Badge>
                      <span className="text-xs text-gray-500">{claim.item.category.name}</span>
                      <span className="text-xs text-gray-500">• {claim.item.location}</span>
                    </div>
                    <p className="text-sm text-gray-700">{claim.message}</p>
                    <p className="text-xs text-gray-500">
                      By {claim.user.fullName} ({claim.user.studentId}) • {claim.user.email}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={updatingId === claim.id}
                      onClick={() => updateStatus(claim.id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updatingId === claim.id}
                      onClick={() => updateStatus(claim.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
