'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPDataTableFacetedFilterFn , IGRPDataTableDateRangeFilterFn } from "@igrp/igrp-framework-react-design-system";
import { IGRPDataTableHeaderSortToggle, IGRPDataTableHeaderSortDropdown, IGRPDataTableHeaderRowsSelect } from "@igrp/igrp-framework-react-design-system";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import New from '@/app/(igrp)/(generated)/process/components/new'
import Project from '@/components/project'
import { 
  IGRPPageHeader,
	IGRPButton,
	IGRPStatsCard,
	IGRPDataTable,
	IGRPDataTableCellBadge,
	IGRPDataTableRowAction,
	IGRPDataTableDropdownMenu,
	IGRPDataTableDropdownMenuCustom,
	IGRPDataTableDropdownMenuLink,
	IGRPDataTableFilterInput,
	IGRPDataTableFilterDropdown 
} from "@igrp/igrp-framework-react-design-system";
import {useProcess} from '@/app/(myapp)/hooks/process'
import {useProcessDefinition} from '@/app/(myapp)/hooks/process'
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system'


export default function PageProcessComponent() {


  
  type Table1 = {
    title: string;
    processKey: string;
    statusDesc: string;
    version: string;
    processDefinitionId: string;
}

  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard3Value, setStatstatsCard3Value] = useState<string | number>(0);
  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [contentTabletable1, setContentTabletable1] = useState<Table1[]>([]);
  const [dropdownFiltertableDropdownFilter1Options, setDropdownFiltertableDropdownFilter1Options] = useState<IGRPOptionsProps[]>([]);
  
  
const [openProject, setOpenProject] = useState<boolean>(false);

const [openProcess, setOpenProcess] = useState<boolean>(false);

const [editingProcess, setEditingProcess] = useState<any>(undefined);

const { igrpToast } = useIGRPToast()

const { data, totalProcessDefinitions,totalProjects, isLoading,error } = useProcessDefinition();

useEffect(() => {
  if (isLoading || !data) return
  setContentTabletable1(data || [])
  setStatstatsCard1Value(totalProjects || 0)
  setStatstatsCard2Value(totalProcessDefinitions || 0)

}, [isLoading])

