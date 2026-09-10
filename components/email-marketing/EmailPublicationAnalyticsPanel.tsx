import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type {
  EmailAnalyticsCompleteness,
  EmailAnalyticsRetentionWindow,
  EmailPublication,
  EmailPublicationAnalytics,
} from '@/modules/email-marketing/contracts';

export function EmailPublicationAnalyticsPanel({
  publication,
  analytics,
  error,
  loading,
  acknowledgementNote,
  onAcknowledgementNoteChange,
  onAcknowledge,
  onExport,
}: {
  publication: EmailPublication;
  analytics: EmailPublicationAnalytics | null;
  error: string | null;
  loading: boolean;
  acknowledgementNote: string;
  onAcknowledgementNoteChange: (value: string) => void;
  onAcknowledge: () => void;
  onExport: () => void;
}) {
  const incident = publication.lateIncident;
  return (
    <Stack spacing={2} aria-label="Publication analytics">
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h6">Performance and health</Typography>
          <Typography variant="body2" color="text.secondary">
            Backend-calculated aggregates. Rates, denominators, cohorts,
            completeness, and health are shown as returned.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={onExport}
          disabled={loading || !analytics}
        >
          Export aggregate analytics
        </Button>
      </Stack>

      {publication.autoPause ? (
        <Alert severity="error">
          Auto-paused by backend ·{' '}
          {publication.autoPause.reason ?? 'Critical health threshold'} ·{' '}
          {formatDate(publication.autoPause.at)}
        </Alert>
      ) : null}
      {incident ? (
        incident.acknowledgedAt ? (
          <Alert severity="success">
            Late critical incident acknowledged{' '}
            {formatDate(incident.acknowledgedAt)}
            {incident.acknowledgementNote
              ? ` · ${incident.acknowledgementNote}`
              : ''}
          </Alert>
        ) : (
          <Alert severity="error">
            <Stack spacing={1.5}>
              <Typography>
                Late critical incident ·{' '}
                {incident.reason ?? 'Critical health threshold'} ·{' '}
                {formatDate(incident.at)}
              </Typography>
              <TextField
                label="Operator acknowledgement note"
                value={acknowledgementNote}
                onChange={(event) =>
                  onAcknowledgementNoteChange(event.target.value)
                }
                multiline
                minRows={2}
                required
              />
              <Button
                variant="contained"
                color="error"
                onClick={onAcknowledge}
                disabled={loading || !acknowledgementNote.trim()}
              >
                Acknowledge late incident
              </Button>
            </Stack>
          </Alert>
        )
      ) : null}

      {loading && !analytics ? (
        <Alert severity="info">Loading analytics…</Alert>
      ) : null}
      {error ? (
        <Alert severity="error">Analytics unavailable: {error}</Alert>
      ) : null}
      {analytics ? <AnalyticsReadModel analytics={analytics} /> : null}
    </Stack>
  );
}

