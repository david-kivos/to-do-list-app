"use server";
import { access } from 'fs';
import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { google } from 'googleapis';

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
    return { success: false, error };

  }

  const data = await res.json();
  
  await setTokens(data)

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

  await setTokens(data)

  return { ok: true, data: data as Res };
}

type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: "not_started" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "mid" | "high";
  due_date?: string;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');

  if (!access) {
    return {"status": 'error', "message": 'Not authenticated'};
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
    return {"status": 'error', "message": 'Not authenticated'};
  }

  if (!res.ok) {
    const error = await res.json();
    return {"status": 'error', "message": error.message || "Failed to update task"};
  }

  const data = await res.json();
  
  revalidatePath('/dashboard');
  
  return {"status": 'success', "data": data};
}

export async function deleteTask(taskId: string) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');

  if (!access) {
    return {"status": 'error', "message": 'Not authenticated'};
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
    return {"status": 'error', "message": 'Not authenticated'};
  }

  if (!res.ok) {
    const error = await res.json();
    return {"status": 'error', "message": error.message || "Failed to delete task"};
  }

  revalidatePath('/dashboard');
  
  return {"status": 'success'};
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

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status: "not_started" | "in_progress" | "done" | "cancelled";
  priority: "low" | "mid" | "high";
  due_date?: string;
}

export async function createTask(payload: CreateTaskPayload) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');

  if (!access) {
    return {"status": 'error', "message": 'Not authenticated'};
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/task/`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${access.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (res.status === 401) {
    return {"status": 'error', "message": 'Not authenticated'};
  }

  if (!res.ok) {
    const error = await res.json();
    return {"status": 'error', "message": error.message || "Failed to create task"};
  }

  const data = await res.json();
  
  revalidatePath('/dashboard');
  
  return {"status": 'success', "data": data};
}

export async function logoutAction() {
  const cookieStore = await cookies();
  
  cookieStore.delete('access');
  cookieStore.delete('refresh');
  cookieStore.delete('user');
  
  redirect('/login');
}

export async function googleLoginAction(code: string) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      throw new Error("No ID token received");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Google login failed");
    }

    const data = await res.json();
    
    await setTokens(data)

    return { success: true, user: data.user };
  } catch (error: any) {
    throw new Error(error.message || "Google login failed");
  }
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get('access');
  
  if (!access) {
    console.log('⚠️ Access token missing, clearing all auth cookies');
    cookieStore.delete('access');
    cookieStore.delete('refresh');
    cookieStore.delete('user');
    return null;
  }
  
  return access.value;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  try {
    cookieStore.delete('refresh');
  }
  catch {
    console.log('Error deleting refresh cookie.')
  }
  try {
    cookieStore.delete('user')
  }
  catch {
    console.log('Error deleting user cookie.')
  }
  try {
    cookieStore.delete('access')
  }
  catch {
    console.log('Error deleting access cookie.')
  }
  
  console.log('Auth cookies cleared');
}

export async function setTokens(data: any) {
  const cookieStore = await cookies();

  cookieStore.set('access', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
    });
    
    cookieStore.set('refresh', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    cookieStore.set('user', JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
}