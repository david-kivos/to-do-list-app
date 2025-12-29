"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { clearAuthCookies } from "@/lib/api"

let setGlobalSessionExpired: ((expired: boolean) => void) | null = null

export function showSessionExpiredDialog() {
  if (setGlobalSessionExpired) {
    setGlobalSessionExpired(true)
  }
}

export function SessionExpiredDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setGlobalSessionExpired = setOpen
    
    return () => {
      setGlobalSessionExpired = null
    }
  }, [])

  const handleLogin = async () => {
    await clearAuthCookies();
    setOpen(false)
    router.push('/login')
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogin}>
            Return to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}