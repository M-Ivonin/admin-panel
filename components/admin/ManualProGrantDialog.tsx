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

const date = (value: string) => new Date(value).toLocaleString();
function errorMessage(error: unknown) {
  if (!(error instanceof ManualGrantError))
    return 'Ответ не получен. Проверьте результат или повторите с теми же параметрами.';
  if (error.code === 'MANUAL_GRANT_PASSWORD_INVALID')
    return 'Неверный пароль подтверждения.';
  if (error.code === 'MANUAL_GRANT_DISABLED')
    return 'Ручная выдача отключена: пароль не настроен на сервере.';
  if (error.status === 429)
    return `Слишком много попыток. Повторите через ${error.retryAfterSeconds ?? 900} сек.`;
  if (error.status === 409)
    return 'Выдача уже существует или параметры операции изменились. История обновлена.';
  if (error.status === 403) return 'Нет прав администратора.';
  return `Не удалось выполнить запрос (${error.status}).`;
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
          `Выдача подтверждена. Окончание: ${date(result.operation.expiresAt)}`
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
          ? 'Ручная выдача отозвана.'
          : `Pro выдан до ${date(result.grant.expiresAt)}.`
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
        Ручная выдача Pro {data ? `· ${data.environment}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography>{user?.email ?? 'Без email'}</Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              ID: {user?.id}
            </Typography>
          </Box>
          {data && (
            <Typography>
              Текущий доступ:{' '}
              {data.access.authorization === 'FULL_ACCESS' ? 'Pro' : 'Free'}
            </Typography>
          )}
          {paid && (
            <Alert severity="warning">
              У пользователя есть оплаченный доступ. Ручная выдача не отменяет
              покупку и списания; её срок начинается сразу.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {pending && (
            <Alert severity="warning">
              Результат выдачи ещё не подтверждён. Проверьте результат или
              повторите ту же выдачу с паролем.
            </Alert>
          )}
          {data?.activeGrant && (
            <Alert severity="info">
              Ручной Pro до {date(data.activeGrant.expiresAt)}. Для новой выдачи
              сначала отзовите текущую.
            </Alert>
          )}
          {revoke && (
            <Alert severity="warning">
              Отзыв выдачи до {date(revoke.expiresAt)}. Покупки магазина
              сохраняются.
            </Alert>
          )}
          {!revoke && (
            <TextField
              select
              label="Срок"
              value={productKey}
              onChange={(e) =>
                setProductKey(
                  e.target.value as ManualGrantRequest['productKey']
                )
              }
              disabled={busy || !!pending || !!data?.activeGrant}
            >
              <MenuItem value="PRO_MONTHLY">1 месяц</MenuItem>
              <MenuItem value="PRO_ANNUAL">1 год</MenuItem>
            </TextField>
          )}
          {!revoke && (
            <Typography variant="body2">
              С момента выдачи, без автоматического продления.
            </Typography>
          )}
          <TextField
            label={revoke ? 'Причина отзыва' : 'Причина'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 500 }}
            disabled={busy || !!pending}
          />
          <TextField
            label="Пароль подтверждения"
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
              ? 'Подтвердить отзыв'
              : pending
                ? 'Повторить выдачу'
                : 'Выдать Pro'}
          </Button>
          {revoke && (
            <Button
              onClick={() => {
                setRevoke(null);
                setReason('');
                setPassword('');
              }}
            >
              Отменить отзыв
            </Button>
          )}
          <Typography variant="subtitle1">История ручных выдач</Typography>
          {data?.history.length === 0 && (
            <Typography color="text.secondary">Выдач пока нет.</Typography>
          )}
          {data?.history.map((grant) => (
            <Box
              key={grant.id}
              sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}
            >
              <Typography>
                {grant.productKey === 'PRO_MONTHLY' ? '1 месяц' : '1 год'} ·{' '}
                {grant.revokedAt
                  ? 'Отозвана'
                  : new Date(grant.expiresAt).getTime() <= Date.now()
                    ? 'Истекла'
                    : 'Действует'}
              </Typography>
              <Typography variant="body2">
                {date(grant.startsAt)} — {date(grant.expiresAt)}
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                Выдал: {grant.createdBy} · {date(grant.createdAt)}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>
                {grant.reason}
              </Typography>
              {grant.revokedAt && (
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  Отозвал: {grant.revokedBy} · {date(grant.revokedAt)} ·{' '}
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
                    Отозвать
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
                Назад
              </Button>
              <Typography>Страница {data.page}</Typography>
              <Button
                disabled={busy || data.page * data.pageSize >= data.total}
                onClick={() => refresh(data.page + 1)}
              >
                Далее
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={() => refresh()}>
          Проверить результат
        </Button>
        <Button onClick={close}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
