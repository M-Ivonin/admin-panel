import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  EmailMarketingDashboard,
  zonedLocalDateTimeToUtc,
} from '@/components/email-marketing/EmailMarketingDashboard';
import type {
  EmailMarketingRepository,
  EmailPublication,
  EmailPublicationAnalytics,
  EmailPublicationInput,
} from '@/modules/email-marketing/contracts';
import { RetentionStage } from '@/lib/api/users';

const basePublication: EmailPublication = {
  id: 'pub-1',
  campaignId: 'campaign-1',
  campaignName: 'Weekly product news',
  definitionVersion: 1,
  topic: 'sirbro_product_updates',
  state: 'draft',
  definition: {
    name: 'Product launch',
    topic: 'sirbro_product_updates',
    frequencyCapHours: 24,
    sendGridTemplateId: 'd-template-product',
    sendGridTemplateVersion: 'version-1',
    audience: {
      segmentSource: 'manual_rules',
      sourceSegmentId: null,
      criteria: {
        retentionStages: [RetentionStage.CURRENT],
        userIds: [],
        locales: ['en', 'es', 'pt'],
      },
      suppression: { excludeUsersWithoutPushOpens: false },
    },
    contentByLocale: {
      en: {
        subject: 'EN subject',
        preheader: 'EN preheader',
        htmlBody: '<p>EN exact</p>',
        textBody: 'EN exact',
      },
      es: {
        subject: 'ES subject',
        preheader: 'ES preheader',
        htmlBody: '<p>ES exact</p>',
        textBody: 'ES exact',
      },
      pt: {
        subject: 'PT subject',
        preheader: 'PT preheader',
        htmlBody: '<p>PT exact</p>',
        textBody: 'PT exact',
      },
    },
  },
  typeData: {
    cta: {
      labelByLocale: { en: 'Read', es: 'Leer', pt: 'Ler' },
      url: 'https://sirbro.gg/news',
    },
  },
  approvalSnapshot: null,
  schedule: null,
  counters: {
    accepted: 7,
    delivered: 5,
    bounced: 1,
    dropped: 1,
    skipped: 3,
    failed: 2,
    ambiguous: 1,
    pending: 4,
  },
  terminalReason: null,
  terminalAt: null,
  cohortAnchorAt: '2026-08-29T10:00:00.000Z',
  cohortHistoryComplete: true,
  autoPause: null,
  lateIncident: null,
  approvedAt: null,
  createdAt: '2026-08-29T10:00:00.000Z',
  updatedAt: '2026-08-29T10:00:00.000Z',
};

const analytics: EmailPublicationAnalytics = {
  dimensions: {
    campaign: 'campaign-1',
    publicationVersion: 1,
    type: 'sirbro_product_updates',
    operator: 'none',
    geo: 'unknown/global',
    league: 'Premier League',
    market: 'match_winner',
  },
  counts: {
    exposedSize: 113,
    controlSize: 17,
    accepted: 113,
    delivered: 91,
    delayed: 7,
    hardBounce: 3,
    blockReject: 2,
    complaint: 1,
    topicUnsubscribe: 4,
    globalUnsubscribe: 2,
    unsubscribe: 6,
    fullAnalysisClicks: 19,
    productClicks: 23,
    appOpens: 13,
    initialSubscriptions: 5,
    partnerLandingViews: 29,
    partnerContinues: 11,
    affiliateConversions: 8,
  },
  slices: [
    {
      campaign: 'campaign-1',
      publicationVersion: 1,
      type: 'sirbro_product_updates',
      operator: 'none',
      geo: 'unknown/global',
      locale: 'en',
      cohort: 'exposed',
      league: 'Premier League',
      market: 'match_winner',
      counts: { accepted: 47, delivered: 31, complaints: 1, unsubscribes: 2 },
      rates: { delivery: 0.4321, complaint: 0.0123, unsubscribe: 0.0234 },
    },
  ],
  rates: {
    delivery: 0.7654,
    revenuePerDeliveredEmail: 1.2345,
    revenuePerEligibleConfirmedPartnerSubscriber: 0,
  },
  denominators: {
    delivered: 91,
    providerAccepted: 113,
    eligibleConfirmedAudience: 130,
  },
  attributionCompleteness: {
    numerator: 89,
    denominator: 101,
    status: 'incomplete',
  },
  affiliateRevenue: { usd: null, completeness: 'incomplete' },
  tracedAttribution: {
    completeness: 'complete',
    available: true,
    eligibleDeliveries: 41,
    tracedDeliveries: 41,
    metrics: {
      fullAnalysisClicks: 19,
      productClicks: 23,
      appOpens: 13,
      initialSubscriptions: 5,
    },
  },
  retention: {
    anchorAt: '2026-08-29T10:00:00.000Z',
    d7: {
      maturity: 'mature',
      completeness: 'complete',
      exposed: { size: 113, denominator: 113, active: 37, rate: 0.321 },
      control: { size: 17, denominator: 17, active: 4, rate: 0 },
    },
    d30: {
      maturity: 'immature',
      completeness: 'N/A',
      exposed: { size: 113, denominator: 0, active: 0, rate: null },
      control: { size: 17, denominator: 0, active: 0, rate: null },
    },
    byLocale: [
      {
        locale: 'en',
        cohort: 'exposed',
        size: 47,
        d7: { denominator: 43, active: 17 },
        d30: { denominator: 0, active: 0 },
      },
    ],
  },
  sponsoredComparator: { status: 'N/A', label: 'observational' },
  health: {
    status: 'warning',
    reasons: ['delivery_rate'],
    rates: {
      complaint: 0.0043,
      hardBounce: 0.0265,
      unsubscribe: 0.0659,
      delivery: 0.7654,
      maturedDelivery: null,
    },
    denominators: {
      complaint: 91,
      hardBounce: 113,
      unsubscribe: 91,
      delivery: 113,
      maturedDelivery: 0,
    },
  },
};

