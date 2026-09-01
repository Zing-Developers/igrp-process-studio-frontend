import type { CreateM2mKeyRequest, CreatedM2mKey, M2mKey, M2mKeysApiClientConfig } from './types';

export class M2mKeysApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'M2mKeysApiClientError';
  }
}

const sensitiveLogFields = new Set([
  'accesstoken',
  'apikey',
  'authorization',
  'cookie',
  'idtoken',
  'key',
  'password',
  'proxyauthorization',
  'refreshtoken',
  'secret',
  'sessionid',
  'setcookie',
  'token',
  'xaccesstoken',
]);

const isSensitiveLogField = (field: string) =>
  sensitiveLogFields.has(field.toLowerCase().replaceAll('-', '').replaceAll('_', ''));

const sanitizeForLog = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeForLog);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([field, fieldValue]) => [
        field,
        isSensitiveLogField(field) ? '[REDACTED]' : sanitizeForLog(fieldValue),
      ]),
    );
  }

  return value;
};

const parseRequestBodyForLog = (body: BodyInit | null | undefined): unknown => {
  if (!body) return undefined;
  if (typeof body !== 'string') return `[${body.constructor.name}]`;

  try {
    return sanitizeForLog(JSON.parse(body));
  } catch {
    return `[non-JSON body, ${body.length} characters]`;
  }
};

/** Local counterpart of the framework SDK client. */
export class M2mKeysApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;

  constructor(config: M2mKeysApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 30000;
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  async list(): Promise<M2mKey[]> {
    return this.request<M2mKey[]>('/m2m-keys', { method: 'GET' });
  }

  async create(request: CreateM2mKeyRequest): Promise<CreatedM2mKey> {
    return this.request<CreatedM2mKey>('/m2m-keys', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async revoke(id: string): Promise<void> {
    await this.request<void>(`/m2m-keys/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async rotate(id: string): Promise<CreatedM2mKey> {
    return this.request<CreatedM2mKey>(`/m2m-keys/${encodeURIComponent(id)}/rotate`, {
      method: 'POST',
    });
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    if (!this.baseUrl) {
      throw new M2mKeysApiClientError('O endereço do gateway da API não está configurado.', 0);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const method = options.method ?? 'GET';
    const url = `${this.baseUrl}${path}`;
    const startedAt = Date.now();

    this.logDevelopment('request', {
      method,
      url,
      headers: sanitizeForLog({ ...this.headers, ...options.headers }),
      body: parseRequestBodyForLog(options.body),
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers },
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await this.readBody(response);
        this.logDevelopment('response', {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          headers: sanitizeForLog(Object.fromEntries(response.headers.entries())),
          durationMs: Date.now() - startedAt,
          body: sanitizeForLog(details),
        });
        const message =
          typeof details === 'object' && details && 'error' in details
            ? String(details.error)
            : `Não foi possível concluir o pedido (código ${response.status}).`;
        throw new M2mKeysApiClientError(message, response.status, details);
      }

      const data = response.status === 204 ? undefined : await this.readBody(response);
      this.logDevelopment('response', {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        headers: sanitizeForLog(Object.fromEntries(response.headers.entries())),
        durationMs: Date.now() - startedAt,
        body: sanitizeForLog(data),
      });
      return data as T;
    } catch (error) {
      if (error instanceof M2mKeysApiClientError) throw error;
      this.logDevelopment('request failed', {
        method,
        url,
        durationMs: Date.now() - startedAt,
        error:
          error instanceof Error ? { name: error.name, message: error.message } : String(error),
      });
      throw new M2mKeysApiClientError(
        error instanceof Error && error.name === 'AbortError'
          ? 'O pedido excedeu o tempo limite. Tente novamente.'
          : 'Não foi possível comunicar com a API. Tente novamente.',
        0,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async readBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    return contentType.includes('application/json') ? response.json() : response.text();
  }

  private logDevelopment(event: string, details: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[M2M API] ${event}`, details);
    }
  }
}
