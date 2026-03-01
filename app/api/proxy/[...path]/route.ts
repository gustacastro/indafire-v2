import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
]);

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const backendPath = pathname.replace(/^\/api\/proxy/, '');
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  const forwardedHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardedHeaders[key] = value;
    }
  });

  if (!forwardedHeaders['content-type']) {
    forwardedHeaders['content-type'] = 'application/json';
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: forwardedHeaders,
    body: hasBody ? await request.text() : undefined,
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
