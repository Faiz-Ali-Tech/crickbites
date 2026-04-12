"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Camera } from "lucide-react"
import { uploadAssetAction } from "@/app/actions/upload.actions"
import { updateAdminProfileAction, getAdminProfileAction } from "@/app/actions/settings.actions"
import { useEffect } from "react"
import { toast } from "sonner"
import { UpdateProfileSchema } from "@/lib/validations/schema"

type ProfileValues = z.infer<typeof UpdateProfileSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const res = await getAdminProfileAction()
      if (res.success && res.data) {
        reset({
          name: res.data.name,
          bio: res.data.bio || "",
          avatarUrl: res.data.avatarUrl || "",
        })
        if (res.data.avatarUrl) setAvatarPreview(res.data.avatarUrl)
      }
    }
    loadProfile()
  }, [reset])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
     const file = e.target.files?.[0]
     if (!file) return

     const previewUrl = URL.createObjectURL(file)
     setAvatarPreview(previewUrl)

     const formData = new FormData()
     formData.append("file", file)
     
     const res = await uploadAssetAction(formData)
     if (res.success) {
        setValue("avatarUrl", res.data)
     }
  }

  async function onSubmit(data: ProfileValues) {
    setIsLoading(true)
    setSuccess(false)
    
    const res = await updateAdminProfileAction(data)
    setIsLoading(false)
    
    if (res.success) {
      setSuccess(true)
      toast.success("Profile updated successfully")
    } else {
      toast.error(res.error || "Failed to update profile")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <Card className="border-neutral-800 bg-neutral-900/50 p-6">
        <CardContent className="space-y-6 pt-0">
          <div className="flex items-center gap-6">
             <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-neutral-800 overflow-hidden ring-4 ring-neutral-800">
                   {avatarPreview ? (
                      <img src={avatarPreview} className="h-full w-full object-cover" />
                   ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold bg-teal-600">SA</div>
                   )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-teal-500 rounded-full cursor-pointer hover:bg-teal-400 transition-colors shadow-lg">
                   <Camera size={16} />
                   <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
             </div>
             <div>
                <h3 className="text-lg font-medium">Avatar Image</h3>
                <p className="text-xs text-neutral-500">JPG, PNG or WEBP. Max 2MB.</p>
             </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
               {...register("name")} 
               className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500" 
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              {...register("bio")}
              rows={4}
              className="flex w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
            />
          </div>

          {success && (
             <div className="flex items-center gap-2 rounded-md bg-teal-900/40 p-3 text-xs text-teal-200">
               <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
             </div>
          )}

          <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
