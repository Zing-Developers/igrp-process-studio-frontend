'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPFormHandle } from "@igrp/igrp-framework-react-design-system";
import { z } from "zod"
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import { 
  IGRPModalDialog,
	IGRPModalDialogContent,
	IGRPModalDialogHeader,
	IGRPModalDialogTitle,
	IGRPForm,
	IGRPInputText,
	IGRPTextarea,
	IGRPCombobox,
	IGRPModalDialogFooter,
	IGRPButton 
} from "@igrp/igrp-framework-react-design-system";
import {createOrUpdateProcessDefinition} from '@/app/(myapp)/functions/process-definition'
import {useProjectConfiguration} from '@/app/(myapp)/hooks/process'
import { useRouter } from 'next/navigation';

export default function New({ open, setOpen, initialData, setNewProcess, invalidateQueries } : { open: boolean, setOpen: (prompt: boolean) => void, initialData?: any, setNewProcess: (prompt: boolean) => void, invalidateQueries: () => void }) {

  
  const form1 = z.object({
    title: z.string().optional(),
    processKey: z.string().optional(),
    description: z.string().optional(),
    projectId: z.string().optional()
})

type Form1ZodType = typeof form1;

const initForm1: z.infer<Form1ZodType> = {
    title: undefined,
    processKey: undefined,
    description: undefined,
    projectId: undefined
}


  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  const [selectprojectIdOptions, setSelectprojectIdOptions] = useState<IGRPOptionsProps[]>([]);
  
const [modalDialogTitle1Content, setModalDialogTitle1Content] = useState<string>('Criar novo processo');

const { igrpToast } = useIGRPToast()

async function handleSubmit (values: z.infer<any>): Promise<void  | undefined> {

  try {
  const data: any = {
    ...values,
    processDefinitionId: initialData?.processDefinitionId,
  };
  await createOrUpdateProcessDefinition(data);
  igrpToast({
    title: 'Sucesso',
    description: data?.uuid
      ? 'Processo atualizado com sucesso.'
      : 'Processo guardado com sucesso.',
    type: 'success',
  });
  invalidateQueries();
  setOpen(false)
} catch (error: any) {
  igrpToast({
    title: 'Erro',
    description: `Ocorreu um erro ao processar o formulário. [${error.message}]`,
    type: 'error',
  });
  console.log(error);
}

}

const router = useRouter();
const { processOptions, isLoading } = useProjectConfiguration();
useEffect(() => {
  if (isLoading) return
  setSelectprojectIdOptions(processOptions || [])
}, [isLoading,open])

useEffect(() => {
  setModalDialogTitle1Content('Criar novo processo')
  setForm1Data(undefined)


  if (initialData) {
    setForm1Data({ ...initialData })
    setModalDialogTitle1Content('Editar processo')

  }
}, [initialData])


  return (
<div className={ cn('component',)}    >
	<IGRPModalDialog
  onOpenChange={ setOpen }
  open={ open }
>
  <IGRPModalDialogContent
  size={ `lg` }
  className={ cn() }
  
  
>
  <IGRPModalDialogHeader
  className={ cn('',) }
  
  
>
  <IGRPModalDialogTitle
  name={ `modalDialogTitle1` }
  
  
  
>
  { modalDialogTitle1Content }
</IGRPModalDialogTitle>
</IGRPModalDialogHeader>
  <IGRPForm
  schema={ form1 }
  validationMode={ `onBlur` }
formRef={ formform1Ref }
  className={ cn('',) }
  onSubmit={ handleSubmit }
  defaultValues={ form1Data }
>
  <>
  <IGRPInputText
  name={ `title` }
  label={ `Título` }
showIcon={ false }
required={ true }
placeholder={ `Introduza o título do processo` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPInputText
  name={ `processKey` }
  label={ `Chave do processo` }
showIcon={ false }
required={ true }
placeholder={ `Introduza a chave do processo` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPTextarea
  name={ `description` }
  label={ `Descrição` }
rows={ 3 }
required={ false }
placeholder={ `Introduza a descrição do processo` }
  className={ cn() }
  
  
>
</IGRPTextarea>
  <IGRPCombobox
  name={ `projectId` }
  label={ `Projeto` }
variant={ `single` }
placeholder={ `Selecione uma opção...` }
required={ true }
selectLabel={ `Nenhuma opção encontrada` }
showSearch={ true }
showIcon={ false }
iconName={ `CornerDownRight` }
  className={ cn() }
  onChange={ () => {} }
  options={ selectprojectIdOptions }
>
</IGRPCombobox>
</>
</IGRPForm>
  <IGRPModalDialogFooter
  className={ cn('','',) }
  
  
>
  <div className={ cn('flex','flex flex-row flex-wrap items-center justify-end gap-2',)}    >
	<IGRPButton
  name={ `button1` }
  variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Save` }
  className={ cn() }
  onClick={ () => formform1Ref.current?.submit() }
  
>
  Guardar
</IGRPButton></div>
</IGRPModalDialogFooter>
</IGRPModalDialogContent>
</IGRPModalDialog></div>
  );
}
