export async function postData<Req, Res>(endpoint: string, data: any): Promise<Res> {
  const api_url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`
  console.log(api_url)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw json
  }

  return json as Res;
}