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
  view,
  analytics,
  error,
  loading,
  acknowledgementNote,
  onAcknowledgementNoteChange,
  onAcknowledge,
  onExport,
}: {
  publication: EmailPublication;
  view: 'overview' | 'analytics';
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
            Delivery results and actions attributed to this publication.
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
          Automatically paused · {reasonLabel(publication.autoPause.reason)} ·{' '}
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
                Late critical incident · {reasonLabel(incident.reason)} ·{' '}
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
      {analytics ? (
        <AnalyticsReadModel
          analytics={analytics}
          publication={publication}
          view={view}
        />
      ) : null}
    </Stack>
  );
}

function AnalyticsReadModel({
  analytics: a,
  publication,
  view,
}: {
  analytics: EmailPublicationAnalytics;
  publication: EmailPublication;
  view: 'overview' | 'analytics';
}) {
  const { counts: c, health: h } = a;
  const partner =
    publication.topic === 'betting_partner_offers' ||
    publication.topic === 'sirbro_predictions_with_partner_offer';
  const product = publication.topic !== 'betting_partner_offers';
  const metrics = a.tracedAttribution.available
    ? a.tracedAttribution.metrics
    : null;
  const unavailable = 'Tracking unavailable';
  const delivery = (
    <Result
      label="Delivered"
      value={formatRate(a.rates.delivery)}
      detail={`${c.delivered.toLocaleString('en-US')} of ${a.denominators.providerAccepted.toLocaleString('en-US')} accepted emails`}
    />
  );
  return (
    <Stack spacing={3}>
      <Alert
        severity={
          h.status === 'healthy'
            ? 'success'
            : h.status === 'warning'
              ? 'warning'
              : 'error'
        }
      >
        <Typography fontWeight={600}>
          {h.status === 'healthy'
            ? 'Delivery health is normal'
            : h.status === 'warning'
              ? 'Delivery needs attention'
              : 'Critical delivery issue'}
        </Typography>
        {h.reasons.map((reason) => (
          <Typography key={reason} variant="body2">
            {reasonLabel(reason)}
            {reason.includes('bounce')
              ? `: ${formatRate(h.rates.hardBounce)} (${c.hardBounce} of ${h.denominators.hardBounce} accepted emails)`
              : reason.includes('complaint')
                ? `: ${formatRate(h.rates.complaint)} (${c.complaint} of ${h.denominators.complaint} delivered emails)`
                : ''}
          </Typography>
        ))}
      </Alert>
      {view === 'overview' ? (
        <>
          <Grid>
            {delivery}
            {product ? (
              <Result
                label="App opens from email"
                value={metrics?.appOpens ?? unavailable}
              />
            ) : null}
            {product ? (
              <Result
                label="Verified initial subscriptions"
                value={metrics?.initialSubscriptions ?? unavailable}
              />
            ) : null}
            {partner ? (
              <Result
                label="Affiliate conversions"
                value={c.affiliateConversions}
                detail="Conversion events; may include repeat conversions"
              />
            ) : null}
            {partner ? (
              <Result
                label="Affiliate revenue (USD)"
                value={formatMoney(a.affiliateRevenue.usd)}
                detail={completenessLabel(a.affiliateRevenue.completeness)}
              />
            ) : null}
          </Grid>
          <StatusLine
            label="Delivery event coverage"
            status={a.attributionCompleteness.status}
            detail={`${a.attributionCompleteness.numerator} of ${a.attributionCompleteness.denominator} provider events correlated`}
          />
          {product ? (
            <StatusLine
              label="Post-click tracking"
              status={a.tracedAttribution.completeness}
              detail={
                a.tracedAttribution.available
                  ? `${a.tracedAttribution.tracedDeliveries} of ${a.tracedAttribution.eligibleDeliveries} eligible deliveries tracked`
                  : 'No attributable action metrics are available for this publication.'
              }
            />
          ) : null}
          <Box component="details">
            <Typography component="summary">
              Delivery processing details
            </Typography>
            <MetricGrid
              values={[
                ['Provider accepted', publication.counters.accepted],
                ['Pending', publication.counters.pending],
                ['Skipped', publication.counters.skipped],
                ['Failed', publication.counters.failed],
                ['Submission outcome unknown', publication.counters.ambiguous],
                ['Bounced', publication.counters.bounced],
                ['Dropped', publication.counters.dropped],
              ]}
            />
          </Box>
        </>
      ) : (
        <>
          <Section title="Delivery and reputation">
            <Grid>
              {delivery}
              <Result
                label="Hard bounce"
                value={formatRate(h.rates.hardBounce)}
                detail={`${c.hardBounce} of ${h.denominators.hardBounce} accepted emails`}
              />
              <Result
                label="Complaints"
                value={formatRate(h.rates.complaint)}
                detail={`${c.complaint} of ${h.denominators.complaint} delivered emails`}
              />
              <Result
                label="Unsubscribes"
                value={formatRate(h.rates.unsubscribe)}
                detail={`${c.unsubscribe} of ${h.denominators.unsubscribe} delivered emails`}
              />
            </Grid>
            <Box component="details">
              <Typography component="summary">More delivery metrics</Typography>
              <MetricGrid
                values={[
                  ['Delayed', c.delayed],
                  ['Blocked or rejected', c.blockReject],
                  ['Topic unsubscribes', c.topicUnsubscribe],
                  ['Global unsubscribes', c.globalUnsubscribe],
                  [
                    'Matured delivery rate',
                    formatRate(h.rates.maturedDelivery),
                  ],
                  ['Matured accepted emails', h.denominators.maturedDelivery],
                ]}
              />
            </Box>
          </Section>
          {product ? (
            <Section title="Product engagement">
              <StatusLine
                label="Post-click tracking"
                status={a.tracedAttribution.completeness}
                detail={
                  a.tracedAttribution.available
                    ? `${a.tracedAttribution.tracedDeliveries} of ${a.tracedAttribution.eligibleDeliveries} eligible deliveries tracked`
                    : 'Tracking unavailable. Missing measurements are not zero activity.'
                }
              />
              <Stages
                values={[
                  [
                    publication.topic === 'sirbro_product_updates'
                      ? 'Product CTA clicks'
                      : 'Full Analysis CTA clicks',
                    publication.topic === 'sirbro_product_updates'
                      ? metrics?.productClicks
                      : metrics?.fullAnalysisClicks,
                  ],
                  ['App opens from email', metrics?.appOpens],
                  [
                    'Verified initial subscriptions',
                    metrics?.initialSubscriptions,
                  ],
                ]}
              />
              <Typography variant="body2" color="text.secondary">
                Initial subscription attribution uses the last eligible click
                within 7 days.
              </Typography>
            </Section>
          ) : null}
          {partner ? (
            <Section title="Affiliate funnel and revenue">
              <Stages
                values={[
                  ['Partner landing views', c.partnerLandingViews],
                  ['Continue-to-operator clicks', c.partnerContinues],
                  ['Affiliate conversions', c.affiliateConversions],
                ]}
              />
              {a.affiliateConversionsByType ? (
                <TableContainer>
                  <Table
                    size="small"
                    aria-label="Affiliate conversions by type"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Conversion type</TableCell>
                        <TableCell align="right">Events</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(a.affiliateConversionsByType).map(
                        ([type, count]) => (
                          <TableRow key={type}>
                            <TableCell>{conversionTypeLabel(type)}</TableCell>
                            <TableCell align="right">{count}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Conversion type breakdown unavailable.</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Conversions are events and may include repeat conversions from
                the same person.
              </Typography>
              <StatusLine
                label="Revenue data"
                status={a.affiliateRevenue.completeness}
                detail={
                  a.affiliateRevenue.completeness === 'incomplete'
                    ? 'USD revenue is unavailable until all required revenue data is complete.'
                    : undefined
                }
              />
              <Grid>
                <Result
                  label="Affiliate revenue (USD)"
                  value={formatMoney(a.affiliateRevenue.usd)}
                />
                <Result
                  label="Revenue per delivered email"
                  value={formatMoney(a.rates.revenuePerDeliveredEmail)}
                  detail={`Based on ${a.denominators.delivered} delivered emails`}
                />
                <Result
                  label="Revenue per eligible partner subscriber"
                  value={formatMoney(
                    a.rates.revenuePerEligibleConfirmedPartnerSubscriber
                  )}
                  detail={`Based on ${a.denominators.eligibleConfirmedAudience} eligible confirmed subscribers`}
                />
              </Grid>
            </Section>
          ) : null}
          <Section title="Audience retention">
            <Typography variant="body2">
              Email group: {a.retention.d7.exposed.size} people · Control group:{' '}
              {a.retention.d7.control.size} people
            </Typography>
            <TableContainer>
              <Table size="small" aria-label="Audience retention">
                <TableHead>
                  <TableRow>
                    {[
                      'Period',
                      'Email group',
                      'Control group',
                      'Data readiness',
                    ].map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <RetentionRow
                    label="D7"
                    days={7}
                    anchor={a.retention.anchorAt}
                    value={a.retention.d7}
                  />
                  <RetentionRow
                    label="D30"
                    days={30}
                    anchor={a.retention.anchorAt}
                    value={a.retention.d30}
                  />
                </TableBody>
              </Table>
            </TableContainer>
            {a.retention.byLocale.length ? (
              <Box component="details">
                <Typography component="summary">
                  Retention by language
                </Typography>
                <TableContainer>
                  <Table
                    size="small"
                    aria-label="Retention locale and cohort groupings"
                  >
                    <TableHead>
                      <TableRow>
                        {[
                          'Language',
                          'Group',
                          'People',
                          'D7 active / eligible',
                          'D30 active / eligible',
                        ].map((label) => (
                          <TableCell key={label}>{label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {a.retention.byLocale.map((slice) => (
                        <TableRow key={`${slice.locale}-${slice.cohort}`}>
                          <TableCell>{slice.locale.toUpperCase()}</TableCell>
                          <TableCell>{cohortLabel(slice.cohort)}</TableCell>
                          <TableCell>{slice.size}</TableCell>
                          <TableCell>
                            {a.retention.d7.maturity === 'mature'
                              ? `${slice.d7.active} / ${slice.d7.denominator}`
                              : a.retention.d7.maturity === 'immature'
                                ? 'Not ready'
                                : 'Unavailable'}
                          </TableCell>
                          <TableCell>
                            {a.retention.d30.maturity === 'mature'
                              ? `${slice.d30.active} / ${slice.d30.denominator}`
                              : a.retention.d30.maturity === 'immature'
                                ? 'Not ready'
                                : 'Unavailable'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : null}
          </Section>
          <Section title="Result breakdown">
            <Box component="details">
              <Typography component="summary">
                Show breakdown by language and audience
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  a.dimensions.operator,
                  a.dimensions.geo,
                  a.dimensions.league,
                  a.dimensions.market,
                ]
                  .filter(
                    (value) =>
                      !['none', 'unknown/global', 'N/A'].includes(value)
                  )
                  .join(' · ')}
              </Typography>
              <TableContainer>
                <Table size="small" aria-label="Result breakdown">
                  <TableHead>
                    <TableRow>
                      {[
                        'Language',
                        'Group',
                        'Accepted',
                        'Delivered',
                        'Delivery rate',
                        'Complaint rate',
                        'Unsubscribe rate',
                        ...(product
                          ? [
                              'Full Analysis clicks',
                              'Product CTA clicks',
                              'App opens',
                              'Initial subscriptions',
                            ]
                          : []),
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {a.slices.map((slice, index) => (
                      <TableRow key={index}>
                        <TableCell>{slice.locale.toUpperCase()}</TableCell>
                        <TableCell>{cohortLabel(slice.cohort)}</TableCell>
                        <TableCell>{slice.counts.accepted}</TableCell>
                        <TableCell>{slice.counts.delivered}</TableCell>
                        <TableCell>
                          {formatRate(slice.rates.delivery)}
                        </TableCell>
                        <TableCell>
                          {formatRate(slice.rates.complaint)}
                        </TableCell>
                        <TableCell>
                          {formatRate(slice.rates.unsubscribe)}
                        </TableCell>
                        {product ? (
                          <>
                            <TableCell>
                              {slice.engagement?.metrics?.fullAnalysisClicks ??
                                unavailable}
                            </TableCell>
                            <TableCell>
                              {slice.engagement?.metrics?.productClicks ??
                                unavailable}
                            </TableCell>
                            <TableCell>
                              {slice.engagement?.metrics?.appOpens ??
                                unavailable}
                            </TableCell>
                            <TableCell>
                              {slice.engagement?.metrics
                                ?.initialSubscriptions ?? unavailable}
                            </TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Section>
          {publication.topic === 'sirbro_predictions_with_partner_offer' ? (
            <Section title="Sponsored / non-sponsored comparison">
              <Typography variant="body2">
                Observational comparison only — differences are not causal A/B
                uplift.
              </Typography>
              {a.sponsoredComparator.status === 'N/A' ? (
                <Typography>No matching non-sponsored publication.</Typography>
              ) : (
                <>
                  <Typography>
                    Compared with version{' '}
                    {a.sponsoredComparator.publicationVersion}, matched within{' '}
                    {a.sponsoredComparator.matching.lookbackDays} days.
                  </Typography>
                  {a.sponsoredComparator.slices.map((slice) => (
                    <MetricGrid
                      key={slice.locale}
                      values={[
                        ['Language', slice.locale],
                        ['Sponsored delivered', slice.sponsored.delivered],
                        ['Non-sponsored delivered', slice.comparator.delivered],
                        [
                          'Sponsored Full Analysis clicks',
                          slice.sponsored.engagement?.metrics
                            ?.fullAnalysisClicks ?? unavailable,
                        ],
                        [
                          'Non-sponsored Full Analysis clicks',
                          slice.comparator.engagement?.metrics
                            ?.fullAnalysisClicks ?? unavailable,
                        ],
                        [
                          'Sponsored Full Analysis click rate',
                          slice.sponsored.engagement?.rates
                            ? formatRate(
                                slice.sponsored.engagement.rates
                                  .fullAnalysisClick
                              )
                            : unavailable,
                        ],
                        [
                          'Non-sponsored Full Analysis click rate',
                          slice.comparator.engagement?.rates
                            ? formatRate(
                                slice.comparator.engagement.rates
                                  .fullAnalysisClick
                              )
                            : unavailable,
                        ],
                        [
                          'Sponsored app opens',
                          slice.sponsored.engagement?.metrics?.appOpens ??
                            unavailable,
                        ],
                        [
                          'Non-sponsored app opens',
                          slice.comparator.engagement?.metrics?.appOpens ??
                            unavailable,
                        ],
                        [
                          'Sponsored initial subscriptions',
                          slice.sponsored.engagement?.metrics
                            ?.initialSubscriptions ?? unavailable,
                        ],
                        [
                          'Non-sponsored initial subscriptions',
                          slice.comparator.engagement?.metrics
                            ?.initialSubscriptions ?? unavailable,
                        ],
                        [
                          'Sponsored complaint rate',
                          formatRate(slice.sponsored.complaintRate),
                        ],
                        [
                          'Non-sponsored complaint rate',
                          formatRate(slice.comparator.complaintRate),
                        ],
                        [
                          'Sponsored unsubscribe rate',
                          formatRate(slice.sponsored.unsubscribeRate),
                        ],
                        [
                          'Non-sponsored unsubscribe rate',
                          formatRate(slice.comparator.unsubscribeRate),
                        ],
                      ]}
                    />
                  ))}
                </>
              )}
            </Section>
          ) : null}
        </>
      )}
    </Stack>
  );
}

function Stages({ values }: { values: Array<[string, number | undefined]> }) {
  const colors = ['#6F86FF', '#B88BFF', '#51C88D'];
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Independent stage totals · step conversion rates are unavailable
      </Typography>
      <Grid>
        {values.map(([label, value], index) => (
          <Box key={label} sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {value === undefined
                ? 'Tracking unavailable'
                : value.toLocaleString('en-US')}
            </Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              {label}
            </Typography>
            <Box
              sx={{
                height: 6,
                borderRadius: 4,
                bgcolor:
                  value === undefined
                    ? 'action.disabledBackground'
                    : colors[index],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {value === undefined ? 'No measurement' : 'Recorded events'}
            </Typography>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
function RetentionRow({
  label,
  value,
  days,
  anchor,
}: {
  label: string;
  value: EmailAnalyticsRetentionWindow;
  days: number;
  anchor: string | null;
}) {
  const ready = value.maturity === 'mature';
  const expected = anchor
    ? new Date(new Date(anchor).getTime() + (days + 8) * 86400000)
    : null;
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      {[value.exposed, value.control].map((cohort, index) => (
        <TableCell key={index}>
          {ready ? (
            <>
              {formatRate(cohort.rate)}
              <Typography variant="caption" display="block">
                {cohort.active} active / {cohort.denominator} eligible
              </Typography>
            </>
          ) : value.maturity === 'immature' ? (
            'Not ready'
          ) : (
            'Unavailable'
          )}
        </TableCell>
      ))}
      <TableCell>
        {value.maturity === 'immature'
          ? `Awaiting observation window${expected ? ` · expected ${formatDate(expected.toISOString())}` : ''}`
          : value.maturity === 'N/A'
            ? value.completeness === 'incomplete'
              ? 'Incomplete cohort history'
              : 'Retention unavailable'
            : completenessLabel(value.completeness)}
      </TableCell>
    </TableRow>
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
        <Stack spacing={2}>
          <Typography variant="h6">{title}</Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}
function Result({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={600} sx={{ my: 0.5 }}>
        {value}
      </Typography>
      {detail ? (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Box>
  );
}
function MetricGrid({ values }: { values: Array<[string, string | number]> }) {
  return (
    <Grid>
      {values.map(([label, value]) => (
        <Result key={label} label={label} value={value} />
      ))}
    </Grid>
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
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
    >
      <Typography variant="body2">{label}</Typography>
      <Chip
        size="small"
        label={completenessLabel(status)}
        color={
          status === 'complete'
            ? 'success'
            : status === 'incomplete'
              ? 'warning'
              : 'default'
        }
      />
      {detail ? (
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Stack>
  );
}
/** Keeps contracted conversion types visible without changing backend totals. */
function conversionTypeLabel(type: string): string {
  if (type === 'ftd') return 'FTD';
  const words = type.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
function completenessLabel(status: EmailAnalyticsCompleteness) {
  return status === 'complete'
    ? 'Complete'
    : status === 'incomplete'
      ? 'Incomplete data'
      : 'No applicable data';
}
function cohortLabel(value: string | null) {
  return value === 'exposed'
    ? 'Email group'
    : value === 'control'
      ? 'Control group'
      : 'Unassigned';
}
function reasonLabel(value: string | null) {
  const labels: Record<string, string> = {
    hard_bounce_rate: 'Elevated hard-bounce rate',
    complaint_rate: 'Elevated complaint rate',
    unsubscribe_rate: 'Elevated unsubscribe rate',
    delivery_rate: 'Low delivery rate',
    matured_delivery_rate: 'Low matured delivery rate',
    predecessor_late_incident:
      'A previous version has an unresolved critical incident',
  };
  return value
    ? labels[value] || value.replace(/_/g, ' ')
    : 'Critical delivery threshold';
}
function formatRate(value: number | null): string {
  return value === null
    ? 'No eligible data'
    : `${(value * 100).toLocaleString('en-US', { maximumFractionDigits: 4 })}%`;
}
function formatMoney(value: number | null): string {
  return value === null
    ? 'Revenue unavailable'
    : value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 4,
      });
}
function formatDate(value: string): string {
  return (
    new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(value)) + ' UTC'
  );
}
