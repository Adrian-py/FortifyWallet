import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  let account_info: any = {
    username: username,
    account_id: null,
    role: null,
  };

  try {
    await fetch(BACKEND_URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (res) => {
        if (res.status !== 200) throw new Error(res.error);
        // Using the authorization code to get the access token
        const response = await getAccessToken(res.authorization_code);
        cookies().set("access_token", response.access_token);
        account_info.account_id = response.account.account_id;
        account_info.role = response.account.role;
      });

    return new NextResponse(
      JSON.stringify({
        status: 200,
        message: "Authorized!",
        account: JSON.stringify(account_info),
      }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({
        status: 500,
        message: "Unauthorized!",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

const getAccessToken = async (authorization_code: string): Promise<any> => {
  return await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authorization_code }),
  })
    .then((res) => {
      if (res.status != 200) {
        throw { message: "Error: Invalid authorization code" };
      }
      return res.json();
    })
    .then((res) => {
      return res;
    });
};
