'use client'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TIMEZONES, useTimezone } from "@/contexts/TimezoneContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { updateTimezone } from "@/lib/settings/settings-actions"


export function SiteHeader({ title }: { title: string }) {
  const { timezone, setTimezone, userTimezone } = useTimezone()
  const isCustomTimezone = timezone.value !== userTimezone.value

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Select 
            value={timezone.value} 
            onValueChange={(value) => {
              const selected = TIMEZONES.find(tz => tz.value === value);
              if (selected) {
                setTimezone(selected);
                updateTimezone({ timezone: value });
              }

            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isCustomTimezone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimezone(userTimezone)}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
