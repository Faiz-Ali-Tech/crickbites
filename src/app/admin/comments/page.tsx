"use client"

import { useEffect, useState } from "react"
import {
  getAllCommentsAction,
  updateCommentStatusAction,
  deleteCommentAction,
} from "@/app/actions/comment.actions"
import { Comment } from "@/repositories/interfaces"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  Loader2,
  Clock,
  CircleCheck,
  CircleX,
} from "lucide-react"

type CommentStatus = "pending" | "approved" | "rejected"

const statusConfig: Record<
  CommentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-900/40 text-amber-400 border border-amber-800",
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: "Approved",
    className: "bg-teal-900/40 text-teal-400 border border-teal-800",
    icon: <CircleCheck className="h-3 w-3" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-900/40 text-red-400 border border-red-800",
    icon: <CircleX className="h-3 w-3" />,
  },
}

function StatusBadge({ status }: { status: string }) {
  const s = statusConfig[status as CommentStatus] ?? statusConfig.pending
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}
    >
      {s.icon}
      {s.label}
    </span>
  )
}

type Filter = "all" | "pending" | "approved" | "rejected"

export default function CommentsPage() {
  const [comments, setComments]     = useState<Comment[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<Filter>("pending")
  const [actingId, setActingId]     = useState<string | null>(null)

  useEffect(() => {
    getAllCommentsAction().then((res) => {
      if (res.success && res.data) setComments(res.data)
      setLoading(false)
    })
  }, [])

  async function handleStatus(id: string, status: CommentStatus) {
    setActingId(id)
    const res = await updateCommentStatusAction(id, { status })
    if (res.success && res.data) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res.data!.status } : c))
      )
    } else {
      alert(res.error ?? "Action failed")
    }
    setActingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this comment?")) return
    setActingId(id)
    const res = await deleteCommentAction(id)
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== id))
    } else {
      alert(res.error ?? "Delete failed")
    }
    setActingId(null)
  }

  const filtered =
    filter === "all" ? comments : comments.filter((c) => c.status === filter)

  const counts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
  }

  const filterTabs: { key: Filter; label: string }[] = [
    { key: "pending",  label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "all",      label: `All (${counts.all})` },
  ]

  function formatDate(date: Date | string | null) {
    if (!date) return "—"
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
          <p className="text-neutral-500 mt-1">Moderate reader comments across all posts.</p>
        </div>
        {counts.pending > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-900/40 text-amber-400 border border-amber-800">
            <Clock className="h-3.5 w-3.5" />
            {counts.pending} awaiting review
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-neutral-800 pb-0">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              filter === tab.key
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-teal-500" />
          <span className="text-sm">Loading comments…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <MessageSquare className="h-10 w-10 mb-3 text-neutral-700" />
          <p className="font-medium">No {filter === "all" ? "" : filter} comments</p>
          <p className="text-sm mt-1">Check back later or change the filter above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <Card
              key={comment.id}
              className="border-neutral-800 bg-neutral-900/50 p-5 transition-colors hover:bg-neutral-800/30"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 shrink-0 uppercase">
                  {comment.authorName.charAt(0)}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-semibold text-neutral-100 text-sm">
                      {comment.authorName}
                    </span>
                    <StatusBadge status={comment.status} />
                    <span className="text-xs text-neutral-600 ml-auto">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed break-words">
                    {comment.content}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1.5">
                    Post ID: <span className="font-mono">{comment.postId}</span>
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-800">
                {comment.status !== "approved" && (
                  <Button
                    size="sm"
                    disabled={actingId === comment.id}
                    onClick={() => handleStatus(comment.id, "approved")}
                    className="h-8 bg-teal-700 hover:bg-teal-600 text-white border-0"
                  >
                    {actingId === comment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Approve
                  </Button>
                )}
                {comment.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingId === comment.id}
                    onClick={() => handleStatus(comment.id, "rejected")}
                    className="h-8 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                  >
                    {actingId === comment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actingId === comment.id}
                  onClick={() => handleDelete(comment.id)}
                  className="h-8 border-red-900/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                >
                  {actingId === comment.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
