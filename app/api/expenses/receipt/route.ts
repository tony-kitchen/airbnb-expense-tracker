import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get('url');
  if (!blobUrl) {
    return new Response('Missing url param', { status: 400 });
  }

  try {
    // Fetch the private blob from Vercel's storage using the server-side token
    const imageRes = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!imageRes.ok) {
      return new Response(`Blob fetch failed: ${imageRes.status}`, { status: imageRes.status });
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await imageRes.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Error: ${message}`, { status: 500 });
  }
}
