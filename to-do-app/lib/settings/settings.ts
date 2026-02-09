"use server"
import axios from "axios"
import { redirect } from "next/navigation"
import axiosInstance from "../axios"

export async function getUserSettings() {
  try {
    const response = await axiosInstance.get("user/me/")
    console.log('ovo je response za usera: ', response)
    return {
      name: response.data.full_name || "",
      email: response.data.email || "",
      timezone: response.data.timezone || "UTC",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/login")
    }
    console.error("Error fetching user settings:", error)
    return {
      name: "",
      email: "",
      timezone: "UTC",
    }
  }
}