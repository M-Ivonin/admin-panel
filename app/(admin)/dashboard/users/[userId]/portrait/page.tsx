import { UserPortrait } from '@/components/app-events-analytics/UserPortrait';

/** A separate protected portrait, retaining Users' existing report and chat destinations. */
export default async function UserPortraitPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserPortrait key={userId} userId={userId} />;
}
