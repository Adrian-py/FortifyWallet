import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const access_token = cookies().get("access_token")?.value;

  if (access_token == undefined)
    return new NextResponse(
      JSON.stringify({ status: 401, message: "Not Authorized!" }),
      {
        status: 200,
      }
    );
  return new NextResponse(
    JSON.stringify({ status: 401, message: "Authorized!" }),
    { status: 200 }
  );
}
