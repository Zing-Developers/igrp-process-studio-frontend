'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FileText } from 'lucide-react';
import {
  cn,
  IGRPAlertDialog,
  IGRPButton,
  IGRPDatePickerSingle,
  IGRPInputPrimitive,
  IGRPInputText,
  IGRPInputTime,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogDescription,
  IGRPModalDialogFooter,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPTextarea,
  useIGRPToast,
} from '@igrp/igrp-framework-react-design-system';
import type {
  EmailAccessMappingDTO,
  EmailAccessMappingRequestDTO,
  UserProfileDTO,
} from '@irn/framework-process-studio-types';
import {
  createEmailAccessMapping,
  revokeEmailAccessMapping,
  updateEmailAccessMapping,
} from '@/app/(myapp)/functions/email-access-mappings';
import { useEmailAccessMappings } from '@/app/(myapp)/hooks/email-access-mappings';
import { PageHeader } from '@/app/(myapp)/components/PageHeader';
import { AccessDeniedPage } from '@/app/(myapp)/components/access-denied-page';
import { UserCell } from '@/app/(myapp)/components/user-cell';
import { IgrpLoading } from '@/app/(myapp)/components/igrp-loading';

const permissionPattern = /^[A-Z0-9_.]+:[a-z_]+$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const studioPermissionSuggestions = [
  'STUDIO_PROJECTS:visualizar',
  'STUDIO_PROJECTS:criar',
  'STUDIO_PROCESS_DEFINITIONS:visualizar',
  'STUDIO_PROCESS_DEFINITIONS:publicar',
  'STUDIO_PARAMETERIZATION:visualizar',
] as const;

const mappingSchema = z.object({
  email: z.string().min(1, 'O email é obrigatório.').email('Introduza um email válido.'),
  permissions: z
    .array(z.string())
    .min(1, 'Adicione pelo menos uma permissão.')
    .refine((values) => new Set(values).size === values.length, 'Não repita permissões.'),
});

type FormMode = 'create' | 'edit';
type MappingStatus = 'active' | 'expired' | 'revoked';
type AccessErrorStatus = 401 | 403;
type FormErrors = {
  email?: string;
  permissions?: string;
  expiration?: string;
};

const fallbackError = 'Não foi possível concluir o pedido. Tente novamente.';

const isAccessErrorStatus = (status?: number): status is AccessErrorStatus =>
  status === 401 || status === 403;

const parseApiDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDate = (value?: string): string => {
  const date = parseApiDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
};

const getMappingStatus = (mapping: EmailAccessMappingDTO, now: number): MappingStatus => {
  if (mapping.active === false) return 'revoked';
  const expiration = parseApiDate(mapping.expiresAt);
  if (expiration && expiration.getTime() <= now) return 'expired';
  return 'active';
};

const padDatePart = (value: number): string => String(value).padStart(2, '0');

const toLocalDateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(':');
  return [
    date.getFullYear(),
    '-',
    padDatePart(date.getMonth() + 1),
    '-',
    padDatePart(date.getDate()),
    'T',
    hours,
    ':',
    minutes,
    ':00',
  ].join('');
};

const getExpirationFormValue = (value?: string): { date?: Date; time: string } => {
  if (!value) return { time: '' };

  const localParts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (localParts) {
    const [, year, month, day, hours, minutes] = localParts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) return { date, time: `${hours}:${minutes}` };
  }

  const date = parseApiDate(value);
  if (!date) return { time: '' };
  return {
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    time: `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`,
  };
};

const permissionValidationMessage = (permission: string): string | undefined => {
  if (
    !permissionPattern.test(permission) ||
    permission.startsWith('ROLE_') ||
    permission.startsWith('GROUP_')
  ) {
    return 'Use o formato MODULO:ação. Roles e grupos não são permitidos.';
  }
  return undefined;
};

const mappingKey = (mapping: EmailAccessMappingDTO, index: number): string =>
  mapping.id ?? mapping.email ?? `mapping-${index}`;

const getAuditUser = (
  profile?: UserProfileDTO,
  identifier?: string,
): UserProfileDTO | string | undefined => profile ?? identifier;

