"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import axiosInstance from "../axios"

export async function updateProfile({ name }: { name: string }) {
  try {
    await axiosInstance.patch("user/me/", { name })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        redirect("/login")
      }
      const errorData = error.response?.data
      return { 
        success: false, 
        error: errorData?.detail || errorData?.name?.[0] || "Failed to update profile" 
      }
    }
    console.error("Error updating profile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updatePassword({ 
  currentPassword, 
  newPassword 
}: { 
  currentPassword: string
  newPassword: string 
}) {
  try {
    await axiosInstance.patch("user/me/", { 
    //   old_password: currentPassword,
    //   new_password: newPassword 
        password: newPassword
    })
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        redirect("/login")
      }
      const errorData = error.response?.data
      return { 
        success: false, 
        error: errorData?.detail || 
               errorData?.old_password?.[0] || 
               errorData?.new_password?.[0] || 
               "Failed to update password" 
      }
    }
    console.error("Error updating password:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateTimezone({ timezone }: { timezone: string }) {
  try {
    await axiosInstance.patch("user/me/", { timezone })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        redirect("/login")
      }
      const errorData = error.response?.data
      return { 
        success: false, 
        error: errorData?.detail || errorData?.timezone?.[0] || "Failed to update timezone" 
      }
    }
    console.error("Error updating timezone:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}