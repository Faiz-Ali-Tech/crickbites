"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash, Image as ImageIcon, Video, Type, Link as LinkIcon } from "lucide-react";

// --- Schema Definitions ---
const LayerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("background_media"),
    media_type: z.enum(["image", "video"]),
    url: z.string().url(),
    alt_text: z.string(),
    poster_image_url: z.string().url().optional(),
  }),
  z.object({
    type: z.literal("text_overlay"),
    html_tag: z.enum(["h1", "h2", "p"]),
    text: z.string(),
    styles: z.object({
      color: z.string(),
      position: z.string(),
    }),
  }),
  z.object({
    type: z.literal("call_to_action"),
    url: z.string().url(),
    text: z.string(),
  }),
]);

const PageSchema = z.object({
  id: z.string(),
  seo_title: z.string(),
  layers: z.array(LayerSchema),
});

const StoryDataSchema = z.object({
  settings: z.object({
    publisher_logo_url: z.string().url(),
    language: z.string(),
    auto_advance_duration: z.string(),
  }),
  pages: z.array(PageSchema),
});

type StoryData = z.infer<typeof StoryDataSchema>;

// --- Web Story Builder Component ---
export default function WebStoryBuilder() {
  const { register, control, watch, handleSubmit, formState: { errors } } = useForm<StoryData>({
    resolver: zodResolver(StoryDataSchema),
    defaultValues: {
      settings: {
        publisher_logo_url: "",
        language: "en",
        auto_advance_duration: "7s",
      },
      pages: [
        {
          id: "page-1",
          seo_title: "First Page",
          layers: [
            {
              type: "background_media",
              media_type: "image",
              url: "https://images.unsplash.com/photo-1540747913346-19e3adca174f?auto=format&fit=crop&w=400&h=600",
              alt_text: "Background",
            },
            {
              type: "text_overlay",
              html_tag: "h1",
              text: "Welcome to CrickBites",
              styles: { color: "#ffffff", position: "center" },
            },
          ],
        },
      ],
    },
  });

  const { fields: pages, append: appendPage, remove: removePage } = useFieldArray({
    control,
    name: "pages",
  });

  const storyState = watch();
  const [activePageIndex, setActivePageIndex] = useState(0);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Left Side: Form Editor */}
      <div className="w-1/2 overflow-y-auto border-r border-neutral-800 p-8">
        <h1 className="mb-6 text-2xl font-bold">Web Story Builder</h1>
        
        <form onSubmit={handleSubmit((data) => console.log(data))} className="space-y-8">
          {/* Settings Section */}
          <section className="space-y-4 rounded-lg border border-neutral-800 p-4">
            <h2 className="text-lg font-semibold">Story Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Publisher Logo URL</label>
                <input 
                  {...register("settings.publisher_logo_url")} 
                  className="w-full rounded bg-neutral-900 border border-neutral-700 p-2 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Language</label>
                <input 
                  {...register("settings.language")} 
                  className="w-full rounded bg-neutral-900 border border-neutral-700 p-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Pages Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Story Pages</h2>
              <button
                type="button"
                onClick={() => appendPage({ id: `page-${pages.length + 1}`, seo_title: "", layers: [] })}
                className="flex items-center gap-1 rounded bg-teal-600 px-3 py-1 text-sm font-medium hover:bg-teal-500"
              >
                <Plus size={16} /> Add Page
              </button>
            </div>

            {pages.map((page, pIndex) => (
              <div 
                key={page.id} 
                className={`rounded-lg border border-neutral-800 p-4 transition-all ${activePageIndex === pIndex ? 'ring-2 ring-teal-500' : ''}`}
                onClick={() => setActivePageIndex(pIndex)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Page {pIndex + 1}</h3>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removePage(pIndex); }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <input 
                    {...register(`pages.${pIndex}.seo_title` as const)}
                    placeholder="Page SEO Title"
                    className="w-full rounded bg-neutral-900 border border-neutral-700 p-2 text-sm"
                  />
                  
                  {/* Layers Editor (Simplified for this component) */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Layers</p>
                    {/* Placeholder for dynamic layer addition */}
                    <div className="flex gap-2">
                       <button type="button" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700" title="Add Media"><ImageIcon size={14}/></button>
                       <button type="button" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700" title="Add Text"><Type size={14}/></button>
                       <button type="button" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700" title="Add CTA"><LinkIcon size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Right Side: Visual Preview */}
      <div className="flex w-1/2 items-center justify-center bg-neutral-900 p-8">
        <div className="relative aspect-[9/16] w-[350px] overflow-hidden rounded-3xl bg-black shadow-2xl ring-8 ring-neutral-800">
           {/* Preview Content */}
           <div className="h-full w-full relative">
              {storyState.pages[activePageIndex] ? (
                <div className="h-full w-full">
                  {storyState.pages[activePageIndex].layers.map((layer, lIndex) => {
                    if (layer.type === "background_media") {
                      return layer.media_type === "image" ? (
                        <img key={lIndex} src={layer.url} alt={layer.alt_text} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <video key={lIndex} src={layer.url} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop />
                      );
                    }
                    if (layer.type === "text_overlay") {
                      return (
                        <div key={lIndex} className="absolute inset-0 flex items-center justify-center p-6 text-center">
                           {layer.html_tag === "h1" && <h1 className="text-4xl font-bold" style={{ color: layer.styles.color }}>{layer.text}</h1>}
                           {layer.html_tag === "h2" && <h2 className="text-2xl font-semibold" style={{ color: layer.styles.color }}>{layer.text}</h2>}
                           {layer.html_tag === "p" && <p className="text-lg" style={{ color: layer.styles.color }}>{layer.text}</p>}
                        </div>
                      );
                    }
                    if (layer.type === "call_to_action") {
                       return (
                         <div key={lIndex} className="absolute bottom-12 left-0 right-0 p-6 flex justify-center">
                            <a href={layer.url} className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg">
                               {layer.text}
                            </a>
                         </div>
                       )
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-500">
                  Select a page to preview
                </div>
              )}
           </div>

           {/* Mobile UI Overlays */}
           <div className="absolute top-4 left-4 right-4 flex gap-1 h-1">
              {storyState.pages.map((_, idx) => (
                <div key={idx} className={`h-full flex-1 rounded-full ${idx === activePageIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
           </div>
           <div className="absolute top-8 left-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-neutral-200" />
              <div className="h-2 w-24 bg-white/20 rounded" />
           </div>
        </div>
      </div>
    </div>
  );
}
