import React from 'react';
import { irnHeaderConfig } from './server/irn-header-functions';
import { StableIRNHeader } from './stable-irn-header';
import { buildPublicUrlResource, normalizeURL } from '../../lib/url';

export async function Header() {
  return (
    <StableIRNHeader
      handlers={{
        getUserData: irnHeaderConfig.getUserData,
        getUserMenu: irnHeaderConfig.getUserMenu,
        switchSpace: irnHeaderConfig.switchSpace,
      }}
      app={{
        id: 'tr',
        code: 'TR',
        name: 'Tramitador',
        picture: buildPublicUrlResource(`irn_logo.svg`),
        homeUrl: process.env.APP_HOME_URL ?? '',
      }}
      userMenuItems={[
        {
          label: 'Encerrar Sessão',
          icon: 'LogOut',
          href: normalizeURL(`/${process.env.IGRP_APP_BASE_PATH ?? ''}/logout`),
          variant: 'destructive',
        },
      ]}
    />
  );
}
