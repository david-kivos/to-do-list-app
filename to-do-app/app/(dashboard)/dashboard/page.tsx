import { DataTable } from "@/app/tasks/data-table"
import { SiteHeader } from "@/components/site-header"
import { getTasksData } from "@/app/tasks/api"
import { columns } from "@/app/tasks/columns"
import { CreateTaskButton } from "@/app/tasks/create-task-button"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  // const page = Number(searchParams?.page ?? 1)
  const params = await searchParams
  const page = Number(params?.page) || 1;
  const data = await getTasksData(page, 10)
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground">
                Manage your tasks and to-do items - {data.count} tasks total
              </p>
            </div>
            <CreateTaskButton />
          </div>
          <DataTable 
            columns={columns} 
            data={data.results}
            count={data.count}
            page={page} 
          />
        </div>
      </div>
    </>
  )
}
