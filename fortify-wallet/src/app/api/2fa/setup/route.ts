import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  try {
    return await fetch(BACKEND_URL + "/accounts/setup-2fa", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${cookie}`,
      },
      cache: "no-cache",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.error);
        return new NextResponse(
          JSON.stringify({ status: 200, two_factor_data: res.two_factor_data }),
          {
            status: 200,
          }
        );
      });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({ status: 500, message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}
