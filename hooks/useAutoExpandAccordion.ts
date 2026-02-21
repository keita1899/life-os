import { useState, useRef, useEffect } from 'react'

export function useAutoExpandAccordion(keys: string[]): {
  openKeys: string[]
  setOpenKeys: React.Dispatch<React.SetStateAction<string[]>>
} {
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const seenKeysRef = useRef<string[]>([])

  useEffect(() => {
    if (keys.length === 0) return
    const added = keys.filter((k) => !seenKeysRef.current.includes(k))
    if (added.length > 0) {
      seenKeysRef.current = [...new Set([...seenKeysRef.current, ...keys])]
      setOpenKeys((prev) => [...new Set([...prev, ...added])])
    }
  }, [keys])

  return { openKeys, setOpenKeys }
}
