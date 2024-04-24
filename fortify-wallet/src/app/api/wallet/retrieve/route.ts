import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  try {
    return await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/wallet/retrieve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "access_token=" + cookie,
        },
        body: JSON.stringify({ user_id: user_id }),
        cache: "no-cache",
      }
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(
            "Error: Something wen't wrong when trying to retrieve your wallets"
          );
        }
        return res.json();
      })
      .then((res) => {
        return new NextResponse(JSON.stringify(res), { status: 200 });
      });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}
