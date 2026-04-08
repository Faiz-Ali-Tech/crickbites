"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CreatePostSchema } from "@/lib/validations/backend.schema"
import { createPostAction, updatePostAction } from "@/app/actions/post.actions"
import { uploadAssetAction } from "@/app/actions/upload.actions"
import { getCategoriesAction, getTagsAction, createCategoryAction, createTagAction } from "@/app/actions/taxonomy.actions"
import { Category, Tag, Post } from "@/repositories/interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Editor } from "@/components/admin/editor"
import {
  ImagePlus,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  X,
  Plus,
} from "lucide-react"

// ─── Schema for the form (omit authorId since we inject it server-side) ───────
const FormSchema = CreatePostSchema.omit({ authorId: true })
type FormValues = z.infer<typeof FormSchema>

// ─── Props ────────────────────────────────────────────────────────────────────
interface PostEditorFormProps {
  /** When provided, the form is in edit mode. */
  post?: Post
  /** The authenticated user's UUID — injected by the Server Component. */
  authorId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function CharCounter({ value, max }: { value: string | undefined; max: number }) {
  const len = value?.length ?? 0
  const over = len > max
  return (
    <span className={`text-xs ml-auto ${over ? "text-red-400" : "text-neutral-500"}`}>
      {len}/{max}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PostEditorForm({ post, authorId }: PostEditorFormProps) {
  const router  = useRouter()
  const isEdit  = !!post

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAction, setSubmitAction] = useState<"draft" | "published">("draft")
  const [showSEO, setShowSEO]           = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featuredImageUrl ?? null)
  const [imageUploading, setImageUploading] = useState(false)

  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [dbTags, setDbTags]             = useState<Tag[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newTagName, setNewTagName]           = useState("")
  const [addingCategory, setAddingCategory]   = useState(false)
  const [addingTag, setAddingTag]             = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title:           post?.title ?? "",
      slug:            post?.slug ?? "",
      content:         post?.content ?? "",
      excerpt:         post?.excerpt ?? "",
      featuredImageUrl: post?.featuredImageUrl ?? "",
      status:          post?.status ?? "draft",
      categoryIds:     [],
      tagIds:          [],
      seoTitle:        post?.seoTitle ?? "",
      seoDescription:  post?.seoDescription ?? "",
    },
  })

  const titleVal       = watch("title")
  const seoTitleVal    = watch("seoTitle")
  const seoDescVal     = watch("seoDescription")
  const categoryIds    = watch("categoryIds") ?? []
  const tagIds         = watch("tagIds") ?? []

  // Load taxonomy on mount
  useEffect(() => {
    getCategoriesAction().then((res) => {
      if (res.success && res.data) setDbCategories(res.data)
    })
    getTagsAction().then((res) => {
      if (res.success && res.data) setDbTags(res.data)
    })
  }, [])

  // Auto-generate slug from title (only in create mode)
  useEffect(() => {
    if (!isEdit && titleVal) {
      setValue("slug", slugify(titleVal))
    }
  }, [titleVal, isEdit, setValue])

  // ── Image upload ─────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await uploadAssetAction(formData)
    if (res.success && res.data) {
      const url = res.data as string
      setFeaturedImage(url)
      setValue("featuredImageUrl", url)
    } else {
      alert(res.error ?? "Image upload failed")
    }
    setImageUploading(false)
  }

  // ── Taxonomy ─────────────────────────────────────────────────────────────
  function toggleCategory(id: string) {
    if (categoryIds.includes(id)) {
      setValue("categoryIds", categoryIds.filter((c) => c !== id))
    } else {
      setValue("categoryIds", [...categoryIds, id])
    }
  }

  function toggleTag(id: string) {
    if (tagIds.includes(id)) {
      setValue("tagIds", tagIds.filter((t) => t !== id))
    } else {
      setValue("tagIds", [...tagIds, id])
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    const res = await createCategoryAction({ name: newCategoryName.trim() })
    if (res.success && res.data) {
      setDbCategories((prev) => [...prev, res.data as Category])
      setValue("categoryIds", [...categoryIds, (res.data as Category).id])
      setNewCategoryName("")
    } else {
      alert(res.error ?? "Failed to create category")
    }
    setAddingCategory(false)
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return
    setAddingTag(true)
    const res = await createTagAction({ name: newTagName.trim() })
    if (res.success && res.data) {
      setDbTags((prev) => [...prev, res.data as Tag])
      setValue("tagIds", [...tagIds, (res.data as Tag).id])
      setNewTagName("")
    } else {
      alert(res.error ?? "Failed to create tag")
    }
    setAddingTag(false)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const payload = { ...data, status: submitAction, authorId }

    const res = isEdit
      ? await updatePostAction(post!.id, { ...data, status: submitAction })
      : await createPostAction(payload)

    if (res.success) {
      toast.success("Saved!")
      router.push("/admin/posts")
      router.refresh()
    } else {
      toast.error(res.error ?? "An error occurred")
    }
    setIsSubmitting(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Left: Main content ──────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title + Slug */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <CardContent className="space-y-5 pt-0">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Post Title
              </Label>
              <Input
                id="title"
                placeholder="Write a headline that grabs attention…"
                className="text-xl font-bold border-neutral-700 bg-neutral-800 h-12 focus-visible:ring-teal-500"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="slug" className="text-xs text-neutral-500 uppercase tracking-wide">
                URL Slug
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 select-none">/</span>
                <Input
                  id="slug"
                  className="border-neutral-700 bg-neutral-800 text-neutral-400 h-8 text-xs focus-visible:ring-teal-500 font-mono"
                  {...register("slug")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-base font-semibold">Content</Label>
              <Editor
                content={post?.content ?? ""}
                onChange={(content) => setValue("content", content)}
              />
              {errors.content && (
                <p className="text-xs text-red-400">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEO Accordion */}
        <Card className="border-neutral-800 bg-neutral-900/50">
          <button
            type="button"
            onClick={() => setShowSEO(!showSEO)}
            className="w-full flex items-center justify-between p-6 hover:bg-neutral-800/40 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Search size={16} className="text-teal-400" />
              <span className="font-semibold text-base">SEO Settings</span>
              {(seoTitleVal || seoDescVal) && (
                <span className="text-xs bg-teal-900/40 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full">
                  Configured
                </span>
              )}
            </div>
            {showSEO ? (
              <ChevronUp size={18} className="text-neutral-400" />
            ) : (
              <ChevronDown size={18} className="text-neutral-400" />
            )}
          </button>

          {showSEO && (
            <CardContent className="px-6 pb-6 pt-0 space-y-4 border-t border-neutral-800">
              <div className="grid gap-1.5 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoTitle">Meta Title</Label>
                  <CharCounter value={seoTitleVal} max={70} />
                </div>
                <Input
                  id="seoTitle"
                  placeholder="Leave blank to use the post title"
                  className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500"
                  {...register("seoTitle")}
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <CharCounter value={seoDescVal} max={160} />
                </div>
                <textarea
                  id="seoDescription"
                  rows={3}
                  placeholder="A concise summary of the post for search engines…"
                  className="flex w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                  {...register("seoDescription")}
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ── Right: Sidebar panels ───────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Publish actions */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold mb-4">Publish</h3>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs uppercase text-neutral-500 tracking-wide">Status</Label>
              <select
                {...register("status")}
                className="w-full h-10 px-3 rounded-md border border-neutral-700 bg-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitAction("draft")
                  handleSubmit(onSubmit)()
                }}
              >
                {isSubmitting && submitAction === "draft" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Save className="h-4 w-4 mr-1.5" />Save Draft</>
                )}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitAction("published")
                  handleSubmit(onSubmit)()
                }}
              >
                {isSubmitting && submitAction === "published" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Send className="h-4 w-4 mr-1.5" />Publish</>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Featured Image */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold mb-3">Featured Image</h3>
          <div
            className="relative aspect-video w-full rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-all overflow-hidden"
            onClick={() => document.getElementById("image-upload-field")?.click()}
          >
            {imageUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                <span className="text-xs text-neutral-400">Uploading…</span>
              </div>
            ) : featuredImage ? (
              <>
                <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFeaturedImage(null)
                    setValue("featuredImageUrl", "")
                  }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-900/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </>
            ) : (
              <>
                <ImagePlus size={28} className="text-neutral-500 mb-2" />
                <span className="text-xs text-neutral-500">Click to upload from R2</span>
                <span className="text-xs text-neutral-600 mt-0.5">PNG, JPG, WebP — max 10 MB</span>
              </>
            )}
            <input
              type="file"
              id="image-upload-field"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </Card>

        {/* Categories */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold mb-4">Categories</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {dbCategories.length === 0 && (
                <span className="text-xs text-neutral-600">No categories yet</span>
              )}
              {dbCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    categoryIds.includes(cat.id)
                      ? "bg-teal-600 border-teal-500 text-white"
                      : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                placeholder="New category…"
                className="h-8 text-xs border-neutral-700 bg-neutral-800"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={addingCategory || !newCategoryName.trim()}
                onClick={handleCreateCategory}
                className="h-8 px-2.5 border-neutral-700 text-neutral-300"
              >
                {addingCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold mb-4">Tags</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {dbTags.length === 0 && (
                <span className="text-xs text-neutral-600">No tags yet</span>
              )}
              {dbTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    tagIds.includes(tag.id)
                      ? "bg-teal-600 border-teal-500 text-white"
                      : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                placeholder="New tag…"
                className="h-8 text-xs border-neutral-700 bg-neutral-800"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={addingTag || !newTagName.trim()}
                onClick={handleCreateTag}
                className="h-8 px-2.5 border-neutral-700 text-neutral-300"
              >
                {addingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Excerpt */}
        <Card className="border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold mb-3">Excerpt</h3>
          <textarea
            rows={4}
            placeholder="A short summary shown in article cards…"
            className="flex w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            {...register("excerpt")}
          />
        </Card>
      </div>
    </div>
  )
}
