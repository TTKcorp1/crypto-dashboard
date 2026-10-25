export function getApiUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configuredUrl || (
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://crypto-dashboard-api.onrender.com'
  );

  return `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
