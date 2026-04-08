"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react"

const navItems = [
  { name: "Dashboard",   href: "/admin",               icon: LayoutDashboard },
  { name: "Posts",       href: "/admin/posts",          icon: FileText },
  { name: "Web Stories", href: "/admin/stories",        icon: BookOpen },
  { name: "Comments",    href: "/admin/comments",       icon: MessageSquare },
  { name: "Settings",    href: "/admin/settings/profile", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router  = useRouter()

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase-ssr")
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-900 text-neutral-100 shrink-0">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <span className="text-xl font-bold tracking-tight text-teal-400">CrickBites</span>
        <span className="ml-1 text-xs text-neutral-500 font-normal mt-0.5">CMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-teal-900/40 text-teal-400 shadow-inner"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-teal-400" : "text-neutral-500 group-hover:text-neutral-300"
                  )}
                />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-3 w-3 text-teal-500" />}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-neutral-800 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            SA
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">Super Admin</span>
            <span className="text-xs text-neutral-500">Administrator</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-500 hover:bg-neutral-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}
