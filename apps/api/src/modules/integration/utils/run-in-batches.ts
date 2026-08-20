export async function runInBatches<TItem, TResult>(
  items: TItem[],
  size: number,
  run: (item: TItem) => Promise<TResult>,
): Promise<TResult[]> {
  const results: TResult[] = []

  for (let index = 0; index < items.length; index += size) {
    const batch = items.slice(index, index + size)
    results.push(...(await Promise.all(batch.map(run))))
  }

  return results
}
