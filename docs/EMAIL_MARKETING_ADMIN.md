# Email Marketing Admin

The Email Marketing page is an authenticated operator surface for creating and
running manual SirBro email publications. It executes the backend contract; it
does not decide whether a publication or recipient is eligible for delivery.

The campaign list renders one row per campaign using its latest definition
version. Clicking anywhere on a row opens a dedicated detail dialog; when history exists, a
version selector defaults to the latest version and can load an older exact
backend projection. Operators select a SendGrid Dynamic Template by name and
then one of its versions. The backend loads that catalog without exposing the
provider API key; only stable IDs are frozen in each immutable definition.

## Ownership and boundaries

- The admin page owns draft input, localized preview selection, explicit
  operator commands, and conversion of a scheduled local date and time to UTC.
- The repository contract under `modules/email-marketing` owns authenticated
  calls to `/campaigns/admin/email-publications` and preserves backend errors.
- Terminal labels preserve backend meaning: `sent` is provider acceptance,
  `completed_no_send` is a zero-submission completion, `sent_with_failures` is
  a mixed success/failure outcome, and `failed` means no accepted submission.
- The backend owns approval, recipient eligibility, legal/display projections,
  lifecycle state, counters, and delivery outcomes. The page renders those
  returned values and does not infer replacements for them.
- Partner compliance data is a read-only backend projection. Missing or
  ineligible configuration remains a backend approval concern.
- Partner publications do not accept an operator destination in this form.
  The backend owns the `offers.sirbro.gg` CTA, while the selected Partner
  Market Configuration owns the operator destination used after eligibility
  checks.
- Prediction choices contain only future predictions with Complete Full
  Analysis. Approval freezes the prediction projection, Full Analysis CTA, and
  SendGrid Dynamic Template; the admin does not compose provider template data.
- Only the active SendGrid template version can be selected for a new or
  successor publication. Inactive saved versions remain visible as history.
- The backend marks each template with compatible publication topics. The
  picker shows only templates compatible with the selected type and clears the
  current template/version when that type changes; backend validation remains
  authoritative on create, edit, approval, and send.
- Publication detail renders the backend analytics read model directly:
  delivery/reputation, traced product engagement, verified initial
  subscriptions, affiliate funnel/revenue, D7/D30 exposed/control retention,
  health, and backend grouping slices. The client only formats returned values;
  it does not derive rates, denominators, maturity, completeness, cohorts, or
  health.
- Sponsored comparison is labeled observational. Provider open rate is not a
  primary KPI.
- Aggregate analytics export strips recipient identity and trace fields as a
  defense-in-depth measure. Analytics UI and exports do not expose recipient
  drill-down data.

## Operator flow

An operator creates or edits a publication, requests the backend audience
estimate and canonical locale preview, and then requests backend approval.
Unsaved successor changes disable send and schedule controls. Once the backend
returns an approved publication, the operator can send immediately or schedule
it, and can later request pause, resume, or cancellation when the returned
state permits that command.

Scheduling requires a local calendar date and time plus an explicit IANA time
zone. The page converts that pair to `scheduledAtUtc` and sends both the UTC
instant and the unchanged time-zone identifier to the repository. It rejects
invalid zone identifiers and local times that do not exist in that zone, such
as a clock time skipped by a daylight-saving transition. The schedule shown to
the operator is the exact schedule returned by the backend.

When the backend reports an automatic pause, the detail identifies it as a
backend action. A terminal publication with an unacknowledged late critical
incident exposes one required operator-note acknowledgement command. After the
command succeeds, the page reloads both publication detail and analytics from
the backend; acknowledgement never changes any other lifecycle guard in the
client.

Implementation entry points are the protected
[route](<../app/(admin)/dashboard/email-marketing/page.tsx>), the
[operator surface](../components/email-marketing/EmailMarketingDashboard.tsx),
and the [repository contract](../modules/email-marketing/repository.ts).

## Validation

Use the page suite for operator behavior and local schedule conversion, and the
repository suite for the HTTP command mapping:

```sh
npm test -- --runInBand __tests__/email-marketing-page.test.tsx
npm test -- --runInBand __tests__/email-marketing-repository.test.ts
npm run lint
npm run typecheck
npm run build
git diff --check
```

Review this document when the admin/backend ownership boundary, publication
lifecycle, schedule payload, or validation entry points change.

## Publication details presentation

The fixed dialog header identifies the saved publication, owning campaign name,
status, and four sections: Overview, Analytics, Content & audience, and History.
Overview prioritizes delivery health and topic-relevant outcomes. Detailed rates
include their returned denominator beside the result; diagnostic counters and
language/cohort breakdowns are expandable. IDs are reserved for technical details.

Content opens read-only with EN/ES/PT tabs and the isolated canonical preview.
Editing is explicit; saving creates the existing successor draft through the
unchanged version-checked command. Historical and incomplete snapshots retain
their existing edit restrictions. Confirmation errors stay inside the command
dialog. The history section shows persisted version and lifecycle timestamps,
not an inferred audit log.

Product and partner stages use the Updated Home visual vocabulary, but remain
independent event totals. No sequential conversion percentages are calculated.
Repeat affiliate conversions remain events. Missing tracking, incomplete revenue,
zero activity, and unready retention are labelled separately. Expected retention
readiness dates follow the current backend observation window (anchor + D7/D30 +
8 days); only the returned maturity decides whether results are displayed.

Publication Details uses a viewport-relative fixed height (`100dvh - 32px`) on
all tabs. The title/tab strip and footer remain stationary; only the content
area scrolls. Incomplete historical retention is unavailable, not a pending
observation window. Failed analytics refresh after saving preserves the save
success and shows the analytics error when returning to Overview or Analytics.

The Analytics view shows affiliate event counts by conversion type (including
approved extras), product engagement in each language/audience slice, and
Full Analysis click rates, app opens and initial subscriptions on both sides
of the observational sponsored comparison. All counts and rates come from the
backend and are included in the aggregate JSON export. Missing breakdowns or
exact tracing display unavailable measurements rather than inferred zeroes.

When legacy conversion history is incomplete, `affiliateConversionsByType` is `null` and the type breakdown is unavailable; unknown historical counts are never displayed as measured zeroes.

### Minimum health sample

The content/audience editor saves `requireMinimumHealthSample` per publication
version. The switch defaults to on, including older publications without the
field. On requires 1,000 emails in each applicable denominator before warnings
or automatic pauses apply. Off applies the same percentage thresholds to any
non-empty denominator; the 60-minute delivery maturity rule is unchanged.
Editing uses the existing new-version workflow and does not alter a running
predecessor. Saved content displays the selected mode.
