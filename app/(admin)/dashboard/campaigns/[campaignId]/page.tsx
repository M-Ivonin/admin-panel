import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';

interface CampaignPageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { campaignId } = await params;

  return (
    <ProtectedRoute>
      <CampaignEditorPage mode="edit" campaignId={campaignId} />
    </ProtectedRoute>
  );
}
