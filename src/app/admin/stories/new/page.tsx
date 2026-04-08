"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StorySchema } from "@/schemas/zod"
import { createStoryAction } from "@/app/actions/story.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function NewStoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(StorySchema),
    defaultValues: {
       title: "",
       slug: "",
       coverImageUrl: "",
       status: "draft",
       storyData: {
          settings: { publisher_logo_url: "https://example.com/logo.png", language: "en", auto_advance_duration: "7s" },
          pages: [],
       }
    }
  })

  async function onSubmit(data: any) {
     setIsLoading(true)
     const res = await createStoryAction(data)
     if (res.success) {
        router.push("/admin/stories")
        router.refresh()
     } else {
        setIsLoading(false)
        alert(res.error)
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Web Story</h1>
        </div>
        <div className="flex gap-3">
           <Button className="bg-teal-600 text-white" disabled={isLoading} onClick={handleSubmit(onSubmit)}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4" /> : "Publish Story"}
           </Button>
        </div>
      </div>
      <div className="grid gap-4 mt-6">
         <Label>Title</Label>
         <Input className="max-w-md border-neutral-700 bg-neutral-800" {...register("title")} />
         {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
      </div>
    </div>
  )
}
