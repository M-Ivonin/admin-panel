import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  EmailMarketingDashboard,
  zonedLocalDateTimeToUtc,
} from '@/components/email-marketing/EmailMarketingDashboard';
import type { EmailMarketingRepository, EmailPublication, EmailPublicationInput } from '@/modules/email-marketing/contracts';
import { RetentionStage } from '@/lib/api/users';

const basePublication: EmailPublication = {
  id: 'pub-1', campaignId: 'campaign-1', definitionVersion: 1,
  topic: 'sirbro_product_updates', state: 'draft',
  definition: {
    name: 'Product launch', topic: 'sirbro_product_updates', frequencyCapHours: 24,
    sendGridTemplateId: 'd-template-product', sendGridTemplateVersion: 'version-1',
    audience: { segmentSource: 'manual_rules', sourceSegmentId: null, criteria: { retentionStages: [RetentionStage.CURRENT], userIds: [], locales: ['en', 'es', 'pt'] }, suppression: { excludeUsersWithoutPushOpens: false } },
    contentByLocale: {
      en: { subject: 'EN subject', preheader: 'EN preheader', htmlBody: '<p>EN exact</p>', textBody: 'EN exact' },
      es: { subject: 'ES subject', preheader: 'ES preheader', htmlBody: '<p>ES exact</p>', textBody: 'ES exact' },
      pt: { subject: 'PT subject', preheader: 'PT preheader', htmlBody: '<p>PT exact</p>', textBody: 'PT exact' },
    },
  },
  typeData: { cta: { labelByLocale: { en: 'Read', es: 'Leer', pt: 'Ler' }, url: 'https://sirbro.gg/news' } },
  approvalSnapshot: null, schedule: null,
  counters: { accepted: 7, delivered: 5, bounced: 1, dropped: 1, skipped: 3, failed: 2, ambiguous: 1, pending: 4 },
  terminalReason: null, terminalAt: null, approvedAt: null,
  createdAt: '2026-08-29T10:00:00.000Z', updatedAt: '2026-08-29T10:00:00.000Z',
};

describe('Email Marketing schedule conversion', () => {
  it('rejects a local time that does not exist during a DST gap', () => {
    expect(() => zonedLocalDateTimeToUtc('2026-03-29T02:30', 'Europe/Paris'))
      .toThrow('The selected local time does not exist in the requested timezone.');
  });
});

function repository(): jest.Mocked<EmailMarketingRepository> {
  return {
    list: jest.fn().mockResolvedValue([basePublication]), get: jest.fn().mockResolvedValue(basePublication),
    create: jest.fn().mockResolvedValue(basePublication), edit: jest.fn().mockResolvedValue(basePublication),
    preview: jest.fn().mockResolvedValue({ locale: 'es', subject: 'Exact ES', preheader: 'Exact preheader', html: '<p>Canonical HTML</p>', text: 'Canonical text' }),
    approve: jest.fn().mockResolvedValue({ ...basePublication, state: 'approved' }), sendNow: jest.fn().mockResolvedValue({ ...basePublication, state: 'scheduled' }),
    schedule: jest.fn().mockResolvedValue({ ...basePublication, state: 'scheduled' }), pause: jest.fn().mockResolvedValue({ ...basePublication, state: 'paused' }),
    resume: jest.fn().mockResolvedValue({ ...basePublication, state: 'sending' }), cancel: jest.fn().mockResolvedValue({ ...basePublication, state: 'cancelled' }),
    estimateAudience: jest.fn().mockResolvedValue({ reachableUsers: 42, warnings: ['Backend estimate only'] }),
    listPredictionReferences: jest.fn().mockResolvedValue([{ id: 'prediction-1', analysisVersion: 4, predictionStatus: 'published', teamsNames: 'A - B' }]),
    listPartnerMarketConfigs: jest.fn().mockResolvedValue([{ id: 'partner-1', operatorDisplayName: 'Bet One', operatorLogoUrl: 'https://cdn.example/logo.png', affiliateDisclosureByLocale: { en: 'EN disclosure', es: 'ES disclosure', pt: 'PT disclosure' }, minimumAge: 18, requiredWarningText: '18+', responsibleGamblingUrl: 'https://bet.example/responsible', countryCode: 'FR', regionCode: null, status: 'approved', killSwitchEnabled: false }]),
    listAudienceSources: jest.fn().mockResolvedValue([]),
    listSendGridTemplates: jest.fn().mockResolvedValue([{ id: 'd-template-product', name: 'Product updates', versions: [
      { id: 'version-1', name: 'Version one', active: true, updatedAt: '2026-08-01 00:00:00' },
      { id: 'version-2', name: 'Version two', active: false, updatedAt: '2026-07-01 00:00:00' },
    ] }]),
  };
}

