# Task: Implementar consola de Chaves M2M — Process Management

## Objetivo

Criar, no frontend `../igrp-process-management-frontend`, uma consola exclusiva para super-admins gerirem as API keys machine-to-machine do Process Management. A consola deve listar, criar, rodar e revogar chaves sem nunca persistir ou expor novamente o plaintext da key.

## Contexto e fontes de verdade

- Backend: `../igrp-process-management-backend-api`, release 24.6, PR `Zing-Developers/igrp-process-management-backend-api#55`.
- Handoff de frontend: `../igrp-process-management-backend-api/docs/M2M_FRONTEND_HANDOFF.md`.
- Decisões de segurança: `../igrp-process-management-backend-api/docs/SPEC_M2M_AUTHORIZATION.md`.
- Protótipo: artifact **“Consola de Chaves M2M”** — obter o link com o Brocy antes da implementação visual final.

O backend já está pronto. As rotas `/m2m-keys/**` só aceitam JWT de utilizador com role de super-admin; uma key M2M ou qualquer utilizador sem essa role recebe `403`.

## Escopo

Incluído:

- Nova entrada de menu **Chaves M2M**, visível apenas para super-admins.
- Página de listagem, criação, rotação e revogação de chaves.
- Integração com `GET`, `POST`, `DELETE` e `POST /rotate` de `/m2m-keys`.
- Estados de carregamento, vazio, erro e controlo de acesso `403`.
- Testes e QA definidos neste documento.

Excluído:

- Alterações ao backend, à geração/hash/armazenamento de keys ou ao grace period.
- Gestão de keys do Process Studio; cada frontend gere apenas as keys do seu backend.
- Persistência, exportação, auditoria ou reexibição do plaintext da key.

## Pré-requisitos e decisões a confirmar

Estas questões devem ser fechadas antes de iniciar o código de controlo de acesso; não assumir valores:

1. **Role/claim de super-admin no frontend:** o backend confirma a authority exata `ROLE_DEPT_IGRP.superadmin` (ver `../igrp-process-studio-backend-api/src/main/java/cv/igrp/platform/process_manager_studio/shared/security/SecurityConfig.java`). Ainda é necessário confirmar onde essa authority fica disponível na sessão/JWT do `igrp-process-management-frontend`, pois o menu atual usa `src/temp/menus/menus.ts` com `roles: []` e não há uma regra de visibilidade super-admin reutilizável.
2. **Protótipo:** obter o URL do artifact “Consola de Chaves M2M” com o Brocy e aplicar os detalhes finais de layout, copy e responsividade.
3. **Cliente HTTP:** confirmar se a versão de `@igrp/platform-process-management-client-ts` já expõe `/m2m-keys`. Se não expuser, criar um adapter local que reutilize o cliente/autorização atual (`src/lib/api-client.ts`) e não duplique a gestão de JWT/cookie/APISIX.
4. **Formato da expiração no UI:** confirmado pelo backend: `expiresAt` é um `Instant`; o frontend deve enviar ISO-8601 com data e hora em UTC. Se o protótipo usar uma data simples, convertê-la explicitamente para uma hora UTC acordada antes do envio.

## Contrato da API

Base URL: a raiz já configurada para a Process Management API, incluindo eventual context path do deployment.

```ts
type M2mKey = {
  id: string;
  clientName: string;
  keyPrefix: string;
  permissions: string; // CSV: "MODULO:acao,OUTRO:acao"
  email: string | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type CreateM2mKeyRequest = {
  clientName: string; // ^[a-z0-9._-]+$
  permissions: string[]; // pelo menos uma; ^[A-Z0-9_.]+:[a-z_]+$
  email?: string;
  expiresAt?: string; // ISO-8601 UTC com data e hora
};

type CreateOrRotateM2mKeyResponse = {
  id: string;
  clientName: string;
  key: string; // plaintext; só nesta resposta
};
```

| Operação | Endpoint | Sucesso | Falhas relevantes |
|---|---|---|---|
| Listar | `GET /m2m-keys` | `200 M2mKey[]` | `403` para não-super-admin |
| Criar | `POST /m2m-keys` | `201 CreateOrRotateM2mKeyResponse` | `400 { error }`, `403` |
| Revogar | `DELETE /m2m-keys/{id}` | `204` | `400 { error }`, `403` |
| Rodar | `POST /m2m-keys/{id}/rotate` | `201 CreateOrRotateM2mKeyResponse` | `400 { error }`, `403` |

