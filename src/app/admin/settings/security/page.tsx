import { SecurityForm } from "./security-form"

export const dynamic = 'force-dynamic'

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-neutral-500">Manage your account security and password.</p>
      </div>
      <SecurityForm />
    </div>
  )
}
