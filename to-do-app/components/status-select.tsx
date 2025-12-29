"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type StatusSelectProps = {
  taskId: string
  currentStatus: "not_started" | "in_progress" | "done" | "cancelled"
  title: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-500'
    case 'in_progress':
      return 'bg-blue-500'
    case 'done':
      return 'bg-green-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function StatusSelect({ taskId, currentStatus, title }: StatusSelectProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    
    setIsLoading(true)
    try {
      const result = await updateTask(taskId, { 
        status: newStatus as "not_started" | "in_progress" | "done" | "cancelled" 
      })
      if (result['status'] === 'success'){
        toast.success("Task status updated", {
          description: `Status of task "${title}" has been updated.`,
        })
        router.refresh()
      }
      else if (result['status'] === 'error') {
        console.error("Failed to update task:", result['message'])
        const errorMessage = result['message'] || "Failed to update task";
        
        if (errorMessage.startsWith("Not authenticated")) {
          const { showSessionExpiredDialog } = await import("@/components/session-expired-dialog")
          showSessionExpiredDialog()
        } else {
          const displayMessage = errorMessage.replace(/^(API_ERROR_\d+|NETWORK_ERROR|UNKNOWN_ERROR):\s*/, '');
          toast.error("Failed to update task", {
            description: displayMessage,
          })
        }
      }

    } catch (error: any) {
      console.error("Failed to update task:", error)
      const errorMessage = error.message || "Failed to update task";
      const displayMessage = errorMessage.replace(/^(API_ERROR_\d+|NETWORK_ERROR|UNKNOWN_ERROR):\s*/, '');
      toast.error("Failed to update task", {
        description: displayMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <SelectValue asChild>
          <Badge className={`${getStatusColor(currentStatus)} cursor-pointer`}>
            {formatStatus(currentStatus)}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="not_started">Not Started</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="done">Done</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  )
}