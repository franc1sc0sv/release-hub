import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 250

interface SearchFieldProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function SearchField({
  value,
  onValueChange,
  placeholder,
  className,
  autoFocus,
}: SearchFieldProps) {
  const [inputValue, setInputValue] = useState(value)
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue === value) return
    const timer = setTimeout(() => onValueChangeRef.current(inputValue), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [inputValue, value])

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="pl-9"
      />
    </div>
  )
}
