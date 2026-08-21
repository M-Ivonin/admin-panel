import {
  buildSupportAuditJson,
  downloadSupportAuditJson,
} from '@/components/support/audit-export';
import type { SupportTicketAuditEvent } from '@/lib/api/support';

const audit: SupportTicketAuditEvent[] = [
  {
    id: 'event-1',
    event_type: 'delivery_materialized',
    actor_type: 'system',
    actor_id: null,
    previous_status: null,
    new_status: 'pending',
    data: {
      channel: 'slack',
      payload: { text: 'Complete backend audit payload' },
    },
    created_at: '2026-08-19T08:01:00.000Z',
  },
];

it('exports the complete backend audit timeline without filtering event data', () => {
  expect(JSON.parse(buildSupportAuditJson(audit))).toEqual(audit);
});

it('downloads audit JSON with the support ticket number in the filename', () => {
  const createObjectURL = jest.fn(() => 'blob:support-audit');
  const revokeObjectURL = jest.fn();
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: createObjectURL },
    revokeObjectURL: { configurable: true, value: revokeObjectURL },
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
  const originalCreateElement = document.createElement.bind(document);
  const createElement = jest
    .spyOn(document, 'createElement')
    .mockImplementation((tagName) => originalCreateElement(tagName));

  downloadSupportAuditJson('SB-AB12CD', audit);

  const link = createElement.mock.results
    .map((result) => result.value)
    .find(
      (element) => element instanceof HTMLAnchorElement
    ) as HTMLAnchorElement;
  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(link.download).toBe(
    'support-ticket_SB-AB12CD_audit-timeline.json'
  );
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:support-audit');

  createElement.mockRestore();
});
