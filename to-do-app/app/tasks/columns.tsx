"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { EditTaskDialog } from "@/components/edit-task-dialog"
// import { deleteTask } from "@/lib/api"
import { useRouter } from "next/navigation"
import { TaskActions } from "./task-actions"
import { Badge } from "@/components/ui/badge"

export type Task = {
  id: string
  title: string
  description: string
  created_at: string
  status: "not_started" | "in_progress" | "done" | "cancelled"
}
export type PaginatedTaskResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Task[]
}

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge className={getStatusColor(status)}>
          {formatStatus(status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created at"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original
      return <TaskActions task={task} />
    },
  },
]