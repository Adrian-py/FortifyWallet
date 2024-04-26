import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const access_token = cookies().get("access_token")?.value;

  if (access_token == undefined)
    return new NextResponse("Not Authorized!", { status: 401 });
  return new NextResponse("Authorized!", { status: 200 });
}
