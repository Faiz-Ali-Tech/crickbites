"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getPostsAction, deletePostAction } from "@/app/actions/post.actions"
import { Post } from "@/repositories/interfaces"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  CircleCheck,
  CircleDashed,
  Clock,
} from "lucide-react"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    published: {
      label: "Published",
      className: "bg-teal-900/40 text-teal-400 border border-teal-800",
      icon: <CircleCheck className="h-3 w-3" />,
    },
    draft: {
      label: "Draft",
      className: "bg-neutral-800 text-neutral-400 border border-neutral-700",
      icon: <CircleDashed className="h-3 w-3" />,
    },
    scheduled: {
      label: "Scheduled",
      className: "bg-amber-900/40 text-amber-400 border border-amber-800",
      icon: <Clock className="h-3 w-3" />,
    },
  }
  const s = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

function formatDate(date: Date | string | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getPostsAction().then((res) => {
      if (res.success && res.data) setPosts(res.data)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await deletePostAction(id)
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert(res.error ?? "Failed to delete post")
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-neutral-500 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} in total
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      {/* Table card */}
      <Card className="border-neutral-800 bg-neutral-900/50 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-teal-500" />
            <span className="text-sm">Loading posts…</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
            <FileText className="h-10 w-10 mb-3 text-neutral-700" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Click "New Post" to write your first article.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Title</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Created</th>
                  <th className="text-left px-6 py-3 font-medium">Published</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-neutral-100 truncate">{post.title}</div>
                      <div className="text-xs text-neutral-500 truncate mt-0.5">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === post.id}
                          onClick={() => handleDelete(post.id, post.title)}
                          className="h-8 border-red-900/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
