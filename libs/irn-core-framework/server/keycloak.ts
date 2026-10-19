import KeycloakProvider from 'next-auth/providers/keycloak';

export type IRNKeycloakOptions = Parameters<typeof KeycloakProvider>[0];

export const createIRNKeycloakProvider = (options: IRNKeycloakOptions) => KeycloakProvider(options);
