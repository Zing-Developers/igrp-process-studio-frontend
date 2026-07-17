'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPDataTableFacetedFilterFn, IGRPDataTableDateRangeFilterFn } from "@igrp/igrp-framework-react-design-system";
import { IGRPDataTableHeaderSortToggle, IGRPDataTableHeaderSortDropdown, IGRPDataTableHeaderRowsSelect } from "@igrp/igrp-framework-react-design-system";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import type { Column } from "@igrp/igrp-framework-react-design-system";
import { IgrpLoading } from '@/app/(myapp)/components/igrp-loading'
import New from '@/app/(igrp)/(generated)/process/components/new'
import Project from '@/components/project'
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
  IGRPDataTableFilterDropdown
} from "@igrp/igrp-framework-react-design-system";
import { deleteProcessDefinition } from '@/app/(myapp)/functions/process-definition'
import z from 'zod';
import { useProcessDefinition } from '@/app/(myapp)/hooks/process'
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system'
import { useRouter } from "next/navigation";
import { useQueryClient } from '@tanstack/react-query';
import { getStatusProcessDefinition } from '@/app/(myapp)/functions/domains'

function StatusFilter<TData>({
  column,
  options,
}: {
  column: Column<TData, unknown>;
  options: IGRPOptionsProps[];
}) {
  useEffect(() => {
    if (column.getFilterValue() === undefined) {
      column.setFilterValue('ALL');
    }
  }, [column]);

  return (
    <IGRPDataTableFilterDropdown
      column={column}
      placeholder={`Filtrar por estado...`}
      options={options}
    />
  );
}


