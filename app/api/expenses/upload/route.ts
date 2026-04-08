import { put } from '@vercel/blob';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: 'Blob storage not configured' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `receipts/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: 'private',
      contentType: file.type || 'image/jpeg',
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Blob upload error:', message);
    return Response.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
