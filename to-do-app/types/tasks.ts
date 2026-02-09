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