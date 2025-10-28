'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      // se não tiver token, manda pro login
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  // até verificar token, não renderiza nada
  if (!ready) return null

  return <>{children}</>
}
