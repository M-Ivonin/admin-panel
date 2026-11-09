# App partner campaigns

Open **Growth → App Partner Campaigns** to configure the SirBro Matches banner
and compact/full prediction footers. New campaigns start in draft. Select one
operator market, independent placements and platforms, a minimum age and a
minimum of two genuine foreground visits. Enter both schedule times with a
shared UTC offset. Use UTC for schedules that cross a daylight-saving change.
The backend receives UTC instants.

Matches uses the optional banner link in **Partner Markets**. Prediction
footers use the campaign's default prediction link or their placement override.
Final operator hostnames identify the allowed landing pages after redirects.
The backend validates the full route to a final hostname on activation and
revalidates at delivery. The image endpoint verifies uploaded static PNG or
JPEG files up to 5 MiB. The default banner image can have phone and tablet
overrides. Write an alternative image description and readable disclosure in
each configured banner locale. English is the fallback. The approved
jurisdiction policy supplies the warning, support and terms.

The fixture preview simulates app eligibility using loaded market policy,
platform, placement, locale, device, visits, commerce and age inputs. It
includes the current draft as a hypothetical active campaign and shows the
winner by priority and stable campaign ID. Save a new record to establish its
tie-break ID. The preview estimates decisions with synthetic inputs. Production
edge, access and redirect checks remain backend-owned. Preview actions are
disabled and do not write evidence or record commercial events.

The backend requires a fresh version for changes and pause commands. Refresh
the list before retrying a conflict. Use **Pause** for one campaign. Disable
**In-app** or pause the operator-market record to suppress subsequent delivery
across its campaigns.

The **Analytics** tab shows qualified impressions, impression-linked CTR,
unique viewer CTR, age outcomes and a click timeline with links to the existing
user portrait. Select a UTC range of up to 30 days. CSV uses the applied
filters and the same authenticated admin API. The timeline and CSV have
server-enforced row limits.
