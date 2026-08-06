export const BASE_PATH = "";

export function withBasePath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized;
}
