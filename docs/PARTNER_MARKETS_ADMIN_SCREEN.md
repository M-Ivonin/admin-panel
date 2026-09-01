# Partner markets admin screen

`/dashboard/partner-markets` is the authenticated admin surface for the two
backend-owned registries that authorize partner marketing:

- **Jurisdiction rules** consumes `marketing_jurisdictions` through
  `/marketing-jurisdictions/admin`;
- **Partner configurations** consumes `partner_market_configs` through
  `/partner-market-configs/admin`.

They are separate tabs and remain separate records. Each registry loads and
accepts operator commands independently.

The screen lists and filters exact operator/country configurations, creates or replaces one
operator-country-region record through `PUT /partner-market-configs/admin`, and performs an
immediate confirmed pause through `POST /partner-market-configs/admin/:id/pause`.

The jurisdiction tab lists and filters exact country/region rules, creates or
replaces one record through `PUT /marketing-jurisdictions/admin`, and performs
an immediate confirmed pause through
`POST /marketing-jurisdictions/admin/:id/pause`. A rule records permitted
communication types, minimum age, required warning/layout facts, regulatory
sources, legal-review dates, effective dates, and an explicit rules version.

The UI records legal and regulatory facts and restrictions. A draft never permits sending, and
an approved record does not independently authorize a campaign: backend eligibility still combines
recipient consent, age and geography, jurisdiction, partner-market configuration, campaign, offer,
and destination checks. The admin screen does not own offers, campaigns, credentials, or partner
registry data and exposes no delete or bulk-import behavior.
