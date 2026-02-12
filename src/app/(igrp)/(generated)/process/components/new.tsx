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


  
  z.config(z.locales.en());

const form1 = z.object({
    title: z.string().nonempty(),
    processKey: z.string().nonempty(),
    description: z.string().optional(),
    projectId: z.string().nonempty()
})

type Form1ZodType = typeof form1;

const initForm1: z.infer<Form1ZodType> = {
    title: ``,
    processKey: ``,
    description: ``,
    projectId: ``
}


  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  const [selectprojectIdOptions, setSelectprojectIdOptions] = useState<IGRPOptionsProps[]>([]);
  
const [modalDialogTitle1Content, setModalDialogTitle1Content] = useState<string>('Create a new Process');

const { igrpToast } = useIGRPToast()

async function handleSubmit (values: z.infer<any>): Promise<void  | undefined> {

  try {
  const data: any = {
    ...values,
    processDefinitionId: initialData?.processDefinitionId,
  };
  await createOrUpdateProcessDefinition(data);
  igrpToast({
    title: 'Success',
    description: data?.uuid
      ? 'Process updated successfully'
      : 'Process saved successfully',
    type: 'success',
  });
  invalidateQueries();
  setOpen(false)
} catch (error: any) {
  igrpToast({
    title: 'Error',
    description: `An error occurred while processing the form. [${error.message}]`,
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
  setModalDialogTitle1Content('Create a new Process')
  setForm1Data(undefined)


  if (initialData) {
    setForm1Data({ ...initialData })
    setModalDialogTitle1Content('Edit Process')

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
  id={ `modalDialogTitle1` }
  
  
  
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
  id={ `title` }
  label={ `Title` }
showIcon={ false }
required={ true }
placeholder={ `Enter process title` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPInputText
  id={ `processKey` }
  label={ `Process Key` }
showIcon={ false }
required={ true }
placeholder={ `Enter process key` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPTextarea
  id={ `description` }
  label={ `Description` }
rows={ 3 }
required={ false }
placeholder={ `Enter process description` }
  className={ cn() }
  
  
>
</IGRPTextarea>
  <IGRPCombobox
  id={ `projectId` }
  label={ `Project` }
variant={ `single` }
placeholder={ `Select an option...` }
required={ true }
selectLabel={ `No option found` }
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
  <div className={ cn('flex',' flex-1 justify-end',)}    >
	<IGRPButton
  id={ `button1` }
  variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Save` }
  className={ cn() }
  onClick={ () => formform1Ref.current?.submit() }
  
>
  Save
</IGRPButton></div>
</IGRPModalDialogFooter>
</IGRPModalDialogContent>
</IGRPModalDialog></div>
  );
}