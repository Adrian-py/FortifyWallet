import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const access_token = cookies().get("access_token")?.value;
  if (access_token == undefined)
    return new Response("Not Authorized!", { status: 401 });

  try {
    return await fetch(BACKEND_URL + "/departments/retrieve", {
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
          JSON.stringify({
            message: "Sucessfully retreived departments!",
            departments: res.departments,
          }),
          {
            status: 200,
          }
        );
      });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ message: "", error: err.message }),
      { status: 500 }
    );
  }
}
