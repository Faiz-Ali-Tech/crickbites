import { PostEditorForm } from "@/components/admin/post-editor-form"
import { PostRepository } from "@/lib/repositories/post.repository"
import { getAdminProfileAction } from "@/app/actions/settings.actions"
import { notFound, redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const results = await Promise.allSettled([
    getAdminProfileAction(),
    PostRepository.getPostById(id),
  ])

  const profileRes = results[0].status === 'fulfilled' ? results[0].value : { success: false, data: null };
  const post = results[1].status === 'fulfilled' ? results[1].value : null;

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