Nunca assumir que `GET` pode devolver `key` ou `keyHash`; isto é uma violação de segurança e deve falhar QA.

## Requisitos funcionais

### 1. Acesso e navegação

- Adicionar a entrada **Chaves M2M** ao menu apenas se o utilizador autenticado for super-admin.
- Proteger a rota no frontend contra acesso direto, mostrando o estado de acesso negado apropriado em caso de `403`; o backend continua a ser o gate autoritativo.
- Não enviar nem aceitar credenciais M2M para gerir keys: a consola usa a sessão JWT/cookie normal da app.

### 2. Lista

Criar uma página com botão **+ Nova chave** e tabela contendo:

- cliente, com email como informação secundária quando existir;
- `keyPrefix…` em mono;
- permissões convertidas da string CSV para chips;
- pill de estado;
- criada em;
- último uso, ou “Nunca usada”;
- ações **Rodar** e **Revogar**.

Derivar o estado exclusivamente dos dados recebidos:

1. `active === false` → `revogada`;
2. `active === true` e `expiresAt` já passou → `expirada`;
3. `active === true` e `expiresAt` no futuro → `a expirar`;
4. caso contrário → `ativa`.

Desativar Rodar e Revogar para chaves mortas (`revogada` ou `expirada`). Explicar no UI que `lastUsedAt` é best-effort e tem granularidade mínima de 60 segundos; não o apresentar como tempo real.

### 3. Criar chave

Abrir um modal com:

- `clientName` obrigatório, convertido/validado como slug `^[a-z0-9._-]+$`;
- permissões obrigatórias num chip-input: Enter adiciona uma permissão, com validação `^[A-Z0-9_.]+:[a-z_]+$`;
- email opcional;
- expiração opcional, serializada como ISO-8601 UTC;
- prevenção de submissões duplicadas e feedback de loading.

Validar no cliente para feedback imediato, mas manter o backend como autoridade. Em qualquer `400`, mostrar literalmente `response.error`; não substituir por uma mensagem genérica, sobretudo para tentativas com `ROLE_*` ou `GROUP_*`.

### 4. Modal de plaintext one-time

Após criar ou rodar, apresentar um modal bloqueante com:

- plaintext da key em fonte mono;
- botão Copiar, com confirmação acessível de cópia;
- aviso claro: “Esta chave só aparece uma vez.”;
- único mecanismo de fecho: botão **“Já copiei — fechar”**.

O modal não fecha por overlay, Escape, botão X ou navegação interna acidental. Guardar o plaintext apenas em state local deste modal, limpar esse state ao fechar/desmontar e nunca o colocar em React Query/query cache, localStorage, sessionStorage, URL, logs, analytics, toast, erro ou telemetry.

### 5. Revogar

- Mostrar confirmação com o `clientName` e a consequência explícita: pedidos com a key passam a receber `401` imediatamente.
- Avisar que não existe undo.
- Em `204`, fechar o modal, invalidar/refetch da lista e mostrar confirmação sem incluir qualquer segredo.
- Em `400`, mostrar a mensagem literal do backend.

### 6. Rodar

- Mostrar confirmação antes do pedido, explicando que será criada uma nova key e a anterior expira no grace period do backend (default 7 dias).
- Em `201`, refetch da lista e abrir o mesmo modal one-time com a nova key.
- Comunicar a data efetiva de expiração da key antiga quando ela estiver disponível após o refetch; não inventar uma data no cliente.

## Abordagem técnica sugerida

1. Criar tipos e um módulo de API dedicado, por exemplo `src/app/(myapp)/m2m-keys/`, usando o mecanismo autenticado existente em `src/lib/api-client.ts`.
2. Criar hooks React Query separados:
   - `useM2mKeys()` para a lista;
   - `useCreateM2mKey()`;
   - `useRevokeM2mKey()`;
   - `useRotateM2mKey()`.
   Invalidar apenas a query `['m2m-keys']` após mutações. Não guardar a resposta que contém `key` numa query.
