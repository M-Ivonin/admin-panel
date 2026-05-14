export type DeepLinkSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function buildDeepLinkQueryString(searchParams: DeepLinkSearchParams) {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      return;
    }

    if (value !== undefined) {
      query.set(key, value);
    }
  });

  return query.toString();
}
