import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!process.env.ACCESS_CODE || code !== process.env.ACCESS_CODE) {
    return Response.json({ error: 'Código incorrecto' }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  // HttpOnly cookie, valid for 30 days
  res.headers.set(
    'Set-Cookie',
    'authed=ok; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000',
  );
  return res;
}