describe('Email Marketing schedule conversion', () => {
  it('rejects a local time that does not exist during a DST gap', () => {
    expect(() =>
      zonedLocalDateTimeToUtc('2026-03-29T02:30', 'Europe/Paris')
    ).toThrow(
      'The selected local time does not exist in the requested timezone.'
    );
  });
});

function repository(): jest.Mocked<EmailMarketingRepository> {
  return {
    list: jest.fn().mockResolvedValue([basePublication]),
    get: jest.fn().mockResolvedValue(basePublication),
    getAnalytics: jest.fn().mockResolvedValue(analytics),
    getAnalyticsExport: jest.fn().mockResolvedValue(analytics),
    create: jest.fn().mockResolvedValue(basePublication),
    edit: jest.fn().mockResolvedValue(basePublication),
    preview: jest.fn().mockResolvedValue({
      locale: 'es',
      subject: 'Exact ES',
      preheader: 'Exact preheader',
      html: '<p>Canonical HTML</p>',
      text: 'Canonical text',
    }),
    approve: jest
      .fn()
      .mockResolvedValue({ ...basePublication, state: 'approved' }),
    sendNow: jest
      .fn()
      .mockResolvedValue({ ...basePublication, state: 'scheduled' }),
    schedule: jest
      .fn()
      .mockResolvedValue({ ...basePublication, state: 'scheduled' }),
    pause: jest.fn().mockResolvedValue({ ...basePublication, state: 'paused' }),
    resume: jest
      .fn()
      .mockResolvedValue({ ...basePublication, state: 'sending' }),
    cancel: jest
      .fn()
      .mockResolvedValue({ ...basePublication, state: 'cancelled' }),
    acknowledgeIncident: jest.fn().mockResolvedValue({ acknowledged: true }),
    estimateAudience: jest.fn().mockResolvedValue({
      reachableUsers: 42,
      warnings: ['Backend estimate only'],
    }),
    listPredictionReferences: jest.fn().mockResolvedValue([
      {
        id: 'prediction-1',
        analysisVersion: 4,
        predictionStatus: 'published',
        teamsNames: 'A - B',
        fixtureTime: '2026-09-06T18:30:00.000Z',
      },
    ]),
    listPartnerMarketConfigs: jest.fn().mockResolvedValue([
      {
        id: 'partner-1',
        operatorDisplayName: 'Bet One',
        operatorLogoUrl: 'https://cdn.example/logo.png',
        affiliateDisclosureByLocale: {
          en: 'EN disclosure',
          es: 'ES disclosure',
          pt: 'PT disclosure',
        },
        minimumAge: 18,
        requiredWarningText: '18+',
        responsibleGamblingUrl: 'https://bet.example/responsible',
        countryCode: 'FR',
        regionCode: null,
        status: 'approved',
        killSwitchEnabled: false,
      },
    ]),
    listAudienceSources: jest.fn().mockResolvedValue([]),
    listSendGridTemplates: jest.fn().mockResolvedValue([
      {
        id: 'd-template-product',
        name: 'Product updates',
        compatibleTopics: [
          'sirbro_predictions',
          'sirbro_predictions_with_partner_offer',
          'sirbro_product_updates',
          'betting_partner_offers',
        ],
        versions: [
          {
            id: 'version-1',
            name: 'Version one',
            active: true,
            updatedAt: '2026-08-01 00:00:00',
          },
          {
            id: 'version-2',
            name: 'Version two',
            active: false,
            updatedAt: '2026-07-01 00:00:00',
          },
        ],
      },
    ]),
  };
}

