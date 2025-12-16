"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { deleteTask } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Task } from "./columns"

type TaskActionsProps = {
  task: Task
}

export function TaskActions({ task }: TaskActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return
    
    try {
      await deleteTask(task.id)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to delete task")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            Edit task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}