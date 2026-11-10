'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Add, Campaign, Edit, PauseCircle, Refresh } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  getAppPartnerCampaigns,
  pauseAppPartnerCampaign,
} from '@/lib/api/app-partner-campaigns';
import { getPartnerMarketConfigs } from '@/lib/api/partner-market-configs';
import { getMarketingJurisdictions } from '@/lib/api/marketing-jurisdictions';
import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfig } from '@/modules/partner-market-configs/types';
import {
  placementLabels,
  platformLabels,
  type AppPartnerCampaign,
} from '@/modules/app-partner-campaigns/types';
import { CampaignEditor } from './CampaignEditor';
import { CampaignAnalyticsPanel } from './CampaignAnalyticsPanel';

export function AppPartnerCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<AppPartnerCampaign[]>([]);
  const [markets, setMarkets] = useState<PartnerMarketConfig[]>([]);
  const [jurisdictions, setJurisdictions] = useState<MarketingJurisdiction[]>(
    []
  );
  const [editing, setEditing] = useState<AppPartnerCampaign | null | undefined>(
    undefined
  );
  const [pausing, setPausing] = useState<AppPartnerCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const latestLoadId = useRef(0);

  const load = useCallback(async () => {
    const loadId = ++latestLoadId.current;
    const isCurrentLoad = () => loadId === latestLoadId.current;
    setLoading(true);
    setError(null);
    setLoadingPolicy(true);
    setPolicyError(null);
    await Promise.all([
      getAppPartnerCampaigns()
        .then((loadedCampaigns) => {
          if (isCurrentLoad()) setCampaigns(loadedCampaigns);
        })
        .catch((caught: unknown) => {
          if (isCurrentLoad()) setError(messageOf(caught));
        })
        .finally(() => {
          if (isCurrentLoad()) setLoading(false);
        }),
      Promise.all([getPartnerMarketConfigs(), getMarketingJurisdictions()])
        .then(([loadedMarkets, loadedJurisdictions]) => {
          if (!isCurrentLoad()) return;
          setMarkets(loadedMarkets);
          setJurisdictions(loadedJurisdictions);
        })
        .catch((caught: unknown) => {
          if (isCurrentLoad()) setPolicyError(messageOf(caught));
        })
        .finally(() => {
          if (isCurrentLoad()) setLoadingPolicy(false);
        }),
    ]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function finish(
    campaign: AppPartnerCampaign,
    action: 'saved' | 'paused'
  ) {
    setEditing(undefined);
    setPausing(null);
    setSuccess(`${campaign.name} ${action}.`);
    await load();
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title="App partner campaigns"
        subtitle="Configure SirBro Matches banners and prediction footers using approved partner markets."
        icon={<Campaign color="primary" />}
        actions={
          activeTab === 0 ? (
            <Button
              startIcon={<Add />}
              variant="contained"
              disabled={
                loading || loadingPolicy || Boolean(error || policyError)
              }
              onClick={() => setEditing(null)}
            >
              Create campaign
            </Button>
          ) : null
        }
      />
      <Stack
        spacing={2}
        sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}
      >
        <Tabs
          aria-label="App partner administration"
          value={activeTab}
          onChange={(_, value: number) => setActiveTab(value)}
        >
          <Tab label="Campaigns" />
          <Tab label="Analytics" />
        </Tabs>
        {activeTab === 1 ? (
          <CampaignAnalyticsPanel campaigns={campaigns} markets={markets} />
        ) : (
          <>
            <Alert severity="info">
              New campaigns start in draft. The backend checks market approval,
              required disclosures and destinations before activation.
            </Alert>
            {error ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    startIcon={<Refresh />}
                    onClick={() => void load()}
                  >
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : null}
            {policyError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={() => void load()}>
                    Retry
                  </Button>
                }
              >
                Could not load market policies. {policyError}
              </Alert>
            ) : null}
            {success ? (
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            ) : null}
            {loading ? (
              <Stack spacing={2} alignItems="center" py={6} role="status">
                <CircularProgress />
                <Typography color="text.secondary">
                  Loading app partner campaigns…
                </Typography>
              </Stack>
            ) : !error && campaigns.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography>No app partner campaigns found</Typography>
                </CardContent>
              </Card>
            ) : null}
            {!loading &&
              !error &&
              campaigns.map((campaign) => {
                const market = markets.find(
                  (item) => item.id === campaign.partnerMarketConfigId
                );
                return (
                  <Card key={campaign.id}>
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Stack spacing={0.75}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            useFlexGap
                            flexWrap="wrap"
                            gap={1}
                          >
                            <Typography variant="h6">
                              {campaign.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={campaign.status}
                              color={
                                campaign.status === 'active'
                                  ? 'success'
                                  : 'default'
                              }
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {market
                              ? `${market.operatorDisplayName} · ${market.countryCode}${market.regionCode ? ` / ${market.regionCode}` : ''}`
                              : 'Operator market unavailable'}
                            {' · Priority '}
                            {campaign.priority}
                          </Typography>
                          <Typography variant="body2">
                            {campaign.platforms
                              .map((platform) => platformLabels[platform])
                              .join(', ') || 'No enabled platforms'}
                            {' · '}
                            {campaign.placements
                              .map((placement) => placementLabels[placement])
                              .join(', ') || 'No enabled placements'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatUtc(campaign.startsAt)} →{' '}
                            {formatUtc(campaign.endsAt)} ·{' '}
                            {campaign.minimumSessions}+ sessions ·{' '}
                            {campaign.minimumAge}+ campaign age floor
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Button
                            startIcon={<Edit />}
                            disabled={loadingPolicy || Boolean(policyError)}
                            onClick={() => setEditing(campaign)}
                          >
                            Edit
                          </Button>
                          <Button
                            color="error"
                            variant="outlined"
                            startIcon={<PauseCircle />}
                            disabled={campaign.status !== 'active'}
                            onClick={() => setPausing(campaign)}
                          >
                            Pause
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
          </>
        )}
      </Stack>
      {editing !== undefined ? (
        <CampaignEditor
          campaign={editing ?? undefined}
          campaigns={campaigns}
          markets={markets}
          jurisdictions={jurisdictions}
          onClose={() => setEditing(undefined)}
          onSaved={(campaign) => finish(campaign, 'saved')}
        />
      ) : null}
      {pausing ? (
        <PauseCampaignDialog
          campaign={pausing}
          onClose={() => setPausing(null)}
          onPaused={(campaign) => finish(campaign, 'paused')}
        />
      ) : null}
    </Box>
  );
}

function PauseCampaignDialog({
  campaign,
  onClose,
  onPaused,
}: {
  campaign: AppPartnerCampaign;
  onClose: () => void;
  onPaused: (campaign: AppPartnerCampaign) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function pause() {
    setBusy(true);
    setError(null);
    try {
      await onPaused(await pauseAppPartnerCampaign(campaign));
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open fullWidth maxWidth="sm" onClose={busy ? undefined : onClose}>
      <DialogTitle>Pause {campaign.name}?</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            The next server decision will hide the campaign across all its
            placements.
          </Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={busy}
          onClick={() => void pause()}
        >
          Confirm pause
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatUtc(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Could not load app partner campaigns.';
}
