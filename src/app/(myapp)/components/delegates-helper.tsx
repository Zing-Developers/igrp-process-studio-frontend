'use client';

import type React from 'react';

import { useState } from 'react';
import { Copy, Check, Mail, Webhook, MessageSquare, FileJson } from 'lucide-react';
import { IGRPBadgePrimitive, IGRPButtonPrimitive, IGRPCardContentPrimitive, IGRPCardDescriptionPrimitive, IGRPCardHeaderPrimitive, IGRPCardPrimitive, IGRPCardTitlePrimitive, useIGRPToast } from '@igrp/igrp-framework-react-design-system';

interface DelegateParameter {
  name: string;
  description: string;
}

interface Delegate {
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  syntax: string;
  parameters: DelegateParameter[];
  example: string;
}

const delegates: Delegate[] = [
  {
    name: 'igrpSendEmailDelegate',
    category: 'Mail',
    icon: <Mail className="size-4" />,
    description:
      'Envia uma mensagem de correio eletrónico para o destinatário indicado com o assunto e o conteúdo fornecidos.',
    syntax: '${igrpSendEmailDelegate}',
    parameters: [
      { name: 'emailTo', description: 'Endereço de email de destino' },
      { name: 'emailSubject', description: 'Assunto do email' },
      { name: 'emailBody', description: 'Conteúdo/corpo do email' },
      { name: 'emailFrom', description: 'Endereço de email do remetente' },
    ],
    example: `<!-- Configuração da tarefa de serviço -->
Tipo de implementação: Delegate Expression
Expressão do delegado: \${igrpSendEmailDelegate}

<!-- Variáveis -->
emailTo: user@example.com
emailSubject: Notificação do processo
emailBody: O seu processo foi concluído com sucesso
emailFrom: noreply@company.com`,
  },
  {
    name: 'igrpMessageBrokerSenderDelegate',
    category: 'Message',
    icon: <MessageSquare className="size-4" />,
    description:
      'Envia uma mensagem através do message broker configurado (por exemplo, Kafka ou RabbitMQ) com base nas definições de integração existentes.',
    syntax: '${igrpMessageBrokerSenderDelegate}',
    parameters: [{
      name: 'topic',
      description: 'Tópico Kafka para onde a mensagem será enviada'
    }],
    example: `<!-- Configuração da tarefa de serviço -->
Tipo de implementação: Delegate Expression
Expressão do delegado: \${igrpMessageBrokerSenderDelegate}

<!-- Variáveis -->
topic: Envia uma mensagem através da configuração definida`,
  },
  {
    name: 'igrpWebhookDelegate',
    category: 'Webhook',
    icon: <Webhook className="size-4" />,
    description:
      'Executa um pedido HTTP para um endpoint webhook externo com método, parâmetros e payload configuráveis.',
    syntax: '${igrpWebhookDelegate}',
    parameters: [
      { name: 'webhookUrl', description: 'URL base do endpoint webhook' },
      { name: 'webhookMethod', description: 'Método HTTP a utilizar (GET, POST, PUT, etc.)' },
      {
        name: 'webhookUrlPath',
        description: 'Caminho anexado à URL base para o recurso específico',
      },
      { name: 'webhookQueryParams', description: 'Parâmetros de query do pedido' },
      { name: 'webhookPayload', description: 'Corpo do pedido (payload) enviado ao webhook' },
      { name: 'webhookPayloadHeader', description: 'Cabeçalhos HTTP incluídos no pedido' },
    ],
    example: `<!-- Configuração da tarefa de serviço -->
Tipo de implementação: Delegate Expression
Expressão do delegado: \${igrpWebhookDelegate}

<!-- Variáveis -->
webhookUrl: https://api.example.com
webhookMethod: POST
webhookUrlPath: /api/v1/notifications
webhookQueryParams: {"userId": "12345"}
webhookPayload: {"message": "Processo concluído", "status": "sucesso"}
webhookPayloadHeader: {"Content-Type": "application/json", "Authorization": "Bearer token123"}`,
  },
  {
    name: 'igrpJsonParseDelegate',
    category: 'Parse',
    icon: <FileJson className="size-4" />,
    description: 'Extrai um payload para uma variável de dados no processo.',
    syntax: '${igrpJsonParseDelegate}',
    parameters: [
      { name: 'json', description: 'Dados JSON estruturados (codificados em base64 ou não)' },
      {
        name: 'isBase64Encoded',
        description: 'Valor booleano que indica se o JSON está codificado ou não',
      },
    ],
    example: `<!-- Configuração da tarefa de serviço -->
Tipo de implementação: Delegate Expression
Expressão do delegado: \${igrpJsonParseDelegate}

<!-- Variáveis -->
json: {"name": "João Silva", "age": 30, "email": "joao@example.com"}
isBase64Encoded: false

<!-- Ou com codificação base64 -->
json: eyJuYW1lIjoiSm9obiBEb2UiLCJhZ2UiOjMwfQ==
isBase64Encoded: true`,
  },
];

