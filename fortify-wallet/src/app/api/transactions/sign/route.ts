import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  // const { password } = await req.json();
  const { transaction_id, sender_address } = await req.json();
  const access_token = cookies().get("access_token")?.value;
  if (access_token === undefined)
    return NextResponse.json(
      JSON.stringify({ status: 401, message: "Not Authorized!" }),
      { status: 401 }
    );

  try {
    return await fetch(BACKEND_URL + "/transactions/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "access_token=" + access_token,
      },
      body: JSON.stringify({ transaction_id, sender_address }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.error);
        return new NextResponse(
          JSON.stringify({ status: res.status, message: res.message }),
          {
            status: 200,
          }
        );
      });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({
        status: 500,
        message: "Internal Server Error!",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}
