import { StoryBuilderForm } from "@/components/admin/story-builder-form"

interface EditStoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params
  return <StoryBuilderForm storyId={id} />
}
