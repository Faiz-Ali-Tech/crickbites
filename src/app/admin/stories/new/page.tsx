import { StoryBuilderForm } from "@/components/admin/story-builder-form"
import { getAdminProfileAction } from "@/app/actions/settings.actions"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function NewStoryPage() {
  const profileRes = await getAdminProfileAction()

  if (!profileRes.success || !profileRes.data) {
    redirect("/login")
  }

  return <StoryBuilderForm storyId="new" authorId={profileRes.data.id} />
}
