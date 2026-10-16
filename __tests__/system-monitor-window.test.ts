import {
  incidentLinkWindow,
  logWindow,
  periodWindow,
  retainedWindow,
} from '@/lib/system-monitor-window';

const now = Date.parse('2026-10-16T12:00:00.000Z');

it('looks up linked incidents across the full current retention window', () => {
  expect(incidentLinkWindow(now)).toEqual({
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  });
});

it.each(['2026-10-09T11:59:59.999Z', '2026-10-09T12:00:00.000Z'])(
  'suppresses a selected window ending at %s when it has expired',
  (to) => {
    expect(
      retainedWindow({ from: '2026-10-08T12:00:00.000Z', to }, now)
    ).toBeNull();
  }
);

it('preserves the last millisecond of a window overlapping retention', () => {
  expect(
    retainedWindow(
      {
        from: '2026-10-08T12:00:00.000Z',
        to: '2026-10-09T12:00:00.001Z',
      },
      now
    )
  ).toEqual({
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-09T12:00:00.001Z',
  });
});

it('clamps a future end to the request time', () => {
  expect(
    retainedWindow(
      {
        from: '2026-10-16T11:00:00.000Z',
        to: '2026-10-16T13:00:00.000Z',
      },
      now
    )
  ).toEqual({
    from: '2026-10-16T11:00:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  });
});

it('suppresses a wholly future window', () => {
  expect(
    retainedWindow(
      {
        from: '2026-10-16T12:00:00.000Z',
        to: '2026-10-16T13:00:00.000Z',
      },
      now
    )
  ).toBeNull();
});

it('clamps a delayed request without advancing or mutating its selection end', () => {
  const selection = {
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  };
  expect(
    retainedWindow(selection, Date.parse('2026-10-16T12:02:00.000Z'))
  ).toEqual({
    from: '2026-10-09T12:02:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  });
  expect(selection).toEqual({
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  });
});

it.each([null, { endedAt: null }])(
  'uses incident confirmation when run end is absent (%j)',
  (run) => {
    expect(
      logWindow(
        { from: '2026-10-15T12:00:00.000Z', to: '2026-10-16T11:00:00.000Z' },
        {
          run,
          incident: {
            confirmedAt: '2026-10-16T09:00:00.000Z',
            openedAt: '2026-10-16T08:00:00.000Z',
          },
        },
        now
      )
    ).toEqual({
      from: '2026-10-16T08:55:00.000Z',
      to: '2026-10-16T09:05:00.000Z',
    });
  }
);

it('uses incident opening when confirmation is absent', () => {
  expect(
    logWindow(
      { from: '2026-10-15T12:00:00.000Z', to: '2026-10-16T11:00:00.000Z' },
      { incident: { confirmedAt: null, openedAt: '2026-10-16T08:00:00.000Z' } },
      now
    )
  ).toEqual({
    from: '2026-10-16T07:55:00.000Z',
    to: '2026-10-16T08:05:00.000Z',
  });
});

it('uses the selected period when there is no run end or incident', () => {
  expect(
    logWindow(
      { from: '2026-10-08T12:00:00.000Z', to: '2026-10-16T11:00:00.000Z' },
      { run: { endedAt: null }, incident: null },
      now
    )
  ).toEqual({
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-16T11:00:00.000Z',
  });
});

it('clamps contextual logs to retention and the current time', () => {
  const range = {
    from: '2026-10-15T12:00:00.000Z',
    to: '2026-10-16T11:00:00.000Z',
  };
  expect(
    logWindow(range, { run: { endedAt: '2026-10-09T12:00:00.000Z' } }, now)
  ).toEqual({
    from: '2026-10-09T12:00:00.000Z',
    to: '2026-10-09T12:05:00.000Z',
  });
  expect(
    logWindow(range, { run: { endedAt: '2026-10-16T12:00:00.000Z' } }, now)
  ).toEqual({
    from: '2026-10-16T11:55:00.000Z',
    to: '2026-10-16T12:00:00.000Z',
  });
});

it('suppresses expired incident context even when the selected period is current', () => {
  expect(
    logWindow(
      { from: '2026-10-15T12:00:00.000Z', to: '2026-10-16T12:00:00.000Z' },
      {
        incident: {
          confirmedAt: '2026-10-09T11:55:00.000Z',
          openedAt: '2026-10-09T11:50:00.000Z',
        },
      },
      now
    )
  ).toBeNull();
});

it.each([
  [1, '2026-10-16T11:00:00.000Z'],
  [24, '2026-10-15T12:00:00.000Z'],
  [168, '2026-10-09T12:00:00.000Z'],
])(
  'constructs a %i-hour selection ending at the supplied time',
  (hours, from) => {
    expect(periodWindow(hours, now)).toEqual({
      from,
      to: '2026-10-16T12:00:00.000Z',
    });
  }
);

it('uses the run end before incident confirmation or opening for log context', () => {
  expect(
    logWindow(
      { from: '2026-10-15T12:00:00.000Z', to: '2026-10-16T11:00:00.000Z' },
      {
        run: { endedAt: '2026-10-16T10:00:00.000Z' },
        incident: {
          confirmedAt: '2026-10-16T09:00:00.000Z',
          openedAt: '2026-10-16T08:00:00.000Z',
        },
      },
      now
    )
  ).toEqual({
    from: '2026-10-16T09:55:00.000Z',
    to: '2026-10-16T10:05:00.000Z',
  });
});

it.each([
  ['2026-10-09T11:59:59.999Z', '2026-10-09T12:00:00.000Z'],
  ['2026-10-09T12:00:00.000Z', '2026-10-09T12:00:00.000Z'],
  ['2026-10-09T12:00:00.001Z', '2026-10-09T12:00:00.001Z'],
])(
  'retains a start at %s within the exact seven-day boundary',
  (from, retainedFrom) => {
    expect(
      retainedWindow({ from, to: '2026-10-15T12:00:00.000Z' }, now)
    ).toEqual({
      from: retainedFrom,
      to: '2026-10-15T12:00:00.000Z',
    });
  }
);
