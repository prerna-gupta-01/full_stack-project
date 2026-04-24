"use client"

import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, MapPin, Search, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/validations/item"

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
})
type FilterInput = z.infer<typeof filterSchema>

type ItemRow = {
  id: string
  itemName: string
  description: string
  location: string
  date: string
  category: { name: string }
}

export default function FoundItemsPage() {
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<FilterInput>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "", category: "" },
  })

  const loadItems = useCallback(async (filters?: FilterInput) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("status", "Found")
      if (filters?.search) params.append("search", filters.search)
      if (filters?.category) params.append("category", filters.category)

      const res = await axios.get<{ items: ItemRow[] }>(`/api/items?${params.toString()}`)
      setItems(res.data.items)
    } catch {
      setError("Could not load found items.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const onSubmit = (data: FilterInput) => {
    void loadItems(data)
  }

  const onClear = () => {
    reset()
    void loadItems()
  }

  return (
    <div className="mx-auto w-full min-h-screen max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Found Items</h1>
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                {...register("search")}
                placeholder="Search by name, description, or location..."
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div className="w-full space-y-2 md:w-64">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select
              {...register("category")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-10 px-6">
              Search
            </Button>
            <Button type="button" variant="outline" onClick={onClear} className="h-10 px-6">
              Clear
            </Button>
          </div>
        </form>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${items.length} item(s) found`}
        </p>
        <Link href="/report-found">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Report Found Item</Button>
        </Link>
      </div>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <Card className="col-span-full border-none shadow-sm">
          <CardContent className="p-16 text-center text-gray-500">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No items found</p>
            <p>Try adjusting your search filters or check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {item.category.name}
                  </span>
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                    FOUND
                  </Badge>
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">{item.itemName}</h2>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="max-w-[120px] truncate">{item.location}</span>
                  </span>
                  <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                </div>

                <div className="mt-6 flex items-center justify-end border-t pt-4">
                  <Link href={`/claim/${item.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Claim this item
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
