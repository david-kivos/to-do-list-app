'use client'
import { SettingsForm, UserSettings } from "@/components/settings/settings-form"
import { TIMEZONES, useTimezone } from "@/contexts/TimezoneContext"
import { useEffect } from "react"

export function SettingsClient({ initialData }: { initialData: UserSettings }) {
    const { setTimezone } = useTimezone()
    useEffect(() => {
        const timezoneObject = TIMEZONES.find(tz => tz.value === initialData.timezone)
        if (timezoneObject) {
        setTimezone(timezoneObject)
        }
    }, [initialData.timezone, setTimezone])

  
  return (
    <div className="flex flex-1 flex-col">
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <SettingsForm initialData={initialData} />
      </div>
    </div>
  )
}