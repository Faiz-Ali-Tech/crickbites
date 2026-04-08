import { PostEditorForm } from "@/components/admin/post-editor-form"
import { getAdminProfileAction } from "@/app/actions/settings.actions"
import { redirect } from "next/navigation"

export default async function NewPostPage() {
  const profileRes = await getAdminProfileAction()
  console.log(profileRes);
  if (!profileRes.success || !profileRes.data) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
          <p className="text-neutral-500 mt-1">Create a compelling story for your audience.</p>
        </div>
      </div>
      <PostEditorForm authorId={profileRes.data.id} />
    </div>
  )
}
