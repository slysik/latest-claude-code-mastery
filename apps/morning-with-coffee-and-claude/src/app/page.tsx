import { getDashboardData } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'

export const revalidate = 86400

export default async function HomePage() {
  const data = await getDashboardData()
  return <DashboardLayout data={data} />
}
