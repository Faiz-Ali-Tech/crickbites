import { Sidebar } from "@/components/admin/sidebar"

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-neutral-950 text-neutral-100">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-neutral-950">
        <div className="mx-auto max-w-7xl p-8">
           {children}
        </div>
      </main>
    </div>
  )
}
