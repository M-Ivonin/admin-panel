import { isAppAdLocation } from '@/modules/marketing-jurisdictions/region-requirement';
import {
  appPlatformKeys,
  appPlatforms,
} from '@/modules/marketing-jurisdictions/in-app-policy-form';
import type { MarketingJurisdiction } from '@/modules/marketing-jurisdictions/types';
import type { PartnerMarketConfigFormValues } from './types';
import {
  isApprovedAppBannerDestination,
  normalizeApprovedDestinationHosts,
} from './validation';

type ReviewPeriod = Pick<
  PartnerMarketConfigFormValues,
  | 'legalReviewedAt'
  | 'legalReviewExpiresAt'
  | 'effectiveFrom'
  | 'effectiveUntil'
>;

function reviewBlocker(row: ReviewPeriod, at: number, label: string) {
  const reviewedAt = Date.parse(row.legalReviewedAt);
  const reviewExpiry = Date.parse(row.legalReviewExpiresAt);
  if (!(reviewedAt <= at && reviewExpiry > at)) {
    return `${label} legal review is not current.`;
  }
  if (
    !(Date.parse(row.effectiveFrom) <= at) ||
    (row.effectiveUntil && !(Date.parse(row.effectiveUntil) > at))
  ) {
    return `${label} is outside its effective period.`;
  }
}

export function inAppSummary(
  market: PartnerMarketConfigFormValues,
  rule: MarketingJurisdiction,
  at: number
) {
  const policy = rule.inAppPartnerPolicy;
  const configured = appPlatformKeys.filter(
    (platform) => policy?.platforms[platform]
  );
  const jurisdictionBlocker =
    rule.status !== 'approved'
      ? `Jurisdiction rule is ${rule.status.replace(/_/g, ' ')}.`
      : (reviewBlocker(
          { ...rule, effectiveUntil: rule.effectiveUntil ?? undefined },
          at,
          'Jurisdiction rule'
        ) ??
        (!policy || !rule.inAppRulesVersion || !configured.length
          ? 'No in-app policy is configured for this jurisdiction.'
          : !(Date.parse(policy.expiresAt) > at)
            ? 'The jurisdiction in-app policy has expired.'
            : undefined));

  const marketBlocker = partnerBlocker(market, at);

  return {
    platforms: jurisdictionBlocker
      ? []
      : configured.map((platform) => appPlatforms[platform]),
    messages: [
      ...(jurisdictionBlocker ? [jurisdictionBlocker] : []),
      ...(marketBlocker ? [marketBlocker] : []),
      ...(!jurisdictionBlocker
        ? appPlatformKeys.flatMap((platform) => {
            const platformRule = policy?.platforms[platform];
            const label = appPlatforms[platform];
            if (!platformRule)
              return [`${label} is not allowed by this jurisdiction.`];
            if (platformRule.assurance !== 'self_declaration') {
              return [
                `${label} requires verified age, which in-app campaigns do not currently support.`,
              ];
            }
            return [];
          })
        : []),
    ],
  };
}

function partnerBlocker(market: PartnerMarketConfigFormValues, at: number) {
  if (!market.inAppEnabled) return 'In-app is switched off for this partner.';
  if (market.killSwitchEnabled) return 'The partner kill switch is enabled.';
  if (market.status !== 'approved')
    return `Partner configuration is ${market.status}.`;
  const review = reviewBlocker(market, at, 'Partner configuration');
  if (review) return review;
  if (!isAppAdLocation(market.countryCode, market.regionCode)) {
    return 'Select a valid country or required region.';
  }
  const link = market.inAppBannerAffiliateUrl.trim();
  if (!link) {
    return 'An in-app banner affiliate link is required.';
  }
  if (
    !isApprovedAppBannerDestination(
      link,
      normalizeApprovedDestinationHosts(market.approvedDestinationHosts)
    )
  ) {
    return 'The in-app banner affiliate link must be a valid HTTPS URL on an approved hostname, without a fragment (up to 2,048 characters).';
  }
}
