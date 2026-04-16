import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';

export default function NewCampaignPage() {
  return (
    <ProtectedRoute>
      <CampaignEditorPage mode="create" />
    </ProtectedRoute>
  );
}
