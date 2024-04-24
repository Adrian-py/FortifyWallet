import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined) {
    return new NextResponse("Not Authorized!", { status: 401 });
  }

  return await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: "access_token=" + cookie,
    },
    cache: "no-cache",
  })
    .then((res) => {
      // If access_token was refreshed, update the cookie
      const returned_access_token = res.headers.get("Set-Cookie");
      if (returned_access_token && returned_access_token != cookie)
        cookies().set("access_token", returned_access_token);

      return res.json();
    })
    .then((res) => {
      if (res.status != 200) {
        return new NextResponse("Not Authorized!", { status: 401 });
      }
      return new NextResponse("Authorized!", { status: 200 });
    });
}
