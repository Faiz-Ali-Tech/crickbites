import { StoryBuilderForm } from "@/components/admin/story-builder-form"

export const dynamic = 'force-dynamic'

interface EditStoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params
  return <StoryBuilderForm storyId={id} />
}
