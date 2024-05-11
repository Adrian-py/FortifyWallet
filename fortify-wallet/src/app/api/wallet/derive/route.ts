import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { account_id } = await req.json();
  const cookie = cookies().get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  return await fetch(BACKEND_URL + "/wallet/derive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "access_token=" + cookie,
    },
    cache: "no-cache",
    body: JSON.stringify({ account_id }),
  })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error("Error: Something went wrong when deriving wallet");
      }
      return res.json();
    })
    .then((res) => {
      return new NextResponse(JSON.stringify({ message: "Wallet derived!" }), {
        status: 200,
      });
    })
    .catch((err) => {
      return new NextResponse(JSON.stringify(err.message), { status: 500 });
    });
}