describe('EmailMarketingDashboard workflow', () => {
  it('opens an overview and requires an explicit action to edit saved content', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });
    expect(
      within(dialog).getByText(/Campaign: Weekly product news/)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('tab', { name: 'Overview' })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(dialog).queryByLabelText('Publication name')
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('tab', { name: 'Content & audience' })
    );
    expect(within(dialog).getByText('EN exact')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Edit draft' }));
    expect(within(dialog).getByLabelText(/^Publication name/)).toHaveValue(
      'Product launch'
    );
  });

  it('explains unavailable analytics after a successful save', async () => {
    const repo = repository();
    repo.getAnalytics
      .mockResolvedValueOnce(analytics)
      .mockRejectedValueOnce(new Error('Metrics offline'));
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    await editSavedContent();
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));
    await screen.findByText('Publication draft saved successfully.');
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(
      screen.getByText('Analytics unavailable: Metrics offline')
    ).toBeInTheDocument();
  });

  it('distinguishes incomplete historical retention from a pending observation window', async () => {
    const repo = repository();
    repo.getAnalytics.mockResolvedValue({
      ...analytics,
      retention: {
        ...analytics.retention,
        d7: {
          ...analytics.retention.d7,
          maturity: 'N/A',
          completeness: 'incomplete',
        },
      },
    });
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Analytics' }));
    const table = screen.getByRole('table', { name: 'Audience retention' });
    expect(
      within(table).getByText('Incomplete cohort history')
    ).toBeInTheDocument();
    expect(within(table).getAllByText('Unavailable')).toHaveLength(2);
    expect(within(table).getAllByText('Not ready')).toHaveLength(2);
    fireEvent.click(screen.getByText('Retention by language'));
    expect(
      within(
        screen.getByRole('table', {
          name: 'Retention locale and cohort groupings',
        })
      ).getByText('Unavailable')
    ).toBeInTheDocument();
  });

  it('keeps a rejected resume visible inside its confirmation dialog', async () => {
    const repo = repository();
    repo.get.mockResolvedValue({ ...basePublication, state: 'paused' });
    repo.resume.mockRejectedValue(
      new Error('Publication health remains critical')
    );
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Resume' }));
    const confirmation = screen.getByRole('dialog', {
      name: 'Resume publication?',
    });
    fireEvent.click(
      within(confirmation).getByRole('button', { name: 'Confirm resume' })
    );
    expect(await within(confirmation).findByRole('alert')).toHaveTextContent(
      'Publication health remains critical'
    );
    expect(
      within(confirmation).getByRole('button', { name: 'Back' })
    ).toBeEnabled();
  });

  it('shows partner event stages and explains missing revenue without inventing step conversion rates', async () => {
    const repo = repository();
    repo.get.mockResolvedValue({
      ...basePublication,
      topic: 'betting_partner_offers',
    });
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Analytics' }));
    expect(
      screen.getByText('Affiliate funnel and revenue')
    ).toBeInTheDocument();
    expect(screen.getByText(/Independent stage totals/)).toBeInTheDocument();
    expect(screen.queryByText('Product engagement')).not.toBeInTheDocument();
    expect(screen.getByText(/USD revenue is unavailable/)).toBeInTheDocument();
    expect(screen.getAllByText('Revenue unavailable').length).toBeGreaterThan(
      0
    );
  });

  it('opens a content-only saved publication without inventing an editable audience', async () => {
    const repo = repository();
    const incomplete = {
      ...basePublication,
      definition: {
        contentByLocale: basePublication.definition.contentByLocale,
      },
    } as EmailPublication;
    repo.list.mockResolvedValue([incomplete]);
    repo.get.mockResolvedValue(incomplete);
    render(<EmailMarketingDashboard repository={repo} />);
    // The real saved row has no name; click its existing public card seam.
    fireEvent.click(
      await screen.findByRole('button', { name: /^Open publication / })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });
    expect(
      within(dialog).getByText('Performance and health')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/saved publication definition is incomplete/i)
    ).toBeInTheDocument();
    await openContent();
    expect(within(dialog).getByText('EN exact')).toBeInTheDocument();
    expect(
      within(dialog).queryByLabelText('Audience source')
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Save new version' })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Load preview' })
    ).not.toBeInTheDocument();
    expect(repo.edit).not.toHaveBeenCalled();
    expect(repo.approve).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(
      screen.getByRole('button', {
        name: 'Open publication Untitled publication',
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/cap N\/A/)).toBeInTheDocument();
  });

  it('keeps publication edit and create usable when analytics are unavailable', async () => {
    const repo = repository();
    repo.getAnalytics.mockRejectedValue(
      new Error('Analytics service unavailable')
    );

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );

    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });
    expect(
      within(dialog).getByText(
        'Analytics unavailable: Analytics service unavailable'
      )
    ).toBeInTheDocument();

    await editSavedContent();
    fireEvent.change(within(dialog).getByLabelText(/^Publication name/), {
      target: { value: 'Updated product launch' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save new version' })
    );
    await waitFor(() => expect(repo.edit).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    expect(
      await screen.findByRole('dialog', { name: 'Create publication' })
    ).toBeInTheDocument();
  });

  it('shows a backend healthy state without inventing an incident', async () => {
    const repo = repository();
    repo.getAnalytics.mockResolvedValue({
      ...analytics,
      health: {
        ...analytics.health,
        status: 'healthy',
        reasons: [],
      },
    });

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });

    expect(
      within(dialog).getByText('Delivery health is normal')
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/Automatically paused/)
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByText(/Late critical incident/)
    ).not.toBeInTheDocument();
  });

  it('renders backend-owned metrics and distinct maturity, health, and incident states', async () => {
    const repo = repository();
    repo.get.mockResolvedValue({
      ...basePublication,
      state: 'paused',
      autoPause: { at: '2026-09-08T10:00:00.000Z', reason: 'complaint_rate' },
      lateIncident: {
        at: '2026-09-08T11:00:00.000Z',
        reason: 'late_complaint_rate',
        acknowledgedAt: null,
        acknowledgementNote: null,
      },
    });

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });

    expect(
      within(dialog).getByText('Delivery needs attention')
    ).toBeInTheDocument();
    expect(within(dialog).getByText('76.54%')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('tab', { name: 'Analytics' }));
    fireEvent.click(
      within(dialog).getByText('Show breakdown by language and audience')
    );
    expect(within(dialog).getByText('43.21%')).toBeInTheDocument();
    expect(within(dialog).getByText('32.1%')).toBeInTheDocument();
    expect(within(dialog).getAllByText('0%').length).toBeGreaterThan(0);
    expect(
      within(dialog).getAllByText(/Awaiting observation window/).length
    ).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('Not ready').length).toBeGreaterThan(0);
    expect(
      within(dialog).getByText(/Automatically paused/)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Late critical incident/)
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/Observational comparison only/)
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/open rate/i)).not.toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(
      /raw email|date of birth|recipient handle|delivery trace|provider token/i
    );
  });

  it('requires a note, sends the typed acknowledgement, and refreshes authoritative detail and analytics', async () => {
    const repo = repository();
    const incident = {
      ...basePublication,
      lateIncident: {
        at: '2026-09-08T11:00:00.000Z',
        reason: 'late_complaint_rate',
        acknowledgedAt: null,
        acknowledgementNote: null,
      },
    };
    const acknowledged = {
      ...incident,
      lateIncident: {
        ...incident.lateIncident,
        acknowledgedAt: '2026-09-08T12:00:00.000Z',
        acknowledgementNote: 'Reviewed provider evidence.',
      },
    };
    repo.get
      .mockResolvedValueOnce(incident)
      .mockResolvedValueOnce(acknowledged);

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    const button = await screen.findByRole('button', {
      name: 'Acknowledge late incident',
    });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/^Operator acknowledgement note/), {
      target: { value: '  Reviewed provider evidence.  ' },
    });
    fireEvent.click(button);

    await waitFor(() =>
      expect(repo.acknowledgeIncident).toHaveBeenCalledWith(
        'pub-1',
        '  Reviewed provider evidence.  '
      )
    );
    await waitFor(() => expect(repo.getAnalytics).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText(/Late critical incident acknowledged/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Acknowledge late incident' })
    ).not.toBeInTheDocument();
  });

  it('keeps acknowledged detail and list authoritative when analytics refresh fails', async () => {
    const repo = repository();
    const incident = {
      ...basePublication,
      lateIncident: {
        at: '2026-09-08T11:00:00.000Z',
        reason: 'late_complaint_rate',
        acknowledgedAt: null,
        acknowledgementNote: null,
      },
    };
    const acknowledged = {
      ...incident,
      lateIncident: {
        ...incident.lateIncident,
        acknowledgedAt: '2026-09-08T12:00:00.000Z',
        acknowledgementNote: 'Reviewed provider evidence.',
      },
    };
    repo.list
      .mockResolvedValueOnce([incident])
      .mockResolvedValueOnce([acknowledged]);
    repo.get
      .mockResolvedValueOnce(incident)
      .mockResolvedValueOnce(acknowledged);
    repo.getAnalytics
      .mockResolvedValueOnce(analytics)
      .mockRejectedValueOnce(new Error('Analytics service unavailable'));

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    const acknowledgeButton = await screen.findByRole('button', {
      name: 'Acknowledge late incident',
    });
    fireEvent.change(screen.getByLabelText(/^Operator acknowledgement note/), {
      target: { value: 'Reviewed provider evidence.' },
    });
    fireEvent.click(acknowledgeButton);

    const dialog = await screen.findByRole('dialog', {
      name: 'Publication details',
    });
    expect(
      await within(dialog).findByText(/Late critical incident acknowledged/)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Analytics unavailable: Analytics service unavailable'
      )
    ).toBeInTheDocument();
    expect(repo.list).toHaveBeenCalledTimes(2);
  });

  it('shows affiliate conversion types, locale engagement and sponsored engagement from the backend', async () => {
    const repo = repository();
    repo.get.mockResolvedValue({
      ...basePublication,
      topic: 'sirbro_predictions_with_partner_offer',
    });
    const engagement = {
      completeness: 'complete' as const,
      denominator: 31,
      metrics: {
        fullAnalysisClicks: 7,
        productClicks: 0,
        appOpens: 4,
        initialSubscriptions: 2,
      },
      rates: {
        fullAnalysisClick: 0.1234,
        productClick: 0,
        appOpen: 0.08,
        initialSubscription: 0.02,
      },
    };
    repo.getAnalytics.mockResolvedValue({
      ...analytics,
      affiliateConversionsByType: {
        registration: 6,
        ftd: 3,
        deposit: 8,
        commission: 2,
        reversal: 1,
        qualified_lead: 5,
      },
      slices: [{ ...analytics.slices[0], engagement }],
      sponsoredComparator: {
        status: 'available',
        label: 'observational',
        publicationId: 'prior',
        publicationVersion: 1,
        matching: {
          league: 'League',
          market: 'Totals',
          locale: 'same_locale_slice',
          lookbackDays: 30,
        },
        slices: [
          {
            locale: 'en',
            sponsored: {
              delivered: 31,
              complaintRate: 0,
              unsubscribeRate: 0,
              engagement,
            },
            comparator: {
              delivered: 47,
              complaintRate: 0,
              unsubscribeRate: 0,
              engagement: {
                ...engagement,
                rates: { ...engagement.rates, fullAnalysisClick: 0.2345 },
              },
            },
          },
        ],
      },
    });
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Analytics' }));
    const conversions = screen.getByRole('table', {
      name: 'Affiliate conversions by type',
    });
    expect(
      within(conversions).getByRole('row', { name: 'Registration 6' })
    ).toBeInTheDocument();
    expect(
      within(conversions).getByRole('row', { name: 'FTD 3' })
    ).toBeInTheDocument();
    expect(
      within(conversions).getByRole('row', { name: 'Deposit 8' })
    ).toBeInTheDocument();
    expect(
      within(conversions).getByRole('row', { name: 'Qualified lead 5' })
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByText('Show breakdown by language and audience')
    );
    const breakdown = screen.getByRole('table', { name: 'Result breakdown' });
    expect(
      within(breakdown).getByRole('columnheader', {
        name: 'Full Analysis clicks',
      })
    ).toBeInTheDocument();
    expect(
      within(breakdown).getByRole('cell', { name: '7' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sponsored Full Analysis click rate')
    ).toBeInTheDocument();
    expect(screen.getByText('12.34%')).toBeInTheDocument();
    expect(
      screen.getByText('Non-sponsored Full Analysis click rate')
    ).toBeInTheDocument();
    expect(screen.getByText('23.45%')).toBeInTheDocument();
  });

  it('shows an unavailable conversion breakdown when historical types are incomplete', async () => {
    const repo = repository();
    repo.get.mockResolvedValue({
      ...basePublication,
      topic: 'sirbro_predictions_with_partner_offer',
    });
    repo.getAnalytics.mockResolvedValue({
      ...analytics,
      affiliateConversionsByType: null,
    });
    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Analytics' }));
    expect(
      screen.getByText('Conversion type breakdown unavailable.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('table', { name: 'Affiliate conversions by type' })
    ).not.toBeInTheDocument();
  });

  it('shows concise backend result breakdowns without deriving alternate rates', async () => {
    const repo = repository();

    render(<EmailMarketingDashboard repository={repo} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Open publication Product launch',
      })
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Analytics' }));
    fireEvent.click(
      screen.getByText('Show breakdown by language and audience')
    );
    const table = screen.getByRole('table', { name: 'Result breakdown' });

    for (const heading of [
      'Language',
      'Group',
      'Accepted',
      'Delivered',
      'Delivery rate',
    ]) {
      expect(
        within(table).getByText(heading, { selector: 'th' })
      ).toBeInTheDocument();
    }
    expect(within(table).getByText('43.21%')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retention by language'));
    const retentionTable = screen.getByRole('table', {
      name: 'Retention locale and cohort groupings',
    });
    expect(within(retentionTable).getByText('17 / 43')).toBeInTheDocument();
    expect(within(retentionTable).getByText('Not ready')).toBeInTheDocument();
  });
  it('filters SendGrid templates by publication type and clears the previous selection', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    repo.listSendGridTemplates.mockResolvedValue([
      {
        id: 'd-prediction',
        name: 'Prediction design',
        compatibleTopics: ['sirbro_predictions'],
        versions: [
          { id: 'vp', name: 'Live', active: true, updatedAt: '2026-09-01' },
        ],
      },
      {
        id: 'd-partner',
        name: 'Partner design',
        compatibleTopics: ['betting_partner_offers'],
        versions: [
          { id: 'vb', name: 'Live', active: true, updatedAt: '2026-09-01' },
        ],
      },
      {
        id: 'd-combined',
        name: 'Prediction + partner design',
        compatibleTopics: ['sirbro_predictions_with_partner_offer'],
        versions: [
          { id: 'vc', name: 'Live', active: true, updatedAt: '2026-09-01' },
        ],
      },
    ]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    selectOption('Publication type', 'SirBro prediction');
    selectOption('SendGrid template', 'Prediction design');
    expect(
      screen.getByRole('combobox', { name: /^SendGrid template$/ })
    ).toHaveTextContent('Prediction design');
    selectOption('Publication type', 'Betting partner offer');
    expect(
      screen.getByRole('combobox', { name: /^SendGrid template$/ })
    ).not.toHaveTextContent('Prediction design');
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /^SendGrid template$/ })
    );
    expect(
      screen.getByRole('option', { name: 'Partner design' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Partner design' }));
    selectOption('Publication type', 'SirBro prediction + partner offer');
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /^SendGrid template$/ })
    );
    expect(
      screen.getByRole('option', { name: 'Prediction + partner design' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Prediction design' })
    ).not.toBeInTheDocument();
  });

  it('shows one latest campaign row and switches versions inside a detail dialog', async () => {
    const repo = repository();
    const version1 = {
      ...basePublication,
      id: 'pub-1',
      definitionVersion: 1,
      state: 'superseded' as const,
    };
    const version2 = {
      ...basePublication,
      id: 'pub-2',
      definitionVersion: 2,
      definition: {
        ...basePublication.definition,
        sendGridTemplateVersion: 'version-2',
      },
    };
    repo.list.mockResolvedValue([version1, version2]);
    repo.get.mockImplementation(async (id) =>
      id === 'pub-1' ? version1 : version2
    );

    render(<EmailMarketingDashboard repository={repo} />);

    expect(await screen.findByText('Product launch')).toBeInTheDocument();
    expect(screen.getAllByText('Product launch')).toHaveLength(1);
    expect(screen.getByText(/version 2/)).toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );

    const detail = await screen.findByRole('dialog', {
      name: 'Publication details',
    });
    expect(
      within(detail).getByRole('combobox', { name: 'Publication version' })
    ).toHaveTextContent('Version 2');
    await openContent();
    expect(within(detail).getByText(/Version two/)).toBeInTheDocument();
    fireEvent.mouseDown(
      within(detail).getByRole('combobox', { name: 'Publication version' })
    );
    fireEvent.click(screen.getByRole('option', { name: /Version 1/ }));

    await waitFor(() => expect(repo.get).toHaveBeenLastCalledWith('pub-1'));
    await screen.findByText(/Historical versions are read-only/);
    await openContent();
    expect(within(detail).getByText(/Version one/)).toBeInTheDocument();
    expect(
      within(detail).getByText(
        'Historical versions are read-only. Select the latest version to edit or run lifecycle commands.'
      )
    ).toBeInTheDocument();
    expect(
      within(detail).queryByRole('button', { name: 'Save new version' })
    ).not.toBeInTheDocument();
  });

  it('offers template audiences without exposing saved segments and copies the selected frozen criteria', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    repo.listAudienceSources = jest.fn().mockResolvedValue([
      {
        id: 'template-dormant',
        name: 'Dormant users',
        description: 'Reusable template audience',
        source: 'template_segment',
        audience: {
          segmentSource: 'template_segment',
          sourceSegmentId: 'template-dormant',
          criteria: {
            retentionStages: [RetentionStage.DEAD],
            userIds: ['user-exact'],
            locales: ['en'],
          },
          suppression: { excludeUsersWithoutPushOpens: true },
        },
      },
    ]);

    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    selectOption('Audience source', 'Template segment');
    expect(
      screen.queryByRole('option', { name: 'Saved segment' })
    ).not.toBeInTheDocument();
    selectOption('Template audience', 'Dormant users');

    expect(
      screen.getByLabelText('Exact user IDs (comma-separated)')
    ).toHaveValue('user-exact');
    expect(
      screen.getByRole('checkbox', { name: RetentionStage.DEAD })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: RetentionStage.NEW })
    ).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'en' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'es' })).not.toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: RetentionStage.NEW }));

    expect(
      screen.getByRole('combobox', { name: 'Audience source' })
    ).toHaveTextContent('Manual rules');
    expect(
      screen.queryByRole('combobox', { name: 'Template audience' })
    ).not.toBeInTheDocument();
  });

  it('accepts an exact-user-only audience without a retention stage', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    fireEvent.click(screen.getByRole('checkbox', { name: RetentionStage.NEW }));
    fireEvent.change(
      screen.getByLabelText('Exact user IDs (comma-separated)'),
      {
        target: { value: 'user-exact' },
      }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    expect(repo.create.mock.calls[0][0].audience.criteria).toEqual(
      expect.objectContaining({ retentionStages: [], userIds: ['user-exact'] })
    );
  });

  it('renders backend state/counters and canonical isolated preview without approving or sending', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    expect(await screen.findByText('Product launch')).toBeInTheDocument();
    expect(screen.getByText('Provider accepted')).toBeInTheDocument();
    for (const value of ['7', '5', '1', '3', '2', '4'])
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await openContent();
    fireEvent.click(screen.getByRole('tab', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));
    const previewDialog = await screen.findByRole('dialog', {
      name: 'Email preview',
    });
    const emailPreview = within(previewDialog).getByTitle(
      'Canonical email preview'
    );
    expect(emailPreview).toHaveAttribute('sandbox', '');
    expect(emailPreview).toHaveAttribute('srcdoc', '<p>Canonical HTML</p>');
    expect(
      within(previewDialog).queryByText('Exact ES')
    ).not.toBeInTheDocument();
    expect(
      within(previewDialog).queryByText('Canonical text')
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(previewDialog).getByRole('button', { name: 'Close preview' })
    );
    expect(
      screen.queryByRole('dialog', { name: 'Email preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: 'Publication details' })
    ).toBeInTheDocument();
    expect(repo.approve).not.toHaveBeenCalled();
    expect(repo.sendNow).not.toHaveBeenCalled();
  });

  it('renders the exact backend schedule without recomputing it', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([
      {
        ...basePublication,
        state: 'scheduled',
        schedule: {
          scheduledAtUtc: '2026-09-01T08:00:00.000Z',
          timezone: 'Europe/Paris',
        },
      },
    ]);
    render(<EmailMarketingDashboard repository={repo} />);
    expect(
      await screen.findByText(
        'Scheduled: 2026-09-01T08:00:00.000Z · Europe/Paris'
      )
    ).toBeInTheDocument();
  });

  it('labels raw sent state as Provider accepted in cards and detail without merging delivery counters', async () => {
    const repo = repository();
    const providerAccepted = { ...basePublication, state: 'sent' as const };
    repo.list.mockResolvedValue([providerAccepted]);
    repo.get.mockResolvedValue(providerAccepted);
    render(<EmailMarketingDashboard repository={repo} />);

    expect(await screen.findByText('Product launch')).toBeInTheDocument();
    expect(screen.getAllByText('Provider accepted')).toHaveLength(2);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('sent')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    expect(
      within(
        await screen.findByRole('dialog', { name: 'Publication details' })
      ).getAllByText('Provider accepted')[0]
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Publication detail · sent')
    ).not.toBeInTheDocument();
  });

  it('clears incompatible fields, submits exact locales, and reuses one create key after failure', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    repo.create
      .mockRejectedValueOnce(new Error('Transport failed'))
      .mockResolvedValueOnce(basePublication);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    selectOption('Publication type', 'Betting partner offer');
    expect(
      screen.getByLabelText(/^Partner market configuration/)
    ).toBeInTheDocument();
    selectOption('Publication type', 'SirBro prediction');
    selectOption('SendGrid template', 'Product updates');
    selectOption(
      'Eligible prediction and version',
      'A - B · 06 Sep 2026, 18:30 UTC · analysis v4'
    );
    expect(
      screen.queryByLabelText(/^Partner market configuration/)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Only future predictions with Complete Full Analysis/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Transport failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalledTimes(2));
    const first = repo.create.mock.calls[0];
    const second = repo.create.mock.calls[1];
    expect(first[1]).toBe(second[1]);
    expect(first[0]).toEqual(
      expect.objectContaining({
        topic: 'sirbro_predictions',
        prediction: { predictionId: 'prediction-1', analysisVersion: 4 },
      })
    );
    expect(first[0]).not.toHaveProperty('productUpdate');
    expect(first[0]).not.toHaveProperty('partnerOffer');
    expect(
      Object.keys((first[0] as EmailPublicationInput).contentByLocale)
    ).toEqual(['en', 'es', 'pt']);
  }, 10_000);

  it('lets an operator disable the 1000-email minimum for an individual publication', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await waitFor(() => expect(repo.get).toHaveBeenCalled());
    await editSavedContent();
    const toggle = await screen.findByRole('switch', {
      name: 'Require at least 1,000 emails before health thresholds apply',
    });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));
    await waitFor(() =>
      expect(repo.edit).toHaveBeenCalledWith(
        'pub-1',
        expect.objectContaining({
          requireMinimumHealthSample: false,
        })
      )
    );
  });

  it('edits with the current definition version and requires confirmations for lifecycle commands', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await waitFor(() => expect(repo.get).toHaveBeenCalled());
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fireEvent.change(screen.getByLabelText(/^Publication name/), {
      target: { value: 'Product launch successor' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));
    await waitFor(() =>
      expect(repo.edit).toHaveBeenCalledWith(
        'pub-1',
        expect.objectContaining({ expectedDefinitionVersion: 1 })
      )
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Refresh detail' })
      ).toBeEnabled()
    );
    repo.get.mockResolvedValue({ ...basePublication, state: 'sending' });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh detail' }));
    await screen.findByText('sending');
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    const dialog = screen.getByRole('dialog', { name: 'Pause publication?' });
    expect(repo.pause).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Confirm pause' })
    );
    await waitFor(() => expect(repo.pause).toHaveBeenCalledWith('pub-1'));
  });

  it('shows visible success feedback after saving and approving a publication', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fireEvent.change(screen.getByLabelText(/^Publication name/), {
      target: { value: 'Product launch successor' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));

    expect(
      await screen.findByText('Publication draft saved successfully.')
    ).toBeInTheDocument();

    repo.get.mockResolvedValue({ ...basePublication, state: 'approved' });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(
      await screen.findByText('Publication approved successfully.')
    ).toBeInTheDocument();
    expect(await screen.findByText('approved')).toBeInTheDocument();
  });

  it('shows visible error feedback when saving or approving fails', async () => {
    const repo = repository();
    repo.edit.mockRejectedValueOnce(new Error('Save was rejected'));
    repo.approve.mockRejectedValueOnce(new Error('Approval was rejected'));
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fireEvent.change(screen.getByLabelText(/^Publication name/), {
      target: { value: 'Product launch successor' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));

    expect(await screen.findByText('Save was rejected')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Publication name/), {
      target: { value: 'Product launch' },
    });
    repo.edit.mockResolvedValueOnce(basePublication);
    fireEvent.click(screen.getByRole('button', { name: 'Save new version' }));
    await screen.findByText('Publication draft saved successfully.');
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(
      await screen.findByText('Approval was rejected')
    ).toBeInTheDocument();
  });

  it('submits product updates without partner/prediction fields and permits an optional CTA', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Include optional first-party CTA' })
    );
    fireEvent.change(screen.getByLabelText('CTA HTTPS URL'), {
      target: { value: 'https://sirbro.gg/product' },
    });
    for (const locale of ['en', 'es', 'pt'])
      fireEvent.change(screen.getByLabelText(`${locale} CTA label`), {
        target: { value: `${locale} CTA` },
      });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    const payload = repo.create.mock.calls[0][0];
    expect(payload.productUpdate).toEqual({
      cta: {
        url: 'https://sirbro.gg/product',
        labelByLocale: { en: 'en CTA', es: 'es CTA', pt: 'pt CTA' },
      },
    });
    expect(payload).not.toHaveProperty('prediction');
    expect(payload).not.toHaveProperty('partnerOffer');
  });

  it('submits only offer copy/location and displays partner compliance as read-only projection', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await editSavedContent();
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    selectOption('Publication type', 'Betting partner offer');
    selectOption('SendGrid template', 'Product updates');
    selectOption('Partner market configuration', 'Bet One · FR');
    expect(
      screen.getByText('Backend legal/display projection (read-only)')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/EN disclosure: EN disclosure/)
    ).toBeInTheDocument();
    for (const locale of ['en', 'es', 'pt']) {
      fireEvent.change(
        screen.getByLabelText(new RegExp(`^${locale} offer headline`)),
        { target: { value: `${locale} headline` } }
      );
      fireEvent.change(
        screen.getByLabelText(new RegExp(`^${locale} offer body`)),
        { target: { value: `${locale} body` } }
      );
      fireEvent.change(
        screen.getByLabelText(new RegExp(`^${locale} material terms`)),
        { target: { value: `${locale} terms` } }
      );
    }
    fireEvent.change(screen.getByLabelText(/^Offer expires at/), {
      target: { value: '2026-09-30T12:00' },
    });
    expect(
      screen.queryByLabelText(/^Approved offers.sirbro.gg destination/)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    const payload = repo.create.mock.calls[0][0];
    expect(payload.partnerOffer).toEqual(
      expect.objectContaining({
        partnerMarketConfigId: 'partner-1',
        countryCode: 'FR',
        regionCode: undefined,
      })
    );
    expect(payload.partnerOffer).not.toHaveProperty('destinationUrl');
    expect(payload).not.toHaveProperty('prediction');
    expect(payload).not.toHaveProperty('productUpdate');
    expect(JSON.stringify(payload)).not.toContain('operatorLogoUrl');
    expect(JSON.stringify(payload)).not.toContain(
      'affiliateDisclosureByLocale'
    );
  });

  it('shows preview errors above the open publication dialog', async () => {
    const repo = repository();
    repo.preview.mockRejectedValueOnce(new Error('Preview was rejected'));
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    await openContent();

    fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));

    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => alert.textContent?.includes('Preview was rejected'))
      ).toBe(true)
    );
  });

  it('gates send/schedule by backend approval and confirms send, resume, and cancel', async () => {
    const repo = repository();
    const approved = { ...basePublication, state: 'approved' as const };
    repo.list.mockResolvedValue([approved]);
    repo.get.mockResolvedValue(approved);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(
      screen.getByRole('button', { name: 'Open publication Product launch' })
    );
    expect(
      await screen.findByRole('button', { name: 'Send now' })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Schedule date and time'), {
      target: { value: '2026-09-01T10:00' },
    });
    fireEvent.change(screen.getByLabelText('IANA timezone'), {
      target: { value: 'Europe/Paris' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    await waitFor(() =>
      expect(repo.schedule).toHaveBeenCalledWith('pub-1', {
        scheduledAtUtc: '2026-09-01T08:00:00.000Z',
        timezone: 'Europe/Paris',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Send now' }));
    expect(repo.sendNow).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm send now' }));
    await waitFor(() => expect(repo.sendNow).toHaveBeenCalledWith('pub-1'));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Send publication now?' })
      ).not.toBeInTheDocument()
    );

    const paused = { ...basePublication, state: 'paused' as const };
    repo.get.mockResolvedValue(paused);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh detail' }));
    expect(
      await screen.findByRole('button', { name: 'Resume' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm resume' }));
    await waitFor(() => expect(repo.resume).toHaveBeenCalledWith('pub-1'));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Resume publication?' })
      ).not.toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.change(screen.getByLabelText('Cancellation reason'), {
      target: { value: 'Operator stopped it' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel' }));
    await waitFor(() =>
      expect(repo.cancel).toHaveBeenCalledWith('pub-1', 'Operator stopped it')
    );
  }, 10_000);
});

function fillCommonFields(): void {
  fireEvent.change(screen.getByLabelText(/^Publication name/), {
    target: { value: 'Prediction mail' },
  });
  selectOption('SendGrid template', 'Product updates');
  fireEvent.change(screen.getByLabelText(/^Frequency cap hours/), {
    target: { value: '24' },
  });
  for (const locale of ['en', 'es', 'pt']) {
    fireEvent.click(screen.getByRole('tab', { name: locale.toUpperCase() }));
    fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} subject`)), {
      target: { value: `${locale} subject` },
    });
    fireEvent.change(
      screen.getByLabelText(new RegExp(`^${locale} preheader`)),
      { target: { value: `${locale} preheader` } }
    );
    fireEvent.change(
      screen.getByLabelText(new RegExp(`^${locale} HTML body`)),
      { target: { value: `<p>${locale}</p>` } }
    );
    fireEvent.change(
      screen.getByLabelText(new RegExp(`^${locale} text body`)),
      { target: { value: locale } }
    );
  }
}

function selectOption(label: string, option: string): void {
  fireEvent.mouseDown(
    screen.getByRole('combobox', { name: new RegExp(`^${label}$`) })
  );
  fireEvent.click(screen.getByRole('option', { name: option }));
}

async function openContent() {
  fireEvent.click(
    await screen.findByRole('tab', { name: 'Content & audience' })
  );
}
async function editSavedContent() {
  if (screen.queryByRole('dialog', { name: 'Create publication' })) return;
  await openContent();
  fireEvent.click(
    screen.getByRole('button', { name: /^(Edit draft|Create new version)$/ })
  );
}
