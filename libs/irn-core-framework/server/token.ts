import { getToken, type GetTokenParams, type JWT } from 'next-auth/jwt';

export type IRNJWT = JWT;
export type IRNGetTokenOptions = GetTokenParams<false>;

export const getIRNToken = (options: IRNGetTokenOptions) => getToken<false>(options);
