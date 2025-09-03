'use client';

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import {
  IGRPDataTableFacetedFilterFn,
  IGRPDataTableDateRangeFilterFn,
} from '@igrp/igrp-framework-react-design-system';
import {
  IGRPDataTableHeaderSortToggle,
  IGRPDataTableHeaderSortDropdown,
  IGRPDataTableHeaderRowsSelect,
} from '@igrp/igrp-framework-react-design-system';
import { IGRPOptionsProps } from '@igrp/igrp-framework-react-design-system';
import Variables from '@/components/variables';
import New from '@/app/(igrp)/(generated)/process/components/new';
import Project from '@/components/project';
import {
  IGRPPageHeader,
  IGRPButton,
  IGRPStatsCard,
  IGRPDataTable,
  IGRPDataTableCellBadge,
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
  IGRPDataTableDropdownMenu,
  IGRPDataTableDropdownMenuCustom,
  IGRPDataTableDropdownMenuAlert,
  IGRPDataTableFilterInput,
  IGRPDataTableFilterDropdown,
} from '@igrp/igrp-framework-react-design-system';
import { deleteProcessDefinition } from '@/app/(myapp)/functions/process-definition';
import z from 'zod';
import { useProcessDefinition } from '@/app/(myapp)/hooks/process';
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function PageProcessComponent() {
  type Table1 = {
    title: string;
    processKey: string;
    statusDesc: string;
    version: string;
    deploymentDate: string;
    processDefinitionId: string;
  };

  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard3Value, setStatstatsCard3Value] = useState<string | number>(0);
  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [contentTabletable1, setContentTabletable1] = useState<Table1[]>([]);
  const [dropdownFiltertableDropdownFilter1Options, setDropdownFiltertableDropdownFilter1Options] =
    useState<IGRPOptionsProps[]>([]);

  const [openProject, setOpenProject] = useState<boolean>(false);

  const [openProcess, setOpenProcess] = useState<boolean>(false);

  const [editingProcess, setEditingProcess] = useState<any>(undefined);

  const [open, setOpen] = useState<boolean>(false);

  const [hasNewProcess, setHasNewProcess] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  function handleDelete(rowData: z.infer<any>): void | undefined {
    try {
      deleteProcessDefinition(rowData.processDefinitionId);

      igrpToast({
        title: 'Sucesso',
        description: 'Process definition has deleted sucessfully',
        type: 'success',
      });

      setHasNewProcess(true);
    } catch (error: any) {
      console.error('Error delete process definition:', error);
      igrpToast({
        title: 'Erro',
        description: `${error.message}`,
        type: 'error',
      });
    }
  }

  const router = useRouter();
  const queryClient = useQueryClient();

  const { processDefinitions, totalPublished, totalProcessDefinitions, totalRascunho, isLoading } =
    useProcessDefinition();

  useEffect(() => {
    console.log(hasNewProcess);
    if (hasNewProcess) {
      // Force refetch the data
      queryClient.invalidateQueries({ queryKey: ['process'] });
      // Reset the flag after refetch
      setHasNewProcess(false);
    }
  }, [hasNewProcess, queryClient]);
  useEffect(() => {
    if (isLoading || !processDefinitions) return;
    setContentTabletable1(processDefinitions || []);
    setStatstatsCard1Value(totalRascunho || 0);
    setStatstatsCard2Value(totalProcessDefinitions || 0);
    setStatstatsCard3Value(totalPublished || 0);
  }, [isLoading, processDefinitions, hasNewProcess]);

  if (isLoading) {
    return (
      <div className="flex items-center gap2 flex-col">
        <IGRPLoadingSpinner />
        <span> loading process definitions...</span>
      </div>
    );
  }

  return (
    <div className={cn('page', 'space-y-6')}>
      <div className={cn('section', ' space-x-6 space-y-6')}>
        <IGRPPageHeader
          name={`pageHeader1`}
          title={`Dashboard process`}
          description={`Create and deploy your process bpmn`}
          iconBackButton={`Search`}
          variant={`h3`}
        >
          <div className="flex items-center gap-2">
            <IGRPButton
              name={`button2`}
              variant={`outline`}
              size={`default`}
              showIcon={true}
              iconName={`Plus`}
              className={cn()}
              onClick={() => {
                setOpenProject(!openProject);
              }}
            >
              New Project
            </IGRPButton>
            <IGRPButton
              name={`button1`}
              variant={`default`}
              size={`default`}
              showIcon={true}
              iconName={`Plus`}
              className={cn()}
              onClick={() => {
                setOpenProcess(!openProcess);
                setEditingProcess(undefined);
                setHasNewProcess(false);
              }}
            >
              New Process Definition
            </IGRPButton>
          </div>
        </IGRPPageHeader>

        <div className={cn('grid', 'grid-cols-1 ', 'md:grid-cols-2 ', 'lg:grid-cols-3 ', ' gap-4')}>
          <IGRPStatsCard
            name={`statsCard2`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`info`}
            iconBackground={`square`}
            title={`Total Processes`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`Workflow`}
            iconSize={`md`}
            iconVariant={`info`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1')}
            onClick={() => {}}
            value={statstatsCard2Value}
          ></IGRPStatsCard>
          <IGRPStatsCard
            name={`statsCard3`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`primary`}
            iconBackground={`square`}
            title={`Total Published`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`ArrowBigUp`}
            iconSize={`md`}
            iconVariant={`primary`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1')}
            onClick={() => {}}
            value={statstatsCard3Value}
          ></IGRPStatsCard>
          <IGRPStatsCard
            name={`statsCard1`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`success`}
            iconBackground={`square`}
            title={`Total Draft`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`Network`}
            iconSize={`md`}
            iconVariant={`success`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1')}
            onClick={() => {}}
            value={statstatsCard1Value}
          ></IGRPStatsCard>
        </div>
        <div className={cn(' border rounded-lg p-3')}>
          <IGRPDataTable<Table1, Table1>
            showFilter={true}
            showPagination={true}
            showToggleColumn={true}
            className={cn()}
            columns={[
              {
                header: 'Process Name',
                accessorKey: 'title',
                cell: ({ row }) => {
                  return row.getValue('title');
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
              {
                header: 'Process Key',
                accessorKey: 'processKey',
                cell: ({ row }) => {
                  return row.getValue('processKey');
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
              {
                header: 'Deployment Date',
                accessorKey: 'deploymentDate',
                cell: ({ row }) => {
                  return row.getValue('deploymentDate');
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
              {
                header: 'Version',
                accessorKey: 'version',
                cell: ({ row }) => {
                  const rowData = row.original;

                  return (
                    <IGRPDataTableCellBadge
                      label={row.original.version}
                      variant={`soft`}
                      badgeClassName={``}
                    ></IGRPDataTableCellBadge>
                  );
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
              {
                header: 'Status',
                accessorKey: 'statusDesc',
                cell: ({ row }) => {
                  const rowData = row.original;

                  return (
                    <IGRPDataTableCellBadge
                      label={row.original.statusDesc}
                      variant={`soft`}
                      badgeClassName={``}
                    ></IGRPDataTableCellBadge>
                  );
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
              {
                id: 'tableActionListCell1',
                enableHiding: false,
                cell: ({ row }) => {
                  const rowData = row.original;

                  return (
                    <IGRPDataTableRowAction>
                      <IGRPDataTableButtonLink
                        labelTrigger={`Process Editor`}
                        href={`/process/${row.original.processDefinitionId}/editor`}
                        variant={`ghost`}
                        icon={`Workflow`}
                        className={cn()}
                        action={() => {}}
                      ></IGRPDataTableButtonLink>
                      <IGRPDataTableDropdownMenu
                        items={[
                          {
                            component: IGRPDataTableDropdownMenuCustom,
                            props: {
                              labelTrigger: `Edit Process`,
                              icon: `SquarePen`,
                              showIcon: true,
                              action: () => {
                                setOpenProcess(!openProcess);
                                setEditingProcess(rowData);
                              },
                            },
                          },
                          {
                            component: IGRPDataTableDropdownMenuAlert,
                            props: {
                              modalTitle: `Delete Process Definition`,
                              labelTrigger: `Delete`,
                              icon: `Trash`,
                              showIcon: true,
                              showCancel: true,
                              labelCancel: `Cancel`,
                              variantCancel: `outline`,
                              showConfirm: true,
                              labelConfirm: `Confirm`,
                              variantConfirm: `destructive`,
                              onClickConfirm: () => {
                                handleDelete(rowData);
                              },
                              children: <>Do you want delete this process definition?</>,
                            },
                          },
                        ]}
                      ></IGRPDataTableDropdownMenu>
                    </IGRPDataTableRowAction>
                  );
                },
                filterFn: IGRPDataTableFacetedFilterFn,
              },
            ]}
            clientFilters={[
              {
                columnId: `title`,
                component: (column) => <IGRPDataTableFilterInput column={column} />,
              },
              {
                columnId: `statusDesc`,
                component: (column) => (
                  <IGRPDataTableFilterDropdown
                    column={column}
                    placeholder={`Filtar...`}
                    options={dropdownFiltertableDropdownFilter1Options}
                  />
                ),
              },
            ]}
            data={contentTabletable1}
          />
        </div>
      </div>
      <Variables open={open} currentProcess={editingProcess} setOpen={setOpen}></Variables>
      <New
        open={openProcess}
        initialData={editingProcess}
        setOpen={setOpenProcess}
        setNewProcess={setHasNewProcess}
      ></New>
      <Project open={openProject} setOpen={setOpenProject}></Project>
    </div>
  );
}
