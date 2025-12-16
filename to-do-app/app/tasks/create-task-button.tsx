// app/tasks/create-task-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "@/app/tasks/create-task-dialog"

export function CreateTaskButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Task
      </Button>
      <CreateTaskDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}