function AnalyticsReadModel({
  analytics,
}: {
  analytics: EmailPublicationAnalytics;
}) {
  const { dimensions, counts, rates, denominators, health } = analytics;
  const healthSeverity =
    health.status === 'healthy'
      ? 'success'
      : health.status === 'warning'
        ? 'warning'
        : 'error';
  return (
    <Stack spacing={2}>
      <Alert severity={healthSeverity}>
        Health: {health.status}
        {health.reasons.length
          ? ` · ${health.reasons.join(', ')}`
          : ' · No threshold warnings'}
      </Alert>

      <Section title="Grouping dimensions">
        <MetricGrid
          values={[
            ['Campaign', dimensions.campaign ?? 'N/A'],
            ['Publication version', dimensions.publicationVersion],
            ['Type', dimensions.type ?? 'N/A'],
            ['Operator', dimensions.operator],
            ['Geo', dimensions.geo],
            ['League', dimensions.league],
            ['Market', dimensions.market],
          ]}
        />
      </Section>

      <Section title="Delivery and reputation">
        <MetricGrid
          values={[
            ['Provider accepted', counts.accepted],
            ['Delivered', counts.delivered],
            ['Delayed', counts.delayed],
            ['Hard bounce', counts.hardBounce],
            ['Block / reject', counts.blockReject],
            ['Complaint', counts.complaint],
            ['Topic unsubscribe', counts.topicUnsubscribe],
            ['Global unsubscribe', counts.globalUnsubscribe],
            ['Delivery rate', formatRate(rates.delivery)],
            ['Delivery denominator', denominators.providerAccepted],
            ['Hard-bounce rate', formatRate(health.rates.hardBounce)],
            ['Hard-bounce denominator', health.denominators.hardBounce],
            ['Complaint rate', formatRate(health.rates.complaint)],
            ['Complaint denominator', health.denominators.complaint],
            ['Unsubscribe rate', formatRate(health.rates.unsubscribe)],
            ['Unsubscribe denominator', health.denominators.unsubscribe],
            ['Matured delivery rate', formatRate(health.rates.maturedDelivery)],
            [
              'Matured delivery denominator',
              health.denominators.maturedDelivery,
            ],
          ]}
        />
      </Section>

      <Section title="Product engagement and verified initial subscription">
        <StatusLine
          label="Attribution completeness"
          status={analytics.attributionCompleteness.status}
          detail={`${analytics.attributionCompleteness.numerator} / ${analytics.attributionCompleteness.denominator} correlated provider events`}
        />
        <StatusLine
          label="Traced attribution"
          status={analytics.tracedAttribution.completeness}
          detail={`${analytics.tracedAttribution.tracedDeliveries} / ${analytics.tracedAttribution.eligibleDeliveries} eligible deliveries`}
        />
        <MetricGrid
          values={[
            [
              'Full Analysis CTA clicks',
              analytics.tracedAttribution.metrics?.fullAnalysisClicks ?? 'N/A',
            ],
            [
              'Product CTA clicks',
              analytics.tracedAttribution.metrics?.productClicks ?? 'N/A',
            ],
            [
              'App opens from email',
              analytics.tracedAttribution.metrics?.appOpens ?? 'N/A',
            ],
            [
              'Verified initial subscriptions',
              analytics.tracedAttribution.metrics?.initialSubscriptions ??
                'N/A',
            ],
          ]}
        />
      </Section>

      <Section title="Affiliate funnel and revenue">
        <StatusLine
          label="Revenue completeness"
          status={analytics.affiliateRevenue.completeness}
        />
        <MetricGrid
          values={[
            ['Partner landing views', counts.partnerLandingViews],
            ['Continue-to-operator clicks', counts.partnerContinues],
            ['Affiliate conversions', counts.affiliateConversions],
            [
              'Affiliate revenue (USD)',
              formatMoney(analytics.affiliateRevenue.usd),
            ],
            [
              'Revenue / delivered email',
              formatMoney(rates.revenuePerDeliveredEmail),
            ],
            ['Delivered denominator', denominators.delivered],
            [
              'Revenue / eligible confirmed partner subscriber',
              formatMoney(rates.revenuePerEligibleConfirmedPartnerSubscriber),
            ],
            [
              'Eligible confirmed audience denominator',
              denominators.eligibleConfirmedAudience,
            ],
          ]}
        />
      </Section>

      <Section title="Exposed / control retention">
        <Typography variant="body2" color="text.secondary">
          Cohort anchor:{' '}
          {analytics.retention.anchorAt
            ? formatDate(analytics.retention.anchorAt)
            : 'N/A'}
        </Typography>
        <RetentionWindow label="D7 activity" value={analytics.retention.d7} />
        <RetentionWindow label="D30 activity" value={analytics.retention.d30} />
        {analytics.retention.byLocale.length ? (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              aria-label="Retention locale and cohort groupings"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Locale</TableCell>
                  <TableCell>Cohort</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>D7 active</TableCell>
                  <TableCell>D7 denominator</TableCell>
                  <TableCell>D30 active</TableCell>
                  <TableCell>D30 denominator</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.retention.byLocale.map((slice) => (
                  <TableRow key={`${slice.locale}-${slice.cohort}`}>
                    <TableCell>{slice.locale}</TableCell>
                    <TableCell>{slice.cohort}</TableCell>
                    <TableCell>{slice.size}</TableCell>
                    <TableCell>{slice.d7.active}</TableCell>
                    <TableCell>{slice.d7.denominator}</TableCell>
                    <TableCell>{slice.d30.active}</TableCell>
                    <TableCell>{slice.d30.denominator}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Section>

      <Section title="Backend groupings">
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="Analytics backend groupings">
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Operator</TableCell>
                <TableCell>Geo</TableCell>
                <TableCell>Locale</TableCell>
                <TableCell>Cohort</TableCell>
                <TableCell>League</TableCell>
                <TableCell>Market</TableCell>
                <TableCell>Accepted</TableCell>
                <TableCell>Delivered</TableCell>
                <TableCell>Delivery rate</TableCell>
                <TableCell>Complaint rate</TableCell>
                <TableCell>Unsubscribe rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.slices.map((slice, index) => (
                <TableRow key={`${slice.locale}-${slice.cohort}-${index}`}>
                  <TableCell>{slice.campaign ?? 'N/A'}</TableCell>
                  <TableCell>{slice.publicationVersion}</TableCell>
                  <TableCell>{slice.type ?? 'N/A'}</TableCell>
                  <TableCell>{slice.operator}</TableCell>
                  <TableCell>{slice.geo}</TableCell>
                  <TableCell>{slice.locale}</TableCell>
                  <TableCell>{slice.cohort ?? 'N/A'}</TableCell>
                  <TableCell>{slice.league}</TableCell>
                  <TableCell>{slice.market}</TableCell>
                  <TableCell>{slice.counts.accepted}</TableCell>
                  <TableCell>{slice.counts.delivered}</TableCell>
                  <TableCell>{formatRate(slice.rates.delivery)}</TableCell>
                  <TableCell>{formatRate(slice.rates.complaint)}</TableCell>
                  <TableCell>{formatRate(slice.rates.unsubscribe)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="Sponsored / non-sponsored comparison">
        <Alert severity="info">
          Observational comparison only — differences are not causal A/B uplift.
        </Alert>
        {analytics.sponsoredComparator.status === 'N/A' ? (
          <Typography>N/A — no matching non-sponsored publication.</Typography>
        ) : (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Comparator publication version{' '}
              {analytics.sponsoredComparator.publicationVersion}; same league,
              market, and locale within{' '}
              {analytics.sponsoredComparator.matching.lookbackDays} days.
            </Typography>
            {analytics.sponsoredComparator.slices.map((slice) => (
              <MetricGrid
                key={slice.locale}
                values={[
                  ['Locale', slice.locale],
                  ['Sponsored delivered', slice.sponsored.delivered],
                  [
                    'Sponsored complaint rate',
                    formatRate(slice.sponsored.complaintRate),
                  ],
                  [
                    'Sponsored unsubscribe rate',
                    formatRate(slice.sponsored.unsubscribeRate),
                  ],
                  ['Non-sponsored delivered', slice.comparator.delivered],
                  [
                    'Non-sponsored complaint rate',
                    formatRate(slice.comparator.complaintRate),
                  ],
                  [
                    'Non-sponsored unsubscribe rate',
                    formatRate(slice.comparator.unsubscribeRate),
                  ],
                ]}
              />
            ))}
          </Stack>
        )}
      </Section>
    </Stack>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">{title}</Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricGrid({ values }: { values: Array<[string, string | number]> }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1,
      }}
    >
      {values.map(([label, value]) => (
        <Box
          key={label}
          sx={{
            p: 1.25,
            bgcolor: 'action.hover',
            borderRadius: 1,
            minWidth: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function StatusLine({
  label,
  status,
  detail,
}: {
  label: string;
  status: EmailAnalyticsCompleteness;
  detail?: string;
}) {
  const color =
    status === 'complete'
      ? 'success'
      : status === 'incomplete'
        ? 'warning'
        : 'default';
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
    >
      <Typography>{label}</Typography>
      <Chip size="small" label={status} color={color} />
      {detail ? (
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Stack>
  );
}

function RetentionWindow({
  label,
  value,
}: {
  label: string;
  value: EmailAnalyticsRetentionWindow;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">{label}</Typography>
        <Chip
          size="small"
          label={value.maturity}
          color={
            value.maturity === 'mature'
              ? 'success'
              : value.maturity === 'immature'
                ? 'info'
                : 'default'
          }
        />
        <Chip
          size="small"
          label={value.completeness}
          color={
            value.completeness === 'complete'
              ? 'success'
              : value.completeness === 'incomplete'
                ? 'warning'
                : 'default'
          }
        />
      </Stack>
      <MetricGrid
        values={[
          ['Exposed cohort size', value.exposed.size],
          ['Exposed active', value.exposed.active],
          ['Exposed denominator', value.exposed.denominator],
          ['Exposed activity rate', formatRate(value.exposed.rate)],
          ['Control cohort size', value.control.size],
          ['Control active', value.control.active],
          ['Control denominator', value.control.denominator],
          ['Control activity rate', formatRate(value.control.rate)],
        ]}
      />
    </Box>
  );
}

function formatRate(value: number | null): string {
  return value === null
    ? 'N/A'
    : `${(value * 100).toLocaleString('en-US', { maximumFractionDigits: 4 })}%`;
}

function formatMoney(value: number | null): string {
  return value === null
    ? 'N/A'
    : value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 4,
      });
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
