"use server"

import { cookies } from "next/headers";
import { Task, PaginatedTaskResponse } from "./columns"
import { redirect } from "next/navigation";

export async function getTasksData(
  page: number = 1, 
  pageSize: number = 10
): Promise<PaginatedTaskResponse> {
  const cookieStore = await cookies();
  const access = cookieStore.get('access')

  if (!access) {
    redirect("/login");
  }
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/task/all/?${params}`,
    {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${access.value}`,
      },
      cache: "no-store",
    }
  );

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
}