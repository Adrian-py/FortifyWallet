import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const access_token = cookies().get("access_token")?.value;
  if (access_token === undefined)
    return NextResponse.json(
      JSON.stringify({ status: 401, message: "Not Authorized!" }),
      { status: 401 }
    );

  try {
    return await fetch(BACKEND_URL + "/transactions/retrieve", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: "access_token=" + access_token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return new NextResponse(
          JSON.stringify({ status: 200, transactions: res.transactions }),
          {
            status: 200,
          }
        );
      });
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ status: 500, message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}
