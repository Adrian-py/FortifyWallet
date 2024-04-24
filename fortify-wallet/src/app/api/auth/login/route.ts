import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (res.status != 200) {
          throw { message: "Invalid username or password" };
        }
        return res.json();
      })
      .then(async (res) => {
        const access_token = await getAccessToken(res.authorization_code);
        cookies().set("access_token", access_token);
      });

    return new NextResponse("", { status: 200 });
  } catch (err) {
    return new NextResponse("Invalid username or password", { status: 400 });
  }
}

const getAccessToken = async (authorization_code: string): Promise<string> => {
  return await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authorization_code }),
  })
    .then((res) => {
      if (res.status != 200) {
        throw { message: "Invalid authorization code" };
      }
      return res.json();
    })
    .then((res) => {
      return res.access_token;
    });
};
