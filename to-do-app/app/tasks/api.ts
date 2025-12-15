"use server"

import { cookies } from "next/headers";
import { Task } from "./columns"
import { redirect } from "next/navigation";

export async function getTasksData(): Promise<Task[]> {
  const cookieStore = await cookies();
  const access = cookieStore.get('access')
  console.log('access: ', access)

  if (!access) {
    redirect("/login");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/task/all/`,
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