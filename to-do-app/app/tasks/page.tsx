import { getTasksData } from "./api"
import { columns, Task } from "./columns"
import { DataTable } from "./data-table"

export default async function DemoPage() {
  const data = await getTasksData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}