'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPFormHandle } from "@igrp/igrp-framework-react-design-system";
import { z } from "@igrp/igrp-framework-react-design-system"
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
	IGRPModalDialogClose,
	IGRPButton 
} from "@igrp/igrp-framework-react-design-system";
import {createOrUpdateProcessDefinition} from '@/app/(myapp)/functions/process-definition'
import {useProjectConfiguration} from '@/app/(myapp)/hooks/process'
import { useRouter } from 'next/navigation';

export default function New({ open, setOpen, initialData } : { open: boolean, setOpen: (prompt: boolean) => void, initialData?: any }) {

  
  const form1 = z.object({
    title: z.string().optional(),
    processKey: z.string().optional(),
    description: z.string().optional(),
    projectId: z.string().optional()
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
  router.push('/process');
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
}, [isLoading])

useEffect(() => {
  if (initialData)
    setForm1Data(initialData)
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
  Create a new Process
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
  label={ `Title` }
showIcon={ false }
required={ true }


placeholder={ `Enter process title` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPInputText
  name={ `processKey` }
  label={ `Process Key` }
showIcon={ false }
required={ true }


placeholder={ `Enter process key` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPTextarea
  name={ `description` }
  
label={ `Description` }
rows={ 3 }
required={ false }


placeholder={ `Enter process description` }
  className={ cn() }
  
  
>
</IGRPTextarea>
  <IGRPCombobox
  name={ `projectId` }
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
  className={ cn('',) }
  
  
>
  <IGRPModalDialogClose
  name={ `modalDialogClose1` }
  

  onClick={ () => {} }
  
>
  Close
</IGRPModalDialogClose>
  <IGRPButton
  name={ `button1` }
  
variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Save` }

  onClick={ () => formform1Ref.current?.submit() }
  
>
  Save
</IGRPButton>
</IGRPModalDialogFooter>
</IGRPModalDialogContent>
</IGRPModalDialog></div>
  );
}