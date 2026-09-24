import { useEffect, useRef } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

export function useAutoCollapsedSidebar() {
  const { open, setOpen } = useSidebar()
  const openWhenEntered = useRef(open)
  const setOpenRef = useRef(setOpen)

  useEffect(() => {
    setOpenRef.current = setOpen
  }, [setOpen])

  useEffect(() => {
    const restoreTo = openWhenEntered.current
    setOpenRef.current(false)
    return () => setOpenRef.current(restoreTo)
  }, [])
}
