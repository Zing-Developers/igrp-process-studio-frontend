'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef, useMemo } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPDataTableFacetedFilterFn, IGRPDataTableDateRangeFilterFn } from "@igrp/igrp-framework-react-design-system";
import { IGRPDataTableHeaderSortToggle, IGRPDataTableHeaderSortDropdown, IGRPDataTableHeaderRowsSelect } from "@igrp/igrp-framework-react-design-system";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import { IgrpLoading } from '@/app/(myapp)/components/igrp-loading'
import New from '@/app/(igrp)/(generated)/process/components/new'
import Project from '@/components/project'
import {
  IGRPButton,
  IGRPDataTable,
  IGRPDataTableCellBadge,
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
  IGRPDataTableDropdownMenu,
  IGRPDataTableDropdownMenuCustom,
  IGRPDataTableDropdownMenuAlert,
  IGRPDropdownMenu,
  IGRPDropdownMenuTrigger,
  IGRPDropdownMenuContent,
  IGRPDropdownMenuItem,
  IGRPCombobox,
  IGRPInputText
} from "@igrp/igrp-framework-react-design-system";
import { deleteProcessDefinition } from '@/app/(myapp)/functions/process-definition'
import z from 'zod';
import { useProcessDefinition } from '@/app/(myapp)/hooks/process'
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system'
import { useRouter } from "next/navigation";
import { useQueryClient } from '@tanstack/react-query';
import { getStatusProcessDefinition } from '@/app/(myapp)/functions/domains'
import { PageHeader } from '@/app/(myapp)/components/PageHeader';
import { FiltersSection } from '@/app/(myapp)/components/filter-section';


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
    createdBy?: {
      fullName?: string;
      id?: string;
    };
    lastModifiedBy?: {
      fullName?: string;
      id?: string;
    };
  }

  const [contentTabletable1, setContentTabletable1] = useState<Table1[]>([]);
  const [dropdownFiltertableDropdownFilter2Options, setDropdownFiltertableDropdownFilter2Options] = useState<IGRPOptionsProps[]>([]);
  const [dropdownFiltertableDropdownFilter1Options, setDropdownFiltertableDropdownFilter1Options] = useState<IGRPOptionsProps[]>([]);


  const [openProject, setOpenProject] = useState<boolean>(false);

  const [openProcess, setOpenProcess] = useState<boolean>(false);

  const [editingProcess, setEditingProcess] = useState<any>(undefined);

  const [hasNewProcess, setHasNewProcess] = useState<boolean>(false);

  const initialFilters = { title: '', projectName: 'ALL', status: 'ALL' };
  const [processFilters, setProcessFilters] = useState(initialFilters);
  const [draftProcessFilters, setDraftProcessFilters] = useState(initialFilters);

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

  const { processDefinitions, projectOptions, isLoading } = useProcessDefinition();

  useEffect(() => {
    if (isLoading || !processDefinitions) return
    setContentTabletable1(processDefinitions || [])

    setDropdownFiltertableDropdownFilter1Options(getStatusProcessDefinition() || [])
    setDropdownFiltertableDropdownFilter2Options([
      { label: 'Todos', value: 'ALL' },
      ...(projectOptions || []),
    ])



  }, [isLoading, processDefinitions, projectOptions])

  const filteredProcessDefinitions = useMemo(() => {
    const searchTerm = processFilters.title
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return contentTabletable1.filter((processDefinition) => {
      const matchesSearch = !searchTerm || Object.values(processDefinition).some((value) =>
        String(value ?? '')
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(searchTerm),
      );
      const matchesProject = processFilters.projectName === 'ALL'
        || processDefinition.projectName === processFilters.projectName;
      const matchesStatus = processFilters.status === 'ALL'
        || processDefinition.status === processFilters.status;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [contentTabletable1, processFilters]);



  return (
    <div className={cn('page', 'space-y-6',)}    >
      <div className={cn('section', ' space-x-6 space-y-6',)}    >
        <PageHeader
          name={`Painel de processos`}
          description={`Crie e publique os seus processos BPMN`}
          badgeCount={contentTabletable1.length}
        />

        <div className="flex flex-wrap items-center justify-end gap-2">
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
          <FiltersSection
            hasAppliedFilters={processFilters.title !== '' || processFilters.projectName !== 'ALL' || processFilters.status !== 'ALL'}
            onApply={() => setProcessFilters(draftProcessFilters)}
            onClear={() => {
              setProcessFilters(initialFilters);
              setDraftProcessFilters(initialFilters);
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <IGRPInputText
                id="title"
                label="Nome do processo"
                placeholder="Pesquisar processo..."
                value={draftProcessFilters.title}
                onChange={(event) => setDraftProcessFilters((filters) => ({ ...filters, title: event.target.value }))}
              />
              <IGRPCombobox
                id="projectName"
                label="Projeto"
                variant="single"
                placeholder="Selecione um projeto..."
                selectLabel="Nenhuma opção encontrada"
                showSearch={true}
                showIcon={false}
                options={dropdownFiltertableDropdownFilter2Options}
                value={draftProcessFilters.projectName}
                onChange={(value) => setDraftProcessFilters((filters) => ({
                  ...filters,
                  projectName: Array.isArray(value) ? value[0] || 'ALL' : value || 'ALL',
                }))}
              />
              <IGRPCombobox
                id="status"
                label="Estado"
                variant="single"
                placeholder="Selecione um estado..."
                selectLabel="Nenhuma opção encontrada"
                showSearch={true}
                showIcon={false}
                options={dropdownFiltertableDropdownFilter1Options}
                value={draftProcessFilters.status}
                onChange={(value) => setDraftProcessFilters((filters) => ({
                  ...filters,
                  status: Array.isArray(value) ? value[0] || 'ALL' : value || 'ALL',
                }))}
              />
            </div>
          </FiltersSection>
          <IGRPDropdownMenu>
            <IGRPDropdownMenuTrigger asChild>
              <IGRPButton
                name={`m2mKeysMenu`}
                variant={`outline`}
                size={`default`}
                showIcon={true}
                iconName={`ChevronDown`}
                className={cn()}
              >
                Segurança
              </IGRPButton>
            </IGRPDropdownMenuTrigger>
            <IGRPDropdownMenuContent align="end">
              <IGRPDropdownMenuItem asChild>
                <a href="/api-keys">Chaves M2M</a>
              </IGRPDropdownMenuItem>
            </IGRPDropdownMenuContent>
          </IGRPDropdownMenu>
        </div>
        {!isLoading && (<div className={cn(' border rounded-lg p-3',)}    >
          <IGRPDataTable<Table1, Table1>
            showFilter={false}
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
                  filterFn: (row, columnId, filterValue: string) => {
                    if (!filterValue || filterValue === 'ALL') return true;
                    return filterValue === row.getValue(columnId);
                  }
                },
                {
                  header: ({ column }) => (<IGRPDataTableHeaderSortToggle column={column} title={`Nome do processo`} />)
                  , accessorKey: 'title',
                  cell: ({ row }) => {
                    return row.getValue("title")
                  },
                  filterFn: (row, _columnId, filterValue: string) => {
                    const searchTerm = filterValue
                      ?.toLocaleLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '');

                    if (!searchTerm) return true;

                    return Object.values(row.original).some((value) =>
                      String(value ?? '')
                        .toLocaleLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .includes(searchTerm),
                    );
                  }
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
                  header: 'Modificado por',
                  accessorKey: 'lastModifiedBy',
                  cell: ({ row }) => row.original.lastModifiedBy?.fullName
                    || row.original.lastModifiedBy?.id
                    || row.original.createdBy?.fullName
                    || row.original.createdBy?.id
                    || '',
                  filterFn: IGRPDataTableFacetedFilterFn
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
            data={filteredProcessDefinitions}
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
