"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TaskActions } from "./task-actions"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { updateTask } from "@/lib/api"
import { StatusSelect } from "@/components/status-select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export type Task = {
  id: string
  title: string
  description: string
  created_at: string
  status: "not_started" | "in_progress" | "done" | "cancelled"
  priority: "low" | "mid" | "high"
  due_date?: string
  completed: boolean
}
export type PaginatedTaskResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Task[]
}

const formatPriority = (priority: string): string => {
  return priority
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-gray-500'
    case 'mid':
      return 'bg-yellow-500'
    case 'high':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getDueDateStyle = (dueDate: string) => {
  const date = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(date)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return "bg-red-600"
  } else if (diffDays === 0) {
    return "bg-red-600"
  } else if (diffDays === 1) {
    return "bg-orange-600"
  } else if (diffDays <= 3) {
    return "bg-orange-500"
  } else if (diffDays <= 7) {
    return "bg-yellow-500"
  } else if (diffDays <= 14) {
    return "bg-emerald-500"
  } else {
    return "bg-emerald-600"
  }
}
type CompleteTaskButtonProps = {
  taskId: string
  completed: boolean
  title: string
}

export function CompleteTaskButton({ taskId, completed, title }: CompleteTaskButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    if (completed) return
    
    setIsLoading(true)
    try {
      const payload = {
        completed: true,
        status: "done" as const
      }
      await updateTask(taskId, payload)
      toast.success("Task completed", {
        description: `Task "${title}" has been completed.`,
      })
      router.refresh()
    } catch (error: any) {
      console.error("Failed to complete task:", error)
      const errorMessage = error.message || "Failed to complete task";
      
      if (errorMessage.startsWith("Not authenticated")) {
        const { showSessionExpiredDialog } = await import("@/components/session-expired-dialog")
        showSessionExpiredDialog()
      } else {
        const displayMessage = errorMessage.replace(/^(API_ERROR_\d+|NETWORK_ERROR|UNKNOWN_ERROR):\s*/, '');
        toast.error("Failed to complete task", {
          description: displayMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (completed) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
        <Check className="h-4 w-4 mr-1" />
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleComplete}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
        </>
      ) : (
        <Check className="h-4 w-4 mr-1" />
      )}
    </Button>
  )
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const task = row.original
      return (
        <StatusSelect 
          taskId={task.id} 
          currentStatus={task.status}
          title={task.title}
        />
      )
    },
  },
  {
    id: "complete",
    header: "Mark as completed",
    cell: ({ row }) => {
      const task = row.original
      return <CompleteTaskButton taskId={task.id} completed={task.completed} title={task.title}/>
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge className={getPriorityColor(priority)}>
          {formatPriority(priority)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date")
      const task = row.original
      if (!dueDate) return <span className="text-muted-foreground">-</span>
      
      const date = new Date(dueDate as string)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      if (task.completed) {
        return <span className="text-muted-foreground">{formattedDate}</span>
      }

      return (
        <Badge className={getDueDateStyle(dueDate as string)}>
          {formattedDate}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      
      const dueDate = row.getValue(id) as string | undefined
      if (!dueDate) return false
      
      const rowDate = new Date(dueDate)
      rowDate.setHours(0, 0, 0, 0)
      
      const { from, to } = value as { from?: Date; to?: Date }
      
      if (from && to) {
        const fromDate = new Date(from)
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        return rowDate >= fromDate && rowDate <= toDate
      } else if (from) {
        const fromDate = new Date(from)
        fromDate.setHours(0, 0, 0, 0)
        return rowDate >= fromDate
      }
      
      return true
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created at
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
      return <TaskActions task={task} />
    },
  },
]