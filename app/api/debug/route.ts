export async function GET() {
  return Response.json({
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasAccessCode: !!process.env.ACCESS_CODE,
  });
}
