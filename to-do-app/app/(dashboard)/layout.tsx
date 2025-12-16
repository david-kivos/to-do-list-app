// app/(dashboard)/layout.tsx
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/api"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}