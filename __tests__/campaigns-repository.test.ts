import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import { campaignsRepository } from '@/modules/campaigns/repository';
import {
  pauseCampaign,
  createCampaignDraft,
  getCampaignDraft,
  getCampaignEditorCatalog,
  sendCampaignTest,
  scheduleCampaign,
  updateCampaignDraft,
} from '@/lib/api/campaigns';

jest.mock('@/lib/api/campaigns', () => ({
  createCampaignDraft: jest.fn(),
  scheduleCampaign: jest.fn(),
  updateCampaignDraft: jest.fn(),
  sendCampaignTest: jest.fn(),
  pauseCampaign: jest.fn(),
  archiveCampaign: jest.fn(),
  getCampaignsOverview: jest.fn(),
  getCampaignEditorCatalog: jest.fn(),
  getCampaignDraft: jest.fn(),
  estimateCampaignAudience: jest.fn(),
  saveCampaignSegment: jest.fn(),
  saveCampaignTemplate: jest.fn(),
  updateCampaignTemplate: jest.fn(),
  deleteCampaignTemplate: jest.fn(),
}));

const mockedCreateCampaignDraft = jest.mocked(createCampaignDraft);
const mockedScheduleCampaign = jest.mocked(scheduleCampaign);
const mockedUpdateCampaignDraft = jest.mocked(updateCampaignDraft);
const mockedSendCampaignTest = jest.mocked(sendCampaignTest);
const mockedPauseCampaign = jest.mocked(pauseCampaign);
const mockedGetCampaignDraft = jest.mocked(getCampaignDraft);
const mockedGetCampaignEditorCatalog = jest.mocked(getCampaignEditorCatalog);