describe('EmailMarketingDashboard workflow', () => {
  it('shows one latest campaign row and switches versions inside a detail dialog', async () => {
    const repo = repository();
    const version1 = { ...basePublication, id: 'pub-1', definitionVersion: 1, state: 'superseded' as const };
    const version2 = {
      ...basePublication,
      id: 'pub-2',
      definitionVersion: 2,
      definition: { ...basePublication.definition, sendGridTemplateVersion: 'version-2' },
    };
    repo.list.mockResolvedValue([version1, version2]);
    repo.get.mockImplementation(async (id) => id === 'pub-1' ? version1 : version2);

    render(<EmailMarketingDashboard repository={repo} />);

    expect(await screen.findByText('Product launch')).toBeInTheDocument();
    expect(screen.getAllByText('Product launch')).toHaveLength(1);
    expect(screen.getByText(/version 2/)).toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open publication Product launch' }));

    const detail = await screen.findByRole('dialog', { name: 'Publication details' });
    expect(within(detail).getByRole('combobox', { name: 'Publication version' })).toHaveTextContent('Version 2');
    expect(within(detail).getByRole('combobox', { name: /^SendGrid template version/ })).toHaveTextContent('Version two');
    fireEvent.mouseDown(within(detail).getByRole('combobox', { name: 'Publication version' }));
    fireEvent.click(screen.getByRole('option', { name: /Version 1/ }));

    await waitFor(() => expect(repo.get).toHaveBeenLastCalledWith('pub-1'));
    await waitFor(() => expect(within(detail).getByRole('combobox', { name: /^SendGrid template version/ })).toHaveTextContent('Version one'));
    expect(within(detail).getByText('Historical versions are read-only. Select the latest version to edit or run lifecycle commands.')).toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: 'Save successor draft' })).not.toBeInTheDocument();
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
    await screen.findByLabelText(/^Publication name/);
    selectOption('Audience source', 'Template segment');
    expect(screen.queryByRole('option', { name: 'Saved segment' })).not.toBeInTheDocument();
    selectOption('Template audience', 'Dormant users');

    expect(screen.getByLabelText('Exact user IDs (comma-separated)')).toHaveValue('user-exact');
    expect(screen.getByRole('checkbox', { name: RetentionStage.DEAD })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: RetentionStage.NEW })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'en' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'es' })).not.toBeChecked();
  });

  it('accepts an exact-user-only audience without a retention stage', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    fireEvent.click(screen.getByRole('checkbox', { name: RetentionStage.NEW }));
    fireEvent.change(screen.getByLabelText('Exact user IDs (comma-separated)'), {
      target: { value: 'user-exact' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    expect(repo.create.mock.calls[0][0].audience.criteria).toEqual(
      expect.objectContaining({ retentionStages: [], userIds: ['user-exact'] }),
    );
  });

  it('renders backend state/counters and canonical isolated preview without approving or sending', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    expect(await screen.findByText('Product launch')).toBeInTheDocument();
    expect(screen.getByText('Provider accepted')).toBeInTheDocument();
    for (const value of ['7', '5', '1', '3', '2', '4']) expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Open publication Product launch' }));
    await screen.findByLabelText('Preview locale');
    selectOption('Preview locale', 'es');
    fireEvent.click(screen.getByRole('button', { name: 'Load preview' }));
    expect(await screen.findByText('Exact ES')).toBeInTheDocument();
    expect(screen.getByTitle('Canonical email preview')).toHaveAttribute('sandbox', '');
    expect(repo.approve).not.toHaveBeenCalled();
    expect(repo.sendNow).not.toHaveBeenCalled();
  });

  it('renders the exact backend schedule without recomputing it', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([{ ...basePublication, state: 'scheduled', schedule: { scheduledAtUtc: '2026-09-01T08:00:00.000Z', timezone: 'Europe/Paris' } }]);
    render(<EmailMarketingDashboard repository={repo} />);
    expect(await screen.findByText('Scheduled: 2026-09-01T08:00:00.000Z · Europe/Paris')).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Open publication Product launch' }));
    expect(await screen.findByText('Publication detail · Provider accepted')).toBeInTheDocument();
    expect(screen.queryByText('Publication detail · sent')).not.toBeInTheDocument();
  });

  it('clears incompatible fields, submits exact locales, and reuses one create key after failure', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    repo.create.mockRejectedValueOnce(new Error('Transport failed')).mockResolvedValueOnce(basePublication);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    selectOption('Publication type', 'Betting partner offer');
    expect(screen.getByLabelText(/^Partner market configuration/)).toBeInTheDocument();
    selectOption('Publication type', 'SirBro prediction');
    expect(screen.queryByLabelText(/^Partner market configuration/)).not.toBeInTheDocument();
    expect(screen.getByText(/Full Analysis CTA is frozen by the backend/)).toBeInTheDocument();
    selectOption('Prediction and version', 'A - B · analysis v4');
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Transport failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalledTimes(2));
    const first = repo.create.mock.calls[0];
    const second = repo.create.mock.calls[1];
    expect(first[1]).toBe(second[1]);
    expect(first[0]).toEqual(expect.objectContaining({
      topic: 'sirbro_predictions', prediction: { predictionId: 'prediction-1', analysisVersion: 4 },
    }));
    expect(first[0]).not.toHaveProperty('productUpdate');
    expect(first[0]).not.toHaveProperty('partnerOffer');
    expect(Object.keys((first[0] as EmailPublicationInput).contentByLocale)).toEqual(['en', 'es', 'pt']);
  });

  it('edits with the current definition version and requires confirmations for lifecycle commands', async () => {
    const repo = repository();
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(screen.getByRole('button', { name: 'Open publication Product launch' }));
    await waitFor(() => expect(repo.get).toHaveBeenCalled());
    await screen.findByLabelText(/^Publication name/);
    fireEvent.change(screen.getByLabelText(/^Publication name/), { target: { value: 'Product launch successor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save successor draft' }));
    await waitFor(() => expect(repo.edit).toHaveBeenCalledWith('pub-1', expect.objectContaining({ expectedDefinitionVersion: 1 })));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh detail' })).toBeEnabled());
    repo.get.mockResolvedValue({ ...basePublication, state: 'sending' });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh detail' }));
    await screen.findByText('Publication detail · sending');
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    const dialog = screen.getByRole('dialog', { name: 'Pause publication?' });
    expect(repo.pause).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm pause' }));
    await waitFor(() => expect(repo.pause).toHaveBeenCalledWith('pub-1'));
  });

  it('submits product updates without partner/prediction fields and permits an optional CTA', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include optional first-party CTA' }));
    fireEvent.change(screen.getByLabelText('CTA HTTPS URL'), { target: { value: 'https://sirbro.gg/product' } });
    for (const locale of ['en', 'es', 'pt']) fireEvent.change(screen.getByLabelText(`${locale} CTA label`), { target: { value: `${locale} CTA` } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    const payload = repo.create.mock.calls[0][0];
    expect(payload.productUpdate).toEqual({ cta: { url: 'https://sirbro.gg/product', labelByLocale: { en: 'en CTA', es: 'es CTA', pt: 'pt CTA' } } });
    expect(payload).not.toHaveProperty('prediction');
    expect(payload).not.toHaveProperty('partnerOffer');
  });

  it('submits only offer copy/location and displays partner compliance as read-only projection', async () => {
    const repo = repository();
    repo.list.mockResolvedValue([]);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('No email publications found');
    fireEvent.click(screen.getByRole('button', { name: 'Create publication' }));
    await screen.findByLabelText(/^Publication name/);
    fillCommonFields();
    selectOption('Publication type', 'Betting partner offer');
    selectOption('Partner market configuration', 'Bet One · FR');
    expect(screen.getByText('Backend legal/display projection (read-only)')).toBeInTheDocument();
    expect(screen.getByText(/EN disclosure: EN disclosure/)).toBeInTheDocument();
    for (const locale of ['en', 'es', 'pt']) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} offer headline`)), { target: { value: `${locale} headline` } });
      fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} offer body`)), { target: { value: `${locale} body` } });
      fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} material terms`)), { target: { value: `${locale} terms` } });
    }
    fireEvent.change(screen.getByLabelText(/^Offer expires at/), { target: { value: '2026-09-30T12:00' } });
    fireEvent.change(screen.getByLabelText(/^Approved offers.sirbro.gg destination/), { target: { value: 'https://offers.sirbro.gg/bet-one' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(repo.create).toHaveBeenCalled());
    const payload = repo.create.mock.calls[0][0];
    expect(payload.partnerOffer).toEqual(expect.objectContaining({ partnerMarketConfigId: 'partner-1', countryCode: 'FR', regionCode: undefined, destinationUrl: 'https://offers.sirbro.gg/bet-one' }));
    expect(payload).not.toHaveProperty('prediction');
    expect(payload).not.toHaveProperty('productUpdate');
    expect(JSON.stringify(payload)).not.toContain('operatorLogoUrl');
    expect(JSON.stringify(payload)).not.toContain('affiliateDisclosureByLocale');
  });

  it('gates send/schedule by backend approval and confirms send, resume, and cancel', async () => {
    const repo = repository();
    const approved = { ...basePublication, state: 'approved' as const };
    repo.list.mockResolvedValue([approved]); repo.get.mockResolvedValue(approved);
    render(<EmailMarketingDashboard repository={repo} />);
    await screen.findByText('Product launch');
    fireEvent.click(screen.getByRole('button', { name: 'Open publication Product launch' }));
    expect(await screen.findByRole('button', { name: 'Send now' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Schedule date and time'), { target: { value: '2026-09-01T10:00' } });
    fireEvent.change(screen.getByLabelText('IANA timezone'), { target: { value: 'Europe/Paris' } });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    await waitFor(() => expect(repo.schedule).toHaveBeenCalledWith('pub-1', { scheduledAtUtc: '2026-09-01T08:00:00.000Z', timezone: 'Europe/Paris' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send now' }));
    expect(repo.sendNow).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm send now' }));
    await waitFor(() => expect(repo.sendNow).toHaveBeenCalledWith('pub-1'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Send publication now?' })).not.toBeInTheDocument());

    const paused = { ...basePublication, state: 'paused' as const };
    repo.get.mockResolvedValue(paused);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh detail' }));
    expect(await screen.findByRole('button', { name: 'Resume' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm resume' }));
    await waitFor(() => expect(repo.resume).toHaveBeenCalledWith('pub-1'));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Resume publication?' })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.change(screen.getByLabelText('Cancellation reason'), { target: { value: 'Operator stopped it' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancel' }));
    await waitFor(() => expect(repo.cancel).toHaveBeenCalledWith('pub-1', 'Operator stopped it'));
  });
});

function fillCommonFields(): void {
  fireEvent.change(screen.getByLabelText(/^Publication name/), { target: { value: 'Prediction mail' } });
  selectOption('SendGrid template', 'Product updates');
  fireEvent.change(screen.getByLabelText(/^Frequency cap hours/), { target: { value: '24' } });
  for (const locale of ['en', 'es', 'pt']) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} subject`)), { target: { value: `${locale} subject` } });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} preheader`)), { target: { value: `${locale} preheader` } });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} HTML body`)), { target: { value: `<p>${locale}</p>` } });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${locale} text body`)), { target: { value: locale } });
  }
}

function selectOption(label: string, option: string): void {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: new RegExp(`^${label}$`) }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}
