# Email Marketing Admin

The Email Marketing page is an authenticated operator surface for creating and
running manual SirBro email publications. It executes the backend contract; it
does not decide whether a publication or recipient is eligible for delivery.

## Ownership and boundaries

- The admin page owns draft input, localized preview selection, explicit
  operator commands, and conversion of a scheduled local date and time to UTC.
- The repository contract under `modules/email-marketing` owns authenticated
  calls to `/campaigns/admin/email-publications` and preserves backend errors.
- The backend owns approval, recipient eligibility, legal/display projections,
  lifecycle state, counters, and delivery outcomes. The page renders those
  returned values and does not infer replacements for them.
- Partner compliance data is a read-only backend projection. Missing or
  ineligible configuration remains a backend approval concern.
- Prediction choices contain only future predictions with Complete Full
  Analysis. Approval freezes the prediction projection, Full Analysis CTA, and
  SendGrid Dynamic Template; the admin does not compose provider template data.

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
