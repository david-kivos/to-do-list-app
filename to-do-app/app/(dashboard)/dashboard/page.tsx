import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/app/tasks/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { getTasksData } from "@/app/tasks/api"
import { columns } from "@/app/tasks/columns"

export default async function Page() {
  const data = await getTasksData()

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
          </div> */}
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </>
  )
}
