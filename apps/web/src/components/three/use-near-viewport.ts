import { useEffect, useState, type RefObject } from 'react'

const ROOT_MARGIN = '200px'

export function useNearViewport(ref: RefObject<HTMLElement | null>): boolean {
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNear(entry.isIntersecting)
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return isNear
}
