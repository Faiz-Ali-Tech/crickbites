import { PostEditorForm } from "@/components/admin/post-editor-form"
import { PostRepository } from "@/lib/repositories/post.repository"
import { getAdminProfileAction } from "@/app/actions/settings.actions"
import { notFound, redirect } from "next/navigation"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profileRes, post] = await Promise.all([
    getAdminProfileAction(),
    PostRepository.getPostById(id),
  ])

  if (!profileRes.success || !profileRes.data) {
    redirect("/login")
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-neutral-500 mt-1 font-mono text-sm">/{post.slug}</p>
        </div>
      </div>
      <PostEditorForm post={post} authorId={profileRes.data.id} />
    </div>
  )
}
