import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbContextValue {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  items: [],
  setItems: () => undefined,
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([])
  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb(): BreadcrumbContextValue {
  return useContext(BreadcrumbContext)
}

export function useSetBreadcrumb(items: BreadcrumbItem[]): void {
  const { setItems } = useBreadcrumb()
  useEffect(() => {
    setItems(items)
    return () => setItems([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.label + (i.to ?? '')).join('|')])
}
