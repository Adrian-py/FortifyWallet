import { NextResponse, NextRequest } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  try {
    return await fetch(BACKEND_URL + "/wallet/retrieve", {
      method: "POST",
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
        if (res.status !== 200) {
          throw new Error(
            "Error: Something wen't wrong when trying to retrieve your wallets"
          );
        }
        return new NextResponse(JSON.stringify(res), { status: 200 });
      });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}
