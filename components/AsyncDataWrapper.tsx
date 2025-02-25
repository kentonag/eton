'use client'

import { useEffect, useState } from 'react'
import { fetchData } from '@/lib/supabaseClient'

interface AsyncDataWrapperProps<T> {
  fetcher: () => Promise<T>
  onError?: (error: Error) => void
  children: (data: T | null) => React.ReactNode
  loadingComponent?: React.ReactNode
}

export default function AsyncDataWrapper<T>({
  fetcher,
  onError,
  children,
  loadingComponent = <div>Loading...</div>,
}: AsyncDataWrapperProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData(fetcher, onError)
      setData(result)
      setLoading(false)
    }
    loadData()
  }, [fetcher, onError])

  if (loading) {
    return loadingComponent
  }

  return children(data)
}
