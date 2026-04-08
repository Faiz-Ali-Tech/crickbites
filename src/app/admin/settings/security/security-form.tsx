"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase-ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"

const securitySchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SecurityValues = z.infer<typeof securitySchema>

export function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
  })

  async function onSubmit(data: SecurityValues) {
    setIsLoading(true)
    setSuccess(false)
    setError(null)
    
    const { error } = await supabase.auth.updateUser({
      password: data.password
    })

    if (error) {
       setError(error.message)
       setIsLoading(false)
       return
    }

    setIsLoading(false)
    setSuccess(true)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <Card className="border-neutral-800 bg-neutral-900/50 p-6">
        <CardContent className="space-y-6 pt-0">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-2 bg-teal-900/30 rounded-lg"><ShieldCheck className="text-teal-400" /></div>
             <div>
                <h3 className="text-lg font-medium">Update Password</h3>
                <p className="text-xs text-neutral-500">Ensure your account is using a long, random password to stay secure.</p>
             </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
               {...register("password")} 
               type="password"
               className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500" 
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
               {...register("confirmPassword")} 
               type="password"
               className="border-neutral-700 bg-neutral-800 focus-visible:ring-teal-500" 
            />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          {success && (
             <div className="flex items-center gap-2 rounded-md bg-teal-900/40 p-3 text-xs text-teal-200">
               <CheckCircle2 className="h-4 w-4" /> Password updated successfully!
             </div>
          )}
          
          {error && (
             <div className="flex items-center gap-2 rounded-md bg-red-900/40 p-3 text-xs text-red-200">
               <AlertCircle className="h-4 w-4" /> {error}
             </div>
          )}

          <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
