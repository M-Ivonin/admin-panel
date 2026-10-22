import { TimeInAppReport } from '@/components/app-events-analytics/TimeInAppReport';

/** Opens engagement analytics, optionally scoped to an account from Users. */
export default async function TimeInAppPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  return <TimeInAppReport userId={userId} />;
}
