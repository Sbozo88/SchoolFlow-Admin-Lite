/** Generate a stable-looking tenant id without external deps. */
export function generateTenantId(now: () => number = Date.now, random: () => number = Math.random): string {
  const time = now().toString(36);
  const rand = Math.floor(random() * 1e9).toString(36);
  return `tenant-${time}-${rand}`;
}

export function slugifyOrgName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "org";
}
