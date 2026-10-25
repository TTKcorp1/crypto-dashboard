import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const apiBaseUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://crypto-dashboard-api.onrender.com');

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `/api/${path.map(encodeURIComponent).join('/')}${incomingUrl.search}`,
    apiBaseUrl,
  );
  const headers = new Headers();

  for (const name of ['authorization', 'content-type', 'accept']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      cache: 'no-store',
    });
    const contentType = upstreamResponse.headers.get('content-type');

    return new Response(await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      headers: contentType ? { 'content-type': contentType } : undefined,
    });
  } catch (error) {
    console.error('API proxy request failed:', error);
    return Response.json({ message: 'Unable to reach the API server' }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
