# Admin Panel Documentation

Current behavior is authoritative in routes, modules, tests, configuration,
and lockfiles. These documents preserve durable architecture, UI contracts,
backend integration boundaries, and future public-content decisions.

## Architecture and public web

- [Architecture core](./ADMIN_PANEL_ARCHITECTURE_CORE.md)
- [Website information architecture and SEO](./SITE_STRUCTURE_AND_SEO_IA.md)
- [Public-content technical backlog](./PUBLIC_CONTENT_TECHNICAL_BACKLOG.md)
- [SirBro public homepage style reference](./FIGMA_APP_STYLE_REFERENCE.md)
- [Quiz UI style alignment](./QUIZZES_UI_STYLE_ALIGNMENT.md)

The IA is the durable navigation and indexing authority. The technical backlog
is retained because it contains unresolved public-content contracts not yet
represented by an owning GitHub issue. Move that scope to issues before
deleting the backlog.

## Admin product contracts

- [Campaigns](./CAMPAIGNS_FEATURE_OVERVIEW.md)
- [Email Marketing](./EMAIL_MARKETING_ADMIN.md)
- [Users](./ADMIN_USERS_SCREEN.md)
- [Prediction evaluations](./PREDICTION_EVALUATION_ADMIN_SCREEN.md)
- [Revenue Ledger](./REVENUE_LEDGER_ADMIN_SCREEN.md)
- [Remote diagnostics](./REMOTE_DIAGNOSTICS_ADMIN.md)

## Agent guidance

- [Execution routing](./agents/execution-routing.md)

## Retention rules

Keep documentation only for stable architecture, operator-visible contracts,
cross-repository ownership, design authority, or operational procedures that
cannot be recovered safely from code. Do not add implementation retrospectives,
generic prompts, copied file trees, completed roadmaps, or static test status.
Git history preserves deleted working documents.

Review this index when routes, public-content ownership, backend contracts, or
the design authority change.
