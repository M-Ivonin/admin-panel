# Remote Diagnostics Admin

The Remote Diagnostics dashboard is available at `/dashboard/remote-diagnostics`.
Visibility is controlled by the backend `/diagnostics/admin/capabilities`
response, not by broad admin email checks in the client.

The screen supports:

- listing active policies and recent policies from `/diagnostics/admin/policies`;
- creating temporary diagnostics policies for device, user, internal QA,
  app version/build, platform, and sampled global targets;
- disabling active policies with a required reason;
- showing an optional Grafana link when
  `NEXT_PUBLIC_DIAGNOSTICS_LOKI_EXPLORE_URL` is configured.
- opening mobile logs with `log_origin="mobile"` and backend logs with
  `log_origin="backend"` so operators can filter the two sources directly in
  Loki.

Client-side validation mirrors the backend safety caps:

- trace policies expire within 60 minutes and require `canTrace`;
- sampled global policies expire within 30 minutes and require sample rate
  `<= 0.01`;
- debug device and user policies expire within 24 hours;
- all creates and disables require a non-empty reason.

The admin screen intentionally does not embed a log viewer. It only links out to
Grafana when a configured explore URL exists.
