"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoryByIdAction, updateStoryAction, createStoryAction } from "@/app/actions/story.actions"
import { uploadAssetAction } from "@/app/actions/upload.actions"
import { toast } from "sonner"
import { WebStory } from "@/repositories/interfaces"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Save,
  Send,
  ImagePlus,
  X,
  ChevronLeft,
  Plus,
  Trash2,
  Smartphone,
  AlertCircle,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
type StoryLayer =
  | { type: "background_media"; media_type: "image" | "video"; url: string; alt_text: string; poster_image_url?: string }
  | { type: "text_overlay"; html_tag: "h1" | "h2" | "p"; text: string; styles: { color: string; position: string } }
  | { type: "call_to_action"; url: string; text: string }

interface StoryPage {
  id: string
  seo_title: string
  layers: StoryLayer[]
}

interface StoryData {
  settings: {
    publisher_logo_url: string
    language: string
    auto_advance_duration: string
  }
  pages: StoryPage[]
}

function makeNewPage(): StoryPage {
  return {
    id: `page-${Date.now()}`,
    seo_title: "",
    layers: [
      {
        type: "background_media",
        media_type: "image",
        url: "",
        alt_text: "",
      },
      {
        type: "text_overlay",
        html_tag: "h1",
        text: "Your headline here",
        styles: { color: "#ffffff", position: "top" },
      },
    ],
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface StoryBuilderProps {
  storyId: string
  authorId?: string
}

export function StoryBuilderForm({ storyId, authorId }: StoryBuilderProps) {
  const router = useRouter()
  const isNew = storyId === "new"

  const [story, setStory]             = useState<WebStory | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [activePage, setActivePage]   = useState(0)
  const [coverUploading, setCoverUploading] = useState(false)
  const [bgUploading, setBgUploading] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Form state
  const [title, setTitle]       = useState("")
  const [slug, setSlug]         = useState("")
  const [status, setStatus]     = useState<"draft" | "published" | "scheduled">("draft")
  const [coverUrl, setCoverUrl] = useState("")
  const [storyData, setStoryData] = useState<StoryData>({
    settings: {
      publisher_logo_url: "",
      language: "en",
      auto_advance_duration: "7s",
    },
    pages: [makeNewPage()],
  })

  // ── Load story ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    getStoryByIdAction(storyId).then((res) => {
      if (res.success && res.data) {
        const s = res.data
        setStory(s)
        setTitle(s.title)
        setSlug(s.slug)
        setStatus(s.status as "draft" | "published" | "scheduled")
        setCoverUrl(s.coverImageUrl ?? "")
        if (s.storyData) setStoryData(s.storyData as StoryData)
      } else {
        setError(res.error ?? "Story not found")
      }
      setLoading(false)
    })
  }, [storyId])

  // ── Page helpers ────────────────────────────────────────────────────────────
  const currentPage = storyData.pages[activePage]

  function addPage() {
    setStoryData((d) => ({ ...d, pages: [...d.pages, makeNewPage()] }))
    setActivePage(storyData.pages.length)
  }

  function deletePage(idx: number) {
    if (storyData.pages.length === 1) {
      alert("A Web Story must have at least one page.")
      return
    }
    setStoryData((d) => ({
      ...d,
      pages: d.pages.filter((_, i) => i !== idx),
    }))
    setActivePage((p) => (p >= idx && p > 0 ? p - 1 : p))
  }

  function updatePage(idx: number, updater: (p: StoryPage) => StoryPage) {
    setStoryData((d) => ({
      ...d,
      pages: d.pages.map((p, i) => (i === idx ? updater(p) : p)),
    }))
  }

  function updateLayer(pageIdx: number, layerIdx: number, updater: (l: StoryLayer) => StoryLayer) {
    updatePage(pageIdx, (p) => ({
      ...p,
      layers: p.layers.map((l, i) => (i === layerIdx ? updater(l) : l)),
    }))
  }

  // ── Cover image upload ──────────────────────────────────────────────────────
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await uploadAssetAction(fd)
    if (res.success && res.data) {
      setCoverUrl(res.data as string)
    } else {
      alert(res.error ?? "Cover upload failed")
    }
    setCoverUploading(false)
  }

  // ── Background media upload ─────────────────────────────────────────────────
  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBgUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await uploadAssetAction(fd)
    if (res.success && res.data) {
      const url = res.data as string
      // Find or create background_media layer
      const bgIdx = currentPage.layers.findIndex((l) => l.type === "background_media")
      if (bgIdx >= 0) {
        updateLayer(activePage, bgIdx, (l) => ({ ...l, url } as StoryLayer))
      } else {
        updatePage(activePage, (p) => ({
          ...p,
          layers: [
            { type: "background_media", media_type: "image", url, alt_text: "" },
            ...p.layers,
          ],
        }))
      }
    } else {
      alert(res.error ?? "Upload failed")
    }
    setBgUploading(false)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave(saveStatus: "draft" | "published") {
    setSaving(true)

    const payload = {
      title,
      slug: slug || undefined, // will auto-generate if empty and creating
      coverImageUrl: coverUrl,
      storyData: storyData as unknown as Parameters<typeof updateStoryAction>[1]["storyData"],
      status: saveStatus,
      publishedAt: saveStatus === "published" ? (new Date().toISOString() as unknown as Date) : undefined,
    }

    let res

    if (isNew) {
      if (!authorId) {
        toast.error("Author ID is missing")
        setSaving(false)
        return
      }
      res = await createStoryAction({
        ...payload,
        authorId,
      } as any) // Type coaxing for schema
    } else {
      res = await updateStoryAction(storyId, payload)
    }

    if (res.success) {
      toast.success("Saved!")
      router.push("/admin/stories")
      router.refresh()
    } else {
      toast.error(res.error ?? "Save failed")
    }
    
    setSaving(false)
  }

  // ── Get bg layer url ────────────────────────────────────────────────────────
  const bgLayer = currentPage?.layers?.find((l) => l.type === "background_media") as
    | Extract<StoryLayer, { type: "background_media" }>
    | undefined

  const textLayers = currentPage?.layers?.filter((l) => l.type === "text_overlay") as
    Array<Extract<StoryLayer, { type: "text_overlay" }>>

  const ctaLayer = currentPage?.layers?.find((l) => l.type === "call_to_action") as
    | Extract<StoryLayer, { type: "call_to_action" }>
    | undefined

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    )
  }

  if (error || (!isNew && !story)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-neutral-500">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="font-medium">{error ?? "Story not found"}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-neutral-700 text-neutral-300"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-neutral-500 hover:text-neutral-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Story Builder</h1>
            <p className="text-neutral-500 text-sm">{isNew ? "New Web Story" : story?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-9 px-3 rounded-md border border-neutral-700 bg-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 h-9"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save Draft
          </Button>
          <Button
            disabled={saving}
            onClick={() => handleSave("published")}
            className="bg-teal-600 hover:bg-teal-500 text-white h-9"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* ── LEFT COLUMN: Editor ────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Story metadata */}
          <Card className="border-neutral-800 bg-neutral-900/50 p-5">
            <h3 className="font-semibold mb-4">Story Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="story-title">Title</Label>
                <Input
                  id="story-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story title…"
                  className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="story-slug">Slug</Label>
                <Input
                  id="story-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="story-slug"
                  className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>

            {/* Cover image */}
            <div className="mt-4 grid gap-1.5">
              <Label>Cover Image</Label>
              <div
                className="relative flex items-center gap-4 p-3 rounded-lg border border-dashed border-neutral-700 bg-neutral-800 cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => document.getElementById("cover-upload")?.click()}
              >
                {coverUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-teal-400 shrink-0" />
                ) : coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="h-16 w-10 object-cover rounded shrink-0"
                  />
                ) : (
                  <ImagePlus className="h-6 w-6 text-neutral-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-400 truncate">
                    {coverUrl ? coverUrl.split("/").pop() : "Click to upload cover (9:16 ratio)"}
                  </p>
                </div>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverUrl("") }}
                    className="p-1 rounded hover:bg-neutral-700 transition-colors"
                  >
                    <X className="h-4 w-4 text-neutral-400" />
                  </button>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>
          </Card>

          {/* Pages list + editor */}
          <Card className="border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Page tabs */}
            <div className="flex items-center gap-1 p-3 border-b border-neutral-800 overflow-x-auto">
              {storyData.pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActivePage(i)}
                  className={`relative shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    i === activePage
                      ? "bg-teal-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Page {i + 1}
                  {storyData.pages.length > 1 && (
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); deletePage(i) }}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-neutral-700 flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <X className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={addPage}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400 hover:text-teal-400 border border-dashed border-neutral-700 hover:border-teal-600 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Page
              </button>
            </div>

            {/* Active page editor */}
            {currentPage && (
              <CardContent className="p-5 space-y-5">
                <div className="grid gap-1.5">
                  <Label htmlFor="page-seo-title" className="text-xs uppercase text-neutral-500 tracking-wide">
                    Page SEO Title
                  </Label>
                  <Input
                    id="page-seo-title"
                    value={currentPage.seo_title}
                    onChange={(e) =>
                      updatePage(activePage, (p) => ({ ...p, seo_title: e.target.value }))
                    }
                    placeholder="SEO title for this slide…"
                    className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500 text-sm"
                  />
                </div>

                {/* Background media */}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Background Image / Video</Label>
                  <div
                    className="relative aspect-[9/16] max-h-72 w-full rounded-lg overflow-hidden border border-dashed border-neutral-700 bg-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors"
                    onClick={() => document.getElementById("bg-upload")?.click()}
                  >
                    {bgUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                        <span className="text-xs text-neutral-400">Uploading…</span>
                      </div>
                    ) : bgLayer?.url ? (
                      <>
                        <img
                          src={bgLayer.url}
                          alt={bgLayer.alt_text || "Background"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs bg-black/60 px-3 py-1.5 rounded">
                            Click to replace
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-10 w-10 text-neutral-600 mb-2" />
                        <span className="text-xs text-neutral-500">Upload background (9:16)</span>
                      </>
                    )}
                    <input
                      id="bg-upload"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleBgUpload}
                    />
                  </div>
                  {bgLayer?.url && (
                    <Input
                      value={bgLayer.alt_text}
                      onChange={(e) => {
                        const idx = currentPage.layers.findIndex((l) => l.type === "background_media")
                        updateLayer(activePage, idx, (l) => ({ ...l, alt_text: e.target.value } as StoryLayer))
                      }}
                      placeholder="Alt text for background image…"
                      className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500 text-sm"
                    />
                  )}
                </div>

                {/* Text overlays */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Text Layers</Label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePage(activePage, (p) => ({
                          ...p,
                          layers: [
                            ...p.layers,
                            {
                              type: "text_overlay",
                              html_tag: "p",
                              text: "New text",
                              styles: { color: "#ffffff", position: "bottom" },
                            } as StoryLayer,
                          ],
                        }))
                      }
                      className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Text
                    </button>
                  </div>
                  {currentPage.layers.reduce<Array<{ layerIdx: number; layer: Extract<StoryLayer, { type: "text_overlay" }> }>>(
                  (acc, l, i) => {
                    if (l.type === "text_overlay") acc.push({ layerIdx: i, layer: l as Extract<StoryLayer, { type: "text_overlay" }> })
                    return acc
                  },
                  []
                ).map(({ layerIdx, layer }) => {
                    return (
                      <div key={layerIdx} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={layer.html_tag}
                            onChange={(e) =>
                              updateLayer(activePage, layerIdx, (l) => ({
                                ...l,
                                html_tag: e.target.value as "h1" | "h2" | "p",
                              } as StoryLayer))
                            }
                            className="h-7 px-2 rounded border border-neutral-600 bg-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="h1">H1</option>
                            <option value="h2">H2</option>
                            <option value="p">P</option>
                          </select>
                          <select
                            value={layer.styles.position}
                            onChange={(e) =>
                              updateLayer(activePage, layerIdx, (l) => ({
                                ...l,
                                styles: { ...(l as typeof layer).styles, position: e.target.value },
                              } as StoryLayer))
                            }
                            className="h-7 px-2 rounded border border-neutral-600 bg-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                            <option value="bottom">Bottom</option>
                          </select>
                          <div className="flex items-center gap-1.5 ml-1">
                            <span className="text-xs text-neutral-500">Color</span>
                            <input
                              type="color"
                              value={layer.styles.color}
                              onChange={(e) =>
                                updateLayer(activePage, layerIdx, (l) => ({
                                  ...l,
                                  styles: { ...(l as typeof layer).styles, color: e.target.value },
                                } as StoryLayer))
                              }
                              className="h-6 w-8 rounded border border-neutral-600 bg-transparent cursor-pointer"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updatePage(activePage, (p) => ({
                                ...p,
                                layers: p.layers.filter((_, i) => i !== layerIdx),
                              }))
                            }
                            className="ml-auto p-1 rounded hover:bg-red-900/40 hover:text-red-400 transition-colors text-neutral-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <Input
                          value={layer.text}
                          onChange={(e) =>
                            updateLayer(activePage, layerIdx, (l) => ({
                              ...l,
                              text: e.target.value,
                            } as StoryLayer))
                          }
                          placeholder="Text content…"
                          className="border-neutral-600 bg-neutral-700 h-8 text-sm focus-visible:ring-teal-500"
                        />
                      </div>
                    )
                  })}
                </div>

                {/* CTA layer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Call to Action</Label>
                    {!ctaLayer && (
                      <button
                        type="button"
                        onClick={() =>
                          updatePage(activePage, (p) => ({
                            ...p,
                            layers: [
                              ...p.layers,
                              { type: "call_to_action", url: "", text: "Read More" } as StoryLayer,
                            ],
                          }))
                        }
                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add CTA
                      </button>
                    )}
                  </div>
                  {ctaLayer && (() => {
                    const ctaIdx = currentPage.layers.indexOf(ctaLayer as StoryLayer)
                    return (
                      <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={ctaLayer.text}
                            onChange={(e) =>
                              updateLayer(activePage, ctaIdx, (l) => ({
                                ...l,
                                text: e.target.value,
                              } as StoryLayer))
                            }
                            placeholder="Button text…"
                            className="border-neutral-600 bg-neutral-700 h-8 text-sm focus-visible:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updatePage(activePage, (p) => ({
                                ...p,
                                layers: p.layers.filter((_, i) => i !== ctaIdx),
                              }))
                            }
                            className="p-2 rounded hover:bg-red-900/40 hover:text-red-400 transition-colors text-neutral-500 shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <Input
                          value={ctaLayer.url}
                          onChange={(e) =>
                            updateLayer(activePage, ctaIdx, (l) => ({
                              ...l,
                              url: e.target.value,
                            } as StoryLayer))
                          }
                          placeholder="https://example.com/article"
                          className="border-neutral-600 bg-neutral-700 h-8 text-sm focus-visible:ring-teal-500 font-mono"
                        />
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Mobile Preview ───────────────────────────────────── */}
        <div className="xl:sticky xl:top-6 self-start">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Smartphone className="h-4 w-4" />
              <span>Live Preview — Page {activePage + 1}</span>
            </div>

            {/* Phone frame */}
            <div className="relative w-[220px] h-[390px] bg-neutral-950 rounded-[32px] border-4 border-neutral-700 shadow-2xl overflow-hidden shrink-0">
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-neutral-800 rounded-full z-10" />

              {/* Story canvas */}
              <div
                className="absolute inset-0 flex flex-col overflow-hidden"
                style={{
                  background: bgLayer?.url
                    ? undefined
                    : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                }}
              >
                {bgLayer?.url && (
                  <img
                    src={bgLayer.url}
                    alt={bgLayer.alt_text || ""}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

                {/* Progress bar */}
                <div className="absolute top-6 left-3 right-3 flex gap-0.5 z-20">
                  {storyData.pages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full ${
                        i === activePage
                          ? "bg-white"
                          : i < activePage
                          ? "bg-white/60"
                          : "bg-white/25"
                      }`}
                    />
                  ))}
                </div>

                {/* Text layers preview */}
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 pt-10">
                  {/* Top text */}
                  <div className="space-y-1 mt-2">
                    {textLayers
                      .filter((l) => l.styles.position === "top")
                      .map((l, i) => (
                        <p
                          key={i}
                          className={`leading-tight ${
                            l.html_tag === "h1"
                              ? "text-lg font-bold"
                              : l.html_tag === "h2"
                              ? "text-base font-semibold"
                              : "text-xs"
                          }`}
                          style={{ color: l.styles.color }}
                        >
                          {l.text || "(empty)"}
                        </p>
                      ))}
                  </div>

                  {/* Center text */}
                  <div className="space-y-1 text-center">
                    {textLayers
                      .filter((l) => l.styles.position === "center")
                      .map((l, i) => (
                        <p
                          key={i}
                          className={`leading-tight ${
                            l.html_tag === "h1"
                              ? "text-lg font-bold"
                              : l.html_tag === "h2"
                              ? "text-base font-semibold"
                              : "text-xs"
                          }`}
                          style={{ color: l.styles.color }}
                        >
                          {l.text || "(empty)"}
                        </p>
                      ))}
                  </div>

                  {/* Bottom: text + CTA */}
                  <div className="space-y-2">
                    {textLayers
                      .filter((l) => l.styles.position === "bottom")
                      .map((l, i) => (
                        <p
                          key={i}
                          className={`leading-tight ${
                            l.html_tag === "h1"
                              ? "text-base font-bold"
                              : l.html_tag === "h2"
                              ? "text-sm font-semibold"
                              : "text-xs"
                          }`}
                          style={{ color: l.styles.color }}
                        >
                          {l.text || "(empty)"}
                        </p>
                      ))}
                    {ctaLayer && (
                      <button className="w-full py-1.5 rounded-full bg-white text-black text-xs font-bold tracking-wide">
                        {ctaLayer.text || "Read More"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Page count indicator */}
            <p className="text-xs text-neutral-600">
              {storyData.pages.length} page{storyData.pages.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
