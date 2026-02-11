import { getTimelineData, getDashboardData } from '@/lib/db'
import TimelineFeed from '@/components/TimelineFeed'
import DashboardLayout from '@/components/DashboardLayout'

export const revalidate = 3600

export default async function HomePage() {
  const data = await getTimelineData(7)

  // Legacy fallback: if no briefings exist yet, show the old dashboard
  if (data.briefings.length === 0) {
    const legacyData = await getDashboardData()
    return <DashboardLayout data={legacyData} />
  }

  return <TimelineFeed data={data} />
}
