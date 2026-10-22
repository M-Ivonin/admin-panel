import { AppEventsAnalyticsView } from '@/components/app-events-analytics/AppEventsAnalyticsView';

/** Opens the chosen analytics tab, optionally scoped to a user from Users. */
export default async function AppEventsAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; userId?: string }>;
}) {
  const { tab, userId } = await searchParams;
  return <AppEventsAnalyticsView tab={tab} userId={userId} />;
}
