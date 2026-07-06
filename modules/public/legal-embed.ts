const legalEmbedPathPattern =
  /^\/(?:en|pt|es)\/(?:privacy|terms|disclaimer)\/embed\/?$/;

export function isLegalEmbedPathname(pathname: string | null | undefined) {
  return pathname != null && legalEmbedPathPattern.test(pathname);
}
