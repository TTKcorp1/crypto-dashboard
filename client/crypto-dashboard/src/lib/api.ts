export function getApiUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configuredUrl || (
    process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''
  );

  if (!baseUrl) {
    throw new Error('Login service is not configured. Set NEXT_PUBLIC_API_URL to the deployed API URL.');
  }

  return `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
