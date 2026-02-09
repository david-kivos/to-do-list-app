import { DataTable } from "@/components/tasks/data-table"
import { SiteHeader } from "@/components/site-header"
import { getTasksData } from "@/lib/tasks"
import { columns } from "@/components/tasks/columns"
import { CreateTaskButton } from "@/components/tasks/create-task-button"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string , cpage?: string}>
}) {
  const params = await searchParams
  const page = Number(params?.page) || 1;
  const cpage = Number(params?.cpage) || 1;
  const data = await getTasksData(page, 10)
  const completedTasksData = await getTasksData(cpage, 10, true)
  
  return (
    <>
      <SiteHeader title="Tasks"/>
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
          <div>
            <h2 className="text-2xl font-bold mb-4">All Tasks</h2>
            <DataTable 
              columns={columns} 
              data={data.results}
              count={data.count}
              page={page} 
              pageParam="page"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Tasks ({completedTasksData.count})</h2>
            <DataTable 
              columns={columns} 
              data={completedTasksData.results}
              count={completedTasksData.count}
              page={cpage} 
              pageParam="cpage"
            />
          </div>
        </div>
      </div>
    </>
  )
}
