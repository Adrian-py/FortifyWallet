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
        const response = await getAccessToken(res.authorization_code);
        cookies().set("response", response.access_token);

        // save user info in local storage to use in the client
        let user_info = {
          user_id: response.user.user_id,
          username: username,
        };
        localStorage.setItem("user", JSON.stringify(user_info));
      });

    return new NextResponse("", { status: 200 });
  } catch (err) {
    return new NextResponse("Invalid username or password", { status: 400 });
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
        throw { message: "Invalid authorization code" };
      }
      return res.json();
    })
    .then((res) => {
      return res;
    });
};
