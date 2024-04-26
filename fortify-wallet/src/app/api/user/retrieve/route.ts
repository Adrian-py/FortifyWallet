import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  try {
    return await fetch(BACKEND_URL + "/users/retrieve", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${cookie}`,
      },
      cache: "no-cache",
    })
      .then((res) => {
        if (res.status == 401) {
          throw new Error("Not Authorized!");
        }
        return res.json();
      })
      .then((res) => {
        return new NextResponse(JSON.stringify(res), {
          status: 200,
        });
      });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}
