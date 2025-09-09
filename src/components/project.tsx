'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPFormHandle } from "@igrp/igrp-framework-react-design-system";
import { z } from "zod"
import { 
  IGRPModalDialog,
	IGRPModalDialogContent,
	IGRPModalDialogHeader,
	IGRPModalDialogTitle,
	IGRPForm,
	IGRPInputText,
	IGRPTextarea,
	IGRPModalDialogFooter,
	IGRPButton 
} from "@igrp/igrp-framework-react-design-system";
import {createOrUpdateProject} from '@/app/(myapp)/functions/project'
import { useRouter } from 'next/navigation';

export default function Project({ open, setOpen, initialData } : { open: boolean, setOpen: (prompt: boolean) => void, initialData?: any }) {

  
  const form1 = z.object({
    code: z.string().nonempty(),
    name: z.string().nonempty(),
    description: z.string().optional()
})

type Form1ZodType = typeof form1;

const initForm1: z.infer<Form1ZodType> = {
    code: ``,
    name: ``,
    description: undefined
}


  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  
const { igrpToast } = useIGRPToast()

async function handleSubmit (values: z.infer<any>): Promise<void  | undefined> {

  try {
  const data: any = {
    ...initialData,
    ...values
  };
  await createOrUpdateProject(data);
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
  
  
  
>
  Create a new Project
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
  name={ `code` }
  label={ `Code` }
showIcon={ false }
required={ true }
placeholder={ `Enter process code` }
  className={ cn() }
  
  
>
</IGRPInputText>
  <IGRPInputText
  name={ `name` }
  label={ `Name` }
showIcon={ false }
required={ true }
placeholder={ `Enter process name` }
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
</>
</IGRPForm>
  <IGRPModalDialogFooter
  className={ cn('',) }
  
  
>
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