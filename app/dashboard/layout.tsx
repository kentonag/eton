import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

const navigation = [
  { name: '記事一覧', href: '/dashboard' },
  { name: 'プロフィール', href: '/dashboard/profile' },
  { name: '統計', href: '/dashboard/stats' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
