export const normalizeURL = (url: string) => url.replace(/\/\//g, '/');

const appBasePath = process.env.IGRP_APP_BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Ideal for building public routes
 * @param assetName 
 * @returns 
 */
export const buildPublicUrlResource =  (assetName: string) => normalizeURL(`/${process.env.IGRP_APP_BASE_PATH ?? ''}/${assetName}`);

export const withBasePath = (path: string) => {
  const normalizedBasePath = appBasePath.endsWith('/') ? appBasePath.slice(0, -1) : appBasePath;
  return `${normalizedBasePath}${path}`;
};