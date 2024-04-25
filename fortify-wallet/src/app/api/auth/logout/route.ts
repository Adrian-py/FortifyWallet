import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();
  const cookie = cookies().get('access_token')?.value;

  if (!cookie)
    return new NextResponse(
      JSON.stringify({ status: 401, message: 'Not Authorized!' }),
      { status: 401 }
    );

  return await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'access_token=' + cookie,
    },
    cache: 'no-cache',
    body: JSON.stringify({ user_id }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.status === 200) cookies().delete('access_token');
      return new NextResponse(
        JSON.stringify({ status: res.status, message: res.message }),
        { status: res.status }
      );
    });
}
