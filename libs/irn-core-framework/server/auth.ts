import NextAuth, { getServerSession, type AuthOptions } from 'next-auth';

export type IRNAuthOptions = AuthOptions;

export const createIRNAuthHandler = (options: IRNAuthOptions) => NextAuth(options);
export const getIRNServerSession = (options: IRNAuthOptions) => getServerSession(options);
