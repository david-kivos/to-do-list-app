"use client"

import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updatePassword, updateProfile, updateTimezone } from "@/lib/settings/settings-actions"

export type UserSettings = {
    name: string
    email: string
    timezone: string
}

export interface SettingsFormProps {
  initialData: UserSettings
}


interface SettingsFormFields {
  name?: string
  timezone?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Belgrade", label: "Belgrade (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
]

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting }, control } = useForm<SettingsFormFields>({
    defaultValues: {
      name: initialData.name,
      timezone: initialData.timezone,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  const watchedFields = watch()

  // Determine if anything changed compared to initialData
  const isChanged = (() => {
    if (watchedFields.name && watchedFields.name !== initialData.name) return true
    if (watchedFields.timezone && watchedFields.timezone !== initialData.timezone) return true
    if (watchedFields.currentPassword || watchedFields.newPassword || watchedFields.confirmPassword) return true
    return false
  })()

  const onSubmit = async (data: SettingsFormFields) => {
    try {
      const updates: Promise<any>[] = []

      // Update name if changed
      if (data.name && data.name !== initialData.name) {
        updates.push(updateProfile({ name: data.name }))
      }

      // Update timezone if changed
      if (data.timezone && data.timezone !== initialData.timezone) {
        updates.push(updateTimezone({ timezone: data.timezone }))
      }

      // Update password if fields filled
      const { currentPassword, newPassword, confirmPassword } = data
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setError("currentPassword", { type: "manual", message: "Fill all password fields" })
          setError("newPassword", { type: "manual", message: "Fill all password fields" })
          setError("confirmPassword", { type: "manual", message: "Fill all password fields" })
          return
        }

        if (newPassword !== confirmPassword) {
          setError("confirmPassword", { type: "manual", message: "Passwords do not match" })
          return
        }

        if (newPassword.length < 8) {
          setError("newPassword", { type: "manual", message: "Password must be at least 8 characters" })
          return
        }

        updates.push(updatePassword({ currentPassword, newPassword }))
      }

      if (updates.length === 0) {
        toast.error("No changes", { description: "No changes were made" })
        return
      }

      const results = await Promise.all(updates)
      const allSuccessful = results.every(r => r.success)
      const errorsResults = results.filter(r => !r.success).map(r => r.error)

      if (allSuccessful) {
        toast.success("Settings updated", { description: "Your settings have been updated successfully" })
      } else {
        toast.error("Error", { description: errorsResults.join(", ") || "Failed to update some settings" })
      }

    } catch (err) {
      console.error(err)
      toast.error("Error", { description: "An unexpected error occurred" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" placeholder="Your name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={initialData.email} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Leave blank to keep current password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" {...register("currentPassword")} />
            {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" {...register("newPassword")} />
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
          <CardDescription>Set your timezone for accurate time displays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="timezone"
            control={control}
            defaultValue={initialData.timezone}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.timezone && (
            <p className="text-red-500 text-sm">{errors.timezone.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isChanged || isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </form>
  )
}