3. Criar componentes pequenos e testáveis: tabela/lista, chips de permissões, formulário/modal de criação, confirmação de revogação, confirmação de rotação e modal one-time.
4. Reutilizar os componentes IGRP e padrões de modais, tabelas, `useIGRPToast`, React Query e layout já usados pelo frontend alvo.
5. Implementar o guard/menu após confirmar a fonte da role. A ocultação do menu é UX; a resposta `403` do backend tem de ser tratada de forma previsível.

## Plano de execução

### Fase 1 — Descoberta e integração de acesso (até 1 dia)

- [ ] Confirmar role/claim de super-admin e protótipo com o Brocy.
- [ ] Confirmar a disponibilidade de `/m2m-keys` no SDK; criar adapter autorizado se necessário.
- [ ] Adicionar rota, guard e menu condicionado à role.

### Fase 2 — Lista e mutações (1–2 dias)

- [ ] Implementar tipos, API adapter e hooks.
- [ ] Implementar tabela, estados derivados, estado vazio/loading/erro e chips de permissões.
- [ ] Implementar confirmação e mutação de revogação.
- [ ] Implementar confirmação e mutação de rotação.

### Fase 3 — Criação segura e polish (1–2 dias)

- [ ] Implementar formulário de criação e chip-input com validação cliente.
- [ ] Implementar modal one-time e fluxo de cópia segura.
- [ ] Aplicar o protótipo, acessibilidade, responsividade e mensagens de erro literais.

### Fase 4 — QA (até 1 dia)

- [ ] Executar os testes de segurança e regressão abaixo.
- [ ] Rever que nenhum segredo aparece em logs, storage, cache de queries, URL, telemetria ou UI após fechar o modal.

## Critérios de aceitação / QA

- [ ] A entrada de menu não aparece para um utilizador não-super-admin e aparece para super-admin.
- [ ] Um utilizador não-super-admin recebe e vê um tratamento correto de `403` em qualquer operação de `/m2m-keys`.
- [ ] A lista apresenta todos os campos definidos, sem `key` ou `keyHash`, e deriva corretamente os quatro estados.
- [ ] Criar uma key válida devolve `201` e apresenta o plaintext apenas no modal one-time.
- [ ] O modal one-time copia a key e não fecha por clique fora, Escape ou X; só fecha por “Já copiei — fechar”.
- [ ] Depois de fechar o modal, atualizar/reabrir a página não permite recuperar o plaintext.
- [ ] Criar com `ROLE_DEPT_IGRP.superadmin` recebe `400` e mostra literalmente o erro do backend.
- [ ] Criar com slug ou permissão inválidos recebe validação de cliente e, se submetido, mostra o `400` literal do backend.
- [ ] Revogar requer confirmação; após `204`, a key fica revogada e um pedido autenticado com ela recebe `401` imediatamente.
- [ ] Rodar requer confirmação; a nova key funciona já e é mostrada apenas uma vez; a antiga fica válida até ao grace e depois expira.
- [ ] Ações Rodar/Revogar ficam desativadas para keys revogadas ou expiradas.
- [ ] Nenhuma key plaintext é escrita em `console.*`, storage, query cache, URL, analytics, telemetry, toasts ou mensagens de erro.

## Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Assumir a role errada | Consola exposta ou invisível indevidamente | Confirmar claim/role antes de implementar o guard e cobrir ambos os perfis em QA. |
| SDK sem endpoints M2M | Integração bloqueada | Usar adapter HTTP local que reutiliza os headers/autorização existentes; não criar nova estratégia de auth. |
| Plaintext persistido acidentalmente pelo estado/cache | Exposição de segredo | State local efémero, sem query cache e limpeza explícita no fecho/desmontagem. |
| Protótipo indisponível | Divergência visual/UX | Implementar contratos e fluxos; validar layout/copy final antes de fechar a tarefa. |

## Definition of Done

A consola está disponível apenas para super-admins no `igrp-process-management-frontend`, cumpre todos os contratos e regras de segurança do handoff, passa a lista de QA acima e foi revista para garantir que o plaintext de qualquer key nunca é persistido ou registado.
