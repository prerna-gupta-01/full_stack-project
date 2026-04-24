import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="mx-auto w-full min-h-screen max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contact Lost & Found Desk</h1>
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>Email: lostfound@campusfind.edu</p>
          <p>Phone: +91-98765-43210</p>
          <p>Office: Admin Block, Room 104</p>
          <p>Hours: Monday to Friday, 9:00 AM - 5:00 PM</p>
        </CardContent>
      </Card>
    </div>
  )
}
