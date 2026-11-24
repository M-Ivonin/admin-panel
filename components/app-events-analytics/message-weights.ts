type Weights = Record<string, number>;

export const totalWeight = 10_000;

function proportionallyAllocate(
  ids: readonly string[],
  amount: number,
  byId: (id: string) => number
): Weights {
  if (ids.length === 0) return {};
  const total = ids.reduce((sum, id) => sum + byId(id), 0);
  const shares = ids.map((id) => {
    const exact = total ? (amount * byId(id)) / total : amount / ids.length;
    return {
      id,
      units: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  const remaining =
    amount - shares.reduce((sum, share) => sum + share.units, 0);
  shares.sort((a, b) => b.remainder - a.remainder);
  return Object.fromEntries(
    shares.map(({ id, units }, index) => [
      id,
      units + Number(index < remaining),
    ])
  );
}

export function reconcileWeights(
  ids: readonly string[],
  saved: Weights | null | undefined
): Weights | null {
  if (!saved) return null;
  const defaultWeight = totalWeight / ids.length;
  return proportionallyAllocate(
    ids,
    totalWeight,
    (id) => saved[id] ?? defaultWeight
  );
}

export function editWeight(
  ids: readonly string[],
  current: Weights | null,
  id: string,
  units: number
): Weights {
  const others = ids.filter((scenarioId) => scenarioId !== id);
  if (others.length === 0) return { [id]: totalWeight };
  return {
    ...proportionallyAllocate(
      others,
      totalWeight - units,
      (key) => current?.[key] ?? 1
    ),
    [id]: units,
  };
}

export function parseWeight(value: string): number | null {
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(value)) return null;
  const units = Math.round(Number(value) * 100);
  return units <= totalWeight ? units : null;
}

export function sameWeights(a: Weights | null, b: Weights | null): boolean {
  if (!a || !b) return a === b;
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([id, value]) => b[id] === value)
  );
}
