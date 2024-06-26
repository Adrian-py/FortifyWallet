import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { otp } = await req.json();
  const cookie = req.cookies.get("access_token")?.value;
  if (cookie == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });

  try {
    return await fetch(BACKEND_URL + "/accounts/verify-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${cookie}`,
      },
      cache: "no-cache",
      body: JSON.stringify({ otp }),
    })
      .then((res) => {
        // If access_token was refreshed, update the cookie
        const returned_access_token = res.headers.get("Set-Cookie");
        if (returned_access_token && returned_access_token != cookie)
          cookies().set("access_token", returned_access_token);
        return res.json();
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.error);
        return new NextResponse(
          JSON.stringify({
            status: 200,
            message: "Successfully Verified OTP!",
          }),
          {
            status: 200,
          }
        );
      });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ status: 500, error: err.message }),
      { status: 500 }
    );
  }
}
