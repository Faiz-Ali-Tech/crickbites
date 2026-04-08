import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, MessageSquare } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome to the CrickBites Content Management System
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Articles</div>
            <p className="text-xs text-neutral-500 mt-1">
              Create and edit long-form content
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Web Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Stories</div>
            <p className="text-xs text-neutral-500 mt-1">
              Create engaging visual stories
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Moderate</div>
            <p className="text-xs text-neutral-500 mt-1">
              Review and moderate user comments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
