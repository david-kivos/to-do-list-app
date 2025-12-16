"use server";
import { access } from 'fs';
import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function postData<Req, Res>(endpoint: string, data: Req): Promise<{ ok: boolean; data?: Res; error?: any }> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    return { ok: false, error: json };
  }

  return { ok: true, data: json as Res };
}

type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAction(payload: LoginPayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login/`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log('error login: ', error)
    throw new Error(error.detail || "Login failed");

  }

  const data = await res.json();
  
  const cookieStore = await cookies();
  cookieStore.set('access', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60,
  });
  
  cookieStore.set('refresh', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });

  cookieStore.set('user', JSON.stringify(data.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });

  return { success: true, message: data.message };
}

export async function registerAction<Req, Res>(endpoint: string, payload: Req): Promise<{ ok: boolean; data?: Res; error?: any }> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data };
  }

  const cookieStore = await cookies();
  cookieStore.set('access', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60,
  });
  
  cookieStore.set('refresh', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });

  // return { success: true, message: data.message };
  return { ok: true, data: data as Res };
}

type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: "not_started" | "in_progress" | "done" | "cancelled";
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');

  if (!access) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/task/${taskId}/`,
    {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${access.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update task");
  }

  const data = await res.json();
  
  revalidatePath('/tasks');
  
  return data;
}

export async function deleteTask(taskId: string) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');

  if (!access) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/task/${taskId}/`,
    {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${access.value}`,
      },
    }
  );

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete task");
  }

  // Revalidate the tasks page to refresh the data
  revalidatePath('/tasks');
  
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  
  if (!userCookie) {
    return null;
  }
  
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}