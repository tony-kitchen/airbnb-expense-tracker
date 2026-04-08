import { put } from '@vercel/blob';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: 'Blob storage not configured' }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = await put(`receipts/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  return Response.json({ url: blob.url });
}
