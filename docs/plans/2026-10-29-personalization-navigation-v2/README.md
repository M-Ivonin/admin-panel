# Personalization navigation v2 — design concepts

Generated with the built-in imagegen tool on 29 October 2026. English UI;
synthetic names, example.invalid addresses and illustrative data. These are
raster mockups, not running product screenshots or implementation proof.
During the mockup-only pass no application source, routes, APIs, database settings or deployments were changed. The later approved implementation is documented separately in [UI-EVIDENCE.md](UI-EVIDENCE.md).

## Navigation

- One sidebar item: Personalization.
- At the global level: Users / Results / Settings. Users is only the directory.
- Open portrait enters a separate user detail page. The top shared navigation
  contains one Back to Users button before User portrait.
- A persistent account identity and breadcrumb distinguish the selected user.
- Inside that user: Portrait / Saved decisions. Global tabs are absent here.
- Saved decisions is an account history, not a global journal. Its intended
  loading path is independent of portrait snapshot availability; empty/restricted
  results keep the existing backend meanings. This behavior is proposed, not
  claimed implemented by these images.

## Frames

1. [Users directory](01-users.png): list, existing search/partner filter and user actions.
2. [Separate user portrait](02-user-portrait.png): account-local Portrait tab and saved facts.
3. [Account saved decisions](03-saved-decisions.png): same detail header/identity, account-local history tab.

## Prompt brief and inspection

Tool: built-in imagegen, three individual desktop ui-mockup generations in
parallel, followed by a targeted correction of the Saved decisions image.
The earlier portrait concept supplied style context only. Final designs use
a charcoal canvas, thin card borders and violet selection accents.

Users prompt: render Personalization header with exactly Users / Results /
Settings tabs, Users selected; no Saved decisions tab and no Back to Users
self-link. Show a six-row synthetic user directory with Open portrait,
Time in app and Chat actions. Do not invent portrait filters or AI controls.

Portrait prompt: separate User portrait page, one outlined Back to Users before
its header title, account identity and breadcrumb; exactly Portrait / Saved
decisions local tabs, Portrait selected. Show existing period/snapshot/refresh
controls and supplied saved factual metrics, with missing values as Unknown.
No global Users/Results/Settings tabs inside the detail page.

Saved decisions prompt: same account identity and separate detail header, local
Saved decisions selected; latest20 read-only evaluations, refresh and frozen
replay. Retain distinction between recorded channel and proposed surface.
No live-send buttons, global journal or delivery-status join. Add a concept
note that history does not depend on a saved portrait snapshot.

Targeted correction: replace the initial history header's bare purple back link
with the portrait's outlined top-header Back to Users layout; align identity
and local tabs, restore Time in app/Chat, remove an invented proposed in-app
surface from the No action card. Keep News evidence, replay and other content.

All final images were visually inspected. Verified global/local tab separation,
selected account context, one back control, English copy, no password screen,
no invented send/model actions and no incorrect action surface on No action.
The directory is an illustrative crop of existing user data/actions; it is not
an instruction to remove existing columns or other sidebar destinations.

## Accepted implementation boundary

The owner approved this navigation and the user detail screens, with one explicit
exception: **do not redesign the Users table**. Use its latest committed version
`7a473f6b` (following compact-table commit `3bf7cfe4`), including existing columns,
filters, row actions and alignment. The directory image illustrates navigation;
its illustrative table does not supersede the committed product table.

The mockup footer explaining independent history loading is an annotation, not
application copy. The product should render actual history/empty/restricted states,
without adding a second global journal or launching new analysis.
