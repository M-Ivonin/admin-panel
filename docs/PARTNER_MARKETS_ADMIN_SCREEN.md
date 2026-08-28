# Partner markets admin screen

`/dashboard/partner-markets` is the authenticated admin consumer of the backend-owned
`partner_market_configs` registry.

The screen lists and filters exact operator/country configurations, creates or replaces one
operator-country-region record through `PUT /partner-market-configs/admin`, and performs an
immediate confirmed pause through `POST /partner-market-configs/admin/:id/pause`.

The UI records legal and regulatory facts and restrictions. A draft never permits sending, and
an approved record does not independently authorize a campaign: backend eligibility still combines
recipient consent, age and geography, jurisdiction, partner-market configuration, campaign, offer,
and destination checks. The admin screen does not own offers, campaigns, credentials, or partner
registry data and exposes no delete or bulk-import behavior.
