import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  let user_info: any = {
    username: username,
    user_id: null,
    role: null,
  };

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
        // Using the authorization code to get the access token
        const response = await getAccessToken(res.authorization_code);
        cookies().set("access_token", response.access_token);
        user_info.user_id = response.user.user_id;
        user_info.role = response.user.role;
      });

    // Encrypt user data before sending it back to the client

    return new NextResponse(
      JSON.stringify({
        message: "Authorized!",
        user: JSON.stringify(user_info),
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse(
      "Error: Something wen't wrong whilst trying to log you in",
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
