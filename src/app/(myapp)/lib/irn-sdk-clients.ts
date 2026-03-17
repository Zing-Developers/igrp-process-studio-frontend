import { Client, createClient } from '@irn/irn-experience-sdk';
import { APIExperienceAuthInterceptor } from './irn-api-token-provider';

const interceptors = new APIExperienceAuthInterceptor('irn-cached-token_v.0');

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

const getSystemAdminBaseUrl = () => {
    const backofficeBaseUrl = process.env.IRN_API_BACKOFFICE_BASE_URL?.trim();
    if (!backofficeBaseUrl) return '';
    return `${trimTrailingSlash(backofficeBaseUrl)}/api/v1`;
};

const createLazyClient = (factory: () => Client): Client => {
    let client: Client | undefined;

    return new Proxy({} as Client, {
        get(_target, prop, receiver) {
            client ??= factory();
            const value = Reflect.get(client as object, prop, receiver);
            return typeof value === 'function' ? value.bind(client) : value;
        },
    });
};


export const expSystemAdminAPIClient = createLazyClient(() =>
    createClient({
        baseUrl: getSystemAdminBaseUrl(),
        interceptors: [interceptors]
    }),
);