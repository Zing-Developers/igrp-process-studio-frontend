import { LRUCache } from 'lru-cache';
import { Interceptor, RequestContext } from '@irn/irn-experience-sdk/types/server';
import { fetchNewToken, getAPISecretKey } from './rsa-token-handlers';


export class APIExperienceAuthInterceptor implements Interceptor {
  private cache: LRUCache<string, string>;
  private cacheKey: string;

  constructor(cacheKey = 'cache_key') {
    this.cacheKey = cacheKey;
    this.cache = new LRUCache<string, string>({
      max: 1,
      ttl: 1000 * 60 * 3,
    });
  }

  async beforeRequest(ctx: RequestContext): Promise<RequestContext> {

    if (!process.env.JWT_KEY || getAPISecretKey() === false) {
      console.error('JWT CREDENTIALS NOT FOUND');
      return ctx;
    }

    let token = this.cache.get(this.cacheKey);

    if (!token) {
      token = await fetchNewToken();
      this.cache.set(this.cacheKey, token);
    }

    (ctx.init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    return ctx;
  }

}