import { ItemStatus } from "@prisma/client"
import { AlertCircle, CheckCircle2, ClipboardList, Home, Mail, MapPin, Search } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { LogoutButton } from "@/components/LogoutButton"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const user = session?.user;
  const userId = user?.id;

  const [items, itemCounts] = await Promise.all([
    prisma.item
      .findMany({
        where: userId ? { userId } : {},
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      })
      .catch(() => []),
    prisma.item
      .groupBy({
        by: ["status"],
        where: userId ? { userId } : {},
        _count: {
          _all: true,
        },
      })
      .catch(() => []),
  ])

  const countMap = itemCounts.reduce<Record<ItemStatus, number>>(
    (acc, row) => {
      acc[row.status] = row._count._all
      return acc
    },
    {
      Lost: 0,
      Found: 0,
      Claimed: 0,
    }
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-12">
      <nav className="bg-[#1e2235] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Search className="w-6 h-6 text-indigo-400" />
            <span>CampusFind</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
            <Link href="/" className="flex items-center space-x-1 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link href="/lost" className="flex items-center space-x-1 hover:text-white transition-colors">
              <AlertCircle className="w-4 h-4" />
              <span>Lost Items</span>
            </Link>
            <Link href="/found" className="flex items-center space-x-1 hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              <span>Found Items</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-1 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button className="bg-[#2d3248] text-white border-none h-9 px-4 hover:bg-[#3a3f58]">Dashboard</Button>
          <LogoutButton />
        </div>
      </nav>

      <div className="bg-[#1e2235] text-white px-6 pt-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome to CampusFind</h1>
          <p className="mt-2 text-gray-400">Manage your lost and found items from your dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="rounded-2xl border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{countMap.Lost + countMap.Found + countMap.Claimed}</p>
              <p className="text-sm font-bold text-gray-700">My Reports</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{countMap.Lost}</p>
              <p className="text-sm font-bold text-gray-700">Lost Items</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{countMap.Found}</p>
              <p className="text-sm font-bold text-gray-700">Found Items</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{countMap.Claimed}</p>
              <p className="text-sm font-bold text-gray-700">Claimed</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <Link href="/report-lost">
            <Button className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-none px-6 py-6 font-medium shadow-md transition-all hover:shadow-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              Report Lost Item
            </Button>
          </Link>
          <Link href="/report-found">
            <Button className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white border-none px-6 py-6 font-medium shadow-md transition-all hover:shadow-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Report Found Item
            </Button>
          </Link>
          <Link href="/admin/claims">
            <Button variant="outline" className="rounded-full px-6 py-6 font-medium shadow-sm">
              Admin Claims
            </Button>
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">My Reported Items</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 ? (
              <Card className="col-span-full rounded-2xl border-none bg-white">
                <CardContent className="p-10 text-center text-gray-500">
                  No items reported yet. Create your first report from the button above.
                </CardContent>
              </Card>
            ) : null}

            {items.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex flex-1 flex-col p-5 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-indigo-600">{item.category.name.toUpperCase()}</span>
                    <Badge variant={item.status === "Lost" ? "destructive" : item.status === "Found" ? "success" : "secondary"}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">{item.itemName}</h3>
                  <p className="mb-6 line-clamp-2 flex-1 text-sm text-gray-500">{item.description}</p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center text-xs font-medium text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      {item.location}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
