import { IGRPMenuItemArgs } from '@igrp/framework-next-types';

export const IGRP_DEFAULT_MENU: IGRPMenuItemArgs[] = [
  {
    id: 43,
    code: 'PROCESS_STUDIO',
    name: 'Process Studio',
    type: 'MENU_PAGE',
    position: 0,
    icon: 'AppWindow',
    status: 'ACTIVE',
    url: 'process',
    pageSlug: 'process',
    parentCode: null,
    applicationCode: 'IGRP',
    permissions: [],
  },
];
