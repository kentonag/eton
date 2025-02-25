'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard' },
  { name: 'プロフィール', href: '/dashboard/profile' },
  { name: '統計', href: '/dashboard/stats' },
]

interface DashboardNavProps {
  user: User
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
                    ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
