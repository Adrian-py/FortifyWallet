import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const cookie = cookies().get("access_token")?.value;
  if (!cookie)
    return new NextResponse(
      JSON.stringify({ status: 401, message: "Not Authorized!" }),
      {
        status: 200,
      }
    );

  const address = req.nextUrl.searchParams.get("address");

  try {
    return await fetch(BACKEND_URL + "/wallet/info/" + address, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: "access_token=" + cookie,
      },
      cache: "no-cache",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return new NextResponse(JSON.stringify(res), { status: 200 });
      });
  } catch (err: any) {
    return new NextResponse(JSON.stringify(err.message), { status: 500 });
  }
}
