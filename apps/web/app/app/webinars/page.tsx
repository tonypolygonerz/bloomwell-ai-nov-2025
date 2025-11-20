import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { redirect } from 'next/navigation'
import { WebinarsPageClient } from '@/src/components/webinars/WebinarsPageClient'

export default async function WebinarsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/app/webinars')
  }

  return <WebinarsPageClient />
}