if (isLoading && !error) {
    return (
      <div className="flex items-center gap2 flex-col">
        <IGRPLoadingSpinner />
        <span>loading process definitions...</span>
      </div>
    );
  }


  return (
<div className={ cn('page','space-y-6',)}    >
	<div className={ cn('section',' space-x-6 space-y-6',)}    >
	<IGRPPageHeader
  name={ `pageHeader1` }
  title={ `Dashboard process` }
  description={ `Create and deploy your process bpmn` }
  iconBackButton={ `Search` }
  variant={ `h3` }
  
>
  <div className="flex items-center gap-2">
    <IGRPButton
  name={ `button2` }
  
variant={ `outline` }
size={ `default` }
showIcon={ true }
iconName={ `Plus` }

  className={ cn() }
  onClick={ () => {setOpenProject(!openProject)
} }
  
>
  New Project
</IGRPButton>
    <IGRPButton
  name={ `button1` }
  
variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Plus` }

  className={ cn() }
  onClick={ () => {setOpenProcess(!openProcess); setEditingProcess(undefined)
} }
  
>
  New Process Definition
</IGRPButton>
</div>
</IGRPPageHeader>

<div className={ cn('grid','grid-cols-1 ','md:grid-cols-2 ','lg:grid-cols-4 ',' gap-4',)}    >
	<IGRPStatsCard
  name={ `statsCard2` }
  cardBorderPosition={ `top` }
cardBorder={ `rounded-xl` }
cardVariant={ `info` }
iconBackground={ `none` }
title={ `Total Processos` }
titleSize={ `sm` }
valueSize={ `2xl` }
showIcon={ true }
iconName={ `Box` }
iconSize={ `md` }
iconVariant={ `info` }
iconPlacement={ `end` }
itemPlacement={ `start` }

  onClick={ () => {} }
  value={ statstatsCard2Value }
>
</IGRPStatsCard>
<IGRPStatsCard
  name={ `statsCard3` }
  cardBorderPosition={ `top` }
cardBorder={ `rounded-xl` }
cardVariant={ `primary` }
iconBackground={ `none` }
title={ `Total Publicados` }
titleSize={ `sm` }
valueSize={ `2xl` }
showIcon={ true }
iconName={ `Box` }
iconSize={ `md` }
iconVariant={ `primary` }
iconPlacement={ `end` }
itemPlacement={ `start` }

  onClick={ () => {} }
  value={ statstatsCard3Value }
>
</IGRPStatsCard>
<IGRPStatsCard
  name={ `statsCard1` }
  cardBorderPosition={ `top` }
cardBorder={ `rounded-xl` }
cardVariant={ `success` }
iconBackground={ `none` }
title={ `Total Rascunhos` }
titleSize={ `sm` }
valueSize={ `2xl` }
showIcon={ true }
iconName={ `Network` }
iconSize={ `md` }
iconVariant={ `success` }
iconPlacement={ `end` }
itemPlacement={ `start` }

  onClick={ () => {} }
  value={ statstatsCard1Value }
>
</IGRPStatsCard></div>
<IGRPDataTable<Table1, Table1>
  showFilter={ true }
  showPagination={ true }
  showToggleColumn={ true }
  columns={
    [
        {
          header: 'Title'
,accessorKey: 'title',
          cell: ({ row }) => {
          return row.getValue("title")
          },
          filterFn: IGRPDataTableFacetedFilterFn
        },
        {
          header: 'Process Key'
,accessorKey: 'processKey',
          cell: ({ row }) => {
          return row.getValue("processKey")
          },
          filterFn: IGRPDataTableFacetedFilterFn
        },
        {
          header: 'Status'
,accessorKey: 'statusDesc',
          cell: ({ row }) => {
          const rowData = row.original;


return <IGRPDataTableCellBadge
  label={ row.original.statusDesc }
  variant={ `soft` }
badgeClassName={ `` }
>

</IGRPDataTableCellBadge>
          },
          filterFn: IGRPDataTableFacetedFilterFn
        },
        {
          header: 'Version'
,accessorKey: 'version',
          cell: ({ row }) => {
          const rowData = row.original;


return <IGRPDataTableCellBadge
  label={ row.original.version }
  variant={ `soft` }
badgeClassName={ `` }
>

</IGRPDataTableCellBadge>
          },
          filterFn: IGRPDataTableFacetedFilterFn
        },
        {
          header: 'Actions'
,accessorKey: 'tableActionListCell1',
          enableHiding: false,cell: ({ row }) => {
          const rowData = row.original;

return (
<IGRPDataTableRowAction>
  <IGRPDataTableDropdownMenu
  items={
    [
      {
        component: IGRPDataTableDropdownMenuCustom,
        props: {
          labelTrigger: `Edit Process`,icon: `SquarePen`,          showIcon: true,          action: () => {setOpenProcess(!openProcess); setEditingProcess(rowData)
},
}
      },
      {
        component: IGRPDataTableDropdownMenuLink,
        props: {
          labelTrigger: `Process Editor`,icon: `Network`,href: `/process/${row.original.processDefinitionId}/editor`,          showIcon: true,          action: (e) => {},
}
      },
]
  }
>
</IGRPDataTableDropdownMenu>
</IGRPDataTableRowAction>
);
          },
          filterFn: IGRPDataTableFacetedFilterFn
        },
]
  }
  clientFilters={
    [
        {
          columnId: `title`,
          component: (column) => (
          <IGRPDataTableFilterInput column={column} />
          )
        },
        {
          columnId: `statusDesc`,
          component: (column) => (
          <IGRPDataTableFilterDropdown
  column={column}
  placeholder={ `Filtar...` }
  
  options={ dropdownFiltertableDropdownFilter1Options }
/>
          )
        },
    ]
  }
  
  data={ contentTabletable1 }
/></div>
<New  open={ openProcess } initialData={ editingProcess }  setOpen={ setOpenProcess
 } ></New>
<Project  open={ openProject }  setOpen={ setOpenProject
 } ></Project></div>
  );
}
