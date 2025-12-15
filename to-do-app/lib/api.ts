"use server";
import { access } from 'fs';
import { cookies } from 'next/headers';

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