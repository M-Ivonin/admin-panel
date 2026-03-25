export function buildApiUrl(baseUrl: string, path: string) {
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
}