const getPaginationPages = (currentPage: number, totalPages: number): number[] => {
  const pageWindowSize = Math.min(totalPages, 5);
  const firstPage = Math.min(
    Math.max(currentPage - Math.floor(pageWindowSize / 2), 0),
    totalPages - pageWindowSize,
  );

  return Array.from({ length: pageWindowSize }, (_, index) => firstPage + index);
};

type MappingPaginationProps = {
  currentPage: number;
  totalPages?: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  disabled: boolean;
  onPageChange: (page: number) => void;
};

function MappingPagination({
  currentPage,
  totalPages,
  isFirstPage,
  isLastPage,
  disabled,
  onPageChange,
}: MappingPaginationProps) {
  const pages = totalPages ? getPaginationPages(currentPage, totalPages) : [currentPage];

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3"
      aria-label="Paginação dos mapeamentos de acesso por email"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Página <span className="font-medium text-foreground">{currentPage + 1}</span>
        {totalPages ? (
          <>
            {' '}
            de <span className="font-medium text-foreground">{totalPages}</span>
          </>
        ) : null}
      </p>
      <div className="flex items-center gap-1" aria-label="Navegação entre páginas">
        <IGRPButton
          name="previousEmailAccessMappingsPage"
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </IGRPButton>
        {pages.map((page) => (
          <IGRPButton
            key={page}
            name={`emailAccessMappingsPage${page + 1}`}
            type="button"
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Página ${page + 1}`}
            onClick={() => onPageChange(page)}
          >
            {page + 1}
          </IGRPButton>
        ))}
        <IGRPButton
          name="nextEmailAccessMappingsPage"
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Seguinte
        </IGRPButton>
      </div>
    </nav>
  );
}

export default function EmailAccessMappingsPage() {
  const queryClient = useQueryClient();
  const { igrpToast } = useIGRPToast();
  const lastListError = useRef('');
  const revokePending = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingMapping, setEditingMapping] = useState<EmailAccessMappingDTO | null>(null);
  const [revokingMapping, setRevokingMapping] = useState<EmailAccessMappingDTO | null>(null);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresDate, setExpiresDate] = useState<Date>();
  const [expiresTime, setExpiresTime] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(() => new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(() => new Set());
  const [pageNumber, setPageNumber] = useState(0);

  const mappingsQuery = useEmailAccessMappings(pageNumber);
  const {
    mappingsResult,
    mappingsPage,
    mappings,
    totalPages,
    totalMappings,
    isFirstPage,
    isLastPage,
    showPagination,
  } = mappingsQuery;
  const now = Date.now();
  const statuses = useMemo(
    () => mappings.map((mapping) => getMappingStatus(mapping, now)),
    [mappings, now],
  );
  const accessErrorStatus =
    mappingsResult && !mappingsResult.success && isAccessErrorStatus(mappingsResult.status)
      ? mappingsResult.status
      : null;
  const visibleListError = mappingsQuery.isError
    ? fallbackError
    : mappingsResult && !mappingsResult.success && !accessErrorStatus
      ? mappingsResult.error
      : undefined;

  useEffect(() => {
    if (!visibleListError) {
      lastListError.current = '';
      return;
    }
    if (lastListError.current === visibleListError) return;
    lastListError.current = visibleListError;
    igrpToast({ title: 'Erro ao carregar', description: visibleListError, type: 'error' });
  }, [igrpToast, visibleListError]);

  useEffect(() => {
    if (!mappingsPage || totalPages === undefined || totalPages === 0 || pageNumber < totalPages) {
      return;
    }
    setPageNumber(totalPages - 1);
  }, [mappingsPage, pageNumber, totalPages]);

  const resetForm = () => {
    setEditingMapping(null);
    setEmail('');
    setPermissions([]);
    setPermissionInput('');
    setDescription('');
    setNotes('');
    setExpiresDate(undefined);
    setExpiresTime('');
    setFormErrors({});
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
    setFormOpen(true);
  };

  const openEditForm = (mapping: EmailAccessMappingDTO) => {
    const expiration = getExpirationFormValue(mapping.expiresAt);
    setFormMode('edit');
    setEditingMapping(mapping);
    setEmail(mapping.email ?? '');
    setPermissions(Array.from(new Set(mapping.permissions ?? [])));
    setPermissionInput('');
    setDescription(mapping.description ?? '');
    setNotes(mapping.notes ?? '');
    setExpiresDate(expiration.date);
    setExpiresTime(expiration.time);
    setFormErrors({});
    setFormOpen(true);
  };

  const addPermission = (rawPermission: string = permissionInput): boolean => {
    const permission = rawPermission.trim();
    if (!permission) return true;

    const validationMessage = permissionValidationMessage(permission);
    if (validationMessage) {
      setFormErrors((current) => ({ ...current, permissions: validationMessage }));
      return false;
    }

    setPermissions((current) =>
      current.includes(permission) ? current : [...current, permission],
    );
    setPermissionInput('');
    setFormErrors((current) => ({ ...current, permissions: undefined }));
    return true;
  };

  const submitMapping = async () => {
    if (isSaving) return;

    const pendingPermission = permissionInput.trim();
    if (pendingPermission && permissionValidationMessage(pendingPermission)) {
      addPermission(pendingPermission);
      return;
    }

    const normalizedPermissions = Array.from(
      new Set([...permissions, ...(pendingPermission ? [pendingPermission] : [])]),
    );
    const normalizedEmail = email.trim().toLowerCase();
    const validation = mappingSchema.safeParse({
      email: normalizedEmail,
      permissions: normalizedPermissions,
    });
    const expirationInvalid =
      Boolean(expiresDate) !== Boolean(expiresTime) ||
      (Boolean(expiresTime) && !timePattern.test(expiresTime));

    if (!validation.success || expirationInvalid) {
      const fieldErrors = validation.success ? {} : validation.error.flatten().fieldErrors;
      setFormErrors({
        email: fieldErrors.email?.[0],
        permissions: fieldErrors.permissions?.[0],
        expiration: expirationInvalid
          ? 'Selecione uma data e introduza uma hora válida.'
          : undefined,
      });
      return;
    }

    const trimmedDescription = description.trim();
    const trimmedNotes = notes.trim();
    const request: EmailAccessMappingRequestDTO = {
      email:
        formMode === 'edit'
          ? (editingMapping?.email ?? validation.data.email)
          : validation.data.email,
      permissions: validation.data.permissions,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      ...(expiresDate && expiresTime
        ? { expiresAt: toLocalDateTime(expiresDate, expiresTime) }
        : {}),
    };

    setFormErrors({});
    setIsSaving(true);
    try {
      const result =
        formMode === 'create'
          ? await createEmailAccessMapping(request)
          : editingMapping?.id
            ? await updateEmailAccessMapping(editingMapping.id, request)
            : {
                success: false as const,
                error: 'O identificador do mapeamento não está disponível.',
              };

      if (!result.success) {
        igrpToast({ title: 'Erro', description: result.error, type: 'error' });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['email-access-mappings'] });
      const savedEmail = validation.data.email;
      setFormOpen(false);
      resetForm();
      igrpToast({
        title: formMode === 'create' ? 'Acesso criado' : 'Mapeamento guardado',
        description:
          formMode === 'create'
            ? `Acesso criado para ${savedEmail}.`
            : `As permissões de ${savedEmail} foram actualizadas.`,
        type: 'success',
      });
    } catch {
      igrpToast({ title: 'Erro', description: fallbackError, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async () => {
    const mappingId = revokingMapping?.id;
    if (!mappingId || isRevoking) return;

    revokePending.current = true;
    setIsRevoking(true);
    try {
      const result = await revokeEmailAccessMapping(mappingId);
      if (!result.success) {
        igrpToast({ title: 'Erro', description: result.error, type: 'error' });
        return;
      }

      const revokedEmail = revokingMapping.email ?? 'este email';
      await queryClient.invalidateQueries({ queryKey: ['email-access-mappings'] });
      setRevokingMapping(null);
      igrpToast({
        title: 'Acesso revogado',
        description: `O acesso de ${revokedEmail} foi revogado.`,
        type: 'success',
      });
    } catch {
      igrpToast({ title: 'Erro', description: fallbackError, type: 'error' });
    } finally {
      revokePending.current = false;
      setIsRevoking(false);
    }
  };

  const toggleExpanded = (
    key: string,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (accessErrorStatus) {
    return (
      <AccessDeniedPage
        status={accessErrorStatus}
        description={
          accessErrorStatus === 401
            ? 'A sua sessão não é válida ou expirou. Inicie sessão novamente para continuar.'
            : 'Não tem permissão para gerir mapeamentos de acesso por email.'
        }
      />
    );
  }

  return (
    <div className={cn('page', 'space-y-6')}>
      <section className={cn('section', 'space-y-6')}>
        <PageHeader
          name="Mapeamentos de acesso por email"
          description="Sistemas externos com o seu próprio token Keycloak recebem as permissões mapeadas ao email do token."
          badgeCount={totalMappings}
        >
          <IGRPButton
            name="createEmailAccessMapping"
            showIcon
            iconName="Plus"
            onClick={openCreateForm}
          >
            Novo mapeamento
          </IGRPButton>
        </PageHeader>

        <IgrpLoading loading={mappingsQuery.isLoading} message="A carregar mapeamentos..." />

        {visibleListError && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <p className="text-sm text-destructive">{visibleListError}</p>
            <IGRPButton
              name="retryEmailAccessMappings"
              variant="outline"
              size="sm"
              loading={mappingsQuery.isFetching}
              loadingText="A tentar..."
              onClick={() => void mappingsQuery.refetch()}
            >
              Tentar novamente
            </IGRPButton>
          </div>
        )}

        {!mappingsQuery.isLoading && mappingsResult?.success && (
          <div className="rounded-md border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th scope="col" className="p-3 font-medium">
                    Email
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Permissões
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Expira
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Criado
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    Última alteração
                  </th>
                  <th scope="col" className="p-3 font-medium text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping, index) => {
                  const rowKey = mappingKey(mapping, index);
                  const status = statuses[index] ?? getMappingStatus(mapping, now);
                  const isRevoked = status === 'revoked';
                  const allPermissions = mapping.permissions ?? [];
                  const permissionsOpen = expandedPermissions.has(rowKey);
                  const visiblePermissions = permissionsOpen
                    ? allPermissions
                    : allPermissions.slice(0, 3);
                  const descriptionOpen = expandedDescriptions.has(rowKey);
                  const longDescription = (mapping.description?.length ?? 0) > 46;
                  const visibleDescription =
                    longDescription && !descriptionOpen
                      ? `${mapping.description?.slice(0, 46)}...`
                      : mapping.description;
                  const lastChangedAt = isRevoked
                    ? (mapping.revokedAt ?? mapping.updatedAt)
                    : mapping.updatedAt;
                  const lastChangedBy = isRevoked
                    ? getAuditUser(
                        mapping.userProfileRevokedBy ?? mapping.userProfileUpdatedBy,
                        mapping.revokedBy ?? mapping.updatedBy,
                      )
                    : getAuditUser(mapping.userProfileUpdatedBy, mapping.updatedBy);

                  return (
                    <tr
                      key={rowKey}
                      className={cn(
                        'border-t align-top transition-colors hover:bg-muted/20',
                        isRevoked && 'bg-muted/30 text-muted-foreground',
                      )}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-foreground">
                            {mapping.email ?? '-'}
                          </span>
                          {mapping.notes && (
                            <button
                              type="button"
                              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              title={mapping.notes}
                              aria-label={`Notas: ${mapping.notes}`}
                            >
                              <FileText className="size-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                        {visibleDescription && (
                          <div className="mt-1 max-w-xs text-xs text-muted-foreground">
                            <span>{visibleDescription}</span>
                            {longDescription && (
                              <button
                                type="button"
                                className="ml-1 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-expanded={descriptionOpen}
                                onClick={() => toggleExpanded(rowKey, setExpandedDescriptions)}
                              >
                                {descriptionOpen ? 'Ver menos' : 'Ver descrição completa'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex max-w-md flex-wrap items-center gap-1.5">
                          {visiblePermissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex rounded-full bg-muted px-2 py-1 font-mono text-xs text-foreground"
                            >
                              {permission}
                            </span>
                          ))}
                          {allPermissions.length === 0 && (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {allPermissions.length > 3 && (
                            <button
                              type="button"
                              className="px-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-expanded={permissionsOpen}
                              onClick={() => toggleExpanded(rowKey, setExpandedPermissions)}
                            >
                              {permissionsOpen
                                ? 'Ver menos'
                                : `Ver todos (+${allPermissions.length - 3})`}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusPill status={status} />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {mapping.expiresAt ? (
                          formatDate(mapping.expiresAt)
                        ) : (
                          <span className="text-muted-foreground">sem expiração</span>
                        )}
                      </td>
                      <td className="p-3">
                        <AuditCell
                          date={mapping.createdAt}
                          user={getAuditUser(mapping.userProfileCreatedBy, mapping.createdBy)}
                        />
                      </td>
                      <td className="p-3">
                        <AuditCell date={lastChangedAt} user={lastChangedBy} />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <IGRPButton
                            name={`edit-email-access-${mapping.id ?? rowKey}`}
                            variant="outline"
                            size="sm"
                            disabled={isRevoked || !mapping.id}
                            onClick={() => openEditForm(mapping)}
                          >
                            Editar
                          </IGRPButton>
                          <IGRPButton
                            name={`revoke-email-access-${mapping.id ?? rowKey}`}
                            variant="destructive"
                            size="sm"
                            disabled={isRevoked || !mapping.id}
                            onClick={() => setRevokingMapping(mapping)}
                          >
                            Revogar
                          </IGRPButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {mappings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      {totalMappings > 0
                        ? 'Não há mapeamentos nesta página.'
                        : 'Ainda não há mapeamentos neste backend.'}
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
            {showPagination && (
              <MappingPagination
                currentPage={pageNumber}
                totalPages={totalPages}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                disabled={mappingsQuery.isFetching}
                onPageChange={setPageNumber}
              />
            )}
          </div>
        )}
      </section>

      <IGRPModalDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (isSaving) return;
          if (open) setFormOpen(true);
          else {
            setFormOpen(false);
            resetForm();
          }
        }}
      >
        <IGRPModalDialogContent size="lg">
          <IGRPModalDialogHeader>
            <IGRPModalDialogTitle name="emailAccessMappingFormTitle">
              {formMode === 'create' ? 'Novo mapeamento' : 'Editar mapeamento'}
            </IGRPModalDialogTitle>
            <IGRPModalDialogDescription name="emailAccessMappingFormDescription">
              {formMode === 'create'
                ? 'O email é o do service account no Keycloak. É guardado em minúsculas e não pode ser alterado depois da criação.'
                : 'Substitui permissões, descrição, notas e expiração. O email não muda; para outro endereço, crie um novo mapeamento.'}
            </IGRPModalDialogDescription>
          </IGRPModalDialogHeader>

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void submitMapping();
            }}
          >
            <div className="grid gap-4 py-2">
              <IGRPInputText
                id="mappingEmail"
                type="email"
                label="Email do service account"
                placeholder="svc-fila@parceiro.cv"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFormErrors((current) => ({ ...current, email: undefined }));
                }}
                error={formErrors.email}
                readOnly={formMode === 'edit'}
                disabled={isSaving}
                required
                inputClassName="font-mono"
              />

              <div className="space-y-2">
                <label htmlFor="mappingPermission" className="text-sm font-medium">
                  Permissões <span aria-hidden="true">*</span>
                </label>
                <div
                  className={cn(
                    'flex min-h-10 flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-2',
                    formErrors.permissions ? 'border-destructive' : 'border-input',
                  )}
                >
                  {permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                    >
                      {permission}
                      <button
                        type="button"
                        aria-label={`Remover permissão ${permission}`}
                        className="rounded-full px-0.5 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() =>
                          setPermissions((current) => current.filter((item) => item !== permission))
                        }
                        disabled={isSaving}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <IGRPInputPrimitive
                    id="mappingPermission"
                    value={permissionInput}
                    placeholder="MODULO:acao"
                    aria-invalid={Boolean(formErrors.permissions)}
                    aria-describedby="mappingPermissionHelp mappingPermissionError"
                    className="h-7 min-w-52 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
                    disabled={isSaving}
                    onChange={(event) => {
                      setPermissionInput(event.target.value);
                      setFormErrors((current) => ({ ...current, permissions: undefined }));
                    }}
                    onBlur={() => {
                      if (permissionInput.trim()) addPermission();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault();
                        addPermission();
                      } else if (
                        event.key === 'Backspace' &&
                        !permissionInput &&
                        permissions.length
                      ) {
                        setPermissions((current) => current.slice(0, -1));
                      }
                    }}
                  />
                </div>
                <p id="mappingPermissionHelp" className="text-xs text-muted-foreground">
                  Formato MODULO:acao. Roles e grupos são rejeitados.
                </p>
                {formErrors.permissions && (
                  <p id="mappingPermissionError" className="text-xs text-destructive" role="alert">
                    {formErrors.permissions}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5" aria-label="Catálogo de permissões">
                  {studioPermissionSuggestions.map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      className="rounded-md border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSaving || permissions.includes(permission)}
                      onClick={() => addPermission(permission)}
                    >
                      {permission}
                    </button>
                  ))}
                </div>
              </div>

              <IGRPInputText
                id="mappingDescription"
                label="Descrição (opcional)"
                placeholder="Job da fila de trabalho"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSaving}
              />

              <IGRPTextarea
                id="mappingNotes"
                label="Notas (opcional)"
                placeholder="Quem pediu, ticket, contacto do parceiro"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={isSaving}
                helperText="Texto livre para a equipa. Nunca entra em nenhuma decisão de acesso."
              />

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                <IGRPDatePickerSingle
                  id="mapping-expires-date"
                  name="mappingExpiresDate"
                  label="Data de expiração"
                  placeholder="Selecione uma data"
                  date={expiresDate}
                  onDateChange={(date) => {
                    setExpiresDate(date);
                    if (!date) setExpiresTime('');
                    if (date && !expiresTime) setExpiresTime('23:59');
                    setFormErrors((current) => ({ ...current, expiration: undefined }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  disabled={isSaving}
                  disabledPicker={isSaving}
                />
                <IGRPInputTime
                  id="mapping-expires-time"
                  name="mappingExpiresTime"
                  label="Hora de expiração"
                  value={expiresTime}
                  onChange={(value) => {
                    setExpiresTime(value);
                    setFormErrors((current) => ({ ...current, expiration: undefined }));
                  }}
                  error={formErrors.expiration}
                  disabled={isSaving}
                />
              </div>
            </div>

            <IGRPModalDialogFooter>
              <IGRPButton
                name="cancelEmailAccessMapping"
                variant="outline"
                onClick={() => {
                  if (isSaving) return;
                  setFormOpen(false);
                  resetForm();
                }}
                disabled={isSaving}
              >
                Cancelar
              </IGRPButton>
              <IGRPButton
                name="submitEmailAccessMapping"
                type="submit"
                loading={isSaving}
                loadingText={formMode === 'create' ? 'A criar...' : 'A guardar...'}
                disabled={isSaving}
              >
                {formMode === 'create' ? 'Criar' : 'Guardar'}
              </IGRPButton>
            </IGRPModalDialogFooter>
          </form>
        </IGRPModalDialogContent>
      </IGRPModalDialog>

      <IGRPAlertDialog
        open={Boolean(revokingMapping)}
        onOpenChange={(open) => {
          if (!open && !revokePending.current) setRevokingMapping(null);
        }}
        title="Revogar este acesso?"
        description={`O sistema que usa ${revokingMapping?.email ?? 'este email'} passa a receber 403 já no próximo pedido. Não há undo; para voltar a dar acesso cria-se um mapeamento novo.`}
        actionLabel="Revogar"
        cancelLabel="Cancelar"
        showCancel
        variant="destructive"
        actionProps={{
          disabled: isRevoking,
          loading: isRevoking,
          loadingText: 'A revogar...',
        }}
        cancelProps={{ disabled: isRevoking }}
        onAction={() => void handleRevoke()}
      >
        <div className="rounded border-l-[3px] border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Fica registado quem revogou e quando. O mapeamento continua na lista, como revogado.
        </div>
      </IGRPAlertDialog>
    </div>
  );
}

function StatusPill({ status }: { status: MappingStatus }) {
  const labels: Record<MappingStatus, string> = {
    active: 'Activo',
    expired: 'Expirado',
    revoked: 'Revogado',
  };
  const classes: Record<MappingStatus, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    expired: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    revoked: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  };

  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', classes[status])}>
      {labels[status]}
    </span>
  );
}

function AuditCell({ date, user }: { date?: string; user?: UserProfileDTO | string }) {
  return (
    <div className="space-y-2">
      <div className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(date)}</div>
      <UserCell user={user} />
    </div>
  );
}
