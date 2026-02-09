import { SettingsForm } from "@/components/settings/settings-form"
import { SiteHeader } from "@/components/site-header"
import { getUserSettings } from "@/lib/settings/settings"
import { useTimezone } from "@/contexts/TimezoneContext"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const userSettings = await getUserSettings()
  
  return (
    <>
      <SiteHeader title="Settings"/>
      <SettingsClient initialData={userSettings} />
    </>
  )
}
