# App partner campaigns

Open **Growth → App Partner Campaigns** to configure the large Matches banner,
the banner on a match’s Predictions tab, and the fixed Full Analysis banner.
**Create campaign** opens the campaign builder with **Campaign setup**,
**Localized creative**, and **Fixture preview**. Use the step buttons or
**Back** and **Continue** to move through the builder. **Save draft** stores a
new draft, and **Back to campaigns** returns to the list.

In Campaign setup, select one operator market, independent placements and
platforms, a minimum age and a minimum of two genuine foreground visits.
Enter both schedule times with a shared UTC offset. Use UTC for schedules that cross a daylight-saving change.
The backend receives UTC instants.

All three placements use the same in-app affiliate link in **Partner Markets**.
Final operator hostnames identify the approved homepage hosts after redirects.
The backend verifies the terminal operator homepage on activation and
revalidates at delivery. It accepts a localized homepage if the operator root
redirects to that path. The image endpoint verifies uploaded static PNG or
JPEG files up to 5 MiB. Matches uses the built-in stadium artwork when no
image is uploaded. An optional custom image replaces only the background on
every device and needs alternative text in each configured banner locale.
When creating a campaign, the selected operator market’s saved affiliate
disclosures prefill the matching EN, ES, and PT fields. Edit the text for the
campaign if needed. A prefilled disclosure alone does not add a translation
to the campaign. English is the fallback. The approved jurisdiction policy
supplies the warning, support and terms.

The fixture preview simulates app eligibility using loaded market policy,
platform, placement, locale, device, visits, commerce and age inputs. It
includes the current draft as a hypothetical active campaign. It shows a sample
chosen by priority and stable campaign ID so the preview is repeatable. Live
delivery rotates eligible campaigns, giving higher priorities more opportunities
to show. The backend owns live edge, access and redirect checks. Preview actions
are disabled and do not write evidence or record commercial events.

The backend requires a fresh version for changes and pause commands. Refresh
the list before retrying a conflict. Use **Pause** for one campaign. Disable
**In-app** or pause the operator-market record to suppress subsequent delivery
across its campaigns.

The **Analytics** tab opens on the last 30 days (UTC). Select a campaign,
operator market, placement or platform, and enter dates for a custom range of
up to 30 days. **More filters** contains audience, visit, version and user
filters. Use **Apply filters** to update the report or **Reset filters** to
return to the default range and clear selections.

**Campaign performance** shows the applied period and filters with the main
impression, tap and CTR metrics. Expand **Metric details** for reach and tap
attribution. The click timeline links to user portraits and
shows up to 250 rows. **Export CSV** uses the applied filters, including when
edits are pending, and exports up to 5,000 rows.
