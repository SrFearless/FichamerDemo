'use client';

import { useEffect } from 'react'

export default function ClientUnloadCleanup() {
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem('token')
    }
    window.addEventListener('unload', handleUnload)
    return () => window.removeEventListener('unload', handleUnload)
  }, [])

  return null
}