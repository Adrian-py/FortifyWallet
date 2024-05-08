import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const new_account = await req.json();
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  return await fetch(BACKEND_URL + "/accounts/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "access_token=" + cookie,
    },
    cache: "no-cache",
    body: JSON.stringify(new_account),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.status !== 200) throw new Error(res.error);
      return new NextResponse(
        JSON.stringify({ message: "Successfully Created User!" }),
        { status: 200 }
      );
    })
    .catch((err) => {
      return new NextResponse(
        JSON.stringify({ status: 500, error: err.message }),
        { status: 500 }
      );
    });
}
