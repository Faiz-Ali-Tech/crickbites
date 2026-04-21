import { ProfileForm } from "./profile-form"

export const dynamic = 'force-dynamic'

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-neutral-500">Update your public profile information.</p>
      </div>
      <ProfileForm />
    </div>
  )
}
