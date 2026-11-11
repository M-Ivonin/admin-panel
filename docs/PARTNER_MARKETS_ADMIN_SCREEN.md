# Partner markets admin screen

Open **Growth → Partner Markets** (`/dashboard/partner-markets`) for the two
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
Partner configuration editing also exposes the backend conversion-type
allowlist. The five core values (`registration`, `ftd`, `deposit`,
`commission`, and `reversal`) are always preserved; operators may add only
normalized, backend-valid extra values through the same configuration command.

The partner editor shows the matched jurisdiction's warning and responsible
gambling URL as read-only values. Saving copies those values into the
existing partner API fields. The optional higher partner minimum age must
exceed the market minimum. Clearing an entered override removes the extra
partner threshold. Existing stored ages at or below the market minimum are
preserved on unrelated edits.

The In-app switch shows the platforms the current jurisdiction permits
and configuration-level blockers. Campaign and app rollout checks still
apply. New countries use the same setup. Argentina, Canada, and the US require
an exact region. An existing regional rule takes precedence over the country
rule in that region. Creating or editing a configuration requires its exact jurisdiction
rule to be available. The dedicated pause action remains available separately.

In the edit dialog, **Licence and restrictions** and **Advanced settings**
start collapsed. Saving with invalid fields opens the affected sections and
focuses the first invalid field. The banner affiliate link sits directly below
the **In-app** switch. Set **Final operator hostnames** there for all campaigns
using that configuration. Each final hostname must also be approved.

The configuration editor and summary show independent **Email** and **In-app**
channel permissions. Email defaults to enabled and In-app defaults to disabled.
Disabling Email removes that configuration from affiliate email authoring.
With Email off, the editor hides the email offer URL, operator terms URL, and
EN/ES/PT email affiliate disclosures. The save leaves previously stored values
in place, so they are available when Email is enabled again. App Partner
Campaigns still require their own creative disclosure and use warning, support,
and terms from the in-app jurisdiction policy.
Pause and the kill switch apply across both channels. **In-app banner affiliate
link** is the optional HTTPS link for the Matches banner. It must use an approved
hostname. Clearing it removes that banner destination. The **Exact operator
destination URL** remains the destination for the email offer flow. When a
configuration changes while its editor is open, reload the list and reopen
the latest record before saving.

The jurisdiction tab lists and filters exact country/region rules, creates or
replaces one record through `PUT /marketing-jurisdictions/admin`, and performs
an immediate confirmed pause through
`POST /marketing-jurisdictions/admin/:id/pause`. A rule records permitted
communication types, minimum age, required warning/layout facts, regulatory
sources, legal-review dates, effective dates, and an explicit rules version.

Use **In-app partner ads** in the jurisdiction editor to configure the
policy expiry, permitted platforms, each platform's minimum age and age
assurance, and localized warning, support and terms. English is required as
the fallback. Turning off **Configure in-app partner ads** and saving clears
the policy. In-app eligibility also requires an effective approved rule and an
eligible partner configuration. The backend owns the in-app policy version.

The UI records legal and regulatory facts and restrictions. A draft never permits sending, and
an approved record does not independently authorize a campaign: backend eligibility still combines
recipient consent, age and geography, jurisdiction, partner-market configuration, campaign, offer,
and destination checks. The admin screen does not own offers, campaigns, credentials, or partner
registry data and exposes no delete or bulk-import behavior.
