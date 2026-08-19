# Support ticket operations

## Routes and access

- List and search: `/support/tickets`
- Ticket detail: `/support/tickets/:ticketId`

Both routes use the existing `ProtectedRoute` admin session. Every read and
command uses `adminAuthFetch`, so the backend receives the same Bearer JWT as
other authenticated dashboard tools. The backend additionally requires the
authenticated email to be present in `ADMIN_EMAILS`; a browser login alone does
not grant support access.

The dashboard card and backend-generated Slack ticket link both point to these
routes. Support pages remain in the `(admin)` route group and are `noindex`.

## Backend ownership

The backend `support-chat/admin` API is the only ticket authority. The admin UI
does not derive lifecycle state, deliver notifications, or use Slack as a data
source. It displays backend search/detail responses and invokes these backend
commands:

- assignment, priority, and status changes;
- resolve and reopen;
- private note and explicit user-facing reply;
- delivery reconciliation and deliberate retry of `failed` or `unknown`
  attempts.

After every command, the UI reloads ticket detail. Status, audit timestamps,
conversation entries, context, private attachment metadata, and Slack/email/push
outcomes therefore come from backend read-back. Attachment storage object keys
and delivery payload text are not displayed.

## Private note versus user reply

`Private internal note` calls `POST /support-chat/admin/tickets/:id/notes` and
is rendered with warning styling and an internal-only explanation. Backend
persists it with `visibility=private`; it may be projected to the internal Slack
thread but is never a user message.

`Reply to user` calls `POST /support-chat/admin/tickets/:id/replies` and is
rendered as a separate primary action with an explicit user-visible warning.
Only this action creates a support reply visible to the user and may produce
email/push delivery attempts. Slack thread text is never copied into this field
or sent to the user automatically.

## Validation

Run the focused contract and component checks:

```bash
npm test -- --runInBand \
  __tests__/support-api.test.ts \
  __tests__/support-routes.test.tsx \
  __tests__/support-navigation.test.tsx \
  __tests__/support-tickets-page.test.tsx \
  __tests__/support-ticket-detail.test.tsx
npm run lint
npm run typecheck
npm run build
```

For a live walkthrough, use a configured non-production backend, an existing
admin account included in that environment's `ADMIN_EMAILS`, and a disposable
support ticket. Verify search -> open -> private note -> user-facing reply ->
status change -> delivery-state read-back. Inspect backend delivery/audit rows
before retrying a delivery; a command response alone is not provider-success
proof. Do not use a production inbox, Slack channel, push target, or email
recipient without separate approval.