export default function PageProcessComponent() {



  type Table1 = {
    projectName: string;
    title: string;
    processKey: string;
    deploymentDate: string;
    processDefinitionId: string;
    version: string;
    statusDesc: string;
    description: string;
    status: string;
  }

  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard3Value, setStatstatsCard3Value] = useState<string | number>(0);
  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [contentTabletable1, setContentTabletable1] = useState<Table1[]>([]);
  const [dropdownFiltertableDropdownFilter2Options, setDropdownFiltertableDropdownFilter2Options] = useState<IGRPOptionsProps[]>([]);
  const [dropdownFiltertableDropdownFilter1Options, setDropdownFiltertableDropdownFilter1Options] = useState<IGRPOptionsProps[]>([]);


  const [openProject, setOpenProject] = useState<boolean>(false);

  const [openProcess, setOpenProcess] = useState<boolean>(false);

  const [editingProcess, setEditingProcess] = useState<any>(undefined);

  const [hasNewProcess, setHasNewProcess] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast()

  function handleDelete(rowData: z.infer<any>): void | undefined {

    try {

      deleteProcessDefinition(rowData.processDefinitionId);

      igrpToast({
        title: 'Sucesso',
        description: 'A definição do processo foi eliminada com sucesso.',
        type: 'success',
      });

      invalidateQueries()

    } catch (error: any) {
      console.error('Error delete process definition:', error);
      igrpToast({
        title: 'Erro',
        description: `${error.message}`,
        type: 'error',
      });
    }

  }

  function invalidateQueries(): void | undefined {

    queryClient.invalidateQueries({ queryKey: ['process'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });

  }

  const queryClient = useQueryClient();

  const { processDefinitions, projectOptions, totalPublished, totalProcessDefinitions, totalRascunho, isLoading } = useProcessDefinition();

  useEffect(() => {
    if (isLoading || !processDefinitions) return
    setContentTabletable1(processDefinitions || [])
    setStatstatsCard1Value(totalRascunho || 0)
    setStatstatsCard2Value(totalProcessDefinitions || 0)
    setStatstatsCard3Value(totalPublished || 0)

    setDropdownFiltertableDropdownFilter1Options(getStatusProcessDefinition() || [])
    setDropdownFiltertableDropdownFilter2Options(projectOptions || [])



  }, [isLoading, processDefinitions, projectOptions, totalProcessDefinitions, totalPublished, totalRascunho])



  return (
    <div className={cn('page', 'space-y-6',)}    >
      <div className={cn('section', ' space-x-6 space-y-6',)}    >
        <IGRPPageHeader
          name={`pageHeader1`}
          title={`Painel de processos`}
          description={`Crie e publique os seus processos BPMN`}
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
                setOpenProject(!openProject)
              }}

            >
              Novo projeto
            </IGRPButton>
            <IGRPButton
              name={`button1`}
              variant={`default`}
              size={`default`}
              showIcon={true}
              iconName={`Plus`}
              className={cn()}
              onClick={() => { setOpenProcess(!openProcess); setEditingProcess(undefined); setHasNewProcess(false) }}

            >
              Nova definição de processo
            </IGRPButton>
          </div>
        </IGRPPageHeader>

        <div className={cn('grid', 'grid-cols-1 ', 'md:grid-cols-2 ', 'lg:grid-cols-3 ', ' gap-4',)}    >
          <IGRPStatsCard
            name={`statsCard2`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`info`}
            iconBackground={`square`}
            title={`Total de processos`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`Workflow`}
            iconSize={`md`}
            iconVariant={`info`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1',)}
            onClick={() => { }}
            value={statstatsCard2Value}
          >
          </IGRPStatsCard>
          <IGRPStatsCard
            name={`statsCard3`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`primary`}
            iconBackground={`square`}
            title={`Total publicados`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`ArrowBigUp`}
            iconSize={`md`}
            iconVariant={`primary`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1',)}
            onClick={() => { }}
            value={statstatsCard3Value}
          >
          </IGRPStatsCard>
          <IGRPStatsCard
            name={`statsCard1`}
            cardBorderPosition={`top`}
            cardBorder={`rounded-xl`}
            cardVariant={`success`}
            iconBackground={`square`}
            title={`Total em rascunho`}
            titleSize={`sm`}
            valueSize={`2xl`}
            showIcon={true}
            iconName={`Network`}
            iconSize={`md`}
            iconVariant={`success`}
            iconPlacement={`end`}
            itemPlacement={`start`}
            showIconBackground={true}
            className={cn('col-span-1',)}
            onClick={() => { }}
            value={statstatsCard1Value}
          >
          </IGRPStatsCard></div>
        {!isLoading && (<div className={cn(' border rounded-lg p-3',)}    >
          <IGRPDataTable<Table1, Table1>
            showFilter={true}
            showPagination={true}
            showToggleColumn={true}
            className={cn()}
            columns={
              [
                {
                  header: ({ column }) => (<IGRPDataTableHeaderSortToggle column={column} title={`Projeto`} />)
                  , accessorKey: 'projectName',
                  cell: ({ row }) => {
                    return row.getValue("projectName")
                  },
                  filterFn: IGRPDataTableFacetedFilterFn
                },
                {
                  header: ({ column }) => (<IGRPDataTableHeaderSortToggle column={column} title={`Nome do processo`} />)
                  , accessorKey: 'title',
                  cell: ({ row }) => {
                    return row.getValue("title")
                  },
                  filterFn: IGRPDataTableFacetedFilterFn
                },
                {
                  header: 'Chave do processo'
                  , accessorKey: 'processKey',
                  cell: ({ row }) => {
                    return row.getValue("processKey")
                  },
                  filterFn: IGRPDataTableFacetedFilterFn
                },
                {
                  header: 'Data de publicação'
                  , accessorKey: 'deploymentDate',
                  cell: ({ row }) => {
                    return row.getValue("deploymentDate")
                  },
                  filterFn: IGRPDataTableFacetedFilterFn
                },
                {
                  header: 'Versão'
                  , accessorKey: 'version',
                  cell: ({ row }) => {
                    const rowData = row.original;


                    return <IGRPDataTableCellBadge
                      label={row.original.version}
                      variant={`soft`}
                      badgeClassName={``}
                    >

                    </IGRPDataTableCellBadge>
                  },
                  filterFn: IGRPDataTableFacetedFilterFn
                },
                {
                  header: 'Estado'
                  , accessorKey: 'status',
                  cell: ({ row }) => {
                    const rowData = row.original;


                    return <IGRPDataTableCellBadge
                      label={row.original.statusDesc}
                      variant={`soft`}
                      badgeClassName={``}
                    >

                    </IGRPDataTableCellBadge>
                  },
                  filterFn: (row, columnId, filterValue: string) => {
                    if (!filterValue || filterValue === 'ALL') return true;
                    return filterValue === row.getValue(columnId);
                  }
                },
                {
                  id: 'tableActionListCell1',
                  enableHiding: false, cell: ({ row }) => {
                    const rowData = row.original;

                    return (
                      <IGRPDataTableRowAction>
                        <IGRPDataTableButtonLink
                          labelTrigger={`Editor do processo`}
                          href={`/process/${row.original.processDefinitionId}/editor`}
                          variant={`ghost`}
                          icon={`Workflow`}
                          className={cn()}
                          action={() => { }}
                        >
                        </IGRPDataTableButtonLink>
                        <IGRPDataTableDropdownMenu
                          items={
                            [
                              {
                                component: IGRPDataTableDropdownMenuCustom,
                                props: {
                                  labelTrigger: `Editar processo`, icon: `SquarePen`, showIcon: true, action: () => { setOpenProcess(!openProcess); setEditingProcess(rowData) },
                                }
                              },
                              {
                                component: IGRPDataTableDropdownMenuAlert,
                                props: {
                                  modalTitle: `Eliminar definição do processo`, labelTrigger: `Eliminar`, icon: `Trash`, showIcon: true, showCancel: true, labelCancel: `Cancelar`, variantCancel: `outline`, showConfirm: true, labelConfirm: `Confirmar`, variantConfirm: `destructive`, onClickConfirm: () => {
                                    handleDelete(rowData);
                                  },
                                  children: <>Pretende eliminar esta definição de processo?</>
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
                    <IGRPDataTableFilterInput
                      column={column}


                    />
                  )
                },
                {
                  columnId: `projectName`,
                  component: (column) => (
                    <IGRPDataTableFilterDropdown
                      column={column}
                      placeholder={`Filtrar por projeto...`}

                      options={dropdownFiltertableDropdownFilter2Options}
                    />
                  )
                },
                {
                  columnId: `status`,
                  component: (column) => (
                    <StatusFilter
                      column={column}
                      options={dropdownFiltertableDropdownFilter1Options}
                    />
                  )
                },
              ]
            }

            data={contentTabletable1}
          /></div>)}
        <IgrpLoading loading={isLoading}   ></IgrpLoading></div>
      <New open={openProcess} initialData={editingProcess} setOpen={setOpenProcess
      }
        setNewProcess={setHasNewProcess
        }
        invalidateQueries={invalidateQueries} ></New>
      <Project open={openProject} setOpen={setOpenProject
      }
        invalidateQueries={invalidateQueries} ></Project></div>
  );
}