function DelegatesHelper() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { igrpToast } = useIGRPToast();

  const copyToClipboard = async (text: string, id: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      igrpToast({
        type: 'success',
        title: 'Copiado',
        description: `${label} copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      igrpToast({
        type: 'error',
        title: 'Falha ao copiar',
        description: 'Tente novamente.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <IGRPCardPrimitive>
        <IGRPCardHeaderPrimitive>
          <IGRPCardTitlePrimitive>Delegados disponíveis</IGRPCardTitlePrimitive>
          <IGRPCardDescriptionPrimitive>
            Os delegados permitem integrar lógica personalizada ou serviços externos diretamente
            nos fluxos de processo BPMN. Utilize-os nas tarefas de serviço definindo o tipo de
            implementação como <IGRPBadgePrimitive variant="secondary">Delegate Expression</IGRPBadgePrimitive>
          </IGRPCardDescriptionPrimitive>
        </IGRPCardHeaderPrimitive>
      </IGRPCardPrimitive>

      <div className="grid gap-6">
        {delegates.map((delegate) => (
          <IGRPCardPrimitive key={delegate.name}>
            <IGRPCardHeaderPrimitive>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {delegate.icon}
                </div>
                <div>
                  <IGRPCardTitlePrimitive className="text-xl">{delegate.name}</IGRPCardTitlePrimitive>
                  <IGRPBadgePrimitive variant="outline" className="mt-1">
                    {delegate.category}
                  </IGRPBadgePrimitive>
                </div>
              </div>
              <IGRPCardDescriptionPrimitive className="mt-3">{delegate.description}</IGRPCardDescriptionPrimitive>
            </IGRPCardHeaderPrimitive>
            <IGRPCardContentPrimitive className="space-y-4">
              {/* Syntax */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Sintaxe da expressão do delegado
                  </h4>
                  <IGRPButtonPrimitive
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(delegate.syntax, `syntax-${delegate.name}`, 'Sintaxe do delegado')
                    }
                  >
                    {copiedId === `syntax-${delegate.name}` ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Copiar sintaxe
                  </IGRPButtonPrimitive>
                </div>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">{delegate.syntax}</div>
              </div>

              {/* Parameters */}
              {delegate.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Parâmetros</h4>
                  <div className="space-y-2">
                    {delegate.parameters.map((param) => (
                      <div key={param.name} className="flex items-center gap-3 text-sm group">
                        <IGRPBadgePrimitive variant="secondary" className="font-mono shrink-0">
                          {param.name}
                        </IGRPBadgePrimitive>
                        <span className="text-muted-foreground flex-1">{param.description}</span>
                        <IGRPButtonPrimitive
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            copyToClipboard(
                              param.name,
                              `param-${delegate.name}-${param.name}`,
                              `Parâmetro "${param.name}"`,
                            )
                          }
                        >
                          {copiedId === `param-${delegate.name}-${param.name}` ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </IGRPButtonPrimitive>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">Configuração de exemplo</h4>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-foreground">{delegate.example}</pre>
                </div>
              </div>
            </IGRPCardContentPrimitive>
          </IGRPCardPrimitive>
        ))}
      </div>

      {/* Quick Reference */}
      <IGRPCardPrimitive>
        <IGRPCardHeaderPrimitive>
          <IGRPCardTitlePrimitive>Referência rápida</IGRPCardTitlePrimitive>
          <IGRPCardDescriptionPrimitive>Como utilizar delegados no seu processo BPMN</IGRPCardDescriptionPrimitive>
        </IGRPCardHeaderPrimitive>
        <IGRPCardContentPrimitive className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Adicione uma tarefa de serviço ao seu diagrama BPMN
                </p>
                <p className="text-sm text-muted-foreground">
                  Crie ou selecione uma tarefa de serviço no fluxo do processo
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Defina o tipo de implementação como &quot;Delegate Expression&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  No painel de propriedades da tarefa de serviço
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground">Copie e cole a sintaxe do delegado</p>
                <p className="text-sm text-muted-foreground">
                  Utilize o botão &quot;Copiar sintaxe&quot; acima para obter o formato correto
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-foreground">Configure os parâmetros obrigatórios</p>
                <p className="text-sm text-muted-foreground">
                  Adicione variáveis de processo com os nomes dos parâmetros listados acima. Passe
                  o cursor sobre cada parâmetro para copiar o respetivo nome individualmente.
                </p>
              </div>
            </div>
          </div>
        </IGRPCardContentPrimitive>
      </IGRPCardPrimitive>
    </div>
  );
}

export { DelegatesHelper };
