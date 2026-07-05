export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function generateUniqueSlug(
  name: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name)
  if (!(await slugExists(base))) return base

  let suffix = 2
  while (await slugExists(`${base}-${suffix}`)) {
    suffix += 1
  }
  return `${base}-${suffix}`
}
