'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cn,
  IGRPAlertDialog,
  IGRPButton,
  IGRPInputText,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogDescription,
  IGRPModalDialogFooter,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  useIGRPToast,
} from '@igrp/igrp-framework-react-design-system';
import {
  createM2mKey,
  getM2mKeys,
  revokeM2mKey,
  rotateM2mKey,
} from '@/app/(myapp)/functions/m2m-keys';
import type { CreateRequest, KeySummary, UserProfileDTO } from '@irn/framework-process-studio-types';
import { PageHeader } from '@/app/(myapp)/components/PageHeader';
import { AccessDeniedPage } from '@/app/(myapp)/components/access-denied-page';
import { UserCell } from '@/app/(myapp)/components/user-cell';
import { IgrpLoading } from '@/app/(myapp)/components/igrp-loading';

const clientNamePattern = /^[a-z0-9._-]+$/;
const permissionPattern = /^[A-Z0-9_.]+:[a-z_]+$/;

type KeyStatus = 'ativa' | 'revogada' | 'expirada' | 'a expirar';
type AccessErrorStatus = 401 | 403;

const isAccessErrorStatus = (status?: number): status is AccessErrorStatus =>
  status === 401 || status === 403;

const parseApiDate = (value?: string | number): Date | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(numericValue) && String(value).trim() !== '') {
    // The M2M API returns Unix timestamps in seconds, possibly with milliseconds as a fraction.
    return new Date(Math.abs(numericValue) < 100_000_000_000 ? numericValue * 1000 : numericValue);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const keyStatus = (key: KeySummary): KeyStatus => {
  if (key.active === false) return 'revogada';
  const expiryDate = parseApiDate(key.expiresAt);
  if (expiryDate && expiryDate.getTime() <= Date.now()) return 'expirada';
  if (key.expiresAt) return 'a expirar';
  return 'ativa';
};

const formatDate = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return 'Nunca usada';

  const isoDate = typeof value === 'string'
    ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(value)
    : null;
  if (isoDate) {
    const [, year, month, day, hour, minute, second] = isoDate;
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
  }

  const date = parseApiDate(value);
  if (!date) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date);
};

const errorMessage = () => 'Não foi possível concluir o pedido. Tente novamente.';

