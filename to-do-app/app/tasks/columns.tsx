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

export type Task = {
  id: string
  title: string
  description: string
  created_at: string
  status: "Not Started" | "In Progress" | "Done" | "Cancelled"
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