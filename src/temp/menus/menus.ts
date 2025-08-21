import { IGRPMenuItemArgs } from '@igrp/framework-next-types';

export const IGRP_DEFAULT_MENU: IGRPMenuItemArgs[] = [
  {
    id: 0,
    name: 'Process Studio',
    type: 'FOLDER',
    position: 1,
    icon: 'AppWindow',
    status: 'ACTIVE',
    target: 'INTERNAL',
    url: 'process',
    parentId: null,
    applicationId: 1,
    resourceId: null,
  }
];
