export function getApiUrl(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}