const getAuditProfile = (key: KeySummary): UserProfileDTO | undefined =>
  key.revokedAt ? key.userProfileRevokedBy ?? key.userProfileCreatedBy : key.userProfileCreatedBy;

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const { igrpToast } = useIGRPToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [secret, setSecret] = useState<{ value: string; oldKeyExpiresAt?: string | null } | null>(null);
  const [selectedKey, setSelectedKey] = useState<KeySummary | null>(null);
  const [confirmAction, setConfirmAction] = useState<'revoke' | 'rotate' | null>(null);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [accessErrorStatus, setAccessErrorStatus] = useState<AccessErrorStatus | null>(null);

  const keysQuery = useQuery({ queryKey: ['m2m-keys'], queryFn: getM2mKeys });
  const keysResult = keysQuery.data;
  const keys = useMemo(() => (keysResult?.success ? keysResult.data : []), [keysResult]);

  const resetCreateForm = () => {
    setClientName('');
    setEmail('');
    setExpiresAt('');
    setPermissions([]);
    setPermissionInput('');
  };

  const invalidateKeys = () => queryClient.invalidateQueries({ queryKey: ['m2m-keys'] });

  const appliedKeyStatuses = useMemo(() => new Map(keys.map((key) => [key.id, keyStatus(key)])), [keys]);

  const addPermission = () => {
    const permission = permissionInput.trim();
    if (!permissionPattern.test(permission)) {
      igrpToast({ title: 'Permissão inválida', description: 'Use o formato MODULO:acao.', type: 'error' });
      return;
    }
    if (!permissions.includes(permission)) setPermissions((current) => [...current, permission]);
    setPermissionInput('');
  };

  const submitCreate = async () => {
    if (!clientNamePattern.test(clientName)) {
      igrpToast({ title: 'Nome inválido', description: 'O nome deve ser um slug com letras minúsculas, dígitos, ponto, _ ou -.', type: 'error' });
      return;
    }
    if (permissions.length === 0) {
      igrpToast({ title: 'Permissões obrigatórias', description: 'Adicione pelo menos uma permissão.', type: 'error' });
      return;
    }
    if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) {
      igrpToast({ title: 'Expiração inválida', description: 'Use uma data ISO-8601 válida.', type: 'error' });
      return;
    }

    const request: CreateRequest = {
      clientName,
      permissions,
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
    };
    setIsCreating(true);
    try {
      const result = await createM2mKey(request);
      if (!result.success) {
        if (isAccessErrorStatus(result.status)) {
          setAccessErrorStatus(result.status);
          return;
        }
        igrpToast({ title: 'Erro', description: result.error, type: 'error' });
        return;
      }
      await invalidateKeys();
      resetCreateForm();
      setCreateOpen(false);
      if (!result.data.key) {
        igrpToast({ title: 'Erro', description: 'A API não devolveu a nova chave.', type: 'error' });
        return;
      }
      setSecret({ value: result.data.key });
    } catch {
      igrpToast({ title: 'Erro', description: errorMessage(), type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async () => {
    const keyId = selectedKey?.id;
    if (!keyId) return;
    setIsRevoking(true);
    try {
      const result = await revokeM2mKey(keyId);
      if (!result.success) {
        if (isAccessErrorStatus(result.status)) {
          setAccessErrorStatus(result.status);
          return;
        }
        igrpToast({ title: 'Erro', description: result.error, type: 'error' });
        return;
      }
      await invalidateKeys();
      setConfirmAction(null);
      setSelectedKey(null);
      igrpToast({ title: 'Chave revogada', description: 'A revogação tem efeito imediato.', type: 'success' });
    } catch {
      igrpToast({ title: 'Erro', description: errorMessage(), type: 'error' });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRotate = async () => {
    const keyId = selectedKey?.id;
    if (!keyId) return;
    setIsRotating(true);
    try {
      const result = await rotateM2mKey(keyId);
      if (!result.success) {
        if (isAccessErrorStatus(result.status)) {
          setAccessErrorStatus(result.status);
          return;
        }
        igrpToast({ title: 'Erro', description: result.error, type: 'error' });
        return;
      }
      const refreshed = await queryClient.fetchQuery({ queryKey: ['m2m-keys'], queryFn: getM2mKeys });
      setConfirmAction(null);
      setSelectedKey(null);
      const oldKey = refreshed.success ? refreshed.data.find((key) => key.id === keyId) : undefined;
      if (!result.data.key) {
        igrpToast({ title: 'Erro', description: 'A API não devolveu a nova chave.', type: 'error' });
        return;
      }
      setSecret({ value: result.data.key, oldKeyExpiresAt: oldKey?.expiresAt });
    } catch {
      igrpToast({ title: 'Erro', description: errorMessage(), type: 'error' });
    } finally {
      setIsRotating(false);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.value);
      igrpToast({ title: 'Copiada', description: 'A chave foi copiada para a área de transferência.', type: 'success' });
    } catch {
      igrpToast({ title: 'Não foi possível copiar', description: 'Copie a chave manualmente.', type: 'error' });
    }
  };

  const closeSecret = () => setSecret(null);
  const isMutating = isRevoking || isRotating;
  const queryAccessErrorStatus = keysResult && !keysResult.success && isAccessErrorStatus(keysResult.status)
    ? keysResult.status
    : null;
  const deniedStatus = accessErrorStatus ?? queryAccessErrorStatus;

  if (deniedStatus) {
    return (
      <AccessDeniedPage
        status={deniedStatus}
        description={deniedStatus === 401
          ? 'A sua sessão não é válida ou expirou. Inicie sessão novamente para continuar.'
          : 'A gestão de chaves M2M está disponível apenas para superadministradores.'}
      />
    );
  }

  return (
    <div className={cn('page', 'space-y-6')}>
      <div className={cn('section', 'space-y-6')}>
        <PageHeader
          name="Chaves de acesso M2M"
          description="Credenciais para sistemas externos acederem à API sem sessão IRN."
          badgeCount={keys.length}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <IGRPButton
            name="createM2mKey"
            variant="default"
            size="default"
            showIcon
            iconName="Plus"
            onClick={() => setCreateOpen(true)}
          >
            Nova chave
          </IGRPButton>
        </div>

        <IgrpLoading loading={keysQuery.isLoading} message="A carregar chaves…" />
        {keysQuery.isError && <p className="text-sm text-destructive">{errorMessage()}</p>}
        {keysResult && !keysResult.success && (
          <p className="text-sm text-destructive">
            {keysResult.status === 404
              ? 'A API de chaves M2M ainda não está disponível no gateway de API configurado.'
              : keysResult.error}
          </p>
        )}

        {!keysQuery.isLoading && !keysQuery.isError && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium">Prefixo</th>
                  <th className="p-3 font-medium">Permissões</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3 font-medium">Criada</th>
                  <th className="p-3 font-medium">Último uso</th>
                  <th className="p-3 font-medium">Criado/Editado por</th>
                  <th className="p-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const status = appliedKeyStatuses.get(key.id) ?? keyStatus(key);
                  const inactive = status === 'revogada' || status === 'expirada';
                  const auditProfile = getAuditProfile(key);
                  return (
                    <tr key={key.id ?? key.clientName} className="border-t align-top">
                      <td className="p-3">
                        <div className="font-medium">{key.clientName ?? ''}</div>
                        {key.email && <div className="text-muted-foreground">{key.email}</div>}
                      </td>
                      <td className="p-3 font-mono">{key.keyPrefix ?? ''}…</td>
                      <td className="p-3">
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {(key.permissions ?? '').split(',').filter(Boolean).map((permission) => (
                            <span key={permission} className="rounded-full bg-muted px-2 py-1 text-xs">{permission}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3"><StatusPill status={status} /></td>
                      <td className="p-3 whitespace-nowrap">{formatDate(key.createdAt)}</td>
                      <td className="p-3 whitespace-nowrap">{formatDate(key.lastUsedAt)}</td>
                      <td className="p-3">
                        <UserCell user={auditProfile} />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <IGRPButton name={`rotate-${key.id ?? ''}`} variant="outline" size="sm" disabled={inactive || !key.id} onClick={() => { setSelectedKey(key); setConfirmAction('rotate'); }}>Rodar</IGRPButton>
                          <IGRPButton name={`revoke-${key.id ?? ''}`} variant="destructive" size="sm" disabled={inactive || !key.id} onClick={() => { setSelectedKey(key); setConfirmAction('revoke'); }}>Revogar</IGRPButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {keys.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Ainda não existem chaves M2M.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <IGRPModalDialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <IGRPModalDialogContent size="lg">
          <IGRPModalDialogHeader>
            <IGRPModalDialogTitle name="createM2mKeyTitle">Nova chave M2M</IGRPModalDialogTitle>
            <IGRPModalDialogDescription name="createM2mKeyDescription">A chave será mostrada apenas uma vez após a criação.</IGRPModalDialogDescription>
          </IGRPModalDialogHeader>
          <div className="grid gap-4 py-2">
            <IGRPInputText id="clientName" label="Nome do cliente" placeholder="fila-trabalho-job" value={clientName} onChange={(event) => setClientName(event.target.value)} required />
            <div className="space-y-2">
              <IGRPInputText
                id="permission"
                label="Permissões"
                placeholder="TASK_INSTANCES:visualizar"
                value={permissionInput}
                onChange={(event) => setPermissionInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addPermission(); } }}
                helperText="Introduza MODULO:acao e pressione Enter."
              />
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <button key={permission} type="button" className="rounded-full bg-muted px-2 py-1 text-xs" onClick={() => setPermissions((current) => current.filter((item) => item !== permission))}>
                    {permission} ×
                  </button>
                ))}
              </div>
            </div>
            <IGRPInputText id="email" type="email" label="E-mail de contacto" value={email} onChange={(event) => setEmail(event.target.value)} />
            <IGRPInputText id="expiresAt" label="Expiração" placeholder="2027-01-01T00:00:00Z" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} helperText="Opcional; use ISO-8601 UTC." />
          </div>
          <IGRPModalDialogFooter>
            <IGRPButton name="cancelCreateM2mKey" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</IGRPButton>
            <IGRPButton name="submitCreateM2mKey" onClick={() => void submitCreate()} disabled={isCreating}>Criar chave</IGRPButton>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>

      <IGRPModalDialog open={Boolean(secret)} onOpenChange={(open) => { if (open) return; }}>
        <IGRPModalDialogContent size="lg" onPointerDownOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => event.preventDefault()}>
          <IGRPModalDialogHeader>
            <IGRPModalDialogTitle name="m2mSecretTitle">Guarde a sua chave</IGRPModalDialogTitle>
            <IGRPModalDialogDescription name="m2mSecretDescription">Esta chave só aparece uma vez. Copie-a agora e guarde-a num gestor de segredos.</IGRPModalDialogDescription>
          </IGRPModalDialogHeader>
          {secret && (
            <>
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                Atenção: esta chave só aparece uma vez. Guarde-a agora num gestor de segredos.
              </div>
              {secret.oldKeyExpiresAt && (
                <p className="text-sm text-muted-foreground">
                  A chave anterior continua válida até {formatDate(secret.oldKeyExpiresAt)}; depois deixará de funcionar.
                </p>
              )}
              <div className="rounded-md border bg-muted p-4 font-mono break-all">{secret.value}</div>
            </>
          )}
          <IGRPModalDialogFooter>
            <IGRPButton name="copyM2mSecret" variant="outline" showIcon iconName="Copy" onClick={copySecret}>Copiar</IGRPButton>
            <IGRPButton name="closeM2mSecret" onClick={closeSecret}>Já copiei — fechar</IGRPButton>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>

      <IGRPAlertDialog
        open={confirmAction === 'revoke'}
        onOpenChange={(open) => { if (!open && !isMutating) setConfirmAction(null); }}
        title="Revogar chave M2M"
        description={`A chave ${selectedKey?.clientName ?? ''} deixará de funcionar imediatamente e não pode ser anulada.`}
        actionLabel="Revogar"
        cancelLabel="Cancelar"
        showCancel
        variant="destructive"
        actionProps={{ disabled: isMutating }}
        onAction={() => void handleRevoke()}
      />

      <IGRPAlertDialog
        open={confirmAction === 'rotate'}
        onOpenChange={(open) => { if (!open && !isMutating) setConfirmAction(null); }}
        title="Rodar chave M2M"
        description={`Será emitida uma nova chave para ${selectedKey?.clientName ?? ''}. A chave atual expira após o período de tolerância definido no backend.`}
        actionLabel="Rodar chave"
        cancelLabel="Cancelar"
        showCancel
        actionProps={{ disabled: isMutating }}
        onAction={() => void handleRotate()}
      />
    </div>
  );
}

function StatusPill({ status }: { status: KeyStatus }) {
  const classes: Record<KeyStatus, string> = {
    ativa: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    revogada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    expirada: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    'a expirar': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${classes[status]}`}>{status}</span>;
}
