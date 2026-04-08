"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PostSchema } from "@/schemas/zod"
import { updatePostAction } from "@/app/actions/post.actions"
import { uploadAssetAction } from "@/app/actions/upload.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Editor } from "@/components/admin/editor"
import { ImagePlus, Loader2, Search, ChevronDown, ChevronUp, Save } from "lucide-react"

export function EditPostForm({ post }: { post: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string | null>(post.featuredImageUrl)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featuredImageUrl: post.featuredImageUrl || "",
      status: post.status,
      categoryIds: [], // Would fetch from junction table in real app
      tagIds: [],
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    },
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
     const file = e.target.files?.[0]
     if (!file) return

     const formData = new FormData()
     formData.append("file", file)
     const res = await uploadAssetAction(formData)
     if (res.success) {
        const uploadedUrl = res.data as string
        setFeaturedImage(uploadedUrl)
        setValue("featuredImageUrl", uploadedUrl)
     }
  }

  async function onSubmit(data: any) {
    setIsLoading(true)
    const res = await updatePostAction(post.id, data)
    if (res.success) {
      router.push("/admin/posts")
      router.refresh()
    } else {
      setIsLoading(false)
      alert(res.error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
           <CardContent className="space-y-6 pt-0">
              <div className="grid gap-2">
                 <Label htmlFor="title" className="text-lg font-medium">Post Title</Label>
                 <Input 
                    id="title" 
                    className="text-xl font-bold border-neutral-700 bg-neutral-800 h-12 focus-visible:ring-teal-500" 
                    {...register("title")}
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message as string}</p>}
              </div>

              <div className="grid gap-2">
                 <Label htmlFor="slug" className="text-xs text-neutral-500 uppercase">URL Slug</Label>
                 <Input 
                    id="slug" 
                    className="border-neutral-700 bg-neutral-800 text-neutral-400 h-8 text-xs focus-visible:ring-teal-500" 
                    {...register("slug")} 
                  />
              </div>

              <div className="grid gap-2">
                 <Label className="text-lg font-medium">Content</Label>
                 <Editor content={post.content} onChange={(content) => setValue("content", content)} />
                 {errors.content && <p className="text-xs text-red-400">{errors.content.message as string}</p>}
              </div>
           </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card className="border-neutral-800 bg-neutral-900/50">
           <button 
              onClick={() => setShowSEO(!showSEO)}
              className="w-full flex items-center justify-between p-6 hover:bg-neutral-800/50 transition-colors"
           >
              <div className="flex items-center gap-2">
                 <Search size={18} className="text-teal-400" />
                 <span className="font-medium text-lg">SEO Settings</span>
              </div>
              {showSEO ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
           </button>
           {showSEO && (
              <CardContent className="p-6 pt-0 space-y-4">
                 <div className="grid gap-2">
                    <Label htmlFor="seoTitle">Meta Title</Label>
                    <Input id="seoTitle" className="border-neutral-700 bg-neutral-800" {...register("seoTitle")} />
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="seoDescription">Meta Description</Label>
                    <textarea 
                       id="seoDescription" 
                       rows={2}
                       className="flex w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:ring-teal-500"
                       {...register("seoDescription")}
                     />
                 </div>
              </CardContent>
           )}
        </Card>
      </div>

      <div className="space-y-6">
         <Card className="border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="space-y-3">
               <Label className="text-xs uppercase text-neutral-500">Status</Label>
               <select 
                  {...register("status")}
                  className="w-full h-10 px-3 rounded-md border border-neutral-700 bg-neutral-800 text-sm focus:ring-teal-500"
               >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
               </select>
               <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white mt-4" disabled={isLoading} onClick={handleSubmit(onSubmit)}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
               </Button>
            </div>
         </Card>

         <Card className="border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium mb-4">Featured Image</h3>
            <div 
              className="aspect-video w-full rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-all overflow-hidden"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
               {featuredImage ? (
                  <img src={featuredImage} className="w-full h-full object-cover" />
               ) : (
                  <><ImagePlus size={32} className="text-neutral-500 mb-2" /><span className="text-xs text-neutral-500">Click to upload</span></>
               )}
               <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
         </Card>

         <Card className="border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium mb-4">Excerpt</h3>
            <textarea 
               rows={4}
               className="flex w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:ring-teal-500"
               {...register("excerpt")}
            />
         </Card>
      </div>
    </div>
  )
}
