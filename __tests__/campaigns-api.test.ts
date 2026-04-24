import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import {
  archiveCampaign,
  createCampaignDraft,
  deleteCampaignTemplate,
  estimateCampaignAudience,
  getCampaignDraft,
  getCampaignEditorCatalog,
  getCampaignsOverview,
  saveCampaignSegment,
  saveCampaignTemplate,
  scheduleCampaign,
  sendCampaignTest,
  updateCampaignTemplate,
  updateCampaignDraft,
} from '@/lib/api/campaigns';
import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('campaigns API helpers', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  it('serializes overview filters into the expected admin path', async () => {
    await getCampaignsOverview({
      page: 2,
      limit: 20,
      search: 'onboarding',
      statuses: ['active', 'paused'],
      triggerTypes: ['state_based', 'event_based'],
      quickView: 'needs_attention',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/campaigns/admin/overview?page=2&limit=20&search=onboarding&quickView=needs_attention&statuses=active&statuses=paused&triggerTypes=state_based&triggerTypes=event_based',
      method: 'GET',
    });
  });

  it('serializes trigger, journey, and per-step content for create/update calls', async () => {
    const draft = createEmptyCampaignDraft();

    await createCampaignDraft({
      name: draft.name,
      goal: draft.goal,
      goalDefinition: draft.goalDefinition,
      channel: draft.channel,
      audience: draft.audience,
      trigger: draft.trigger,
      journey: draft.journey,
      content: draft.content,
    });
    await updateCampaignDraft('cmp_onboarding_not_completed', {
      name: draft.name,
      goal: draft.goal,
      goalDefinition: draft.goalDefinition,
      channel: draft.channel,
      audience: draft.audience,
      trigger: draft.trigger,
      journey: draft.journey,
      content: draft.content,
    });

    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, {
      path: '/campaigns/admin',
      method: 'POST',
      body: JSON.stringify({
        name: draft.name,
        goal: draft.goal,
        goalDefinition: draft.goalDefinition,
        channel: draft.channel,
        audience: draft.audience,
        trigger: draft.trigger,
        journey: draft.journey,
        content: draft.content,
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(2, {
      path: '/campaigns/admin/cmp_onboarding_not_completed',
      method: 'PUT',
      body: JSON.stringify({
        name: draft.name,
        goal: draft.goal,
        goalDefinition: draft.goalDefinition,
        channel: draft.channel,
        audience: draft.audience,
        trigger: draft.trigger,
        journey: draft.journey,
        content: draft.content,
      }),
    });
  });

  it('calls the expected paths and methods for catalog, draft, and action helpers', async () => {
    const draft = createEmptyCampaignDraft();

    await getCampaignEditorCatalog();
    await getCampaignDraft('cmp_onboarding_not_completed');
    await estimateCampaignAudience({ audience: draft.audience });
    await saveCampaignSegment({
      name: 'Saved from test',
      audience: draft.audience,
    });
    await saveCampaignTemplate({
      name: 'Template from test',
      description: 'Reusable scenario',
      definition: {
        name: draft.name,
        goal: draft.goal,
        goalDefinition: draft.goalDefinition,
        channel: draft.channel,
        audience: draft.audience,
        trigger: draft.trigger,
        journey: draft.journey,
        content: draft.content,
      },
    });
    await updateCampaignTemplate('tpl_onboarding_recovery', {
      name: 'Updated template',
      description: 'Edited in admin',
      definition: {
        name: draft.name,
        goal: draft.goal,
        goalDefinition: draft.goalDefinition,
        channel: draft.channel,
        audience: draft.audience,
        trigger: draft.trigger,
        journey: draft.journey,
        content: draft.content,
      },
    });
    await deleteCampaignTemplate('tpl_saved_1');
    await sendCampaignTest('cmp_onboarding_not_completed', {
      recipients: ['spec@local.test'],
      locale: 'en',
    });
    await scheduleCampaign('cmp_onboarding_not_completed', { confirm: true });
    await archiveCampaign('cmp_onboarding_not_completed', { confirm: true });

    expect(adminAuthFetch).toHaveBeenNthCalledWith(1, {
      path: '/campaigns/admin/catalog',
      method: 'GET',
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(2, {
      path: '/campaigns/admin/cmp_onboarding_not_completed',
      method: 'GET',
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(3, {
      path: '/campaigns/admin/estimate-audience',
      method: 'POST',
      body: JSON.stringify({ audience: draft.audience }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(4, {
      path: '/campaigns/admin/segments',
      method: 'POST',
      body: JSON.stringify({
        name: 'Saved from test',
        audience: draft.audience,
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(5, {
      path: '/campaigns/admin/templates',
      method: 'POST',
      body: JSON.stringify({
        name: 'Template from test',
        description: 'Reusable scenario',
        definition: {
          name: draft.name,
          goal: draft.goal,
          goalDefinition: draft.goalDefinition,
          channel: draft.channel,
          audience: draft.audience,
          trigger: draft.trigger,
          journey: draft.journey,
          content: draft.content,
        },
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(6, {
      path: '/campaigns/admin/templates/tpl_onboarding_recovery',
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated template',
        description: 'Edited in admin',
        definition: {
          name: draft.name,
          goal: draft.goal,
          goalDefinition: draft.goalDefinition,
          channel: draft.channel,
          audience: draft.audience,
          trigger: draft.trigger,
          journey: draft.journey,
          content: draft.content,
        },
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(7, {
      path: '/campaigns/admin/templates/tpl_saved_1',
      method: 'DELETE',
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(8, {
      path: '/campaigns/admin/cmp_onboarding_not_completed/send-test',
      method: 'POST',
      body: JSON.stringify({
        recipients: ['spec@local.test'],
        locale: 'en',
      }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(9, {
      path: '/campaigns/admin/cmp_onboarding_not_completed/schedule',
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
    expect(adminAuthFetch).toHaveBeenNthCalledWith(10, {
      path: '/campaigns/admin/cmp_onboarding_not_completed/archive',
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
  });

  it('surfaces backend validation messages for draft save failures', async () => {
    const draft = createEmptyCampaignDraft();

    (adminAuthFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: jest.fn().mockResolvedValue({
        statusCode: 400,
        message:
          'All step locales must map to the same supported campaign goal',
        error: 'Bad Request',
      }),
    });

    await expect(
      createCampaignDraft({
        name: draft.name,
        goal: draft.goal,
        goalDefinition: draft.goalDefinition,
        channel: draft.channel,
        audience: draft.audience,
        trigger: draft.trigger,
        journey: draft.journey,
        content: draft.content,
      })
    ).rejects.toThrow(
      'All step locales must map to the same supported campaign goal'
    );
  });
});
