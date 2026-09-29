'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  createManualGrant,
  getManualGrants,
  ManualGrant,
  ManualGrantError,
  ManualGrantHistory,
  ManualGrantRequest,
  revokeManualGrant,
} from '@/lib/api/manual-grants';

const durationLabels = {
  PASS_24H: '24 hours',
  PASS_3D: '3 days',
  PRO_MONTHLY: '1 month',
  PRO_ANNUAL: '1 year',
};

const date = (value: string) => new Date(value).toLocaleString('en-US');
function errorMessage(error: unknown) {
  if (!(error instanceof ManualGrantError))
    return 'No response received. Check the result or retry with the same details.';
  if (error.code === 'MANUAL_GRANT_PASSWORD_INVALID')
    return 'Incorrect confirmation password.';
  if (error.code === 'MANUAL_GRANT_DISABLED')
    return 'Manual grants are disabled: the server password is not configured.';
  if (error.status === 429)
    return `Too many attempts. Retry in ${error.retryAfterSeconds ?? 900} seconds.`;
  if (error.status === 409)
    return 'A grant already exists or the request details changed. History has been refreshed.';
  if (error.status === 403) return 'Administrator access is required.';
  return `Request failed (${error.status}).`;
}

export function ManualProGrantDialog({
  user,
  onClose,
  onChanged,
}: {
  user: { id: string; email: string | null } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<ManualGrantHistory | null>(null);
  const [productKey, setProductKey] =
    useState<ManualGrantRequest['productKey']>('PRO_MONTHLY');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [revoke, setRevoke] = useState<ManualGrant | null>(null);
  const [pending, setPending] = useState<ManualGrantRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Only non-secret retry identity survives closing or changing the selected user.
  const unresolved = useRef(new Map<string, ManualGrantRequest>());
  const generation = useRef(0);

  useEffect(() => {
    const version = ++generation.current;
    setPassword('');
    setReason('');
    setRevoke(null);
    setData(null);
    setError('');
    setSuccess('');
    const attempt = user ? (unresolved.current.get(user.id) ?? null) : null;
    setPending(attempt);
    setProductKey(attempt?.productKey ?? 'PRO_MONTHLY');
    setReason(attempt?.reason ?? '');
    setBusy(!!user);
    if (user) {
      getManualGrants(user.id, 1, attempt?.operationId)
        .then((result) => {
          if (version !== generation.current) return;
          setData(result);
          if (result.operation) {
            unresolved.current.delete(user.id);
            setPending(null);
          }
        })
        .catch((e) => {
          if (version === generation.current) setError(errorMessage(e));
        })
        .finally(() => {
          if (version === generation.current) setBusy(false);
        });
    }
    return () => {
      generation.current = version + 1;
    };
  }, [user]);

  async function refresh(page = 1) {
    if (!user) return;
    const version = generation.current;
    setBusy(true);
    setPassword('');
    try {
      const result = await getManualGrants(
        user.id,
        page,
        unresolved.current.get(user.id)?.operationId
      );
      if (version !== generation.current) return;
      setData(result);
      if (result.operation) {
        unresolved.current.delete(user.id);
        setPending(null);
        setSuccess(
          `Grant confirmed. Expires: ${date(result.operation.expiresAt)}`
        );
        onChanged();
      }
    } catch (e) {
      if (version === generation.current) setError(errorMessage(e));
    } finally {
      if (version === generation.current) setBusy(false);
    }
  }

  async function submit() {
    if (!user || busy) return;
    const recipient = user.id;
    const version = generation.current;
    const attempt = pending ?? {
      operationId: crypto.randomUUID(),
      productKey,
      reason: reason.trim(),
    };
    if (!revoke) {
      unresolved.current.set(recipient, attempt);
      setPending(attempt);
    }
    setBusy(true);
    setError('');
    setSuccess('');
    const secret = password;
    setPassword('');
    try {
      const result = revoke
        ? await revokeManualGrant(recipient, revoke.id, reason.trim(), secret)
        : await createManualGrant(recipient, attempt, secret);
      if (!revoke) unresolved.current.delete(recipient);
      if (version !== generation.current) return;
      setPending(null);
      setRevoke(null);
      setReason('');
      setSuccess(
        result.grant.revokedAt
          ? 'Manual grant revoked.'
          : `Pro granted until ${date(result.grant.expiresAt)}.`
      );
      const updated = await getManualGrants(recipient);
      if (version !== generation.current) return;
      setData(updated);
      onChanged();
    } catch (e) {
      if (
        e instanceof ManualGrantError &&
        e.status >= 400 &&
        e.status < 500 &&
        !pending
      )
        unresolved.current.delete(recipient);
      if (version !== generation.current) return;
      setPending(unresolved.current.get(recipient) ?? null);
      setError(errorMessage(e));
      try {
        const result = await getManualGrants(
          recipient,
          1,
          unresolved.current.get(recipient)?.operationId
        );
        if (version !== generation.current) return;
        setData(result);
        if (result.operation) {
          unresolved.current.delete(recipient);
          setPending(null);
          onChanged();
        }
      } catch {
        /* Keep the original error and retry identity. */
      }
    } finally {
      if (version === generation.current) {
        setPassword('');
        setBusy(false);
      }
    }
  }

  const close = () => {
    setPassword('');
    onClose();
  };
  const paid =
    data?.access.authorization === 'FULL_ACCESS' &&
    (data.access.accessSource === 'legacy_grandfathered' ||
      data.access.primaryEntitlement?.entitlementId !== data.activeGrant?.id);
  return (
    <Dialog open={!!user} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        Manual Pro grant {data ? `· ${data.environment}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography>{user?.email ?? 'No email'}</Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              ID: {user?.id}
            </Typography>
          </Box>
          {data && (
            <Typography>
              Current access:{' '}
              {data.access.authorization === 'FULL_ACCESS' ? 'Pro' : 'Free'}
            </Typography>
          )}
          {paid && (
            <Alert severity="warning">
              This user has paid access. A manual grant does not cancel the
              purchase or billing; its duration starts immediately.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {pending && (
            <Alert severity="warning">
              The grant result is not yet confirmed. Check the result or retry
              the same grant with the password.
            </Alert>
          )}
          {data?.activeGrant && (
            <Alert severity="info">
              Manual Pro until {date(data.activeGrant.expiresAt)}. Revoke the
              current grant before creating another.
            </Alert>
          )}
          {revoke && (
            <Alert severity="warning">
              Revoking the grant ending {date(revoke.expiresAt)}. Store
              purchases are unaffected.
            </Alert>
          )}
          {!revoke && (
            <TextField
              select
              label="Duration"
              value={productKey}
              onChange={(e) =>
                setProductKey(
                  e.target.value as ManualGrantRequest['productKey']
                )
              }
              disabled={busy || !!pending || !!data?.activeGrant}
            >
              {Object.entries(durationLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {!revoke && (
            <Typography variant="body2">
              Starts immediately, without automatic renewal.
            </Typography>
          )}
          <TextField
            label={revoke ? 'Revocation reason' : 'Reason'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 500 }}
            disabled={busy || !!pending}
          />
          <TextField
            label="Confirmation password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            inputProps={{ maxLength: 72 }}
          />
          <Button
            variant="contained"
            onClick={submit}
            disabled={
              busy ||
              !data ||
              (!revoke && !!data.activeGrant && !pending) ||
              reason.trim().length < 3 ||
              !password
            }
          >
            {revoke
              ? 'Confirm revocation'
              : pending
                ? 'Retry grant'
                : 'Grant Pro'}
          </Button>
          {revoke && (
            <Button
              onClick={() => {
                setRevoke(null);
                setReason('');
                setPassword('');
              }}
            >
              Cancel revocation
            </Button>
          )}
          <Typography variant="subtitle1">Manual grant history</Typography>
          {data?.history.length === 0 && (
            <Typography color="text.secondary">No grants yet.</Typography>
          )}
          {data?.history.map((grant) => (
            <Box
              key={grant.id}
              sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}
            >
              <Typography>
                {durationLabels[grant.productKey]} ·{' '}
                {grant.revokedAt
                  ? 'Revoked'
                  : new Date(grant.expiresAt).getTime() <= Date.now()
                    ? 'Expired'
                    : 'Active'}
              </Typography>
              <Typography variant="body2">
                {date(grant.startsAt)} — {date(grant.expiresAt)}
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                Granted by: {grant.createdBy} · {date(grant.createdAt)}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>
                {grant.reason}
              </Typography>
              {grant.revokedAt && (
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  Revoked by: {grant.revokedBy} · {date(grant.revokedAt)} ·{' '}
                  {grant.revokeReason}
                </Typography>
              )}
              {!grant.revokedAt &&
                new Date(grant.expiresAt).getTime() > Date.now() && (
                  <Button
                    disabled={busy || !!pending}
                    onClick={() => {
                      setRevoke(grant);
                      setReason('');
                      setPassword('');
                    }}
                  >
                    Revoke
                  </Button>
                )}
            </Box>
          ))}
          {data && data.total > data.pageSize && (
            <Stack direction="row" spacing={1}>
              <Button
                disabled={busy || data.page === 1}
                onClick={() => refresh(data.page - 1)}
              >
                Previous
              </Button>
              <Typography>Page {data.page}</Typography>
              <Button
                disabled={busy || data.page * data.pageSize >= data.total}
                onClick={() => refresh(data.page + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={() => refresh()}>
          Check result
        </Button>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
