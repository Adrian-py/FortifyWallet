import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { source_address, target_address, value } = await req.json();
  const cookie = cookies().get("access_token")?.value;
  if (!cookie)
    return new NextResponse(
      JSON.stringify({ status: 401, message: "Unauthorized!" }),
      {
        status: 401,
      }
    );

  try {
    return await fetch(BACKEND_URL + "/transactions/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "access_token=" + cookie,
      },
      body: JSON.stringify({ source_address, target_address, value }),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (res) => {
        if (res.status !== 200) throw new Error(res.message);
        return new NextResponse(
          JSON.stringify({
            status: res.status,
            message: res.message,
          }),
          { status: 200 }
        );
      });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ status: 500, error: err.message }),
      {
        status: 500,
      }
    );
  }
}