describe('campaignsRepository editor adapter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('saves a new draft before scheduling it', async () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';

    const savedDraft = {
      ...draft,
      id: 'cmp_local_001',
      updatedAt: '2026-05-05T10:00:00.000Z',
    };
    const scheduledDraft = {
      ...savedDraft,
      status: 'scheduled' as const,
    };

    mockedCreateCampaignDraft.mockResolvedValue(savedDraft);
    mockedScheduleCampaign.mockResolvedValue({
      campaign: scheduledDraft,
      firstSendAt: '2026-05-05T12:00:00.000Z',
    });

    const result = await campaignsRepository.scheduleDraft(draft);

    expect(mockedCreateCampaignDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Campaign Spec Local',
        goal: 'Recover onboarding completion',
      })
    );
    expect(mockedScheduleCampaign).toHaveBeenCalledWith('cmp_local_001', {
      confirm: true,
    });
    expect(mockedCreateCampaignDraft.mock.invocationCallOrder[0]).toBeLessThan(
      mockedScheduleCampaign.mock.invocationCallOrder[0]
    );
    expect(result).toEqual({
      campaign: scheduledDraft,
      firstSendAt: '2026-05-05T12:00:00.000Z',
      persistedDraftId: 'cmp_local_001',
    });
  });

  it('updates an existing draft before sending a test', async () => {
    const draft = {
      ...createEmptyCampaignDraft(),
      id: 'cmp_existing_001',
      name: 'Campaign Spec Local',
      goal: 'Recover onboarding completion',
      updatedAt: '2026-05-05T09:00:00.000Z',
    };
    const savedDraft = {
      ...draft,
      updatedAt: '2026-05-05T10:00:00.000Z',
    };

    mockedUpdateCampaignDraft.mockResolvedValue(savedDraft);
    mockedSendCampaignTest.mockResolvedValue({
      acceptedAt: '2026-05-05T11:00:00.000Z',
      warnings: [],
    });

    const result = await campaignsRepository.sendTestDraft(draft, {
      recipients: ['admin@example.com'],
      locale: 'en',
    });

    expect(mockedUpdateCampaignDraft).toHaveBeenCalledWith(
      'cmp_existing_001',
      expect.objectContaining({
        name: 'Campaign Spec Local',
        goal: 'Recover onboarding completion',
      })
    );
    expect(mockedSendCampaignTest).toHaveBeenCalledWith('cmp_existing_001', {
      recipients: ['admin@example.com'],
      locale: 'en',
    });
    expect(mockedUpdateCampaignDraft.mock.invocationCallOrder[0]).toBeLessThan(
      mockedSendCampaignTest.mock.invocationCallOrder[0]
    );
    expect(result).toEqual({
      acceptedAt: '2026-05-05T11:00:00.000Z',
      warnings: [],
      persistedDraft: savedDraft,
    });
  });

  it('updates an existing draft before pausing it', async () => {
    const draft = {
      ...createEmptyCampaignDraft(),
      id: 'cmp_existing_001',
      name: 'Campaign Spec Local',
      goal: 'Recover onboarding completion',
      status: 'active' as const,
      updatedAt: '2026-05-05T09:00:00.000Z',
    };
    const savedDraft = {
      ...draft,
      updatedAt: '2026-05-05T10:00:00.000Z',
    };
    const pausedDraft = {
      ...savedDraft,
      status: 'paused' as const,
      updatedAt: '2026-05-05T11:00:00.000Z',
    };

    mockedUpdateCampaignDraft.mockResolvedValue(savedDraft);
    mockedPauseCampaign.mockResolvedValue({
      campaign: pausedDraft,
    });

    const result = await campaignsRepository.pauseDraft(draft);

    expect(mockedUpdateCampaignDraft).toHaveBeenCalledWith(
      'cmp_existing_001',
      expect.objectContaining({
        name: 'Campaign Spec Local',
        goal: 'Recover onboarding completion',
      })
    );
    expect(mockedPauseCampaign).toHaveBeenCalledWith('cmp_existing_001', {
      confirm: true,
    });
    expect(mockedUpdateCampaignDraft.mock.invocationCallOrder[0]).toBeLessThan(
      mockedPauseCampaign.mock.invocationCallOrder[0]
    );
    expect(result).toEqual({
      campaign: pausedDraft,
      persistedDraftId: 'cmp_existing_001',
    });
  });

  it('creates a new draft through the shared save command', async () => {
    const draft = createEmptyCampaignDraft();
    draft.name = 'Campaign Spec Local';
    draft.goal = 'Recover onboarding completion';
    draft.goalDefinition = {
      eventKey: 'rewards_wallet_opened',
      attributionMode: 'trace_required_response',
    };

    const savedDraft = {
      ...draft,
      id: 'cmp_local_001',
      updatedAt: '2026-05-05T10:00:00.000Z',
    };

    mockedCreateCampaignDraft.mockResolvedValue(savedDraft);

    const result = await campaignsRepository.saveDraft(draft);

    expect(mockedCreateCampaignDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Campaign Spec Local',
        goal: 'Recover onboarding completion',
        goalDefinition: {
          eventKey: 'rewards_wallet_opened',
          attributionMode: 'trace_required_response',
          rewardPoints: 0,
        },
      })
    );
    expect(result).toEqual({
      draft: savedDraft,
      wasCreated: true,
    });
  });

  it('loads editor data for edit mode through one query', async () => {
    const catalog = {
      savedSegments: [],
      scenarioTemplates: [],
      retentionStageOptions: [],
      tokens: [],
      deeplinkOptions: [],
      sourceEvents: [],
      goalOptions: [],
      defaults: {
        eventMaxSendsPerUser: 3,
      },
    };
    const draft = {
      ...createEmptyCampaignDraft(),
      id: 'cmp_existing_001',
      name: 'Campaign Spec Local',
    };

    mockedGetCampaignEditorCatalog.mockResolvedValue(catalog);
    mockedGetCampaignDraft.mockResolvedValue(draft);

    const result = await campaignsRepository.loadEditor({
      mode: 'edit',
      campaignId: 'cmp_existing_001',
    });

    expect(mockedGetCampaignEditorCatalog).toHaveBeenCalledTimes(1);
    expect(mockedGetCampaignDraft).toHaveBeenCalledWith('cmp_existing_001');
    expect(result).toEqual({
      catalog,
      draft,
      lastPersistedDraft: draft,
    });
  });

  it('preserves the persisted draft id when scheduling fails after save', async () => {
    const draft = {
      ...createEmptyCampaignDraft(),
      name: 'Campaign Spec Local',
      goal: 'Recover onboarding completion',
    };
    const savedDraft = {
      ...draft,
      id: 'cmp_local_001',
      updatedAt: '2026-05-05T10:00:00.000Z',
    };

    mockedCreateCampaignDraft.mockResolvedValue(savedDraft);
    mockedScheduleCampaign.mockRejectedValue(new Error('Schedule failed'));

    await expect(campaignsRepository.scheduleDraft(draft)).rejects.toMatchObject(
      {
        message: 'Schedule failed',
        persistedDraftId: 'cmp_local_001',
      }
    );
  });
});
