'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  articleId: string
  price: number
}

export default function PurchaseButton({ articleId, price }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/articles/${articleId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Purchase error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handlePurchase}>
        <div className="mb-6">
          <span className="text-3xl font-bold text-blue-600">¥{price.toLocaleString()}</span>
          <span className="text-gray-500 ml-2">（税込）</span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            bg-blue-600 text-white px-6 py-2 rounded-md
            hover:bg-blue-700 transition-colors
            disabled:bg-blue-400 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? '処理中...' : '購入する'}
        </button>
      </form>
    </div>
  )
}
