// Versão do app no formato X.Y.Z (sem pré-release). Puro TS.

export const VERSION_PATTERN = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

export function isValidVersion(v: string): boolean {
  return VERSION_PATTERN.test(v);
}

/** -1 se a < b, 0 se iguais, 1 se a > b. Versões inválidas contam como 0.0.0. */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) => (isValidVersion(v) ? v.split(".").map(Number) : [0, 0, 0]);
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}
